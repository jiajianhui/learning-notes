# 13. 前后端衔接：浏览器怎样调用 Express

> Mini CMS 前端过渡章：第 12 章已经整理好 Express 后端，第 14 章才开始 Ant Design 跟练。本章不创建项目，只用一条完整请求讲清 `fetch()`、前后端数据传递、跨域和后续前端路线。

## 1. 先看完整协作路线

Mini CMS 最终包含三个独立子工程：

```text
mini-cms/
├── server/                 Express API
├── admin-web-antd/         Ant Design 后台
└── admin-web-shadcn/       shadcn/ui 后台
```

两个前端不会导入 `server` 中的 Router，也不会直接连接 PostgreSQL。页面只能通过 HTTP API 与后端协作。先用第 14 章将要使用的 `fetch()` 看这条流程：

```text
React 页面
-> fetch() 发送 HTTP 请求
-> Express 路由读取和校验数据
-> Prisma 读写 PostgreSQL
-> Express 返回状态码和 JSON
-> fetch() 读取结果
-> React 更新页面
```

前后端需要共同遵守 API contract：

```text
请求方法 + 路径 + 请求字段 + 状态码 + 响应 JSON
```

例如，前端要新建文章，就必须按照后端已经提供的 `POST /api/articles` 发送数据，不能自己猜路径和字段。

---

## 2. `fetch()` 怎样得到文章数组

假设文章列表接口返回状态码 `200`，响应体是：

```json
{
  "data": [
    {
      "id": 1,
      "title": "文章 A"
    },
    {
      "id": 2,
      "title": "文章 B"
    }
  ]
}
```

响应体通过网络传输时是 JSON 文本。先发送请求：

```ts
const response = await fetch(
  "http://localhost:3001/api/articles",
);
```

为了看清结构，可以把此时的 `response` 简化理解成下面这样。这是概念示意，不是浏览器真实打印出的 JavaScript 对象：

```text
response ≈ {
  status: 200,
  ok: true,
  body: ReadableStream(
    '{"data":[{"id":1,"title":"文章 A"},{"id":2,"title":"文章 B"}]}'
  ),
  headers: ...
}
```

`Response` 保存了状态码、响应头和响应体等信息。它的 `body` 是一个可读取的数据流，里面承载着服务器返回的 JSON 文本。

接着调用：

```ts
const body = await response.json();
```

`response.json()` 会直接读取这个 `Response` 对象中的响应体，也就是 `response.body`，等待内容读取完成，再把 JSON 文本解析成 JavaScript 对象。此时得到的 `body` 可以理解为：

```text
body = {
  data: [
    { id: 1, title: "文章 A" },
    { id: 2, title: "文章 B" },
  ],
};
```

最后检查状态码并取出文章数组：

```ts
if (!response.ok) {
  throw new Error(
    body.error?.message ?? `请求失败：${response.status}`,
  );
}

const articles = body.data;
```

此时：

```text
articles = [
  { id: 1, title: "文章 A" },
  { id: 2, title: "文章 B" },
]

Array.isArray(articles) = true
```

```text
Express 返回 JSON 响应体
-> fetch() 得到包含 response.body 的 Response 对象
-> response.json() 读取 response.body，并得到 JavaScript 对象 body
-> body.data 得到 JavaScript 数组 articles
```

Express 中的 `response.json({ data: articles })` 负责发送 JSON；浏览器中的 `response.json()` 负责读取并解析 JSON。两边变量名字可以相同，但动作方向相反。

`response.json()` 只负责解析响应体，不负责判断请求是否成功。404、422 和 500 也可能带有 JSON 响应体，所以还要使用 `response.ok` 判断状态码。

本套路线会练习两种请求方式：第 14 章在 Ant Design 后台中封装 `fetch` 并完成整套文章 CRUD；第 24 章在 shadcn/ui 后台中改用 Axios 请求同一套 API。两边都会把请求细节集中到统一函数中，页面只调用文章和登录 API。

Axios 不是 shadcn/ui 的固定搭配，Ant Design 也不限制使用 `fetch`。这样安排只是为了先掌握浏览器原生请求流程，再学习项目中常见的请求客户端。请求缓存和自动重新请求属于 TanStack Query 等工具解决的另一层问题，暂不加入这两个项目。

---

## 3. 一次新建文章怎样走完前后端

用新建文章把请求和响应连起来。

### 3.1 浏览器发送请求

```ts
const values = {
  title: "第一篇文章",
  content: "正文内容",
};

const response = await fetch(
  "http://localhost:3001/api/articles",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  },
);

const body = await response.json();

if (!response.ok) {
  throw new Error(body.error?.message ?? "新建失败");
}

const article = body.data;
```

`fetch()` 的第二个参数描述怎样发送这次请求：

- `method`：使用哪个 HTTP 方法。
- `headers`：这里告诉后端，请求体是 JSON。
- `body`：真正发送的数据；普通 JavaScript 对象要先经过 `JSON.stringify()`。

