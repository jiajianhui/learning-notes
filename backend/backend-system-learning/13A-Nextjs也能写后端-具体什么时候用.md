# 13A. Next.js 也能写后端：具体什么时候用

> 架构选读：先用第 13 章理解浏览器、Next.js 前端与独立 Express 的边界。本章只比较两种服务端方案，不修改 Mini CMS，也不打断第 14～17 章的实操主线。

## 问题背景

本章只回答两个架构问题：

```text
既然 Next.js 能写后端，为什么还需要 Express？
Next.js 的服务端能力和独立 Express 分别适合什么边界？
```

先记住结论：

```text
Next.js 可以承担很多常见网站的后端功能。
如果选择 Next.js 全栈，通常直接使用它的服务端能力，不再往里面套 Express。
```

---

## Next.js 的服务端能力分成什么

### 1. Server Component：服务器先读取数据，再生成页面

例如个人网站的文章列表：

```tsx
// app/articles/page.tsx

import { findPublishedArticles } from "@/lib/articles";

export default async function ArticlesPage() {
  const articles = await findPublishedArticles();

  return <ArticleList articles={articles} />;
}
```

数据流：

```text
浏览器请求页面
-> Next.js Server Component
-> 服务端数据访问函数
-> PostgreSQL
-> 返回生成后的页面
```

如果读取数据只服务于当前 Next.js 页面，Server Component 可以直接调用服务端数据层，不需要先请求自己写的 `/api/articles`。

适合：

- 个人网站文章列表。
- 商品详情页。
- 登录后的仪表盘首屏数据。
- 需要服务端渲染的内容页。

### 2. Server Action：处理自己页面里的数据修改

例如联系表单：

```ts
// app/contact/actions.ts

"use server";

export async function submitContact(formData: FormData) {
  const email = formData.get("email");
  const message = formData.get("message");

  await saveContactMessage({ email, message });
}
```

页面可以把 action 交给表单：

```tsx
<form action={submitContact}>
  <input name="email" />
  <textarea name="message" />
  <button type="submit">发送</button>
</form>
```

数据流：

```text
用户提交当前 Next.js 页面
-> Server Action 在服务器运行
-> 校验数据和权限
-> 写数据库或调用外部服务
-> 页面重新获取结果
```

适合：

- 联系表单。
- 新建或编辑文章。
- 收藏、点赞。
- 修改个人资料。
- 登录和退出。

Server Action 虽然不像手写 API 路径，但它仍然可以被客户端触发，必须重新校验输入、身份和权限。

### 3. Route Handler：提供真正的 HTTP 接口

```ts
// app/api/articles/route.ts

export async function GET() {
  const articles = await findPublishedArticles();
  return Response.json({ data: articles });
}

export async function POST(request: Request) {
  const input = await request.json();
  const article = await createArticle(input);

  return Response.json(
    { data: article },
    { status: 201 },
  );
}
```

这里的 `Request` 和 `Response` 是 Web 标准对象，不是 Express 增强过的 `req` 和 `res`。职责相同，都是接收和返回 HTTP 数据，但读取 body、设置状态码的具体 API 不同。

这和 Express route 的职责很接近：

```text
接收 HTTP 请求
-> 读取 method、headers、query 和 body
-> 校验数据和身份
-> 调用业务和数据库
-> 返回状态码、headers 和 body
```

适合：

- 浏览器客户端需要通过 `fetch` 请求数据。
- 给第三方或移动端提供 JSON API。
- 接收支付、CMS 或 GitHub webhook。
- 返回 RSS、XML、文本或文件。
- 为前端代理外部 API。

Route Handler 是公开 HTTP 接口。只要知道地址，其他客户端也可以请求，所以不能因为它在 Next.js 工程里就跳过认证和校验。

---

## Next.js 后端的五个具体场景

### 场景 1：个人网站的联系表单

需求：

```text
访客填写邮箱和消息
-> 保存数据库或发送邮件
-> 页面显示提交成功
```

可以使用：

```text
Next.js 页面
-> Server Action
-> 邮件服务或 PostgreSQL
```

只有当前网站使用这个功能，不需要为了一个表单单独启动 Express 服务。

### 场景 2：和网站绑定的小型管理后台

需求：

```text
管理员登录
-> 新建文章
-> 修改状态
-> 前台网站立即读取
```

可以使用：

```text
Server Component
-> 读取文章列表

Server Action
-> 创建、编辑和发布文章

Route Handler
-> 提供 webhook 或公开文章 API
```

如果前台、后台和数据都只属于同一个 Next.js 产品，一个工程就能完成完整闭环。

### 场景 3：接收第三方 webhook

例如支付平台通知付款成功：

```text
支付平台
-> POST /api/webhooks/payment
-> Next.js Route Handler 验证签名
-> 更新订单
```

这类功能需要明确的公开 URL，适合 Route Handler，不适合 Server Action。

### 场景 4：隐藏第三方密钥并整理数据

浏览器不能直接带着私密 API key 请求第三方服务。

可以使用：

```text
浏览器
-> Next.js Route Handler
-> 在服务器读取私密 API key
-> 请求一个或多个外部服务
-> 筛选、组合后返回前端
```

