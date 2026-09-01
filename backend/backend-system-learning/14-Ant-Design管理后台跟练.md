# 14. Ant Design 管理后台跟练：让 Next.js 调用 Express

> Mini CMS 阶段 4：这是和第 09 章一样需要照着完成的详细跟练章。第 09 章在临时 demo 中第一次跑通后端 CRUD；本章不再创建 demo，而是在真实 `mini-cms` 中新增 Ant Design 后台项目。

## 0. 本章要完成什么

第 13 章已经讲清前后端通过 HTTP 协作时的数据转换、CORS、API 地址和错误判断。本章开始动手：在真实 `mini-cms` 中创建 `admin-web-antd`，让它调用阶段 3 已经稳定的文章 API。

完成后，用户可以直接在页面中：

```text
查看文章列表
-> 新建文章
-> 编辑文章
-> 确认后删除文章
```

本章只练 Ant Design 后台。两个并列前端项目的完整路线回看[第 13 章](./13-前后端怎样通过HTTP协作.md)。

---

## 1. 先确认两个现有接口可用

在创建前端之前，先进入 `mini-cms/server` 启动 Express：

```bash
npm run dev
```

用浏览器或 Apifox 检查：

```text
GET http://localhost:3001/api/articles/health
GET http://localhost:3001/api/articles
```

如果后端还不能返回文章列表，先回到第 10 章检查阶段 1～3。前端只能显示 API 已经提供的数据，不会替后端补出缺少的接口。

---

## 2. 创建项目并完成 Ant Design 初始化

打开另一个终端，进入 `mini-cms` 根目录。不要在 `server` 里面创建前端：

```bash
cd mini-cms

npx create-next-app@latest admin-web-antd \
  --ts \
  --eslint \
  --app \
  --tailwind \
  --import-alias "@/*" \
  --use-npm \
  --disable-git
```

如果命令询问是否把代码放进 `src/`，选择 `No`。本项目使用根目录的 `app/`。

`--tailwind` 会安装 Tailwind CSS 和 PostCSS 配置。后面的页面使用 Tailwind 工具类处理布局与间距，再使用 Ant Design token 调整组件内部样式。`--disable-git` 避免子项目再次初始化 Git，三个子项目共用 `mini-cms/.git`。

先进入新项目并启动一次：

```bash
cd admin-web-antd
npm run dev
```

浏览器能打开 `http://localhost:3000`，说明 Next.js 项目已经创建成功。接着安装 Ant Design 和图标包：

```bash
# 先按 Ctrl+C 停止刚才的开发服务器
npm install antd @ant-design/icons
npm run dev
```

先不做后台页面，只验证组件能否正常显示。把 `app/page.tsx` 改成：

```tsx
"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";

export default function HomePage() {
  return (
    <main style={{ padding: 48 }}>
      <Button type="primary" icon={<PlusOutlined />}>
        新建文章
      </Button>
    </main>
  );
}
```

`page.tsx` 默认是 Server Component。这个验证页使用了 `@ant-design/icons`，因此需要在文件顶部写 `"use client"`，让图标在客户端组件中运行。

页面能显示蓝色按钮和加号图标，就说明 Ant Design 已经接入：

| 包 | 负责什么 |
|---|---|
| `antd` | 提供表格、表单、按钮、提示等 UI 组件 |
| `@ant-design/icons` | 提供后台菜单等位置使用的图标 |

当前使用两个本地地址：

| 地址 | 项目 | 当前职责 |
|---|---|---|
| `http://localhost:3000` | `admin-web-antd` | Ant Design 管理页面 |
| `http://localhost:3001` | `server` | Express API |

---

## 3. 解决 App Router 的首屏样式问题

按钮已经能显示，但 Next.js App Router 会先在服务器生成页面 HTML。为了让这份 HTML 同时带上 Ant Design 的首屏样式，需要再安装官方适配包：

```bash
npm install @ant-design/nextjs-registry
```

`AntdRegistry` 会收集服务器渲染时产生的 Ant Design 样式，并把它们放进首屏 HTML，避免刷新时先看到无样式内容再恢复。

修改 `app/layout.tsx`：

```tsx
import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Mini CMS",
  description: "Mini CMS Ant Design 管理后台",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
```

把 `app/globals.css` 简化为：

```css
@import "tailwindcss";

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
}
```

第一行 `@import "tailwindcss";` 必须保留，它负责生成后面会使用的 `h-screen`、`p-10`、`mb-6` 等工具类。删除这一行后，项目虽然仍然安装了 Tailwind，页面中的这些 class 也不会产生对应样式。

根 `layout.tsx` 只负责包住整个应用，没有状态和点击事件，因此不需要写 `"use client"`。

---

## 4. 让 Express 允许 Ant Design 后台访问

第 13 章已经解释过不同端口为什么会触发浏览器 CORS 检查。现在只完成项目配置。

进入 `mini-cms/server` 安装 CORS 中间件：

```bash
npm install cors
npm install -D @types/cors
```

在 `src/app.ts` 中，确保 CORS 位于文章路由之前：

```ts
import cors from "cors";
import express from "express";

import { errorHandler } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";
import { articleRouter } from "./modules/articles/article-router";

export const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);
app.use(express.json());

app.use("/api/articles", articleRouter);

app.use(notFound);
app.use(errorHandler);
```

阶段 4 只允许 Ant Design 后台的 3000 端口。第 16、16A 章增加 Cookie 登录时，再补 `credentials`；第 24 章创建第二套后台时，再允许 3002。

---

## 5. 告诉浏览器 Express API 在哪里

在 `admin-web-antd` 根目录新建 `.env.local`：

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

`.env.local` 仍然是普通的环境变量文件，作用和 `server` 中的 `.env` 相同。区别在于读取方式：`server` 使用 `dotenv`，Next.js 已经内置读取 `.env*` 文件的能力，所以 `admin-web-antd` 不需要再安装 `dotenv`。两个项目最终都从 `process.env` 读取变量，不必强行统一成同一个 npm 包。

浏览器端要使用的变量以 `NEXT_PUBLIC_` 开头。

同时在可以提交到仓库的 `admin-web-antd/.env.example` 中保留同样的变量名和开发示例。真实 `.env.local` 继续由 Next.js 默认忽略。

如果 create-next-app 生成的 `.gitignore` 中有 `.env*`，再紧跟一行例外规则，保证示例文件可以提交：

```gitignore
.env*
!.env.example
```

修改 `.env.local` 后要重启 `npm run dev`，Next.js 才会重新读取它。

---

## 6. 先跑通最小请求流程

先只验证一件事：Next.js 页面能不能拿到 Express 返回的文章。把 `app/page.tsx` 改成：

```tsx
"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [message, setMessage] = useState("正在请求文章……");

  useEffect(() => {
    async function loadArticles() {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/articles`,
      );
      // 读取 response.body，并把其中的 JSON 解析成 JavaScript 对象
      const body = await response.json();

      setArticles(body.data);
      setMessage("请求成功");
    }

    loadArticles();
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: "48px auto" }}>
      <h1>文章请求测试</h1>
      <p>{message}</p>
      {/* 转成两空格缩进的 JSON 文本；pre 会保留换行和空格 */}
      <pre>{JSON.stringify(articles, null, 2)}</pre>
    </main>
  );
}
```

打开 `http://localhost:3000`。如果数据库中已有文章，页面会显示文章 JSON；没有文章时显示 `[]`。

这段代码只走成功流程：

```text
页面第一次显示
-> useEffect 调用 loadArticles()
-> fetch() 请求 Express 并得到 Response 对象
-> response.json() 把响应体解析成 JavaScript 对象 body
-> body.data 取出 JavaScript 文章数组
-> setArticles() 和 setMessage() 更新页面
```

到这里先确认请求能跑通。类型检查和失败处理放到下一节。

---

## 7. 在能运行的代码上逐步完善

### 7.1 先补上文章类型

类型要根据后端返回的数据定义，但不必一次写全。当前测试页只用到文章的 `id` 和 `title`，所以先看 `GET /api/articles` 响应体中的这部分：

```ts
{
  data: [
    { id: 1, title: "文章 A" },
    { id: 2, title: "文章 B" },
  ],
}
```

其中，`data` 是文章数组，数组中的每一项是一篇文章。真实响应中还有 `slug`、`status` 等字段，第 7.4 节用到时再补进类型。

在 `page.tsx` 的 import 下方增加：

```tsx
type ArticleListItem = {
  id: number;
  title: string;
};

type ArticleListBody = {
  data: ArticleListItem[];
};
```

再给两处数据补上类型：

```tsx
const [articles, setArticles] = useState<ArticleListItem[]>([]);

// loadArticles() 内
const body: ArticleListBody = await response.json();
```

- `ArticleListItem` 对应 `data` 数组中的一篇文章。
- `ArticleListItem[]` 对应整个文章数组。
- `ArticleListBody` 对应解析后的完整响应体 `{ data: [...] }`。

这些类型只在开发时帮助编辑器补全和检查代码，不会改变或验证后端数据。

### 7.2 再处理请求失败

关闭 Express 或写错 API 地址，当前页面会一直停在“正在请求文章”。现在让已有的 `message` 同时显示失败信息。

把 `loadArticles()` 改成：

