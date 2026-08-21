# 13. 前后端衔接：浏览器怎样调用 Express

> Mini CMS 前端过渡章：第 12 章已经整理好 Express 后端，第 14 章才开始 Ant Design 跟练。本章不创建项目，只讲清浏览器和 Express 通过 HTTP 协作时最容易混淆的对象、数据转换、跨域和错误判断，并总览后面的两个前端项目。

## 1. 前端和后端只通过 HTTP 协作

Mini CMS 最终包含三个独立子工程：

```text
mini-cms/
├── server/                 Express API
├── admin-web-antd/         Ant Design 后台
└── admin-web-shadcn/       shadcn/ui 后台
```

两个前端不会导入 `server` 中的 Router 或 Repository，也不会直接连接 PostgreSQL。一次页面操作只沿着下面这条线前进：

```text
浏览器页面
-> fetch() 发送 HTTP 请求
-> Express 校验数据并调用 Prisma
-> PostgreSQL 查询或保存数据
-> Express 返回 HTTP 响应
-> fetch() 读取结果
-> React 更新页面
```

前后端真正共享的是 API contract：请求方法、路径、字段、状态码和 JSON 结构，而不是内存中的函数或 TypeScript 类型。

---

## 2. 不要把几种 response 混成一个对象

### 2.1 HTTP 响应不是 JavaScript 对象

HTTP 只规定网络响应包含状态码、响应头和响应体：

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"data":{"id":1,"title":"第一篇文章"}}
```

HTTP 本身没有一个叫 `res` 的变量。`res` 和 `Response` 是不同运行环境为了操作 HTTP 消息提供的代码对象。

### 2.2 服务器用 Node 和 Express 对象发送响应

Node 内置 `node:http` 会为请求提供 `http.ServerResponse`。Express 在它的基础上增加了更方便的方法，路由中通常把这个对象写成 `res`：

```ts
articleRouter.post("/", async (request, res) => {
  const input = createArticleSchema.parse(request.body);
  const article = await createArticle(input);

  res.status(201).json({ data: article });
});
```

这里的 `res` 只存在于 Express 服务器中。`status()` 设置状态码，`json()` 把 JavaScript 数据转换成 JSON 并发送出去。

`res` 只是变量名，写成 `response` 也可以；真正决定它是什么的是 Express 传入的对象。

### 2.3 浏览器用 fetch `Response` 读取响应

```ts
const response = await fetch(
  "http://localhost:3001/api/articles",
);

const body = await response.json();
```

这里的 `response` 是浏览器 Fetch API 的 `Response`：

- `status`、`ok` 和 `headers` 读取响应信息。
- `json()` 异步读取响应体并解析 JSON。
- `body.data` 才是 Express 返回的文章数据。

把它们放回同一条线：

```text
Express res.status(201).json({ data: article })
-> Node 生成 HTTP 响应
-> HTTP 把状态码、响应头和 JSON 传到浏览器
-> fetch() 得到浏览器 Response
-> response.json() 解析出 body
-> body.data 得到文章
```

| 所在位置 | 对象 | 负责什么 |
|---|---|---|
| 网络协议 | HTTP 响应 | 传输状态码、响应头和响应体 |
| Node 服务器 | `http.ServerResponse` | 写出底层 HTTP 响应 |
| Express 服务器 | 路由中的 `res` | 方便地设置并发送响应 |
| 浏览器 | fetch `Response` | 读取已经收到的响应 |

同理，Express `request` 和浏览器 Fetch API 的 `Request` 也不是同一个对象，它们分别位于服务器和浏览器两端。

---

## 3. JavaScript 数据要转换后才能穿过 HTTP

HTTP 不会把内存中的对象原样搬到另一端。请求和响应都要经过 JSON 转换：

```text
React 表单值
-> JSON.stringify() 生成 JSON 文本
-> HTTP 请求体
-> express.json() 解析
-> request.body

