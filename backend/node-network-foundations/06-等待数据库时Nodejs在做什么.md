# 06. 等待数据库时 Node.js 在做什么

如果一次文章查询需要两秒，这两秒里另一个用户请求健康检查，也必须等两秒吗？

答案取决于这段时间在做什么：等待一个未完成的异步操作时，可以把执行机会交出去；持续运行同步 JavaScript 时，主线程无法同时执行其他请求的 JavaScript。

## 1. 先看项目里真正等待的地方

文章 Router 中有这样的顺序：

```ts
// server/src/modules/articles/article-router.ts 的局部片段
const query = listArticleQueryScheme.parse(req.query);
const { articles, total } = await getArticles(query);
res.json({
  data: articles,
  pagination: { page: query.page, pageSize: query.pageSize, total },
});
```

校验需要先执行，查询结果尚未准备好时，后面的 `res.json` 不能执行。`await` 让当前异步函数的后续逻辑等待结果。

它保留的是“这次请求接下来要做什么”，不会要求整个 Node.js 进程一直停在原地。

## 2. 服务员和厨房的类比

服务员接到订单，交给厨房，记好桌号，就可以继续接待其他客人。厨房完成后，服务员再把菜送回原来的桌位。

放到 MiniCMS 中：

| 餐厅里的角色 | 当前程序中的对应物 |
|---|---|
| 服务员正在做的动作 | 主线程正在执行的 JavaScript |
| 订单与桌号 | 某次请求的上下文与后续处理 |
| 独立工作的厨房 | PostgreSQL 进程 |
| 菜做好后的通知与送餐 | 结果就绪后，恢复相应代码并生成响应 |

但是，如果服务员亲自站在前台切两秒的菜，他就没有机会接待下一桌。把切菜动作写进 `async` 函数，并不会凭空多出一名服务员。

类比也有边界：不是所有异步操作都像同一个厨房，数据库、文件系统和计时器的实现不同，需要分别说明谁在工作。

## 3. 从调用栈到事件循环

调用栈可以先理解为 JavaScript 当前正在执行的函数链。主线程正在运行一段同步代码时，要先让它运行完或走到能交出后续执行的位置，其他工作才有机会继续。

事件循环负责协调就绪工作，例如网络事件和计时器回调。Promise 的后续处理通过微任务机制调度；它不会打断一段正在执行的同步 JavaScript。

对当前查询，可以沿着下面的顺序理解：

```text
执行路由中的校验与查询准备
→ 发起查询，结果暂未就绪
→ 当前异步函数在 await 处暂停后续步骤
→ 调用栈腾出执行机会，主线程处理其他就绪工作
→ 数据库结果到达，驱动处理结果并使 Promise 完成
→ await 后续有机会继续，生成当前请求的响应
```

这是一张职责图，不是要求背诵所有事件循环阶段。先能用它预测“其他请求是否会被同步工作挡住”，再去看更细的阶段。[Node.js 事件循环说明](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)

## 4. 到底是谁在后台做事

Node.js 主线程通常一次执行一段 JavaScript，但整个进程并非只有一个线程，操作系统和外部服务也在并行工作。

- V8 执行 JavaScript，并参与内存管理。
- Node.js 和 libuv 把网络、文件等能力连接到操作系统提供的机制。
- 网络 I/O 通常依赖操作系统的非阻塞能力与就绪通知，不是每个连接都分配一个 JavaScript 工作线程。
- 某些文件、DNS、加密等操作会使用工作线程池，具体由相应 API 决定。
- PostgreSQL 在自己的进程中执行查询，Node.js 等的是另一端的结果。

因此，“异步等于开线程”“所有异步都进入 libuv 线程池”“Node.js 单线程所以只能接一个请求”，都不足以解释实际运行。[Node.js 对事件循环与工作线程池的区分](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)

## 5. Prisma 查询也是一次跨进程通信

项目的 `server/src/db/client.ts` 创建 PrismaPg 适配器，并传给 Prisma Client。请求数据时的主要职责是：

```text
repository 调用 Prisma Client
→ 适配器和 pg 驱动负责数据库访问
→ 使用数据库连接发送查询
→ PostgreSQL 执行 SQL
→ 驱动读取结果，应用继续处理
```

Node.js 在接收浏览器请求时是服务端，在访问 PostgreSQL 时又是客户端。同一个进程可以同时拥有这两种角色。

这段通信使用 PostgreSQL 协议，不能因为前半段是 HTTP，就以为后半段也在调用 HTTP API。

数据库连接通常由连接池复用。像餐厅有若干条固定传菜通道，查询借用通道，完成后释放；不必每次请求都重新创建 Prisma Client 和连接。项目把 Client 放在独立模块中导出，正是复用入口。

连接数量有限时，查询也可能先等待空闲连接。异步让 Node.js 能高效等待，不会让 PostgreSQL、连接池或机器资源变成无限。

## 6. Promise.all 能带来什么，不能带来什么