```tsx
async function loadArticles() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/articles`,
    );

    if (!response.ok) {
      throw new Error(`请求失败：${response.status}`);
    }

    const body: ArticleListBody = await response.json();

    setArticles(body.data);
    setMessage(`请求成功，共 ${body.data.length} 篇文章`);
  } catch (error) {
    if (error instanceof Error) {
      setMessage(error.message);
    } else {
      setMessage("请求失败");
    }
  }
}
```

`catch (error)` 中的 `error` 不是提前定义的变量。只要 `try` 中有内容被抛出，JavaScript 就会自动把它交给 `catch`。

当 `response.ok` 为 `false` 时，代码会主动抛出 `new Error(...)`；Express 未启动或网络中断时，`fetch()` 也会抛出 `Error`。它们都会进入 `error instanceof Error` 分支，代码可以读取 `error.message`。

JavaScript 也允许抛出不是 `Error` 对象的值，所以 `else` 分支用来接住这类未知值。两个分支真正区分的是：

```text
Error 对象 -> 读取具体的 error.message
其他未知值 -> 显示统一的失败信息
```

### 7.3 从 `loadArticles()` 提取通用请求函数

第 7.2 节已经完成了文章列表请求，也补上了类型和错误处理。当前只有一个请求，直接写在页面里没有问题。

接下来还要请求文章详情，以及完成新建、编辑和删除。如果每个操作都重新写一遍 API 地址、`fetch()`、状态判断和 `response.json()`，相同代码会越来越多。因此从这里开始，把页面逻辑和通用请求逻辑分开：

```text
页面自己的工作：更新 articles 和 message
每个接口都要做的工作：拼接 API 地址、发送请求、检查结果、解析 JSON
```

这些接口的通用请求流程相同，但接口路径、请求选项和返回的 `data` 不同：

```text
文章列表：GET  /api/articles    -> data 是 ArticleListItem[]
文章详情：GET  /api/articles/1  -> data 是完整文章对象
新建文章：POST /api/articles    -> data 是创建后的完整文章对象
```

因此可以把通用流程提取成 `apiRequest()`：调用时用 `<T>` 说明返回的数据类型，用 `path` 传入接口路径，用 `options` 传入请求配置。

#### 先看 `fetch()` 的两个参数

`fetch()` 的基本写法是：

```ts
fetch(url, options);
```

- `url` 是请求地址。
- `options` 是可选的请求配置。普通 GET 请求可以省略；POST、PATCH 或 DELETE 请求可以在这里设置 `method`、`headers` 和 `body`。

例如，获取列表时只需要地址：

```ts
await fetch(`${API_BASE_URL}/api/articles`);
```

新建文章时还要说明请求方法，并把表单数据放进请求体：

```ts
await fetch(`${API_BASE_URL}/api/articles`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(input),
});
```

`options` 会原样传给 `fetch()` 的第二个参数。TypeScript 已经为这个参数提供了 `RequestInit` 类型，不需要安装或导入。`options?: RequestInit` 中的 `?` 表示整个参数可以省略。

`RequestInit` 只描述第二个参数中可以填写的配置，不会提供接口路径的候选值。

#### 泛型函数中的 `<T>`

在项目的 `apiRequest<T>()` 声明中，`T` 是**类型参数**，用来记录 TypeScript 应该怎样理解本次请求返回的 `data`。

**调用时分别传入类型实参和函数实参**：

```typescript
apiRequest<ArticleListItem[]>("/api/articles")
//         ^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^
//             类型实参          函数实参
```

声明时的 `T` 是类型参数，调用时的 `ArticleListItem[]` 是填入 `T` 的类型实参。`"/api/articles"` 是传给 `path` 的函数实参。类型实参只用于 TypeScript 检查，转换成 JavaScript 后会消失；函数实参是程序运行时真正使用的值。

先区分两件事：

- 后端实际返回什么数据，由 Express 和数据库决定。
- `<ArticleListItem[]>` 不会改变响应，只是告诉 TypeScript：“后续代码把这次成功返回的 `data` 当作 `ArticleListItem[]` 使用。”

这次调用为什么必须显式写 `<ArticleListItem[]>`？因为在 `apiRequest()` 的函数签名中，`T` 只出现在返回类型 `Promise<T>` 里，`path: string` 和 `options?: RequestInit` 的类型都不包含 `T`。TypeScript 推断类型参数，靠的是拿函数实参的类型去匹配某个包含 `T` 的参数位置；但这里没有一个参数的类型含 `T`，没有位置可供匹配。TypeScript 也不会根据 `"/api/articles"` 去查后端接口，或者分析以后返回的 JSON 长什么样。因此，这次调用必须显式传入类型实参 `<ArticleListItem[]>`。

显式传入类型实参，只是在类型检查时给占位符 `T` 填值：

```text
T = ArticleListItem[]
Promise<T> = Promise<ArticleListItem[]>
```

类型实参确定的是 TypeScript 看到的返回类型，不是服务器真实返回的数据，也不会在运行时验证 JSON。

`<T>` 还可以写在类型名等其他位置，位置不同表示确定类型的时机不同；这里不展开，参见 [14B 第 1.3 节](./14B-管理后台里的TypeScript-Promise和React状态.md#13-函数类型中的参数返回值和泛型)。

#### 再确定函数内部的流程

`API_BASE_URL` 继续读取前面 `.env.local` 中配置的后端地址。调用函数时只传 `/api/articles` 这样的接口路径，函数会把两部分拼成完整地址。

函数内部按照下面的顺序工作：

```text
用 API_BASE_URL 和 path 拼出完整地址
-> 把地址和 options 交给 fetch()
   ├─ 无法完成请求：fetch() 直接抛出错误
   ├─ Express 返回失败响应：读取 error.message 并抛出错误
   └─ Express 返回成功响应：读取并返回 data
```

后端成功时返回 `{ data: ... }`，所以用 `ApiSuccess<T>` 表示 `{ data: T }`。失败响应中虽然同时有 `code` 和 `message`，但当前函数只读取 `message`，所以 `ApiFailure` 只定义用到的字段。

#### 按照这个流程写代码

在 `admin-web-antd` 项目根目录新建 `lib/api-client.ts`。`lib` 不是 Next.js 的固定目录，这里用它存放不属于某个具体页面的通用请求代码：

```ts
// 根据后端响应定义，只描述当前请求函数会读取的字段
type ApiSuccess<T> = {
  data: T;
};

type ApiFailure = {
  error: {
    message: string;
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("缺少 NEXT_PUBLIC_API_BASE_URL");
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    const errorBody: ApiFailure = await response.json();
    throw new Error(errorBody.error.message);
  }

  const successBody: ApiSuccess<T> = await response.json();
  return successBody.data;
}
```

失败分支中的 `response.json()` 把后端错误响应体解析成 JavaScript 对象，`: ApiFailure` 告诉 TypeScript 当前代码会读取 `error.message`。随后代码把这个提示转成 JavaScript `Error`，交给页面的 `catch`。

这里的 TypeScript 类型不是后端响应数据本身，而是前端根据后端响应，为当前代码会读取的字段写出的静态描述，因此无需与后端完整响应结构一致。没有写进 `ApiFailure` 的 `code`、`details` 仍然存在于真实对象中，不影响赋值和运行；只是 TypeScript 不允许当前代码直接读取它们，需要使用时再补进类型。

类型标注也不会验证真实响应。下一节会把第一次正式调用放进文章功能目录。

### 7.4 最后整理文章功能代码

目前只有 `app/page.tsx` 使用 `ArticleListItem` 时，类型留在页面中也可以。但后面的文章请求和列表还会继续使用它，继续写在页面中就会重复定义。因此现在集中放到 `features/articles/types.ts`；这是为了复用，不是每个类型都必须单独建文件。

在 `admin-web-antd` 项目根目录新建 `features/articles`，它与 `app` 目录同级。新建 `features/articles/types.ts`：

```ts
export type ArticleStatus = "draft" | "published";

export type ArticleListItem = {
  id: number;
  title: string;
  slug: string;
  status: ArticleStatus;
  createdAt: string;
};
```

第 7.1 节只定义了用于跑通请求的 `id` 和 `title`。现在增加第 9 节文章列表会显示的 `slug`、`status` 和 `createdAt`，`ArticleStatus` 把 `status` 限制为草稿或已发布。这里只描述列表接口真正返回的字段；完整文章类型等第 10 节补齐其他请求时再增加。

再新建 `features/articles/api.ts`：

```ts
import { apiRequest } from "@/lib/api-client";

import type { ArticleListItem } from "./types";

export function getArticles() {
  return apiRequest<ArticleListItem[]>("/api/articles");
}
```

`getArticles()` 没有手写返回类型，因为 TypeScript 会根据 `apiRequest<ArticleListItem[]>("/api/articles")` 自动推断它返回 `Promise<ArticleListItem[]>`。也可以写成 `getArticles(): Promise<ArticleListItem[]>`，结果相同，这里不重复标注。

第 9 节会继续在此目录中增加其他文章请求。现在先把 `getArticles()` 接回测试页面，确认整理后的代码仍然可以运行。

### 7.5 用封装后的请求重新验证页面

第 7.3～7.4 节只是提取和整理代码。还要让页面真正调用 `getArticles()`，才能确认封装后的完整请求流程没有问题。

把 `app/page.tsx` 替换为：

```tsx
"use client";

import { useEffect, useState } from "react";

import { getArticles } from "@/features/articles/api";
import type { ArticleListItem } from "@/features/articles/types";

export default function HomePage() {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [message, setMessage] = useState("正在请求文章……");

  useEffect(() => {
    // getArticles() 返回 Promise<ArticleListItem[]>，不是 ArticleListItem[]。
    // useEffect 的回调不能直接写成 async，所以在内部定义
    // 异步函数，用 await 取出文章数组后再更新页面。
    async function loadArticles() {
      try {
        const articleList = await getArticles();

        setArticles(articleList);
        setMessage(`请求成功，共 ${articleList.length} 篇文章`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "请求失败");
      }
    }

    loadArticles();
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: "48px auto" }}>
      <h1>文章请求测试</h1>
      <p>{message}</p>
      <pre>{JSON.stringify(articles, null, 2)}</pre>
    </main>
  );
}
```

与第 7.2 节相比，页面不再需要 `ArticleListBody` 和 `response.json()`，因为 `apiRequest()` 已经解析了 `{ data: ... }` 并返回其中的 `data`。

`getArticles()` 虽然没有使用 `async` 声明，但它直接返回了 `apiRequest()` 产生的 `Promise<ArticleListItem[]>`。页面使用 `await` 等待请求完成后，`articleList` 才是可以交给 `setArticles()` 的 `ArticleListItem[]`。

此时的调用顺序是：

```text
页面的 loadArticles() 调用 getArticles()
-> getArticles() 调用 apiRequest("/api/articles")
-> apiRequest() 使用 fetch() 请求 Express
-> apiRequest() 取出并返回文章数组
-> loadArticles() 更新 articles 和 message
```

重新打开 `http://localhost:3000`，页面应该与第 6 节一样显示文章 JSON，失败时显示 `apiRequest()` 抛出的错误信息。这样第一条封装后的请求就验证完成了。

---

## 8. 先在独立页面建立后台骨架

页面按下面的顺序排列，`Header` 位于整个后台顶部：

```text
Layout
├── Header
└── Layout
    ├── Sider
    └── Content
```

新建 `app/admin/articles/page.tsx`：

```tsx
"use client";

// Ant Design
import { Layout, Menu } from "antd";

const { Header, Sider, Content } = Layout;

export default function AdminPage() {
  const items = [
    {
      key: "/item1",
      label: "item1",
    },
    {
      key: "/item2",
      label: "item2",
    },
    {
      key: "/item3",
      label: "item3",
    },
  ];

  return (
    <Layout>
      <Header>1</Header>

      <Layout>
        <Sider>
          <Menu selectedKeys={[items[0].key]} items={items} />
        </Sider>
        <Content></Content>
      </Layout>
    </Layout>
  );
}
```

