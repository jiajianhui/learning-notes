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

本章固定使用独立 Express API。先完成前后端联调；学完主线后，如果想比较另一种项目结构，再把下面这章当作选读：

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

一个网址的协议、主机和端口合起来叫做来源（origin）。这里两个地址的端口不同，因此浏览器把它们看作两个来源。

浏览器不会默认允许页面读取另一个来源的响应。安装 `cors` 包后，Express 可以通过这个中间件明确允许管理后台的来源：

```ts
import cors from "cors";

app.use(cors({
  origin: "http://localhost:3000",
}));
```

CORS 是浏览器的跨来源访问规则。当前只需要允许这个管理后台地址；登录后怎样跨来源携带 Cookie，第 13 章再处理。

### 2. 管理后台使用 API 地址

`admin-web/.env.local`：

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

它会进入浏览器代码，所以只能放公开 API 地址，不能放数据库密码和服务器密钥。

### 3. 需要交互的文件使用 `"use client"`

Ant Design 表格、表单、弹窗和点击事件需要客户端交互：

```tsx
"use client";

import { Table } from "antd";
```

当前只要记住：使用点击事件、表单状态或浏览器 API 的文件，需要在顶部写 `"use client"`。第一轮先用这种方式把管理后台和 Express 接通。

---

## 最小请求函数

```ts
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getArticles() {
  const response = await fetch(`${API_URL}/api/articles`);

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
```

不能只写一个成功后的 `setData()`。

---

## 管理后台页面

```text
/admin/articles
/admin/articles/new
/admin/articles/[id]/edit
```

页面实现时先完成文章列表、新建、编辑和删除，关闭单表 CRUD 的产品闭环。分页和标签等功能放到后续阶段。

Ant Design 主要负责：

- `Table` 展示列表。
- `Form` 收集和校验输入。
- `Select` 选择文章状态。
- `Modal` 确认删除。
- `Alert`、`message` 展示反馈。

后台页面不需要重新做视觉临摹，重点是状态和流程完整。

---

## 一条创建文章链路

```text
Ant Design Form 提交
-> fetch POST /api/articles
-> Express 路由接收请求
-> 参数校验
-> Prisma Client 生成 INSERT SQL
-> PostgreSQL 执行 SQL 并写入数据
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
-> 检查输入，执行业务逻辑，再读写数据库

状态码和 JSON
-> 返回给 Next.js，由页面更新显示结果
```

接通这一层后，文章 API 才从“接口集合”变成可以实际操作的小产品。

下一章进入登录和安全。12A 是架构对比选读，建议完成第一轮主线后再看。