这就是常见的 Backend for Frontend：后端层主要为当前前端整理数据、保护密钥和统一接口。

### 场景 5：生成 RSS、文本和公开数据

```text
/rss.xml
/api/public/articles
/.well-known/...
```

Route Handler 不只能返回 JSON，也可以返回 XML、文本、图片和文件。

---

## 一个纯 Next.js 全栈项目长什么样

```text
my-site/
├── app/
│   ├── articles/
│   │   └── page.tsx             Server Component 读取数据
│   ├── admin/articles/
│   │   └── page.tsx             管理页面
│   ├── api/articles/
│   │   └── route.ts             公开 HTTP API
│   └── actions/
│       └── article-actions.ts    Server Actions
├── lib/
│   ├── db.ts                     数据库连接
│   ├── auth.ts                   登录和权限
│   └── articles.ts               业务和数据访问
└── package.json
```

数据流可能有三条：

```text
页面读取
-> Server Component -> 数据层 -> PostgreSQL

自己页面修改数据
-> Server Action -> 业务层 -> PostgreSQL

外部客户端或 webhook
-> Route Handler -> 业务层 -> PostgreSQL
```

这里没有 Express，但仍然有真正的后端职责：校验、认证、业务逻辑、数据库和错误处理。

---

## Next.js 全栈和独立 Express 的区别

| 判断 | Next.js 全栈 | Next.js + 独立 Express |
|---|---|---|
| 前后端是否属于同一产品 | 非常适合 | 也可以，但多一层服务 |
| 是否只服务一个 Web 前端 | 很适合 | 可能显得偏重 |
| 是否要给多个客户端提供稳定 API | 可以做 | 边界通常更清楚 |
| 是否需要单独部署和扩容后端 | 不够独立 | 更自然 |
| 是否需要完整学习后端框架 | 框架约定会隐藏一部分 | 更适合观察后端边界 |
| 是否大量依赖 Express 中间件 | 不适合 | 适合 |

Next.js 官方把这类能力定位为 Backend for Frontend，并提醒它不是所有后端场景的完整替代品。

---

## 为什么不把 Express 塞进 Next.js

技术上可以用自定义服务器启动 Next.js，再把 Express 接进去。

但通常会变成：

```text
Next.js 已经有自己的路由和服务器能力
-> 又增加一层 Express 自定义服务器
-> 部署、升级和框架优化更复杂
```

Next.js 官方说明，大多数项目不需要 custom server；使用它还会失去部分框架优化。

更清楚的选择是二选一：

```text
方案 A
Next.js 页面 + Next.js 服务端能力 + PostgreSQL

方案 B
Next.js 管理前端 + 独立 Express API + PostgreSQL
```

不要默认选择“Next.js 里面再套 Express”。

---

## 为什么这套学习仍然使用独立 Express

这套后端学习的第一轮目标包含：

- 看清 HTTP API 边界。
- 学习 Express route 和 middleware。
- 理解独立的认证、CORS 和错误处理。
- 使用 Apifox 直接检查 API。
- 让前端和后端能够分别启动。
- 理解独立后端怎样测试和部署。

所以本次路线保持：

```text
Next.js 管理后台
-> 独立 Express API
-> PostgreSQL
```

这不代表独立 Express 是文章系统的唯一实现方式，而是它更符合当前学习目标。

完成第一个独立后端项目后，可以做一个很小的对比练习：

```text
把 GET /api/articles
用 Next.js Route Handler 再实现一次
```

对比两种写法的路由、请求对象、错误处理和部署边界，不需要把整个项目推翻重写。

---

## 怎样选择

优先考虑 Next.js 全栈：

- 只有一个 Web 产品。
- 前台、后台和 API 强绑定。
- 主要是表单、CRUD、内容读取和登录。
- 希望减少项目和部署数量。
- 不要求独立后端技术边界。

优先考虑独立 Express：

- API 要服务 Web、移动端或其他客户端。
- 后端需要独立部署、扩容或交给不同团队。
- 有较多后台任务、常驻连接或独立服务需求。
- 大量使用 Express 中间件生态。
- 当前目标就是系统学习后端。

如果仍然拿不准，先问：

```text
这个后端只服务当前 Next.js 页面，
还是会作为独立服务被多个客户端长期使用？
```

---

## 小结

```text
Server Component
-> 当前页面在服务器读取数据

Server Action
-> 当前 Next.js 页面修改数据

Route Handler
-> 接收 HTTP 请求，并返回 JSON、文本或文件等响应

独立 Express
-> 单独运行和部署，可以同时给多个客户端提供 API
```

页面和数据功能都只服务同一个 Next.js 网站时，可以直接使用 Next.js 的服务端能力。API 需要给多个客户端使用、单独部署，或者希望完整练习后端请求流程时，使用独立 Express 更清楚。

## 官方参考

- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Next.js Backend for Frontend](https://nextjs.org/docs/app/guides/backend-for-frontend)
- [Next.js 数据安全](https://nextjs.org/docs/app/guides/data-security)
- [Next.js Custom Server](https://nextjs.org/docs/app/guides/custom-server)
