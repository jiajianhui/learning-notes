# 12. 前后端联调：Next.js 管理后台怎样接 Express

## 问题背景

一个使用独立 API 的文章管理系统可以包含两个工程：

```text
server
-> Express 后端

admin-web
-> Next.js 管理后台前端
```

它们不共享运行时状态，只通过 HTTP API 交互。

本章固定使用独立 Express API。如果想理解“Next.js 自己承担后端”具体有什么意义，接着看：

- [12A-Next.js 也能写后端：具体什么时候用](./12A-Nextjs也能写后端-具体什么时候用.md)

---

## 两个工程怎样通过 HTTP 配合

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

第一轮先用客户端请求把管理后台和 Express 接通。

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

页面实现时先完成文章列表、新建和编辑，关闭单表 CRUD 的产品闭环；再接入标签等关联数据，避免同时调试过多链路。

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

## 小结

```text
Next.js 管理后台
-> 收集用户输入，显示 loading、error 和 success 等页面状态

HTTP 请求
-> 把页面上的操作和数据发给 Express

Express
-> 检查身份和输入，执行业务逻辑，再读写数据库

状态码和 JSON
-> 返回给 Next.js，由页面更新显示结果
```

接通这一层后，文章 API 才从“接口集合”变成可以实际操作的小产品。

下一章 12A 会用具体产品场景对比：什么时候可以直接使用 Next.js 的服务端能力，什么时候保留独立 Express 更清楚。
