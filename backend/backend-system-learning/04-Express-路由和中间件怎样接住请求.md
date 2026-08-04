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

## 核心解释

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
app.use("/api/articles", articleRouter);
app.use(notFoundHandler);
app.use(errorHandler);
```

请求按注册顺序向下经过中间件。

404 和错误处理中间件通常放在路由之后。

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
| 请求头 | `Authorization: ...` | `req.headers.authorization` |

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

## Mini CMS 中用在哪里

```text
app.ts
-> 注册通用中间件和模块路由

article.routes.ts
-> 匹配文章路径和 HTTP 方法

handler
-> 读取请求，调用业务函数，返回响应
```

后续进入第 19 章的项目阶段 1 时，会先实现：

- `GET /api/health`
- 内存版 `GET /api/articles`

---

## 常见误区

- 路径正确但方法错误，仍然匹配不到路由。
- 忘记 `express.json()` 时，`request.body` 可能是 `undefined`。
- 认证中间件要放在受保护路由之前，404 和错误处理要放在路由之后；顺序反了，请求就不会经过正确处理。
- 发送响应后继续执行代码，可能出现重复响应错误。
- Express 路由能工作，不代表数据已经写进数据库。

---

## 小结

```text
Node.js 让服务器能够运行
Express app 组织服务器
route 决定哪类请求由谁处理
middleware 处理请求经过的公共步骤
handler 读取输入并返回响应
req 读取客户端输入
res 只发送一次结果
next 让请求继续向后执行
```

这就是请求进入后端后的第一段路径。