打开 `http://localhost:3000/admin/articles`，先只确认三块区域的位置：顶部是 `Header`，下面左边是 `Sider`，右边是空的 `Content`。

- `const { Header, Sider, Content } = Layout` 使用对象解构，后面可以直接写 `<Header>`，不用写 `<Layout.Header>`。
- `items` 是菜单数据，每一项使用 `key` 标识自己，使用 `label` 显示文字。
- `selectedKeys={[items[0].key]}` 表示当前选中第一项。`selectedKeys` 接收数组，因此外面还要写一层 `[]`。
- 外层 `Layout` 负责上下排列，内层 `Layout` 再把 `Sider` 和 `Content` 放到左右两边。

这里不加 Tailwind 样式，也不接 API。第 9 节先完成文章数据展示并抽出公共布局，再在第 9.3 节跑通页面切换，第 9.4 节统一美化。删除功能留到第 13 节。

---

## 9. 完成文章列表，再建立可切换的后台布局

### 9.1 先完成文章数据展示

继续修改第 8 节的 `app/admin/articles/page.tsx`。这一步只调用 `getArticles()`，再把返回的文章数组交给 `Table`：

```tsx
"use client";

// Ant Design
import { Layout, Menu, Table } from "antd";
import { useEffect, useState } from "react";

import { getArticles } from "@/features/articles/api";
import type { ArticleListItem } from "@/features/articles/types";

const { Header, Sider, Content } = Layout;

export default function AdminPage() {
  // 状态
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [message, setMessage] = useState("加载中……");

  // 初始化
  useEffect(() => {
    async function loadArticles() {
      try {
        const result = await getArticles();
        setArticles(result);
        setMessage("加载成功");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "加载失败");
      }
    }

    void loadArticles();
  }, []);

  // 侧边栏菜单
  const items = [
    {
      key: "/item1",
      label: "item1",
    },
    {
      key: "/item2",
      label: "item2",
    },
    {
      key: "/item3",
      label: "item3",
    },
  ];

  // 表格列
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
    },
  ];

  return (
    <Layout>
      <Header>1</Header>

      <Layout>
        <Sider>
          <Menu selectedKeys={[items[0].key]} items={items} />
        </Sider>
        <Content>
          <p>{message}</p>
          <Table
            bordered
            rowKey="id"
            columns={columns}
            dataSource={articles}
          />
        </Content>
      </Layout>
    </Layout>
  );
}
```

`columns` 决定表格显示哪些列。每个 `dataIndex` 都对应 `ArticleListItem` 中的同名属性，`dataSource={articles}` 再把文章数组交给表格。`rowKey="id"` 告诉 Table 使用每篇文章的 `id` 识别对应的行，它不负责把 ID 显示成一列。请求完成并执行 `setArticles(result)` 后，组件重新渲染，表格就会显示文章数据。

`getArticles()` 请求失败时，`apiRequest()` 抛出的错误会沿着 Promise 回到 `loadArticles()`。这里用 `catch` 把错误信息写入 `message`，页面就不会一直停在“加载中……”。

打开 `/admin/articles`，请求成功时会看到“加载成功”和文章表格；请求失败时会看到错误信息。删除、确认提示和操作状态留到后面再加。

### 9.2 列表可用后再抽出共享布局

新建 `app/admin/layout.tsx`：

```tsx
"use client";

import { Layout, Menu } from "antd";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    {
      key: "/admin/articles",
      label: "文章管理",
    },
  ];

  return (
    <Layout>
      <Header>Mini CMS</Header>

      <Layout>
        <Sider>
          <Menu
            selectedKeys={[pathname]}
            items={items}
            onClick={(item) => router.push(item.key)}
          />
        </Sider>
        <Content>{children}</Content>
      </Layout>
    </Layout>
  );
}
```

`Header` 和 `Sider` 是后台页面都会使用的固定部分，所以放进 `layout.tsx`。`children` 是当前路由对应的页面内容，会显示在 `Content` 中。

这三个 `Menu` 属性分别负责不同的事情：

- `items={items}`：`Menu` 会遍历 `items`，数组中的每一项生成一个菜单项。
- `selectedKeys={[pathname]}` 根据当前地址高亮菜单项。
- `onClick` 处理菜单点击。

页面中只有一个 `Menu`，但它根据 `items` 生成了多个菜单项。点击哪个菜单项，`onClick` 的参数 `item` 就对应 `items` 中的哪一项，因此可以通过 `item.key` 取得这一项的 `key`。

```tsx
onClick={(item) => router.push(item.key)}
```

例如点击“文章管理”，对应项的 `key` 是 `/admin/articles`，`router.push()` 就会进入 `/admin/articles`。

当前只有“文章管理”一个菜单项，下一节会增加“页面一”和“页面二”，实际观察这条切换流程。

布局抽离后，`app/admin/articles/page.tsx` 的完整代码是：

```tsx
"use client";

import { Table } from "antd";
import { useEffect, useState } from "react";

import { getArticles } from "@/features/articles/api";
import type { ArticleListItem } from "@/features/articles/types";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [message, setMessage] = useState("加载中……");

  useEffect(() => {
    async function loadArticles() {
      try {
        const result = await getArticles();
        setArticles(result);
        setMessage("加载成功");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "加载失败");
      }
    }

    void loadArticles();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
    },
  ];

  return (
    <>
      <p>{message}</p>
      <Table
        bordered
        rowKey="id"
        columns={columns}
        dataSource={articles}
      />
    </>
  );
}
```

`Table` 就写在文章页面中。打开 `/admin/articles` 时，Next.js 把这个页面返回的内容作为 `children` 传给 `app/admin/layout.tsx`，再由 `<Content>{children}</Content>` 显示出来。

`app/admin/page.tsx` 只对应 `/admin`，不会参与 `/admin/articles` 的渲染。本章直接进入 `/admin/articles`，因此不需要这个文件；如果之前创建过，可以删除。

### 9.3 用两个演示页面验证切换

侧边栏目前只有“文章管理”，还看不出切换效果。这里先增加“页面一”和“页面二”，只验证 `Sider` 切换 `Content`，暂时不绑定文章的新建和编辑功能。

把 `items` 改成：

```tsx
const items = [
  {
    key: "/admin/articles",
    label: "文章管理",
  },
  {
    key: "/admin/page-one",
    label: "页面一",
  },
  {
    key: "/admin/page-two",
    label: "页面二",
  },
];
```

`items` 中的 `key` 要与页面文件夹生成的路由一致：

```text
/admin/articles -> app/admin/articles/page.tsx
/admin/page-one -> app/admin/page-one/page.tsx
/admin/page-two -> app/admin/page-two/page.tsx
```

`Menu` 继续使用第 9.2 节的点击写法：

```tsx
onClick={(item) => router.push(item.key)}
```

新建 `app/admin/page-one/page.tsx`：

```tsx
export default function PageOne() {
  return <h1>页面一</h1>;
}
```

再新建 `app/admin/page-two/page.tsx`：

```tsx
export default function PageTwo() {
  return <h1>页面二</h1>;
}
```

点击菜单项后，`router.push(item.key)` 进入对应地址。两个页面都位于 `app/admin` 下，因此继续共用 `app/admin/layout.tsx`：`Header` 和 `Sider` 不变，`Content` 在“页面一”和“页面二”之间切换。验证完成后，再根据实际产品页面替换这两个示例。

### 9.4 页面跑通后再统一主题

现在页面中已经有 `Layout`、`Menu` 和 `Table`。这一节只美化公共布局，并统一 Ant Design 组件主题。

新建 `components/antd-provider.tsx`：

```tsx
"use client";

import { App, ConfigProvider } from "antd";
import type { ReactNode } from "react";

export function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          colorBgLayout: "#f5f7fa",
          colorText: "#1f2329",
          borderRadius: 8,
        },
        components: {
          Layout: {
            bodyBg: "#f5f7fa",
            headerBg: "#ffffff",
            headerPadding: "0 24px",
            lightSiderBg: "#ffffff",
          },
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
```

在 `app/layout.tsx` 中增加导入：

```tsx
import { AntdProvider } from "@/components/antd-provider";
```

再把原来的 `<AntdRegistry>{children}</AntdRegistry>` 替换为：

```tsx
<AntdRegistry>
  <AntdProvider>{children}</AntdProvider>
</AntdRegistry>
```

`ConfigProvider` 会把主题交给内部的 Ant Design 组件。`token` 可以理解为一组统一的样式变量，组件会把这些变量用到自己的具体位置：

| 配置 | 怎样影响组件 |
|---|---|
| `colorPrimary` | Ant Design 根据主色生成悬停色、按下色等状态色，再用于菜单选中状态和后续的主按钮 |
| `borderRadius` | 作为基础圆角，影响按钮、卡片和输入框等组件 |
| `colorText` | 作为组件的基础文字色 |
| `colorBgLayout` | 作为布局区域的背景色 |
| `components.Layout` | 只覆盖 `Layout`，这里分别设置顶部栏、侧边栏和内容区 |

前四项放在 `theme.token` 中，会被多个组件共同读取；`components.Layout` 只影响 `Layout`。这就是“主题值到组件样式”的映射关系。

把 `app/admin/layout.tsx` 中 `AdminLayout` 的 `return` 替换为：

```tsx
return (
  <Layout className="h-screen">
    <Header className="border-b border-gray-100 flex justify-between items-center">
      <h1 className="font-black text-xl">Mini-CMS</h1>
      <p>user</p>
    </Header>

    <Layout>
      <Sider theme="light">
        {/* selectedKeys 要接收 string[] */}
        <Menu
          items={items}
          selectedKeys={[pathname]}
          onClick={(item) => router.push(item.key)}
        />
      </Sider>
      <Content className="p-10">{children}</Content>
    </Layout>
  </Layout>
);
```

`h-screen` 让后台占满一屏，`p-10` 给内容区留出间距。顶部栏使用 Flex 把标题和用户信息放在两边；顶部栏背景由 `headerBg` 控制，浅色侧边栏会读取 `lightSiderBg`。

`app/admin/articles/page.tsx` 不需要改成布局代码，它继续返回文章状态和 `Table`。这个返回值会作为 `children` 显示在上面的 `Content` 中。

