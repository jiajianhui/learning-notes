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
  --no-tailwind \
  --import-alias "@/*" \
  --use-npm \
  --disable-git
```

如果命令询问是否把代码放进 `src/`，选择 `No`。本项目使用根目录的 `app/`。

`--disable-git` 避免子项目再次初始化 Git。三个子项目共用 `mini-cms/.git`。

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
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
}
```

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
type Article = {
  id: number;
  title: string;
};

type ArticleListBody = {
  data: Article[];
};
```

再给两处数据补上类型：

```tsx
const [articles, setArticles] = useState<Article[]>([]);

// loadArticles() 内
const body: ArticleListBody = await response.json();
```

- `Article` 对应 `data` 数组中的一篇文章。
- `Article[]` 对应整个文章数组。
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

接下来还要请求文章详情，以及完成新建、编辑和删除。如果每个页面都重新写一遍 API 地址、`fetch()`、状态判断和 `response.json()`，相同代码会越来越多。因此从这里开始，把页面逻辑和通用请求逻辑分开：

```text
页面自己的工作：更新 articles 和 message
每个接口都要做的工作：拼接 API 地址、发送请求、检查结果、解析 JSON
```

这些接口的通用请求流程相同，但接口路径、请求选项和返回的 `data` 不同：

```text
文章列表：GET  /api/articles    -> data 是 Article[]
文章详情：GET  /api/articles/1  -> data 是 Article
新建文章：POST /api/articles    -> data 是 Article
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

**`<T>` 是什么**：紧跟在函数名后面、用尖括号声明的**类型参数**。它的作用是给函数占一个"类型插槽"，具体填什么类型，由调用时决定。

**类比但不等于函数参数**：

```typescript
apiRequest<Article[]>('/articles')
//         ^^^^^^^^^   ^^^^^^^^^^
//          类型参数      函数参数
```

两者逻辑相似（外部传入、内部使用），但活在不同世界：函数参数传的是"值"，运行时真实存在；类型参数传的是"类型"，只服务于编译期检查，代码一旦编译成 JS，T 就彻底消失，没有任何运行时痕迹。

**它不是什么**（对应前面聊到的几个容易混的概念）：

- 不是"返回类型"本身——`Promise<T>` 才是完整返回类型，T 只是嵌在里面的占位符
- 不是"函数类型"——函数类型描述的是整个函数长什么样（如 `(req: Request) => void`），T 是另一回事
- 不是"可变的类型"（跟 mutable/immutable 无关）——它是"每次调用可被替换成不同具体类型"的占位符

**为什么在 apiRequest 里必须手动指定**：因为 T 只出现在返回类型 `Promise<T>` 里，参数 `path`、`options` 跟它没关系，TS 没有线索能反推，所以只能靠调用时显式传入，比如 `apiRequest<Article[]>('/articles')`，TS 才会把签名里所有的 T 替换成 `Article[]`，最终返回类型具体化为 `Promise<Article[]>`。

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

目前只有 `app/page.tsx` 使用 `Article` 时，类型留在页面中也可以。但后面的文章请求、列表、表单和编辑页都会使用文章类型，继续写在页面中就会重复定义。因此现在集中放到 `features/articles/types.ts`；这是为了复用，不是每个类型都必须单独建文件。

在 `admin-web-antd` 项目根目录新建 `features/articles`，它与 `app` 目录同级。新建 `features/articles/types.ts`：

```ts
export type ArticleStatus = "draft" | "published";

export type Article = {
  id: number;
  title: string;
  slug: string;
  status: ArticleStatus;
  createdAt: string;
};
```

第 7.1 节只定义了用于跑通请求的 `id` 和 `title`。现在增加第 9 节文章列表会显示的 `slug`、`status` 和 `createdAt`，`ArticleStatus` 把 `status` 限制为草稿或已发布。编辑页需要的正文、摘要等属性，等第 12 节用到时再增加。

再新建 `features/articles/api.ts`：

```ts
import { apiRequest } from "@/lib/api-client";

import type { Article } from "./types";

export function getArticles() {
  return apiRequest<Article[]>("/api/articles");
}
```

`getArticles()` 没有手写返回类型，因为 TypeScript 会根据 `apiRequest<Article[]>("/api/articles")` 自动推断它返回 `Promise<Article[]>`。也可以写成 `getArticles(): Promise<Article[]>`，结果相同，这里不重复标注。

第 9 节会继续在此目录中增加其他文章请求。现在先把 `getArticles()` 接回测试页面，确认整理后的代码仍然可以运行。