### 3.2 Express 处理并返回结果

```ts
articleRouter.post("/", async (request, response) => {
  const input = createArticleSchema.parse(request.body);
  const article = await createArticle(input);

  response.status(201).json({ data: article });
});
```

Express 匹配到这条路由后，会调用处理函数：

- 第一个参数 `request` 用来读取浏览器发来的数据。
- 第二个参数 `response` 用来设置状态码并返回数据。

`request` 和 `response` 只是形参名称，也可以简写成 `req` 和 `res`。这里真正需要掌握的是：前者读取请求，后者返回响应。

### 3.3 把两段代码连起来

```text
React 表单得到 values
-> JSON.stringify(values) 生成 JSON 文本
-> fetch() 把 POST 请求发送到 /api/articles
-> express.json() 把 JSON 解析到 request.body
-> Zod 校验，Prisma 保存文章
-> response.status(201).json({ data: article }) 返回结果
-> fetch() 得到 Response
-> response.json() 解析出 body
-> body.data 得到新文章，React 更新页面
```

这里的 `values` 来自 React 表单。前端代码先把它转换成 JSON，Express 收到后再解析成 `request.body`；后端返回数据时也会转换成 JSON。因此数据库中的日期到了前端通常是字符串，前端类型要按照接口实际返回的字段定义。

Mini CMS 统一使用下面两种响应外形：

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

## 4. 为什么浏览器会遇到跨域

开发阶段，前端和后端使用不同端口：

```text
admin-web-antd     http://localhost:3000
server             http://localhost:3001
admin-web-shadcn   http://localhost:3002
```

协议、主机或端口不同，就属于不同来源。浏览器不会默认让 3000 的页面读取 3001 的响应，因此 Express 要明确允许这个前端地址。

第 14 章会直接完成配置：

```ts
app.use(cors({
  origin: "http://localhost:3000",
}));
```

现在只需要记住三点：

- Apifox 能调用接口，不代表浏览器一定能调用；浏览器还会检查 CORS。
- CORS 决定页面能否读取跨来源响应，不负责判断用户是否登录。
- shadcn/ui 项目启动后，再把 3002 加入后端允许的来源。

前端用环境变量保存后端 API 地址，避免在请求代码中到处写死 `http://localhost:3001`：

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

Next.js 规定，浏览器端代码要读取的环境变量必须以 `NEXT_PUBLIC_` 开头。后面的统一请求函数会读取这个变量并拼接接口路径。

---

## 5. `fetch()` 的两类失败

`fetch()` 不会把所有失败都变成同一种结果：

| 情况 | 会发生什么 | 怎样处理 |
|---|---|---|
| Express 返回 404、422、500 | 仍然得到 `Response` | 检查 `response.ok`，读取后端错误信息 |
| 服务器未启动、断网或浏览器拦截跨域请求 | `fetch()` 抛出错误 | 使用 `try...catch` 显示请求失败 |

因此页面通常要区分四种状态：

```text
loading -> 正在请求
empty   -> 请求成功，但没有数据
error   -> API 返回错误或请求没有完成
success -> 显示数据或成功反馈
```

第 14 章会在真实页面中完成这些状态。遇到具体问题时，统一回到[第 20 章](./20-开始实践后怎样排错.md)沿请求链排查，本章不再展开故障清单。

---

## 6. 后面的两个前端项目怎样学习

```text
第 14 章
-> 创建 admin-web-antd
-> 用 fetch 和 Ant Design 完成文章列表、新建、编辑和删除

第 15～17 章
-> 增加标签、登录和自动化测试
-> 继续完善同一个 server 和 admin-web-antd

第 23～27 章
-> 创建并完成 admin-web-shadcn
-> 用 Axios 请求同一套 Express API
-> 复用同一套 API、登录和 PostgreSQL 数据
-> 完成同等核心管理功能
```

两套前端都是必做的并列项目，都要完成登录、文章管理和标签管理。先做 Ant Design、再做 shadcn/ui，只是为了先稳定 API contract，避免同时学习两套组件组织方式。

如果还想知道“Next.js 也能写后端，为什么这里仍然使用独立 Express”，可以继续看[第 13A 章](./13A-Nextjs也能写后端-具体什么时候用.md)。它不影响后面的项目练习，可以按需阅读。

下一步进入[第 14 章 Ant Design 管理后台跟练](./14-Ant-Design管理后台跟练.md)，开始创建真实 `admin-web-antd`。

## 官方参考

- [MDN：使用 Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)
- [Next.js：环境变量](https://nextjs.org/docs/app/guides/environment-variables)
- [Axios：Getting Started](https://axios-http.com/docs/intro)
- [Express：Response API](https://expressjs.com/en/5x/api.html#res)
- [Express：cors 中间件](https://expressjs.com/en/resources/middleware/cors.html)