可以临时把 `colorPrimary` 改成 `#722ed1`，观察菜单选中状态变成紫色，再改回 `#1677ff`。Tailwind 负责布局和间距，Ant Design token 负责组件内部样式。`<App>` 会在后面的页面中提供消息提示。

### 9.5 删除测试页代码，再设置首页跳转

第 6～7 节的 API 已经跑通，测试首页不再需要。把 `app/page.tsx` 完整替换为：

```tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/admin/articles");
}
```

原测试页中的状态、请求和 JSON 输出全部删除。`lib/api-client.ts` 和 `features/articles/` 是正式请求代码，文章列表仍在使用，不要删除。

---

## 10. 先补齐文章 CRUD 的类型和 API

第 9 节只完成了列表请求。接下来集中补齐文章详情、新建、编辑和删除请求，让 `features/articles/api.ts` 先形成完整的 CRUD 请求层。

先把 `features/articles/types.ts` 整理为：

```ts
export type ArticleStatus = "draft" | "published";

export type Article = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
};

export type ArticleListItem = Pick<
  Article,
  "id" | "title" | "slug" | "status" | "createdAt"
>;

export type CreateArticleInput = {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  status?: ArticleStatus;
};

export type UpdateArticleInput = {
  title?: string;
  slug?: string;
  summary?: string | null;
  content?: string;
  status?: ArticleStatus;
};
```

这几个类型对应不同方向的数据：

| 类型 | 描述什么 |
|---|---|
| `ArticleStatus` | 文章状态允许使用哪些值 |
| `Article` | 详情、新建、编辑和删除接口返回的完整文章 |
| `ArticleListItem` | 列表接口返回的一行，只包含列表需要的五个字段 |
| `CreateArticleInput` | POST 新建文章时允许提交的字段 |
| `UpdateArticleInput` | PATCH 更新文章时允许提交的字段 |

前端类型按照 API 请求和响应定义，不需要照搬数据库模型。`id` 用来拼接编辑和删除接口地址，`createdAt`、`updatedAt` 也会随完整文章返回，所以它们都保留在 `Article` 中。

`id`、`createdAt` 和 `updatedAt` 由后端生成，不需要客户端提交，因此不属于两个请求输入类型。数据库和 Prisma 中的时间是 `DateTime` / `Date`，经过 JSON 传到浏览器后变成字符串，所以前端把两个时间字段写成 `string`。

创建文章时，`title`、`slug` 和 `content` 必须存在，`summary`、`status` 可以省略。更新文章时只提交需要修改的字段，所以 `UpdateArticleInput` 中的属性都是可选的；后端 Zod 仍会拒绝空对象。

`ArticleListItem` 使用 `Pick` 从 `Article` 中选出列表字段，不必重新写一遍相同属性；以后这些公共字段的类型发生变化时，只需要修改 `Article`。

再把 `features/articles/api.ts` 整理为：

```ts
import { apiRequest } from "@/lib/api-client";

import type {
  Article,
  ArticleListItem,
  CreateArticleInput,
  UpdateArticleInput,
} from "./types";

export function getArticles() {
  return apiRequest<ArticleListItem[]>("/api/articles");
}

export function getArticleById(id: number) {
  return apiRequest<Article>(`/api/articles/${id}`);
}

export function createArticle(input: CreateArticleInput) {
  return apiRequest<Article>("/api/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function updateArticle(id: number, input: UpdateArticleInput) {
  return apiRequest<Article>(`/api/articles/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function deleteArticle(id: number) {
  return apiRequest<Article>(`/api/articles/${id}`, {
    method: "DELETE",
  });
}
```

这一层只负责发送 HTTP 请求并返回解析后的数据：列表和详情使用 GET，新建使用 POST，编辑使用 PATCH，删除使用 DELETE。

---

## 11. 写一个由新建和编辑抽屉共用的文章表单

第 10 节已经准备好文章 CRUD 的请求函数。这一节开始写 UI，先把新建和编辑都会使用的文章表单抽成 `ArticleForm`。

新建和编辑显示的字段和校验规则相同，因此只需要一个表单组件。它不需要知道当前是新建还是编辑，只负责收集字段、校验和提交；第 12 节再由文章列表页决定提交时调用新建还是更新接口。

### 11.1 定义表单收集的值

`CreateArticleInput` 和 `UpdateArticleInput` 描述 API 允许接收的请求体，`ArticleFormValues` 则描述这张表单实际收集的字段。在 `features/articles/types.ts` 中增加：

```ts
export type ArticleFormValues = {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  status: ArticleStatus;
};
```

标题、slug 和正文必须由用户填写。

`ArticleFormValues` 描述的是 Form 校验通过后传给 `handleFinish()` 的最终表单值。`status` 写成 `ArticleStatus` 而不是 `status?: ArticleStatus`，因为表单保证提交时一定有状态：

- 新建时，`initialValues={{ status: "draft", ...initialValues }}` 提供默认状态 `draft`。
- 编辑时，文章列表页把 `editingArticle.status` 放进 `initialValues`，覆盖前面的默认状态 `draft`。
- `status` 对应的 `Form.Item` 有 `required` 校验；没有状态时，Form 不会调用 `handleFinish()`。

因此，`handleFinish(values)` 收到的 `values.status` 一定存在。`CreateArticleInput.status` 仍然是可选字段，因为它描述的是整个 API 允许的请求体：其他客户端可以不传，此时数据库使用默认值 `draft`。

当前表单中的摘要只有两类值：

- 新建时没有填写摘要，值是 `undefined`。
- 输入过摘要时，值是字符串；清空文本框得到的是空字符串 `""`，也不是 `null`。

因此 `ArticleFormValues.summary` 写成 `summary?: string`。而更新接口还要区分三种意图：不提交 `summary` 表示不修改，提交字符串表示保存这个字符串，提交 `null` 表示明确把数据库记录的 `summary` 字段设为 `null`。所以 `UpdateArticleInput.summary` 是 `summary?: string | null`；其中 `null` 可以由 Apifox 等其他客户端提交，当前表单不会提交它。

### 11.2 写出新建和编辑共用的表单

新建 `app/admin/articles/_components/article-form.tsx`：

```tsx
"use client";

import { Alert, Button, Form, Input, Select, Space } from "antd";
import { useState } from "react";

import type { ArticleFormValues } from "@/features/articles/types";

type ArticleFormProps = {
  // 新建时不传，编辑时传入当前文章的表单值
  initialValues?: ArticleFormValues;
  // 父组件根据新建或编辑传入不同文案和提交函数
  submitText: string;
  onCancel: () => void;
  onSubmit: (values: ArticleFormValues) => Promise<void>;
};