Prisma 文章对象
-> res.json() 序列化
-> HTTP 响应体
-> response.json() 解析
-> body.data
```

转换后要注意：

- `Date` 通常变成字符串，前端需要再格式化。
- `undefined`、类方法和原型关系不会原样保留。
- TypeScript 类型只在开发时检查，不会跟着 HTTP 传输。
- 前端类型必须与真实 JSON 对齐，不能凭页面需要猜字段。

Mini CMS 因此统一使用两种响应外形：

```json
{ "data": {} }
```

```json
{
  "error": {
    "code": "ARTICLE_NOT_FOUND",
    "message": "文章不存在"
  }
}
```

---

## 4. 不同端口为什么会遇到 CORS

开发环境使用三个地址：

```text
admin-web-antd     http://localhost:3000
server             http://localhost:3001
admin-web-shadcn   http://localhost:3002
```

协议、主机和端口合起来叫 origin（来源）。端口不同，就属于不同来源。

浏览器页面读取另一个来源的响应时会检查 CORS：

```text
3000 页面请求 3001 API
-> 浏览器检查 3001 是否允许 3000
-> 允许：页面可以读取响应
-> 不允许：浏览器拦截响应
```

Apifox、curl 和服务器之间的请求不受浏览器同一套 CORS 检查。因此“Apifox 成功、浏览器失败”时，应先检查来源和 CORS，不要先怀疑 Prisma。

Ant Design 项目开始时，Express 只需要允许 3000：

```ts
app.use(cors({
  origin: "http://localhost:3000",
}));
```

浏览器发送带 JSON 的写请求时，还可能先发送 `OPTIONS` 预检请求。`cors` 中间件会处理，不需要为每个文章路由单独编写。

前端同时要知道 Express 在哪里：

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

这个变量保存的是 API 地址，不是前端自己的 3000 地址。`NEXT_PUBLIC_` 变量会进入浏览器，只能放公开信息，不能放数据库密码和密钥。

CORS 也不是登录认证。第 16、16A 章增加 Cookie 登录时，还要让后端允许 `credentials`，让前端 fetch 使用 `credentials: "include"`，并继续验证 Session。第 24 章创建 shadcn/ui 后台后，再把 3002 加入允许来源。

---

## 5. fetch 为什么不能只写成功流程

`fetch()` 遇到两类失败时表现不同：

| 情况 | fetch 结果 | 前端怎样判断 |
|---|---|---|
| Express 返回 404、422、500 | 仍然得到 `Response` | 检查 `response.ok` |
| 服务器未启动、断网或 CORS 拦截 | Promise rejected | 使用 `try...catch` |

最小请求函数至少要同时处理这两层：

```ts
const response = await fetch(url);
const body = await response.json();

if (!response.ok) {
  throw new Error(body.error?.message ?? "请求失败");
}

return body.data;
```

页面再把请求过程显示成四种状态：

```text
loading -> 正在读取
empty   -> 请求成功，但没有数据
error   -> 网络失败或 API 返回错误
success -> 显示数据或成功反馈
```

这些是两个前端项目的共同要求，不属于某一个 UI 库。

---

## 6. 常见问题先判断发生在哪一层

| 现象 | 优先检查 |
|---|---|
| Apifox 成功，浏览器失败 | 浏览器控制台、来源、Express CORS |
| 浏览器无法连接 | Express 是否启动、端口和 API 地址 |
| 返回 404 | 请求方法、完整 URL、Router 挂载前缀 |
| 返回 422 | 请求字段、类型和 Zod 错误详情 |
| `body.data` 是 `undefined` | 是否 `await response.json()`，响应是否真有 `data` |
| 新建成功但列表没变化 | 前端是否重新请求或更新本地状态 |
| 登录后仍然 401 | Cookie、`credentials`、CORS 和 Session |

排查时继续沿着同一条请求链，不要在所有文件里同时改代码。

---

## 7. 后面的两个前端项目怎样学习

```text
第 14 章
-> 创建 admin-web-antd
-> 用 Ant Design 完成文章列表、新建、编辑和删除

第 15～17 章
-> 增加标签、登录和自动化测试
-> 继续完善同一个 server 和 admin-web-antd

第 23～27 章
-> 创建并完成 admin-web-shadcn
-> 复用同一套 API、登录和 PostgreSQL 数据
-> 完成同等核心管理功能
```

两套前端都是必做的并列项目，都要完成登录、文章管理和标签管理。先做 Ant Design、再做 shadcn/ui，只是为了先稳定 API contract，避免同时学习两套组件组织方式。

如果想比较“既然 Next.js 也能写服务端代码，为什么这里还使用独立 Express”，阅读架构选读：

- [13A-Next.js 也能写后端：具体什么时候用](./13A-Nextjs也能写后端-具体什么时候用.md)

下一步进入[第 14 章 Ant Design 管理后台跟练](./14-Ant-Design管理后台跟练.md)，开始创建真实 `admin-web-antd`。

## 官方参考

- [Node.js：HTTP ServerResponse](https://nodejs.org/api/http.html#class-httpserverresponse)
- [Express：Response API](https://expressjs.com/en/5x/api.html#res)
- [MDN：Response](https://developer.mozilla.org/zh-CN/docs/Web/API/Response)
- [MDN：使用 Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)
- [Express：cors 中间件](https://expressjs.com/en/resources/middleware/cors.html)
