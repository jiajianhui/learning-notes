# 10. 前后端联调：Next.js 管理后台怎样接 Express

## 问题背景

Mini CMS 包含两个独立工程：

```text
server
-> Express 后端

admin-web
-> Next.js 管理后台前端
```

它们不共享运行时状态，只通过 HTTP API 交互。

本章固定使用独立 Express API。如果想理解“Next.js 自己承担后端”具体有什么意义，接着看：

- [10A-Next.js 也能写后端：具体什么时候用](./10A-Nextjs也能写后端-具体什么时候用.md)

---

## 核心解释

### 1. 项目边界

```text
code/
├── server/
│   └── package.json
└── admin-web/
    └── package.json
```

它们有独立依赖、启动命令和环境变量。

开发环境：

```text
admin-web：http://localhost:3000
server：http://localhost:3001
```

### 2. 管理后台使用 API 地址

`admin-web/.env.local`：

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

它会进入浏览器代码，所以只能放公开 API 地址，不能放数据库密码和服务器密钥。

### 3. 交互组件运行在客户端

Ant Design 表格、表单、弹窗和点击事件需要客户端交互：

```tsx
"use client";

import { Table } from "antd";
```

Next.js App Router 的 page 和 layout 默认是 Server Components；需要状态、事件或浏览器 API 的边界使用 Client Components。

第一轮可以先用客户端请求把流程看清楚，不急着加入 BFF 或 Server Actions。

---

## 最小请求函数

```ts
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getArticles() {
  const response = await fetch(`${API_URL}/api/articles`, {
    credentials: "include",
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error?.message ?? "请求失败");
  }

  return body.data;
}
```

这里的 `response` 是浏览器 `fetch()` 收到的 Response 对象，代表 Express 已经返回给前端的 HTTP 响应；它不是后端 handler 中用于发送结果的 Express `res`。

```text
Express res.json(...)
-> HTTP 响应
-> fetch 得到 response
-> response.json() 读取 JSON body
```

前端需要同时处理：

```text
网络失败
HTTP 错误状态
成功 JSON
加载状态
空状态
登录失效
```

不能只写一个成功后的 `setData()`。

---

## 管理后台页面

```text
/login
/admin/articles
/admin/articles/new
/admin/articles/[id]/edit
/admin/tags
```

本章先完成文章列表、新建和编辑页面，关闭单表 CRUD 的产品闭环。`/admin/tags` 等读完第 11 章、后端建立文章标签关系后再实现。

Ant Design 主要负责：

- `Table` 展示列表。
- `Form` 收集和校验输入。
- `Select` 选择状态和标签。
- `Modal` 确认删除。
- `Alert`、`message` 展示反馈。
- `Pagination` 控制分页参数。

后台页面不需要重新做视觉临摹，重点是状态和流程完整。

---

## 一条创建文章链路

```text
Ant Design Form 提交
-> fetch POST /api/articles
-> 浏览器携带 Cookie
-> Express CORS 和认证中间件
-> 参数校验
-> PostgreSQL INSERT
-> 返回 201
-> 前端提示成功并跳转列表
```

如果失败，前端保留用户输入并显示明确错误。

---

## 常见误区

- `admin-web` 虽然叫管理后台，仍然是用户操作的前端界面；本项目真正的后端是 Express。
- `admin-web` 不应绕过 Express 并携带数据库密码查询 PostgreSQL；它只通过 HTTP API 获取数据。
- 所有文件都加 `"use client"` 会扩大客户端代码范围；只在需要状态、事件和浏览器 API 的组件边界添加。
- 跨来源请求如果没有 `credentials: "include"`，浏览器不会按需要携带登录 Cookie，接口会继续返回 401。
- 前端要求携带 Cookie 时，Express 的 CORS 也必须允许准确来源和 credentials，否则浏览器会拦截响应。
- 只写成功后的页面更新，会让登录失效、数据冲突和参数错误都变成模糊的“请求失败”；分别处理常见状态。
- 前端对当前数组切片，只能分页已经下载的数据；真正分页和筛选应由后端查询数据库。

---

## 小结

```text
Next.js 管理用户操作和页面状态
Express 管接口、业务和权限
PostgreSQL 管长期数据
HTTP 是两个工程之间的边界
```

接通这一层后，Mini CMS 才从“接口集合”变成可以实际使用的小产品。

下一章 10A 会用具体产品场景对比：什么时候可以直接使用 Next.js 的服务端能力，什么时候保留独立 Express 更清楚。