export function ArticleForm({
  initialValues,
  submitText,
  onCancel,
  onSubmit,
}: ArticleFormProps) {
  // 请求期间禁止重复操作，请求失败时保留错误信息
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form.Item 的 rules 全部通过后，onFinish 才会调用这个函数
  async function handleFinish(values: ArticleFormValues) {
    setSubmitting(true);
    setSubmitError(null);

    try {
      // 具体发送 POST 还是 PATCH，由父组件传入的 onSubmit 决定
      await onSubmit(values);
    } catch (requestError) {
      setSubmitError(
        requestError instanceof Error
          ? requestError.message
          : "保存失败",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // 新建时默认为草稿；编辑时 initialValues 会用原状态覆盖 draft
  return (
    <Form<ArticleFormValues>
      layout="vertical"
      initialValues={{ status: "draft", ...initialValues }}
      onFinish={handleFinish}
      scrollToFirstError={{ focus: true }}
    >
      <Form.Item
        name="title"
        label="标题"
        rules={[
          { required: true, whitespace: true, message: "请输入标题" },
          { max: 200, message: "标题不能超过 200 个字符" },
        ]}
      >
        <Input placeholder="例如：怎样设计文章 API" />
      </Form.Item>

      <Form.Item
        name="slug"
        label="Slug"
        extra="用于文章地址，只使用小写字母、数字和连字符。"
        rules={[
          { required: true, message: "请输入 slug" },
          { max: 200, message: "slug 不能超过 200 个字符" },
          {
            pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            message: "slug 格式不正确",
          },
        ]}
      >
        <Input placeholder="design-article-api" />
      </Form.Item>

      <Form.Item
        name="summary"
        label="摘要"
        rules={[{ max: 500, message: "摘要不能超过 500 个字符" }]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item
        name="content"
        label="正文"
        rules={[
          { required: true, whitespace: true, message: "请输入正文" },
          { max: 100000, message: "正文不能超过 100000 个字符" },
        ]}
      >
        <Input.TextArea rows={14} />
      </Form.Item>

      <Form.Item
        name="status"
        label="状态"
        rules={[{ required: true, message: "请选择状态" }]}
      >
        <Select
          options={[
            { value: "draft", label: "草稿" },
            { value: "published", label: "已发布" },
          ]}
        />
      </Form.Item>

      {submitError ? (
        <div className="mb-6">
          <Alert
            type="error"
            showIcon
            title="保存失败"
            description={submitError}
          />
        </div>
      ) : null}

      <Space>
        <Button type="primary" htmlType="submit" loading={submitting}>
          {submitText}
        </Button>
        <Button onClick={onCancel} disabled={submitting}>
          取消
        </Button>
      </Space>
    </Form>
  );
}
```

### 11.3 读懂表单的提交流程

新建时，父组件没有传入 `initialValues`，所以它的值是 `undefined`。对象展开会按从左到右的顺序合并字段：

```text
{ status: "draft", ...initialValues }
-> initialValues 是 undefined，展开时没有增加任何字段
-> 最终得到 { status: "draft" }
```

这个对象传给 Ant Design Form 的 `initialValues` 属性。Form 再用对象中的 `status` 找到 `name="status"` 的 `Form.Item`，把其中 `Select` 的初始值设为 `draft`。其他字段没有初始值，所以保持空白。

编辑时，父组件会传入完整的 `initialValues`。因为 `...initialValues` 写在 `status: "draft"` 后面，文章原来的 `status` 会覆盖默认的 `draft`，其他字段也会按各自的 `name` 回填到表单。

每个 `Form.Item` 的 `name` 都会把一个字段登记给 Form。用户输入时，Ant Design Form 会在内部保存这些字段的当前值；点击提交且全部校验通过后，它会调用 `onFinish` 接收的函数，并把当前表单数据作为第一个参数传入：

```tsx
onFinish={handleFinish}

// 校验通过后，可以理解为 Ant Design Form 调用：
handleFinish(currentFormValues);
```

因此，`handleFinish(values)` 中的 `values` 就是这次提交时的表单数据。`values` 只是形参名，改成 `formData` 也可以；对象中的 `title`、`slug` 等属性名来自对应 `Form.Item` 的 `name`，不是 Ant Design 凭空生成的。

`onSubmit` 的返回类型是 `Promise<void>`，因为第 12 节传入的箭头函数会返回 `handleCreate()` 或 `handleUpdate()` 产生的 Promise。`Promise` 表示提交结果稍后才能确定，`void` 表示函数完成后不需要再返回业务数据。`ArticleForm` 通过 `await onSubmit(values)` 等待请求结束，才能正确维持 `loading` 并捕获请求错误。

这段代码按下面的顺序工作：

1. 父组件传入初始值、按钮文案、取消函数和提交函数。
2. Ant Design Form 保存用户输入，并使用每个 `Form.Item` 的 `rules` 校验字段。
3. 校验通过后，Form 调用 `onFinish={handleFinish}` 传入的函数，并把当前表单数据作为第一个参数交给 `handleFinish()`。
4. `handleFinish()` 开启提交状态并等待 `onSubmit(values)`；失败时显示错误，结束后恢复按钮。

`scrollToFirstError={{ focus: true }}` 只处理 `rules` 发现的字段错误：点击提交后，Form 会滚动到第一个错误字段并把输入焦点放进去，此时不会调用 `handleFinish()`。重复 slug 等 API 错误发生在 `rules` 已经通过、`handleFinish()` 已经执行之后，因此不会触发这个自动滚动；这类错误通过提交按钮上方的 `Alert` 展示，用户刚点击完保存就能看到。

`ArticleForm` 不导入 `createArticle()` 或 `updateArticle()`。第 12 节的父组件会根据新建或编辑传入不同的 `onSubmit`，所以这里只需要调用 `onSubmit(values)`。

取消按钮调用 `onCancel` 关闭抽屉，提交失败时则把后端返回的错误显示在提交按钮上方。

### 11.4 代码中用到的 Ant Design 属性

代码中用到的 Ant Design 属性如下：

因为 Form 提交的数据类型是 `ArticleFormValues`，所以写成 `<Form<ArticleFormValues>>`。这样 `onFinish` 收到的 `values` 也会按照 `ArticleFormValues` 进行 TypeScript 类型检查。

| 写法 | 作用 |
|---|---|
| `<Form<ArticleFormValues>>` | 告诉 TypeScript 这张表单收集的值符合 `ArticleFormValues` |
| `layout="vertical"` | 让标签显示在输入控件上方 |
| `initialValues={...}` | 设置表单初始值：新建时默认为草稿，编辑时由文章原值覆盖 |
| `onFinish={handleFinish}` | 点击提交且 `rules` 全部通过后，调用 `handleFinish(values)` |
| `scrollToFirstError={{ focus: true }}` | `rules` 校验失败时滚动并聚焦第一个错误字段 |
| `Form.Item` 的 `name` / `label` / `rules` / `extra` | 分别定义字段名、页面标签、校验规则和补充说明 |
| `Input` 的 `placeholder` | 在没有输入时显示示例文字 |
| `Input.TextArea` 的 `rows` | 设置多行文本框的默认行数 |
| `Select` 的 `options` | 定义下拉选项的值和显示文字 |
| `Alert` 的 `type` / `showIcon` / `title` / `description` | 定义提示类型、图标、标题和详细错误 |
| `<div className="mb-6">` | 在 `Alert` 外层使用 Tailwind，给错误提示和提交按钮之间增加下间距 |
| `<Space>` | 让内部按钮自动保持间距 |
| `type="primary"` | 使用 Ant Design 的主操作按钮样式 |
| `htmlType="submit"` | 把按钮设为 HTML 提交按钮，点击后触发 Form 提交 |
| `loading={submitting}` | 请求期间显示加载状态并防止重复点击 |
| `onClick={onCancel}` / `disabled={submitting}` | 点击时执行取消函数；提交期间禁用取消按钮 |

Ant Design 6 已弃用 `Alert` 的 `message` 属性，本章使用 `title` 设置提示标题。下面 `Form.Item` 校验规则中的 `message` 是另一个属性，仍用来设置字段校验失败时的文案。

Ant Design 会给 `Alert` 根节点设置自己的重置样式，其中包含 `margin: 0`。因此不要直接给 `Alert` 写 `className="mb-6"`；Tailwind 虽然会生成下边距，但可能被组件样式覆盖。把间距加在普通 `div` 上，可以让外层负责布局，`Alert` 只负责显示错误。后面的列表错误提示和 `Card` 也使用同样的外层包裹方式设置间距。

`rules` 是 Ant Design `Form.Item` 的前端校验写法。标题长度、slug 格式、摘要长度和正文长度等业务限制应当与后端 Zod 保持一致，这样页面能尽早给出正确提示。但两层不需要完全复制：例如后端允许创建时省略 `status`，而当前 UI 会默认提交 `draft`。

当前代码中，`required` 表示必填，`whitespace` 表示不能只输入空格，`max` 限制最大字符数，`pattern` 使用正则检查格式，`message` 是校验失败时显示的文字。

前端 `rules` 只负责页面交互，不能取代 Zod。后端还要校验 Apifox、另一套后台或其他客户端发来的请求，并执行 `trim()`、`toLowerCase()` 等最终数据处理，因此 Zod 才是 API 输入的最终标准。

---

## 12. 在文章列表页接入新建和编辑抽屉

第 11 节已经写好 `ArticleForm`，但公共组件本身不会生成页面。这一节把它导入 `app/admin/articles/page.tsx`，用按钮打开 Drawer，完成两条交互链路：

```text
新建文章
-> 点击“新建文章”
-> 打开空表单
-> 提交 POST 请求
-> 把新文章加入当前表格

编辑文章
-> 点击某一行的“编辑”
-> 请求这篇文章的详情
-> 用详情回填表单
-> 提交 PATCH 请求
-> 用新数据替换表格中的旧数据
```

两条链路都留在 `/admin/articles`，不创建新路由，也不使用 `router.push()`。下面按“新建 → 编辑 → 完善反馈”推进；每一步都形成一条可运行的完整链路，不写用完马上删除的临时代码。

### 12.1 先完整跑通新建文章

先只接新建需要的内容。把页面顶部相关导入整理为：

```tsx
import { Button, Drawer, Table } from "antd";
import { useEffect, useState } from "react";

import { ArticleForm } from "@/app/admin/articles/_components/article-form";
import { createArticle, getArticles } from "@/features/articles/api";
import type {
  ArticleFormValues,
  ArticleListItem,
} from "@/features/articles/types";
```

在组件外定义抽屉模式，在组件中增加抽屉状态：

```tsx
type DrawerMode = "create" | "edit";

const [drawerOpen, setDrawerOpen] = useState(false);
const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
```

`drawerOpen` 决定抽屉是否显示，`drawerMode` 决定同一个抽屉用于新建还是编辑。现在先写新建按钮和提交逻辑：

```tsx
function openCreateDrawer() {
  setDrawerMode("create");
  setDrawerOpen(true);
}

async function handleCreate(values: ArticleFormValues) {
  const newArticle = await createArticle(values);
  setArticles((current) => [
    newArticle,
    ...current,
  ]);
  setDrawerOpen(false);
}
```

`handleCreate()` 把表单值交给 POST 请求。`current` 是更新函数的形参，React 会把最新的 `articles` 数组传给它；新文章放到这个数组最前面后，页面再关闭抽屉。

在 Table 上方放置按钮：

```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
      文章管理
    </h1>
    <p className="mt-1 text-sm text-slate-500">
      在当前页面查看、新建和编辑文章。
    </p>
  </div>

  <Button type="primary" onClick={openCreateDrawer}>
    新建文章
  </Button>
</div>
```

再在 Table 后面放置 Drawer 和表单：

```tsx
<Drawer
  title={drawerMode === "create" ? "新建文章" : "编辑文章"}
  open={drawerOpen}
  size="large"
  destroyOnHidden
  onClose={() => setDrawerOpen(false)}
>
  {drawerMode === "create" ? (
    <ArticleForm
      submitText="创建文章"
      onCancel={() => setDrawerOpen(false)}
      onSubmit={(values) => handleCreate(values)}
    />
  ) : null}
</Drawer>
```

`submitText` 设置提交按钮文字，`onCancel` 负责关闭抽屉。`onSubmit` 的箭头函数显式接收校验通过的 `values`，再调用 `handleCreate(values)`。

`size="large"` 使用较宽的抽屉，`destroyOnHidden` 在抽屉关闭后卸载表单，避免下次打开时保留上一次输入。

现在先验证一条完整链路：点击“新建文章”打开表单，提交后发送 POST 请求，抽屉关闭，新文章出现在表格第一行。

### 12.2 再完整跑通编辑文章

编辑从 Table 中某一行的“编辑”按钮开始，完整的数据流是：

```text
Table 渲染每一行时，调用操作列的 render，并传入当前行的 article
-> 点击“编辑”，把 article.id 交给 openEditDrawer()
-> getArticleById(id) 请求完整文章
-> setEditingArticle() 保存完整文章
-> 打开 Drawer，用 editingArticle 回填表单
-> 提交 PATCH 请求
-> 用更新后的文章替换 Table 中 id 相同的旧行
```

Table 当前行是 `ArticleListItem`，只有列表需要的字段；编辑表单需要完整的 `Article`，所以按钮不会把这一行直接交给 Drawer，而是只取它的 `id`，再请求完整文章。

先把相关导入扩展为：

```tsx
import {
  Button,
  Drawer,
  Table,
  type TableColumnsType,
} from "antd";
import {
  createArticle,
  getArticleById,
  getArticles,
  updateArticle,
} from "@/features/articles/api";
import type {
  Article,
  ArticleFormValues,
  ArticleListItem,
} from "@/features/articles/types";
```

再增加 `editingArticle`，保存详情接口返回的完整文章：

```tsx
const [editingArticle, setEditingArticle] = useState<Article | null>(null);
```

`openEditDrawer()` 和 Drawer 都在 `ArticlesPage` 中：前者把完整文章写入 `editingArticle`，后者读取它并回填表单。这个状态是详情请求与编辑表单之间的连接点。

#### 12.2.1 从 Table 当前行取得文章 id

先把原来的 `const columns = [` 改为 `const columns: TableColumnsType<ArticleListItem> = [`，数组中已有的四列保持不变。

`TableColumnsType` 是 Ant Design 提供的泛型类型，用来描述 Table 的列配置；`ArticleListItem` 是传给它的具体类型，告诉它表格每一行的数据结构。因此，`render` 中的 `article` 也会被识别为 `ArticleListItem`。

再把操作列追加到数组末尾：

```tsx
{
  title: "操作",
  key: "actions",
  render: (_, article) => (
    <Button
      type="link"
      onClick={() => void openEditDrawer(article.id)}
    >
      编辑
    </Button>
  ),
},
```

`render` 是操作列配置中的函数，用来决定这个单元格显示什么。Table 渲染每一行时都会调用它，并把当前行数据作为第二个参数 `article` 传入。点击按钮时读取 `article.id`，再把它交给 `openEditDrawer()`；`void` 表示点击事件不使用这个异步函数返回的 Promise。

#### 12.2.2 用 id 请求完整文章，再打开 Drawer

增加 `openEditDrawer()`：

```tsx
async function openEditDrawer(id: number) {
  const articleDetail = await getArticleById(id);
  setEditingArticle(articleDetail);
  setDrawerMode("edit");
  setDrawerOpen(true);
}
```

`getArticleById(id)` 返回完整的 `Article`。`articleDetail` 表示这次请求拿到的文章详情；把它保存到 `editingArticle` 后，再把模式切换为编辑并打开 Drawer。

这一小节先跑通请求成功的正常流程，所以拿到详情后才打开 Drawer；第 12.3 节再改成先打开 Drawer 显示加载状态，并补上请求失败提示。

#### 12.2.3 Drawer 读取 editingArticle 并回填表单

把 Drawer 的内容改为根据模式显示新建或编辑表单：

```tsx
{drawerMode === "create" ? (
  <ArticleForm
    key="create"
    submitText="创建文章"
    onCancel={() => setDrawerOpen(false)}
    onSubmit={(values) => handleCreate(values)}
  />
) : editingArticle ? (
  <ArticleForm
    key={`edit-${editingArticle.id}`}
    initialValues={{
      title: editingArticle.title,
      slug: editingArticle.slug,
      summary: editingArticle.summary ?? "",
      content: editingArticle.content,
      status: editingArticle.status,
    }}
    submitText="保存修改"
    onCancel={() => setDrawerOpen(false)}
    onSubmit={(values) =>
      handleUpdate(editingArticle.id, values)
    }
  />
) : null}
```

Drawer 没有直接接收 Table 当前行。它读取同一页面状态中的 `editingArticle`，再把标题、slug、摘要、正文和状态转换成 `ArticleFormValues`，交给表单的 `initialValues`。

新建和编辑开始共用 Drawer 后，`key="create"` 和 ``key={`edit-${editingArticle.id}`}`` 让 React 把它们识别为不同的表单实例，切换时会重新应用各自的初始值。

`summary ?? ""` 把 API 可能返回的 `null` 转成文本框使用的空字符串。

#### 12.2.4 提交更新，再替换 Table 中的旧行

编辑表单提交后，`onSubmit` 的箭头函数把 `editingArticle.id` 作为第一个参数，把表单 `values` 作为第二个参数，再调用 `handleUpdate(id, values)`：

```tsx
async function handleUpdate(
  id: number,
  values: ArticleFormValues,
) {
  const updatedArticle = await updateArticle(id, values);
  setArticles((current) =>
    current.map((article) =>
      article.id === updatedArticle.id ? updatedArticle : article,
    ),
  );
  setDrawerOpen(false);
}
```

`updateArticle()` 返回更新后的完整文章。React 把最新文章数组作为 `current` 传入更新函数。`map()` 遍历旧数组，并把每次返回的元素组成一个新数组，不会直接修改原数组：

- 当前行的 `id` 等于 `updatedArticle.id`：用 `updatedArticle` 替换旧文章。
- `id` 不相等：保留原来的 `article`。

这里没有把 `Article` 自动转换成 `ArticleListItem`。`ArticleListItem` 是从 `Article` 中选出列表字段得到的类型，完整的 `Article` 已经包含它要求的全部字段，因此可以直接作为一条列表数据使用。运行时保存的仍是完整对象，只是 `articles` 的类型仍然是 `ArticleListItem[]`，后续代码按列表字段使用它。

> 可以先这样理解：Swift 更关注“值声明成什么类型”；TypeScript 使用结构类型，更关注“值是否具备目标类型需要的字段”。

`setArticles()` 保存新数组后，Table 重新渲染，刚才编辑的那一行就会显示最新数据，然后 Drawer 关闭。到这里，“点击编辑 → 请求详情 → 回填表单 → 提交更新 → 刷新当前行”形成一条完整链路。

### 12.3 正常流程跑通后，再完善页面反馈

前两步已经完成 CRUD 的正常流程。现在再处理四个实际问题：列表加载、详情加载、请求失败，以及编辑内容没有变化时产生的无意义更新请求。

请求状态的处理模式可以复用，但不同请求的状态不能混用。列表请求和详情请求都会经历“加载→成功或失败”，但它们影响的页面区域不同：列表状态交给 Table 使用，详情状态交给编辑 Drawer 使用。因此本节分别保存两组状态。

先在 Ant Design 导入中增加 `Alert` 和 `App`：

```tsx
import {
  Alert,
  App,
  Button,
  Drawer,
  Table,
  type TableColumnsType,
} from "antd";
```

删除第 9 节的 `message` 状态，保留 `articles`，再增加页面反馈需要的状态：

```tsx
const { message: messageApi } = App.useApp();
const [articles, setArticles] = useState<ArticleListItem[]>([]);
const [listLoading, setListLoading] = useState(true);
const [listError, setListError] = useState<string | null>(null);
const [detailLoading, setDetailLoading] = useState(false);
const [detailError, setDetailError] = useState<string | null>(null);
```

`App.useApp()` 读取前面 `<App>` 提供的页面反馈工具。`const { message: messageApi }` 从返回对象中取出 `message` 并改名为 `messageApi`，后面便可以调用 `messageApi.success()` 显示成功提示。

`listLoading` 和 `listError` 描述 `getArticles()` 列表请求。第 12.2 节的 `editingArticle` 保存 `getArticleById(id)` 返回的详情数据，`detailLoading` 和 `detailError` 分别保存这次详情请求的加载状态和失败原因。

`detailLoading` 只会在编辑前使用，因为编辑需要先请求已有文章的详情，新建空表单没有这次请求。这个名称按“正在加载文章详情”命名，不叫 `drawerLoading`；Drawer 同时承载新建和编辑，不能准确说明是哪次请求正在加载。

把第 9 节的列表请求改为：

```tsx
useEffect(() => {
  async function loadArticles() {
    setListLoading(true);
    setListError(null);

    try {
      setArticles(await getArticles());
    } catch (requestError) {
      setListError(
        requestError instanceof Error
          ? requestError.message
          : "文章列表加载失败",
      );
    } finally {
      setListLoading(false);
    }
  }

  void loadArticles();
}, []);
```

再给详情请求补上加载和错误处理：

```tsx
async function openEditDrawer(id: number) {
  setDrawerMode("edit");
  setEditingArticle(null);
  setDetailError(null);
  setDetailLoading(true);
  setDrawerOpen(true);

  try {
    setEditingArticle(await getArticleById(id));
  } catch (requestError) {
    setDetailError(
      requestError instanceof Error
        ? requestError.message
        : "文章详情加载失败",
    );
  } finally {
    setDetailLoading(false);
  }
}
```

新建抽屉打开时，也清除上一次编辑留下的文章和错误：

```tsx
function openCreateDrawer() {
  setDrawerMode("create");
  setEditingArticle(null);
  setDetailError(null);
  setDrawerOpen(true);
}
```

最后把 `handleUpdate()` 改为先比较表单值和原始文章，再决定是否发送更新请求：

```tsx
async function handleUpdate(
  id: number,
  values: ArticleFormValues,
) {
  if (!editingArticle) {
    throw new Error("缺少要编辑的文章");
  }

  const isUnchanged =
    values.title === editingArticle.title &&
    values.slug === editingArticle.slug &&
    values.summary === (editingArticle.summary ?? "") &&
    values.content === editingArticle.content &&
    values.status === editingArticle.status;

  if (isUnchanged) {
    messageApi.warning("内容没有变化");
    return;
  }

  const updatedArticle = await updateArticle(id, values);
  setArticles((current) =>
    current.map((article) =>
      article.id === updatedArticle.id ? updatedArticle : article,
    ),
  );
  setDrawerOpen(false);
  messageApi.success("文章已保存");
}
```

`isUnchanged` 比较的是提交时的最终值。因此，无论用户完全没有修改，还是修改后又恢复原值，都不会调用 `updateArticle()`。如果确实修改了字段，当前固定字段的小表单仍然把完整的 `values` 交给 PATCH 接口，写法简单且足够清楚。

摘要需要写成 `values.summary === (editingArticle.summary ?? "")`。API 中未填写的摘要可能是 `null`，但编辑表单的 `initialValues` 已经把它转换成空字符串；如果直接比较 `"" === null`，没有修改的摘要也会被误判为发生变化。

`editingArticle` 的类型包含 `null`，所以函数开头先确认原始文章存在。没有变化时直接 `return`，`ArticleForm` 等待的 Promise 会正常结束，提交按钮恢复可用；Drawer 保持打开，并通过 `messageApi.warning()` 告诉用户没有需要保存的变化。

Drawer 使用 `loading` 显示详情加载状态，失败时显示 `Alert`，成功时显示编辑表单。Table 同样使用 `listLoading` 和 `listError`：

```tsx
{listError ? (
  <Alert
    type="error"
    showIcon
    title="文章列表加载失败"
    description={listError}
  />
) : null}

<Table
  rowKey="id"
  loading={listLoading}
  columns={columns}
  dataSource={articles}
/>

<Drawer
  title={drawerMode === "create" ? "新建文章" : "编辑文章"}
  open={drawerOpen}
  size="large"
  loading={drawerMode === "edit" && detailLoading}
  destroyOnHidden
  onClose={() => setDrawerOpen(false)}
>
  {drawerMode === "create" ? (
    <ArticleForm
      key="create"
      submitText="创建文章"
      onCancel={() => setDrawerOpen(false)}
      onSubmit={(values) => handleCreate(values)}
    />
  ) : detailError ? (
    <Alert
      type="error"
      showIcon
      title="文章详情加载失败"
      description={detailError}
    />
  ) : editingArticle ? (
    <ArticleForm
      key={`edit-${editingArticle.id}`}
      initialValues={{
        title: editingArticle.title,
        slug: editingArticle.slug,
        summary: editingArticle.summary ?? "",
        content: editingArticle.content,
        status: editingArticle.status,
      }}
      submitText="保存修改"
      onCancel={() => setDrawerOpen(false)}
      onSubmit={(values) =>
        handleUpdate(editingArticle.id, values)
      }
    />
  ) : null}
</Drawer>
```

在 `handleCreate()` 的 `setDrawerOpen(false)` 后面调用 `messageApi.success("文章已创建")`；`handleUpdate()` 的成功提示已经在上面的完整函数中加入。保存失败仍由第 11 节的 `ArticleForm` 显示错误并保留输入内容。这些状态和提示不负责完成 CRUD，只负责把已经跑通的页面补完整。

这里同时存在两个方向：表单值通过 `onSubmit` 传给外层页面，请求错误又沿着 `handleCreate()` 或 `handleUpdate()` 返回的失败 Promise 传回 `ArticleForm`。本章先继续完成页面；全部跟练结束后，可以用第 14A 章串起完整流程，再用第 14B 章复习背后的 Promise 机制。

### 12.4 按需对照完整页面代码

前面三步已经依次完成新建、编辑和页面反馈。如果需要确认它们在 `app/admin/articles/page.tsx` 中的最终位置，再展开下面的完整代码。完整代码还用 `Card` 包住 Table，并设置了空列表文字，这两项只影响展示：

<details>
<summary>展开完整的文章列表页代码</summary>

```tsx
"use client";

import {
  Alert,
  App,
  Button,
  Card,
  Drawer,
  Table,
  type TableColumnsType,
} from "antd";
import { useEffect, useState } from "react";

import { ArticleForm } from "@/app/admin/articles/_components/article-form";
import {
  createArticle,
  getArticleById,
  getArticles,
  updateArticle,
} from "@/features/articles/api";
import type {
  Article,
  ArticleFormValues,
  ArticleListItem,
} from "@/features/articles/types";

type DrawerMode = "create" | "edit";

export default function ArticlesPage() {
  const { message: messageApi } = App.useApp();
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticles() {
      setListLoading(true);
      setListError(null);

      try {
        setArticles(await getArticles());
      } catch (requestError) {
        setListError(
          requestError instanceof Error
            ? requestError.message
            : "文章列表加载失败",
        );
      } finally {
        setListLoading(false);
      }
    }

    void loadArticles();
  }, []);

  function openCreateDrawer() {
    setDrawerMode("create");
    setEditingArticle(null);
    setDetailError(null);
    setDrawerOpen(true);
  }

  async function openEditDrawer(id: number) {
    setDrawerMode("edit");
    setEditingArticle(null);
    setDetailError(null);
    setDetailLoading(true);
    setDrawerOpen(true);

    try {
      setEditingArticle(await getArticleById(id));
    } catch (requestError) {
      setDetailError(
        requestError instanceof Error
          ? requestError.message
          : "文章详情加载失败",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreate(values: ArticleFormValues) {
    const newArticle = await createArticle(values);
    setArticles((current) => [
      newArticle,
      ...current,
    ]);
    setDrawerOpen(false);
    messageApi.success("文章已创建");
  }

  async function handleUpdate(
    id: number,
    values: ArticleFormValues,
  ) {
    if (!editingArticle) {
      throw new Error("缺少要编辑的文章");
    }

    const isUnchanged =
      values.title === editingArticle.title &&
      values.slug === editingArticle.slug &&
      values.summary === (editingArticle.summary ?? "") &&
      values.content === editingArticle.content &&
      values.status === editingArticle.status;

    if (isUnchanged) {
      messageApi.warning("内容没有变化");
      return;
    }

    const updatedArticle = await updateArticle(id, values);
    setArticles((current) =>
      current.map((article) =>
        article.id === updatedArticle.id ? updatedArticle : article,
      ),
    );
    setDrawerOpen(false);
    messageApi.success("文章已保存");
  }

  const columns: TableColumnsType<ArticleListItem> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "操作",
      key: "actions",
      render: (_, article) => (
        <Button
          type="link"
          onClick={() => void openEditDrawer(article.id)}
        >
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            文章管理
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            在当前页面查看、新建和编辑文章。
          </p>
        </div>

        <Button type="primary" onClick={openCreateDrawer}>
          新建文章
        </Button>
      </div>

      {listError ? (
        <div className="mt-6">
          <Alert
            type="error"
            showIcon
            title="文章列表加载失败"
            description={listError}
          />
        </div>
      ) : null}

      <div className="mt-6">
        <Card>
          <Table
            rowKey="id"
            loading={listLoading}
            columns={columns}
            dataSource={articles}
            locale={{ emptyText: "暂无文章" }}
          />
        </Card>
      </div>

      <Drawer
        title={drawerMode === "create" ? "新建文章" : "编辑文章"}
        open={drawerOpen}
        size="large"
        loading={drawerMode === "edit" && detailLoading}
        destroyOnHidden
        onClose={() => setDrawerOpen(false)}
      >
        {drawerMode === "create" ? (
          <ArticleForm
            key="create"
            submitText="创建文章"
            onCancel={() => setDrawerOpen(false)}
            onSubmit={(values) => handleCreate(values)}
          />
        ) : detailError ? (
          <Alert
            type="error"
            showIcon
            title="文章详情加载失败"
            description={detailError}
          />
        ) : editingArticle ? (
          <ArticleForm
            key={`edit-${editingArticle.id}`}
            initialValues={{
              title: editingArticle.title,
              slug: editingArticle.slug,
              summary: editingArticle.summary ?? "",
              content: editingArticle.content,
              status: editingArticle.status,
            }}
            submitText="保存修改"
            onCancel={() => setDrawerOpen(false)}
            onSubmit={(values) =>
              handleUpdate(editingArticle.id, values)
            }
          />
        ) : null}
      </Drawer>
    </div>
  );
}
```

</details>

### 12.5 按两条链路完成验证

先测试新建：

```text
点击“新建文章”
-> 抽屉打开，表单为空，状态默认是草稿
-> 填写并提交
-> POST /api/articles 返回新文章
-> 抽屉关闭，新文章出现在表格第一行
```

再测试编辑：

```text
点击某一行的“编辑”
-> 抽屉打开并显示详情加载状态
-> GET /api/articles/:id 返回完整文章
-> 表单回填文章内容
-> 不修改直接保存：显示“内容没有变化”，不发送 PATCH
-> 修改后恢复原值再保存：仍然不发送 PATCH
-> 真正修改一个字段：提交一次 PATCH /api/articles/:id
-> 抽屉关闭，表格中这一行更新
```

可以在浏览器开发者工具的 Network 面板中确认 PATCH 是否出现。两次操作中的浏览器地址都应始终是 `/admin/articles`。如果内容没有变化或保存失败，抽屉不会关闭；保存失败时，用户已经输入的内容仍然保留。

---

## 13. 最后增加删除功能

第 10 节已经准备好 DELETE 请求。现在只补删除确认和页面状态，CRUD 仍然全部留在文章列表页。

把 `app/admin/articles/page.tsx` 的 Ant Design 导入补上 `Popconfirm` 和 `Space`：

```tsx
import {
  Alert,
  App,
  Button,
  Card,
  Drawer,
  Popconfirm,
  Space,
  Table,
  type TableColumnsType,
} from "antd";
```

文章 API 导入补上 `deleteArticle`：

```tsx
import {
  createArticle,
  deleteArticle,
  getArticleById,
  getArticles,
  updateArticle,
} from "@/features/articles/api";
```

在文章列表状态下面增加：

```tsx
const [deletingId, setDeletingId] = useState<number | null>(null);
```

再在 `columns` 前面增加删除函数：

```tsx
async function handleDelete(id: number) {
  setDeletingId(id);

  try {
    await deleteArticle(id);
    setArticles((current) =>
      current.filter((article) => article.id !== id),
    );
    messageApi.success("文章已删除");
  } catch (error) {
    messageApi.error(error instanceof Error ? error.message : "删除失败");
  } finally {
    setDeletingId(null);
  }
}
```

DELETE 请求成功后，`filter()` 从当前 `articles` 中排除这篇文章，`setArticles()` 触发表格重新渲染。最后把操作列替换为：

这里的 `id` 和 `deletingId` 职责不同：函数参数 `id` 表示本次确定要删除的文章，因此 `deleteArticle(id)` 和 `filter()` 都直接使用它；`deletingId` 只保存“当前正在删除哪一篇”，供按钮判断是否显示 loading。`setDeletingId(id)` 不会立即改变当前函数中的状态值，所以不能使用 `deletingId` 代替 `id` 过滤列表。

名称使用 `deletingId`，而不是 `deletedId`：`deleting` 表示删除请求仍在进行，`finally` 执行后它会恢复为 `null`；它并不保存已经删除完成的文章。

```tsx
{
  title: "操作",
  key: "actions",
  render: (_, article) => (
    <Space>
      <Button
        type="link"
        onClick={() => void openEditDrawer(article.id)}
      >
        编辑
      </Button>

      <Popconfirm
        title="确认删除这篇文章吗？"
        description="删除后不能通过页面恢复。"
        okText="删除"
        cancelText="取消"
        onConfirm={() => handleDelete(article.id)}
      >
        <Button
          type="link"
          danger
          loading={deletingId === article.id}
        >
          删除
        </Button>
      </Popconfirm>
    </Space>
  ),
},
```

`render` 拿到当前行的 `article`，编辑按钮用 `article.id` 打开抽屉，删除按钮用同一个 `id` 发送 DELETE 请求。`Popconfirm` 会先要求用户确认，确认后才调用 `handleDelete()`。`setDeletingId()` 本身不会显示任何内容；只有按钮读取 `deletingId === article.id` 后，当前行才会进入 loading 状态。本地请求很快时可能看不到这个短暂变化，第 14.5 节会说明怎样使用慢速网络验证。

---

## 14. 按四条链路完成联调

### 14.0 先让 Express 打印 API 请求日志

Next.js 开发终端会打印它处理的页面请求，例如：

```text
GET /admin/articles 200
```

这只能说明 `http://localhost:3000/admin/articles` 页面加载成功。页面挂载后，浏览器还会直接请求 `http://localhost:3001/api/articles`；这次请求绕过 Next.js，当前 Express 又没有请求日志，所以两个终端中不会自动出现对应的 API 记录。

为了在联调时直接看到 Express 收到了什么请求，并更直观地识别每次响应的状态码，先在 `server/src/app.ts` 顶部导入 Node.js 自带的 `styleText`：

```ts
import { styleText } from "node:util";
```

再在 `export const app = express()` 后面增加一个日志中间件，并把它放在 CORS、JSON 解析和文章路由之前：

```ts
export const app = express();

app.use((request, response, next) => {
  const startTime = Date.now();

  response.on("finish", () => {
    const duration = Date.now() - startTime;
    const statusCode = styleText(
      "blue",
      String(response.statusCode),
    );

    console.log(
      `${request.method} ${request.originalUrl} ${statusCode} in ${duration}ms`,
    );
  });

  next();
});

app.use(cors({
  origin: "http://localhost:3000",
}));
```

这段代码按照下面的顺序工作：

```text
浏览器的 API 请求到达 app.ts 中创建的 Express 应用
-> Express 按 app.use() 的注册顺序，首先执行日志中间件
-> startTime 记录请求进入日志中间件的时间
-> response.on("finish", callback) 登记响应结束后要执行的函数
-> next() 把请求交给后面的 CORS、JSON 解析和业务路由
-> 路由查询数据库并返回响应
-> 响应发送完成，触发 finish
-> 用当前时间减去 startTime，得到请求耗时
-> styleText() 把状态码显示为蓝色
-> 打印请求方法、地址、状态码和耗时
```

`response.on("finish", ...)` 在登记时不会立即打印。只有后面的路由完成 `response.json()` 等响应操作后，回调才会读取最终的 `statusCode` 并计算总耗时。`styleText("blue", String(response.statusCode))` 先把数字状态码转成字符串，再给它增加蓝色终端样式；颜色只用于突出状态码，不改变响应内容。`next()` 则负责让请求继续进入后面的中间件和路由；如果这里不调用它，请求会停在日志中间件中。

日志中间件需要放在文章路由之前，因为 Express 按注册顺序处理请求。如果文章路由已经返回响应，它通常不会再调用 `next()`，放在路由后面的日志中间件便没有机会执行。它不必绝对占据 `app.ts` 的第一行，只要位于需要记录的路由之前即可。

增加后，Express 终端会出现类似记录：

```text
GET /api/articles 200 in 8ms
OPTIONS /api/articles 204 in 1ms
POST /api/articles 201 in 15ms
DELETE /api/articles/3 200 in 6ms
```

上面示例中的状态码会在实际终端中显示为蓝色。`styleText` 来自 Node.js，不需要安装新的依赖。

#### 为什么会看到 OPTIONS 请求

Next.js 页面运行在 `localhost:3000`，Express API 运行在 `localhost:3001`，端口不同，所以浏览器会把它们视为不同源。发送 JSON POST、PATCH 或 DELETE 等写请求前，浏览器可能先自动发送一个 `OPTIONS` 预检请求，询问 Express 是否允许当前来源、请求方法和请求头。

`OPTIONS` 是正常的 CORS 检查，不是错误，也不是页面代码重复调用了业务 API。预检由 `cors()` 中间件处理；通过后，浏览器才继续发送真正的 POST、PATCH 或 DELETE。普通 GET 通常不需要这一步。

#### Next.js 开发模式为什么可能出现两次请求

当前 Next.js 项目在开发模式下使用 React Strict Mode。刷新页面时，它可能让负责加载列表的 `useEffect` 额外执行一次，因此 Express 终端和 Network 面板可能出现两次 `GET /api/articles`。这项检查只发生在开发模式，不要为了消除这两条记录关闭 Strict Mode。

#### 浏览器为什么可能收到 304

浏览器缓存中已经存在相同响应时，Express 还可能记录 `304`。它表示内容没有变化，浏览器继续使用缓存中的文章数据，不是请求失败；在 Network 面板勾选 `Disable cache` 后刷新，通常会重新看到 `200`。

同时启动两个项目：

```bash
# 终端 1：mini-cms/server
npm run dev

# 终端 2：mini-cms/admin-web-antd
npm run dev
```

依次检查：页面用于确认操作结果，Express 终端用于确认请求和状态码。只有排错时才需要打开 Network 面板。

### 14.1 列表

```text
打开 /admin/articles
-> 页面显示 loading
-> 在 Express 终端确认 GET /api/articles 返回 200；使用缓存时可能是 304
-> 有数据时显示表格，无数据时显示空状态
```

### 14.2 新建

```text
在 /admin/articles 点击“新建文章”
-> 打开新建抽屉并提交合法文章
-> 在 Express 终端确认 POST /api/articles 返回 201
-> 抽屉关闭，当前表格出现新文章
```

再提交一次相同 slug，在 Express 终端确认 `POST /api/articles` 返回 `409`；抽屉应保留输入并显示后端给出的错误信息。

### 14.3 编辑

```text
在 /admin/articles 点击某一行的“编辑”
-> 在 Express 终端确认 GET /api/articles/:id 返回 200
-> 编辑抽屉回填文章内容
-> 修改并提交后，在 Express 终端确认 PATCH /api/articles/:id 返回 200
-> 抽屉关闭，当前表格显示修改结果
```

### 14.4 删除

```text
点击删除
-> 先出现确认提示
-> 确认删除后，在 Express 终端确认 DELETE /api/articles/:id 返回 200
-> 从 articles 状态中移除这篇文章
-> 被删除文章消失
```

当前 Mini CMS 的删除接口返回 `200` 和被删除文章的 JSON，与 `apiRequest()` 读取 JSON 的写法一致。

### 14.5 手动验证加载状态和错误提示

正常请求在本机可能很快结束，页面上的 loading 会一闪而过。要观察加载状态，可以打开浏览器开发者工具的 Network 面板，选择一个慢速网络预设，再执行刷新、编辑、保存或删除操作。

按照下面的顺序分别验证。每次停止 Express 后，先重新启动它并恢复正常页面，再进入下一个场景，避免一次失败影响其他判断。

| 要验证的状态 | 怎样触发 | 页面应该怎样显示 |
|---|---|---|
| `listLoading` | 使用慢速网络刷新 `/admin/articles` | Table 显示加载状态，请求完成后显示列表或空状态 |
| `listError` | 停止 Express，再刷新页面 | Table 上方显示“文章列表加载失败” |
| `detailLoading` | 使用慢速网络点击某一行的“编辑” | Drawer 打开并显示详情加载状态，完成后出现表单 |
| `detailError` | 先正常打开列表，再停止 Express，点击“编辑” | Drawer 内显示“文章详情加载失败”，原列表仍然保留 |
| `submitting` | 使用慢速网络提交新建或编辑表单 | 提交按钮显示加载状态，不能重复提交 |
| `submitError` | Express 正常运行时，再提交一次已经存在的 slug | Drawer 不关闭，已填内容保留，提交按钮上方显示保存错误 |
| `deletingId` | 使用慢速网络确认删除 | 只有当前行的删除按钮显示加载状态 |
| 删除错误提示 | 先正常打开列表，再停止 Express，确认删除 | 页面显示删除失败消息，原文章仍然留在列表中 |

标题留空或输入错误格式的 slug，验证的是 `Form.Item rules` 的前端校验提示。这类错误会阻止提交，不会发送 API 请求。重复 slug、服务器停止等情况验证的才是 API 请求失败后的错误传递和展示。

不要只把 `listError` 或 `submitError` 的初始值临时改成一段文字。这样只能看到提示组件的外观，不能证明请求失败后对应的 `catch`、状态更新和页面展示已经连通。

第 17、17A 章会使用 Vitest 和 Supertest 自动验证后端 API 的状态码与错误结构，但不会打开浏览器检查这里的 `Alert`、Drawer 和按钮 loading。当前学习路线暂时不增加浏览器端 E2E 测试，因此本节仍是前端页面反馈的手动验收。

---

## 15. 用新建文章串起完整数据流

```text
浏览器中的 ArticleForm 收集 values
-> page.tsx 的 handleCreate(values)
-> features/articles/api.ts 的 createArticle()
-> lib/api-client.ts 的 apiRequest()
-> 浏览器直接向 localhost:3001 发送 POST /api/articles

-> Express 进程收到请求
-> app.ts 中间件依次处理请求
-> article-router.ts 匹配 POST 路由
-> article-schema.ts 校验数据
-> article-repository.ts 调用 Prisma
-> PostgreSQL 保存文章

-> Express 返回新文章
-> apiRequest() 解析响应
-> handleCreate() 得到 newArticle
-> setArticles() 更新列表
-> Table 显示新文章
```

---

## 16. 下一步继续完善同一个系统

完成跟练后，先阅读[第 14A 章](./14A-从页面操作到数据库-一条线看懂管理后台CRUD.md)，把页面操作、`fetch`、Express、Prisma、数据库和 UI 更新收成一条完整主线；再阅读[第 14B 章](./14B-管理后台里的TypeScript-Promise和React状态.md)，集中复习泛型、Promise、Swift 与 TypeScript 的类型差异和 React 状态。这两章都是完成第 14 章后的扩展阅读，不需要在跟练中途跳出本章。

第 15～17 章继续修改同一套 Mini CMS：

```text
第 15 章
-> server 增加标签、多表关系、筛选和发布规则
-> admin-web-antd 增加对应管理页面

第 16、16A 章
-> server 增加认证 API 和中间件
-> admin-web-antd 增加登录页和登录状态

第 17、17A 章
-> 用测试固定共享 API 的核心行为
```

下一步进入[第 15 章](./15-数据关系JOIN和事务.md)，给文章增加标签和发布规则。共享 API 稳定以后，再按第 23～27 章用 Axios 完成并列的 `admin-web-shadcn`。

## 官方参考

- [Next.js：create-next-app CLI](https://nextjs.org/docs/app/api-reference/cli/create-next-app)
- [Next.js：项目目录和私有文件夹](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js：Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
- [Next.js：useRouter](https://nextjs.org/docs/app/api-reference/functions/use-router)
- [Next.js：环境变量](https://nextjs.org/docs/app/guides/environment-variables)
- [Tailwind CSS：在 Next.js 中安装](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
- [Ant Design：定制主题](https://ant.design/docs/react/customize-theme-cn/)
- [Ant Design：Layout 布局](https://ant.design/components/layout-cn/)
- [Ant Design：Menu 导航菜单](https://ant.design/components/menu-cn/)
- [Ant Design：Form 表单](https://ant.design/components/form-cn/)
- [Ant Design：Alert 警告提示](https://ant.design/components/alert-cn/)
- [Ant Design：Button 按钮](https://ant.design/components/button-cn/)
- [Ant Design：Drawer 抽屉](https://ant.design/components/drawer-cn/)
- [Ant Design：在 Next.js App Router 中使用](https://ant.design/docs/react/use-with-next/)
- [MDN：使用 Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)