### 7.5 用封装后的请求重新验证页面

第 7.3～7.4 节只是提取和整理代码。还要让页面真正调用 `getArticles()`，才能确认封装后的完整请求流程没有问题。

把 `app/page.tsx` 替换为：

```tsx
"use client";

import { useEffect, useState } from "react";

import { getArticles } from "@/features/articles/api";
import type { Article } from "@/features/articles/types";

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [message, setMessage] = useState("正在请求文章……");

  useEffect(() => {
    // getArticles() 返回 Promise<Article[]>，不是 Article[]。
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

`getArticles()` 虽然没有使用 `async` 声明，但它直接返回了 `apiRequest()` 产生的 `Promise<Article[]>`。页面使用 `await` 等待请求完成后，`articleList` 才是可以交给 `setArticles()` 的 `Article[]`。

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
import type { Article } from "@/features/articles/types";

const { Header, Sider, Content } = Layout;

export default function AdminPage() {
  // 状态
  const [articles, setArticles] = useState<Article[]>([]);
  const [message, setMessage] = useState("loading");

  // 初始化
  useEffect(() => {
    async function loadArticles() {
      const result = await getArticles();
      setArticles(result);
      setMessage("加载成功");
    }

    loadArticles();
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

`columns` 决定表格显示哪些列。每个 `dataIndex` 都对应 `Article` 中的同名属性，`dataSource={articles}` 再把文章数组交给表格。请求完成并执行 `setArticles(result)` 后，组件重新渲染，表格就会显示文章数据。

打开 `/admin/articles`，看到“加载成功”和文章表格，这一步就完成。删除、确认提示和操作状态留到后面再加。

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
            onClick={(menuInfo) => router.push(menuInfo.key)}
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

- `selectedKeys={[pathname]}` 只负责菜单高亮。`usePathname()` 返回当前地址，例如 `/admin/articles`；Ant Design 的 `selectedKeys` 要接收 `string[]`，所以即使只选中一项，也要把 `pathname` 放进数组。
- `items={items}` 决定显示哪些菜单项。当前 `items` 中的 `key` 是 `/admin/articles`，`label` 是用户看到的“文章管理”。菜单项的 `key` 同时作为后面要跳转的地址。
- `onClick={(menuInfo) => router.push(menuInfo.key)}` 负责点击后的跳转。可以把 `menuInfo` 理解成“刚才点了哪一项”。如果点击“文章管理”，`menuInfo.key` 就是 `/admin/articles`，`router.push()` 会跳到这个地址。

因此，`selectedKeys` 不负责跳转，`router.push()` 也不负责菜单样式。两者通过当前 URL 配合：

```text
点击菜单项
-> onClick 得到 menuInfo
-> router.push(menuInfo.key) 改变地址
-> usePathname() 读到新地址
-> selectedKeys 高亮与地址同名的菜单项
-> 新路由的 page.tsx 成为 children，显示在 Content 中
```

当前只有“文章管理”一个菜单项，下一节会增加“页面一”和“页面二”，实际观察这条切换流程。

布局抽离后，`app/admin/articles/page.tsx` 的完整代码是：

```tsx
"use client";

import { Table } from "antd";
import { useEffect, useState } from "react";