项目的 `getArticles` 同时准备当前页数据和总数：

```ts
// 简化参数，只保留两个查询的关系
const [articles, total] = await Promise.all([
  prisma.article.findMany({ where }),
  prisma.article.count({ where }),
]);
```

两个结果彼此不依赖，代码允许它们并发进行；实际是否同时执行、何时取得连接，取决于驱动、连接池和数据库。

`Promise.all` 不会把一段同步计算自动拆到多个 CPU 核心上，也不会让两个查询自动处在同一个事务快照中。它主要组织多个异步结果的完成与失败。

现在先掌握“并发”：多项工作在一段时间内交错推进。是否真的在不同执行单元上同时计算，是另一个层次的“并行”。

## 7. 实验：同样两秒，另一个请求有什么不同

本实验使用计时器模拟等待，不连接真实数据库。它证明的是“让出执行机会”与“占用主线程”的区别，不是测数据库性能。

在第一个终端运行[事件循环服务器](./labs/03-event-loop.mjs)：

```bash
node backend/node-network-foundations/labs/03-event-loop.mjs
```

它提供三个 GET 路径：

| 路径 | 行为 |
|---|---|
| `/api/health` | 立即返回小 JSON |
| `/wait` | 异步等待约两秒，再结束响应 |
| `/block` | 用同步循环占用主线程约两秒，再结束响应 |

在另一个终端运行[观察客户端](./labs/04-probe.mjs)：

```bash
node backend/node-network-foundations/labs/04-probe.mjs wait
node backend/node-network-foundations/labs/04-probe.mjs block
```

两条命令依次执行，客户端会先发出慢请求，读到服务器的开始标记后，再发送健康检查。因此不用靠手速在两秒内切换终端。

预测并记录结果：

| 模式 | 慢请求完成 | 健康检查耗时 |
|---|---|---|
| wait | 约两秒 | 通常明显少于两秒 |
| block | 约两秒 | 通常也要等待接近剩余阻塞时间 |

数字会受到机器负载与调度影响，重点是两组差异，不要求毫秒数相同。客户端与服务器运行在不同进程，服务端的循环不会直接阻塞客户端自己的计时。

实验先用 `res.write` 发出一段开始标记，最后才 `res.end`。这也呼应上一章：开始收到响应，不代表正文已经完整收到。

## 8. async 为什么救不了同步循环

两条实验路径的核心差别是：

```js
// 等待：期间允许主线程执行其他就绪工作
await delay(2000);
```

```js
// 计算：这段循环结束前一直占用当前主线程
const end = performance.now() + 2000;
while (performance.now() < end) {
  // 故意忙等，用来观察阻塞
}
```

即使第二段在 `async` 函数里，它仍然是同步计算。类似地，`await heavyCalculation()` 会先执行 `heavyCalculation()`；若它在返回前做大量同步计算，这段时间已经造成阻塞。

真正的项目中，大对象的 JSON 解析、序列化或复杂文本处理也可能占用主线程。普通文章输入先用合理大小限制；出现确切性能问题后，再决定是否分批处理、使用 worker_threads 或独立任务进程。更换框架不一定改变这类计算的成本。

## 9. 异步失败怎样回到 HTTP 响应

查询失败时，相应 Promise 会拒绝；`await` 把拒绝表现为当前异步函数中的抛错。MiniCMS 使用 Express 5，路由返回的 Promise 失败会交给错误中间件。

```text
数据库操作失败
→ repository 返回的 Promise 拒绝
→ Router 中的 await 抛错
→ Express 5 接到 handler 的失败
→ errorHandler 识别错误，返回状态和 JSON
```

这个联系必须保留。若在 handler 中启动一个 Promise，却既不 await，也不 return，Express 就不能仅凭“它在路由里被创建”自动接住后来的拒绝。计时器回调中的异常也不能靠外层已经结束的 try/catch 捕获。

还要区分请求结束与操作取消：浏览器停止等待，不代表已经发出的数据库写入自动撤回。超时和重试涉及操作是否仍在执行，需要依据实际流程判断，不能直接把重复点击当成安全重试。

## 10. 合上文档，讲给别人听

1. 一个 await 为什么能让当前请求等，同时让其他请求继续？
2. 数据库究竟是在 Node.js 主线程里执行 SQL，还是在另一个进程里执行？
3. 把同步耗时函数加上 async，为什么没有解决阻塞？
4. Promise.all 为什么不等于“开两个线程执行 SQL”？
5. 慢请求很多时，主线程没阻塞，为什么系统仍可能排队或耗尽资源？

<details>
<summary>讲完后再看提示</summary>

当前函数的后续步骤与整个进程的执行机会不同。异步不创造无限资源，仍要考虑连接池、数据库、内存和响应体等成本。用实验中的健康检查耗时证明自己理解了“等待”和“计算”的差别。

</details>

继续阅读：[Cookie 和跨域怎样影响登录](./07-Cookie和跨域怎样影响登录.md)。
