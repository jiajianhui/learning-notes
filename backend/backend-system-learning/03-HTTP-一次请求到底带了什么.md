# 03. HTTP：一次请求到底带了什么

## 问题背景

前端和后端不是直接调用彼此的函数，而是通过 HTTP 交换请求和响应。

后端路由、状态码、JSON、Cookie 和 CORS 都建立在 HTTP 之上。

---

## 核心解释

### 1. 请求包含什么

一条请求可以先拆成：

```text
method + URL + headers + body
```

例如：

```http
POST /api/articles HTTP/1.1
Content-Type: application/json
Cookie: session=...

{
  "title": "我的第一篇文章"
}
```

| 部分 | 这里表示什么 |
|---|---|
| `POST` | 想创建资源 |
| `/api/articles` | 请求文章集合 |
| `Content-Type` | body 是 JSON |
| `Cookie` | 携带登录凭证 |
| body | 新文章数据 |

### 2. 响应包含什么

```text
status code + headers + body
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "data": {
    "id": 1,
    "title": "我的第一篇文章"
  }
}
```

状态码告诉客户端结果属于哪一类，JSON 提供具体数据。

---

## 常用请求方法

| 方法 | 常见用途 | Mini CMS 示例 |
|---|---|---|
| `GET` | 读取 | 获取文章列表 |
| `POST` | 创建或触发动作 | 新建文章、登录 |
| `PATCH` | 部分更新 | 修改文章标题或状态 |
| `DELETE` | 删除 | 删除文章 |

方法表达意图，路径表达操作对象。

---

## 参数可能放在哪里

### 路径参数

```text
GET /api/articles/42
```

`42` 用来定位某一篇文章。

### 查询参数

```text
GET /api/articles?status=draft&page=2
```

适合筛选、排序和分页。

### 请求体

```json
{
  "title": "新标题",
  "content": "正文"
}
```

适合创建和修改数据。

### 请求头

适合内容类型、认证信息和缓存信息，不适合放完整文章正文。

---

## 常用状态码

| 状态码 | 先怎么理解 |
|---|---|
| `200` | 请求成功 |
| `201` | 创建成功 |
| `204` | 成功，但没有响应正文 |
| `400` | 请求格式或参数有问题 |
| `401` | 没有登录或凭证无效 |
| `403` | 已识别身份，但没有权限 |
| `404` | 资源不存在 |
| `409` | 与现有数据冲突，例如 slug 重复 |
| `422` | 数据格式能读，但业务校验不通过 |
| `500` | 服务器内部错误 |

状态码不是错误文案。客户端通常还需要读取 JSON 中的错误信息。

---

## Mini CMS 中用在哪里

```text
GET /api/articles?status=published
-> 读取已发布文章

POST /api/articles
-> 创建文章

PATCH /api/articles/42
-> 更新 42 号文章

DELETE /api/articles/42
-> 删除 42 号文章
```

---

## 常见误区

- JSON 是数据格式，不等于 HTTP，也不等于 API。
- `POST` 不一定成功，结果仍要看状态码。
- 浏览器中的 `fetch()` 返回 Response 对象，不代表业务成功；`response.ok` 为 `true` 才表示状态码属于 2xx。
- `401` 表示还没有有效身份，`403` 表示身份已经确认但没有权限。
- 如果失败也返回 `200`，客户端就不能直接根据 HTTP 状态判断成败；应该使用对应状态码，再在 JSON 中补充原因。

---

## 小结

后端接到的不是一个抽象的“数据”，而是一条结构化 HTTP 请求：

```text
方法说明想做什么
路径说明操作谁
headers 提供附加信息
body 携带数据
状态码说明结果类型
```

理解 HTTP，才能理解 Express 在帮你处理什么。