import { getArticles } from "@/features/articles/api";
import type { Article } from "@/features/articles/types";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [message, setMessage] = useState("loading");

  useEffect(() => {
    async function loadArticles() {
      const result = await getArticles();
      setArticles(result);
      setMessage("加载成功");
    }

    loadArticles();
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

侧边栏目前只有“文章管理”，还看不出切换效果。这里先增加“页面一”和“页面二”，只验证 `Sider` 切换 `Content`，暂时不绑定文章的新建、编辑等功能。

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
onClick={(menuInfo) => router.push(menuInfo.key)}
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

点击菜单项后，`router.push(menuInfo.key)` 进入对应地址。两个页面都位于 `app/admin` 下，因此继续共用 `app/admin/layout.tsx`：`Header` 和 `Sider` 不变，`Content` 在“页面一”和“页面二”之间切换。验证完成后，再根据实际产品页面替换这两个示例。

### 9.4 页面跑通后再统一主题

现在页面中已经有 `Layout`、`Menu` 和 `Table`。这一节再加入页面间距、内容卡片和主要操作按钮，并统一 Ant Design 组件主题。

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
| `colorPrimary` | Ant Design 根据主色生成悬停色、按下色等状态色，再用于主按钮和菜单选中状态 |
| `borderRadius` | 作为基础圆角，影响按钮、卡片和输入框等组件 |
| `colorText` | 作为组件的基础文字色 |
| `colorBgLayout` | 作为布局区域的背景色 |
| `components.Layout` | 只覆盖 `Layout`，这里分别设置顶部栏、侧边栏和内容区 |

前四项放在 `theme.token` 中，会被多个组件共同读取；`components.Layout` 只影响 `Layout`。这就是“主题值到组件样式”的映射关系。

把 `app/admin/layout.tsx` 中 `AdminLayout` 的 `return` 替换为：

```tsx
return (
  <Layout className="min-h-screen">
    <Header className="border-b border-slate-200 text-lg font-semibold text-slate-950">
      Mini CMS
    </Header>

    <Layout>
      <Sider width={200} theme="light">
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={items}
          onClick={(menuInfo) => router.push(menuInfo.key)}
        />
      </Sider>
      <Content className="p-6">{children}</Content>
    </Layout>
  </Layout>
);
```

`min-h-screen` 让后台至少占满一屏，`p-6` 给内容区留出间距。顶部栏背景由 `components.Layout.headerBg` 控制，侧边栏因为使用 `theme="light"`，会读取 `lightSiderBg`。

最后把 `app/admin/articles/page.tsx` 的 Ant Design 导入改成：

```tsx
import { Button, Card, Table } from "antd";
```

再把 `return` 替换为：

```tsx
return (
  <div>
    <div className="flex items-end justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">文章管理</h1>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
      </div>
      <Button type="primary">主要操作</Button>
    </div>

    <Card className="mt-6 border-slate-200 shadow-sm">
      <Table
        bordered
        rowKey="id"
        columns={columns}
        dataSource={articles}
      />
    </Card>
  </div>
);
```

页面现在是白色顶部栏和侧边栏、浅灰背景、白色内容卡片。Tailwind 负责布局、间距和文字层级，Ant Design token 负责组件内部的颜色、圆角和交互状态。

可以临时把 `colorPrimary` 改成 `#722ed1`，观察主按钮和菜单选中状态一起变成紫色，再改回 `#1677ff`。`<App>` 暂时不产生可见样式，后面的页面会通过 `App.useApp()` 使用消息提示。

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

## 10. 写一个新建和编辑共用的文章表单

表单提交的数据和 Express 返回的完整文章不同。先在 `features/articles/types.ts` 中增加：

```ts
export type ArticleInput = {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  status: ArticleStatus;
};
```

`ArticleInput` 只描述新建和编辑时要提交的字段，不包含数据库生成的 `id` 和时间。

新建 `app/admin/articles/_components/article-form.tsx`。它只负责文章表单界面和提交状态，新建页与编辑页都可以使用：

```tsx
"use client";

import { Alert, Button, Form, Input, Select, Space } from "antd";
import { useState } from "react";

import type { ArticleInput } from "@/features/articles/types";

type ArticleFormProps = {
  initialValues?: ArticleInput;
  submitText: string;
  onSubmit: (values: ArticleInput) => Promise<void>;
};

export function ArticleForm({
  initialValues,
  submitText,
  onSubmit,
}: ArticleFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleFinish(values: ArticleInput) {
    setSubmitting(true);
    setSubmitError(null);

    try {
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

  return (
    <Form<ArticleInput>
      layout="vertical"
      initialValues={{ status: "draft", ...initialValues }}
      onFinish={handleFinish}
    >
      {submitError ? (
        <Alert
          type="error"
          showIcon
          message="保存失败"
          description={submitError}
          className="mb-6"
        />
      ) : null}

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
        <Input.TextArea rows={12} />
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

      <Space>
        <Button type="primary" htmlType="submit" loading={submitting}>
          {submitText}
        </Button>
        <Button href="/admin/articles">取消</Button>
      </Space>
    </Form>
  );
}
```

Ant Design Form 会在提交前提示明显的字段错误。Express 中的 Zod 仍然必须保留，因为后端也会收到来自 Apifox、另一套后台或其他客户端的请求。后端返回的错误信息统一显示在表单顶部。

---

## 11. 完成新建页面

新建页面需要发送 POST 请求。先把 `features/articles/api.ts` 中的类型导入改成：

```ts
import type { Article, ArticleInput } from "./types";
```

再增加：

```ts
export function createArticle(input: ArticleInput) {
  return apiRequest<Article>("/api/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}
```

新建 `app/admin/articles/new/page.tsx`：

```tsx
"use client";

import { App, Card } from "antd";
import { useRouter } from "next/navigation";

import { ArticleForm } from "@/app/admin/articles/_components/article-form";
import { createArticle } from "@/features/articles/api";
import type { ArticleInput } from "@/features/articles/types";

export default function NewArticlePage() {
  const router = useRouter();
  const { message } = App.useApp();

  async function handleSubmit(values: ArticleInput) {
    await createArticle(values);
    message.success("文章已创建");
    router.push("/admin/articles");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
        新建文章
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        填写文章内容并保存到 Mini CMS。
      </p>

      <Card className="mt-6 border-slate-200 shadow-sm">
        <ArticleForm submitText="创建文章" onSubmit={handleSubmit} />
      </Card>
    </div>
  );
}
```

当前跟练选择用独立页面完成新建，但不把它固定成侧边栏菜单项。以后如果产品决定在文章列表中使用弹窗或抽屉，可以调整页面组织，不影响第 9.3 节讲清的布局与路由关系。

回到 `app/admin/articles/page.tsx`，把第 9.4 节的“主要操作”按钮替换为：

```tsx
<Button type="primary" href="/admin/articles/new">
  新建文章
</Button>
```

先实际创建一篇文章，并确认：

```text
点击创建文章
-> Ant Design Form 完成第一轮校验
-> fetch POST /api/articles
-> Express 用 Zod 再校验一次
-> Prisma 写入 PostgreSQL
-> Express 返回 201 和文章 JSON
-> 页面提示成功并回到列表
```

如果保存失败，表单不会跳走，用户已经输入的内容仍然保留。

---

## 12. 完成编辑页面

编辑页要读取文章正文和摘要。先把 `features/articles/types.ts` 中的 `Article` 补充完整：

```ts
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
```

再在 `features/articles/api.ts` 中增加详情和编辑请求：

```ts
export function getArticle(id: number) {
  return apiRequest<Article>(`/api/articles/${id}`);
}

export function updateArticle(id: number, input: ArticleInput) {
  return apiRequest<Article>(`/api/articles/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}
```

新建 `app/admin/articles/[id]/edit/page.tsx`：

```tsx
"use client";

import { Alert, App, Button, Card, Spin } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ArticleForm } from "@/app/admin/articles/_components/article-form";
import { getArticle, updateArticle } from "@/features/articles/api";
import type {
  Article,
  ArticleInput,
} from "@/features/articles/types";

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { message } = App.useApp();
  const id = Number(params.id);

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      setLoadError(null);

      try {
        setArticle(await getArticle(id));
      } catch (requestError) {
        setLoadError(
          requestError instanceof Error
            ? requestError.message
            : "文章加载失败",
        );
      } finally {
        setLoading(false);
      }
    }

    if (Number.isInteger(id) && id > 0) {
      void loadArticle();
    } else {
      setLoadError("文章 ID 不正确");
      setLoading(false);
    }
  }, [id]);

  async function handleSubmit(values: ArticleInput) {
    await updateArticle(id, values);
    message.success("文章已保存");
    router.push("/admin/articles");
  }

  if (loading) {
    return <Spin tip="正在加载文章" />;
  }

  if (loadError || !article) {
    return (
      <Alert
        type="error"
        showIcon
        message="文章加载失败"
        description={loadError ?? "文章不存在"}
        action={<Button href="/admin/articles">返回列表</Button>}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
        编辑文章
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        修改文章内容、地址和发布状态。
      </p>

      <Card className="mt-6 border-slate-200 shadow-sm">
        <ArticleForm
          submitText="保存修改"
          initialValues={{
            title: article.title,
            slug: article.slug,
            summary: article.summary ?? "",
            content: article.content,
            status: article.status,
          }}
          onSubmit={handleSubmit}
        />
      </Card>
    </div>
  );
}
```

编辑页比新建页多一步：先根据 URL 中的 `id` 请求文章详情，再把数据交给同一个 `ArticleForm`。表单结构和校验不需要复制第二份。

---

## 13. 最后增加删除功能

读取、新建和编辑已经完成，现在再给文章列表增加删除操作。

先在 `features/articles/api.ts` 中增加：

```ts
export function deleteArticle(id: number) {
  return apiRequest<Article>(`/api/articles/${id}`, {
    method: "DELETE",
  });
}
```

回到 `app/admin/articles/page.tsx`，把 Ant Design 导入改成：

```tsx
import {
  App,
  Button,
  Card,
  Popconfirm,
  Space,
  Table,
  type TableColumnsType,
} from "antd";
```

文章 API 导入改成：

```tsx
import { deleteArticle, getArticles } from "@/features/articles/api";
```

在原有状态下面增加：

```tsx
const { message: messageApi } = App.useApp();
const [deletingId, setDeletingId] = useState<number | null>(null);
```

`messageApi` 用来显示删除结果，`deletingId` 记录当前正在删除哪一篇文章。接着在 `columns` 前面增加删除函数：

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

DELETE 请求成功后，`filter()` 从当前 `articles` 中排除这篇文章，`setArticles()` 触发表格重新渲染。最后把原来的 `columns` 替换为：

```tsx
const columns: TableColumnsType<Article> = [
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
      <Space>
        <Button
          type="link"
          href={`/admin/articles/${article.id}/edit`}
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
];
```

`render` 不再读取某个 `dataIndex`，而是拿到当前行的 `article`，再使用 `article.id` 生成编辑地址和删除请求。`Popconfirm` 先要求用户确认，确认后才调用 `handleDelete()`。

---

## 14. 按四条链路完成联调

同时启动两个项目：

```bash
# 终端 1：mini-cms/server
npm run dev

