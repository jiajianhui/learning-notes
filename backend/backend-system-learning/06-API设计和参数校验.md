# 06. API 设计：让前端知道怎样请求，也知道哪里错了

## 问题背景

接口不只是一个能访问的 URL，而是前端和后端之间的约定：

```text
请求什么路径
使用什么方法
参数放在哪里
成功返回什么
失败返回什么
```

这套约定也叫 API contract。

---

## 核心解释

### 1. 路径描述资源，方法描述动作

```text
GET    /api/articles
GET    /api/articles/:id
POST   /api/articles
PATCH  /api/articles/:id
DELETE /api/articles/:id
```

这里的资源是 `articles`，HTTP 方法表示读取、创建、更新或删除。

登录这类动作可以写成：

```text
POST /api/auth/login
POST /api/auth/logout
```

不需要为了形式纯粹，把所有业务动作都硬塞进 CRUD。

### 2. 响应结构要稳定

单条数据：

```json
{
  "data": {
    "id": 1,
    "title": "文章标题"
  }
}
```

列表和分页：

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0
  }
}
```

错误：

```json
{
  "error": {
    "code": "SLUG_ALREADY_EXISTS",
    "message": "slug 已存在",
    "details": null
  }
}
```

前端不应该每个接口猜一种完全不同的结构。

---

## 参数校验分三层

### 1. 格式校验

```text
title 是否是字符串？
page 是否是正整数？
status 是否属于 draft / published？
```

这类检查适合在请求刚进入业务逻辑前完成。

### 2. 业务校验

```text
发布文章时正文是否完整？
草稿是否允许没有 published_at？
当前管理员是否能执行这个动作？
```

这类规则属于业务层。

### 3. 数据库约束

```text
slug 必须唯一
title 不能为空
article_tags 引用的文章必须存在
```

数据库是最后一道保护。即使前面校验过，也不能取消必要约束。

---

## TypeScript 类型不能代替运行时校验

```ts
type CreateArticleInput = {
  title: string;
  slug: string;
  content: string;
};
```

这个类型可以检查你自己写的 TypeScript 代码，但浏览器、Apifox 或其他客户端发送的 JSON 不会自动遵守它。

所以请求进入后端时仍要：

```text
先把外部输入当作未知数据
-> 做运行时校验
-> 通过后再交给业务代码
```

TypeScript 负责开发期类型提示，校验代码负责运行时边界。

---

## 创建文章的契约

请求：

```json
{
  "title": "我的第一篇文章",
  "slug": "my-first-article",
  "summary": "摘要",
  "content": "正文",
  "status": "draft"
}
```

先明确规则：

- `title` 必填，去掉首尾空格后不能为空。
- `slug` 必填，只允许约定字符，并且不能重复。
- `content` 必填。
- `status` 只能是 `draft` 或 `published`。
- 未提供 `status` 时默认为 `draft`。

明确规则之后，才选择具体校验库或手写最小校验。

---

## Apifox 在这里做什么

接口完成后至少检查：

- 正常参数。
- 缺少必填字段。
- 字段类型错误。
- 不允许的状态值。
- 重复 slug。
- 不存在的文章 id。
- 未登录请求。

管理后台主要验证真实操作流程，Apifox 更适合主动构造错误输入。

---

## 常见误区

- 只依赖 Ant Design 表单校验，后端完全不校验。
- 状态码和错误结构不稳定，前端只能匹配错误文案。
- 把数据库报错原样当作业务错误返回。
- 分页只在前端对当前数组切片。
- 路径里放动词过多，却看不出操作的资源。

---

## 小结

```text
HTTP 方法和路径定义入口
请求结构定义允许输入什么
校验保护业务边界
数据库约束保护最终数据
状态码和 JSON 让客户端理解结果
```

读完本章后，应该先写清楚文章 CRUD 的接口契约，再开始连接数据库。
