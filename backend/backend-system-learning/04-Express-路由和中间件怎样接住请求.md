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

## `request` 和 `response`

常用输入：

```ts
request.params
request.query
request.body
request.headers
```

常用输出：

```ts
response.status(201)
response.json(data)
response.sendStatus(204)
```

一般一次请求只发送一次响应。

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
- 中间件注册顺序错误，会导致认证、404 或错误处理失效。
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
```

这就是请求进入后端后的第一段路径。
