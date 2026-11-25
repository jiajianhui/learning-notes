# 从 MiniCMS 理解 Node.js 与网络基础

你已经能用 Next.js、Express 和 Prisma 完成项目。这一轮从熟悉的动作往下追：输入启动命令以后谁在运行？请求怎样进入程序？等待数据库时，服务器还能做什么？

目标是遇到问题时，能先判断它发生在哪一层，再选择证据验证；讨论方案时，能解释它为什么有效、会付出什么代价。

## 1. 沿着一个已经做完的项目往下看

```text
启动 Next.js 和 Express
→ 操作系统运行进程，服务开始监听端口
→ 浏览器发出请求，网络把数据送到服务
→ Node.js 解析 HTTP，Express 组织处理流程
→ 后端等待 PostgreSQL，继续处理其他就绪工作
→ 返回响应，浏览器更新页面
→ 加上 Cookie、HTTPS 和反向代理，回看真实部署
```

第一轮项目教程回答“怎样完成这个功能”，这里集中回答“这些代码为什么能完成它”。原有项目阶段继续以[后端学习路线](../backend-system-learning/README.md)和[MiniCMS 项目总览](../backend-system-learning/10-MiniCMS项目总览.md)为准。

## 2. 阅读顺序

| 章节 | 从哪个疑问进入 | 读完要能解释什么 |
|---|---|---|
| [01：npm run dev 后面发生了什么](./01-npm-run-dev后面发生了什么.md) | 为什么一个命令能启动不同项目？ | scripts、PATH、CLI、Node.js 与进程的关系 |
| [02：同一份 JavaScript 在哪里运行](./02-同一份JavaScript在哪里运行.md) | 为什么有时能用 window，有时能读服务器配置？ | 运行时、模块、TypeScript、环境变量与构建边界 |
| [03：服务怎样监听端口并等待请求](./03-服务怎样监听端口并等待请求.md) | app.listen 做完后，程序为什么不退出？ | 地址、端口、Socket、进程与事件通知 |
| [04：一次请求怎样找到你的服务](./04-一次请求怎样找到你的服务.md) | URL 怎样变成一次 HTTP 交换？ | DNS、IP、TCP、TLS、HTTP 的职责 |
| [05：JSON 怎样穿过网络变成 req.body](./05-JSON怎样穿过网络变成req-body.md) | 浏览器里的对象怎样出现在后端？ | 字节、Buffer、流、序列化与 Express 中间件 |
| [06：等待数据库时 Node.js 在做什么](./06-等待数据库时Nodejs在做什么.md) | await 两秒会卡住整个服务吗？ | 事件循环、异步 I/O、阻塞、连接池与错误传播 |
| [07：Cookie 和跨域怎样影响登录](./07-Cookie和跨域怎样影响登录.md) | 登录成功后，下一次请求凭什么被认出来？ | Session、Cookie、同源、同站、CORS 与预检 |
| [08：把本地原理带到线上排错](./08-把本地原理带到线上排错.md) | 为什么本地能用，上线后却失败？ | 反向代理、容器网络、配置时机与分层诊断 |

建议每次完成一章。第 01～03 章先建立程序运行的模型，第 04～05 章解释数据传输，第 06～08 章把并发、登录和部署接回来。

## 3. 每章怎样使用费曼学习法

先看开头的问题，写下自己的猜测，再阅读解释和类比。类比帮助进入问题，真实代码负责说明边界。

完成小实验后，合上正文，向一个只会写基础 JavaScript 的朋友解释：

1. 谁发起了这件事？
2. 谁实际执行？输入怎样变成输出？
3. 如果删掉或改变其中一步，会看到什么？
4. 用哪个观察结果证明自己的解释？

讲到“系统会自动处理”“底层会帮忙”时，停下来补上具体主语。把讲不清的地方记成问题，回到相应段落或代码验证，再重新讲一遍。

各章的折叠提示用于自查，不要先背答案。学完以后，应该能换一组端口、一个请求或一种错误继续推理。

## 4. 本轮使用哪些项目事实

本轮于 2026-11-25 对照本地独立仓库 `mini-cms` 的代码编写。下面的路径均相对于那个仓库；本学习仓库不保存 MiniCMS 的最终业务代码。

| 观察位置 | 本轮实际使用的实现 |
|---|---|
| `admin-web-antd/package.json` | 开发用 `next dev`；生产先 `next build`，再 `next start` |
| `server/package.json` | 开发用 `tsx watch src/server.ts`；生产用 `tsx src/server.ts` |
| `server/src/server.ts` | 导入 app，读取 PORT，调用 app.listen；默认端口 3001 |
| `server/src/app.ts` | 请求日志、CORS、JSON 解析、Cookie 解析、来源检查、路由与错误处理 |
| `server/src/modules/articles/` | Router 直接调用 repository；不假设另有 controller/service 文件 |
| `server/src/db/client.ts` | Prisma Client + PrismaPg 适配器 + pg，连接 PostgreSQL |
| `server/src/modules/auth/` | 数据库 Session；Cookie 名称为 mini_cms_session |
| `admin-web-antd/lib/api-client.ts` | fetch 携带 credentials，读取状态和 JSON |
| `deploy/docker-compose.yml` | api、admin_web_antd、postgres 三个服务；应用端口映射到宿主机回环地址 |

后续业务代码调整后，先核对这些入口。文中的原理仍可复用，具体接口和字段以项目当时的实现为准。

## 5. 实验怎样运行

实验使用 Node.js 24，代码在 [labs](./labs/README.md)，只依赖 Node.js 内置模块，无需安装 npm 包。命令默认从 `learning-notes` 仓库根目录执行。

实验监听 `127.0.0.1:4311～4313`，不占用 MiniCMS 的 3000、3001，不连接数据库。它们分别验证监听、HTTP 请求体和事件循环，不需要加入业务项目。结束服务器实验时，在运行它的终端按 `Ctrl+C`。

第 01、02、07、08 章还有只读观察任务：检查项目脚本、浏览器 Network 或已有部署。需要 MiniCMS 运行时会明确说明；没有线上环境时可以先完成本地部分。

## 6. 学到哪里算够

完成这一轮后，尝试不看正文回答：

- next、tsx、Node.js 和 Express 分别负责什么？
- 同样是 3001，为什么不同机器或容器里可以各有一个？
- TCP 已连通为什么还可能得到 404？HTTP 200 为什么仍可能被浏览器限制读取？
- JSON 对象在哪几步变成字符串、字节，再恢复为对象？
- 等数据库和进行大量同步计算，对其他请求分别有什么影响？
- 浏览器有 Cookie，为什么服务器仍可能返回 401？
- 健康检查成功，为什么不能证明数据库和整条页面链路都正常？

这一轮讲清 V8、libuv 和操作系统的分工，不展开它们的完整源码；讲清连接、传输和协议分层，不背 TCP 状态机或拥塞控制算法。以后遇到具体问题，再沿这些入口继续深入。

需要回看已有实现时：CRUD 看 [14A](../backend-system-learning/14A-从页面操作到数据库-一条线看懂管理后台CRUD.md)，登录实现看 [17A](../backend-system-learning/17A-管理员登录实操-用Session和Cookie保护写接口.md)，部署命令看 [20A](../backend-system-learning/20A-用宝塔和Docker-Compose部署MiniCMS.md)。操作系统与服务器管理继续使用 [Linux 路线](../../linux/README.md)。
