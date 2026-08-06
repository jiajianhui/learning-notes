# 04. Express：路由和中间件怎样接住请求

## 问题背景

Node.js 可以直接写 HTTP 服务器，但路由匹配、JSON 解析和错误组织都比较底层。

Express 把常见 Web 服务器能力整理成：

```text
app
route
middleware
handler
```

---

## Express 怎样组织一次请求

### 1. `app` 是整个 Express 应用

```ts
import express from "express";

const app = express();
```

后面的中间件和路由都会注册到这个应用上。

### 2. 路由根据方法和路径匹配请求

```ts
app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});
```

它只匹配：

```text
GET /api/health
```

`POST /api/health` 或 `GET /api/articles` 都不会进入这个 handler。

### 3. 中间件在请求链路中间工作

```ts
app.use(express.json());
```

这个中间件读取 JSON 请求体，把结果放到：

```ts
request.body
```

如果没有它，创建文章时可能拿不到 JSON body。

自定义中间件通常会收到第三个参数 `next`：

```ts
app.use((request, _response, next) => {
  console.log(request.method, request.path);
  next();
});
```

这里的 `_response` 仍然是 response，下划线只表示这段代码没有使用它。

```text
request
-> 读取本次请求

response
-> 需要时直接结束请求并返回结果

next()
-> 当前中间件处理完了，继续执行后面的中间件或路由
```

如果中间件既不发送响应，也不调用 `next()`，请求会停在这里。

### 4. 中间件顺序很重要

```ts
app.use(express.json());

app.use((request, _response, next) => {
  console.log(request.method, request.path);
  next();
});

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});
```

请求按注册顺序向下执行。这里先解析 JSON、再记录请求，最后才尝试匹配健康检查路由。

---

## 最小文章路由

```ts
import { Router } from "express";

const articleRouter = Router();

articleRouter.get("/", (_request, response) => {
  response.json({ data: [] });
});

articleRouter.post("/", (request, response) => {
  const article = {
    id: 1,
    title: request.body.title,
  };

  response.status(201).json({ data: article });
});

export { articleRouter };
```

在应用中挂载：

```ts
app.use("/api/articles", articleRouter);
```

组合后的路径是：

```text
GET  /api/articles
POST /api/articles
```

---

## `req` 接收输入，`res` 返回结果

Express 匹配到路由后，会调用 handler，并传入两个最重要的对象：

```ts
app.get("/api/articles/:id", (req, res) => {
  // 从 req 读取这次请求
  // 用 res 返回这次请求的结果
});
```

`req` 和 `res` 只是常用简写，下面两种命名没有区别：

```ts
(req, res) => {}
(request, response) => {}
```

它们把第 03 章的 HTTP 请求和响应带进了代码：

```text
浏览器发送 HTTP 请求
-> Express 把请求信息放进 req
-> handler 读取输入并处理
-> res 生成 HTTP 响应
-> 浏览器收到状态码、headers 和 body
```

### 从 `req` 的哪里读取数据

| HTTP 中的数据 | 请求示例 | Express 中读取 |
|---|---|---|
| 路径参数 | `/api/articles/42` | `req.params.id` |
| 查询参数 | `?status=draft&page=2` | `req.query.status`、`req.query.page` |
| JSON 请求体 | `{ "title": "新文章" }` | `req.body.title` |
| 请求头 | `Content-Type: application/json` | `req.headers["content-type"]` |

例如：

```ts
articleRouter.patch("/:id", (request, response) => {
  const articleId = request.params.id;
  const title = request.body.title;

  return response.json({
    data: { id: articleId, title },
  });
});
```

`request.body` 依赖前面注册的 `express.json()`。这些值都来自客户端，进入业务代码前仍然要做类型转换和参数校验。

### 用 `res` 发送什么

```ts
response.status(201)
```

只设置状态码，还没有发送响应；通常继续链式调用：

```ts
return response.status(201).json({ data: article });
```

`response.json(data)` 会发送 JSON body。`response.sendStatus(204)` 会直接发送状态码，不带正文，常用于删除成功：

```ts
return response.sendStatus(204);
```

一次请求只能发送一次响应。分支提前返回时使用 `return`，可以避免后面的代码再次响应：

```ts
if (!article) {
  return response.status(404).json({
    error: { message: "文章不存在" },
  });
}

return response.json({ data: article });
```

---

## 放进文章后端中理解

```text
app.ts
-> 注册通用中间件和模块路由

article.routes.ts
-> 匹配文章路径和 HTTP 方法

handler
-> 读取请求，调用业务函数，返回响应
```

现在如果要做最小练习，可以先实现：

- `GET /api/health`
- 内存版 `GET /api/articles`

---

## 小结

```text
app
-> 注册这个 Express 服务要使用的中间件和路由

route
-> 根据请求方法和路径，找到对应的处理函数

middleware
-> 按注册顺序处理日志、解析 JSON 等公共步骤

req
-> 读取路径参数、查询参数、请求体和请求头

res
-> 返回状态码和数据，一次请求只能发送一次响应

next()
-> 当前中间件处理完后，继续执行后面的中间件或路由
```

这就是请求进入后端后的第一段路径。