# 终端 2：mini-cms/admin-web-antd
npm run dev
```

依次检查：

### 14.1 列表

```text
打开 /admin/articles
-> 页面显示 loading
-> GET /api/articles 返回 200
-> 有数据时显示表格，无数据时显示空状态
```

### 14.2 新建

```text
打开 /admin/articles/new
-> 提交合法文章
-> POST /api/articles 返回 201
-> 回到列表并看到新文章
```

再提交一次相同 slug，确认 Express 返回 409，页面能显示后端给出的错误信息。

### 14.3 编辑

```text
进入 /admin/articles/[id]/edit
-> GET /api/articles/:id 返回详情
-> 修改后 PATCH /api/articles/:id 返回 200
-> 列表显示修改结果
```

### 14.4 删除

```text
点击删除
-> 先出现确认提示
-> DELETE /api/articles/:id 返回 200
-> 从 articles 状态中移除这篇文章
-> 被删除文章消失
```

当前 Mini CMS 的删除接口返回 `200` 和被删除文章的 JSON，与 `apiRequest()` 读取 JSON 的写法一致。

---

## 15. 本章验收

目录至少包含：

```text
admin-web-antd/
├── app/
│   ├── admin/
│   │   ├── articles/
│   │   │   ├── _components/article-form.tsx
│   │   │   ├── [id]/edit/page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── page.tsx
│   │   ├── page-one/page.tsx
│   │   ├── page-two/page.tsx
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── antd-provider.tsx
├── features/articles/
│   ├── api.ts
│   └── types.ts
├── lib/
│   └── api-client.ts
└── postcss.config.mjs
```

完成后运行：

```bash
npm run lint
npm run build
```

并确认自己能回答：

- `admin-web-antd` 和 `server` 为什么是两个项目？
- `.env.local` 里的地址指向谁，为什么不是 `http://localhost:3000`？
- `await fetch(...)` 和 `await response.json()` 分别得到什么？
- 为什么 404 和 500 也要自己检查 `response.ok`？
- 为什么第一次请求直接写在页面里，后面又拆成 `lib` 和 `features`？
- `ConfigProvider` 和 Tailwind CSS 分别负责哪一层样式？
- `colorPrimary` 为什么能同时影响主按钮和菜单选中状态？
- 全局 `theme.token` 和 `components.Layout` 的作用范围有什么不同？
- 为什么要等独立文章列表完成并验证后，再把公共部分移进 `admin/layout.tsx`？
- 点击侧边栏后，是谁改变 URL，又是谁把新页面放进 `Content`？
- 为什么切换“页面一”和“页面二”时，`Header` 与 `Sider` 不需要重新写？
- 为什么前端表单已经校验，Express 仍然要保留 Zod？
- 新建一篇文章时，数据经过了哪些文件和进程？
- `columns`、`dataIndex`、`dataSource` 和 `rowKey` 分别怎样帮助 `Table` 展示数据？
- 删除成功后，为什么要使用 `setArticles()` 更新列表？

全部能运行、能操作、能解释，再回到[第 10 章项目总览](./10-MiniCMS项目总览.md)完成阶段 4 验收。

---

## 16. 下一步继续完善同一个系统

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
- [Ant Design：在 Next.js App Router 中使用](https://ant.design/docs/react/use-with-next/)
- [MDN：使用 Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)
