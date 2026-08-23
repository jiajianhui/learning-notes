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

类型不是凭空定义的，要和后端返回的数据结构对应。`GET /api/articles` 的响应体解析后大致是：

```ts
{
  data: [
    { id: 1, title: "文章 A" },
    { id: 2, title: "文章 B" },
  ],
}
```

其中，`data` 是文章数组，数组中的每一项是一篇文章。

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

类型不会改变后端数据，也不会在运行时检查接口。它主要帮助编辑器补全字段，并在写错字段名或赋错值时提前报错。去掉类型，请求仍然能运行；但在 TypeScript 项目中，保留类型更不容易写错。这里只定义当前页面会读取的字段，后面用到其他字段时再补充。

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

`catch (error)` 中的 `error` 不是提前定义的变量。只要 `try` 中抛出错误，JavaScript 就会自动把这个错误交给它。这里主要会接住两类错误：

```text
后端返回 404 / 500
-> fetch() 仍然拿到 Response
-> 代码发现 response.ok 为 false，主动 throw
-> catch 接住这个 Error

Express 未启动、网络中断或请求被跨域策略拦截
-> fetch() 自己抛出错误
-> catch 接住这个 Error
```

两类错误最后都会进入同一个 `catch`。`error instanceof Error` 用来确认它是标准错误对象，确认后才能读取 `error.message`。

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

因此可以把通用流程提取成 `apiRequest()`，由调用它的代码提供这三项信息。

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

`options` 会原样传给 `fetch()` 的第二个参数。TypeScript 已经为这个参数提供了 `RequestInit` 类型，不需要安装或导入；`options?: RequestInit` 中的 `?` 表示整个参数可以省略。

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
-> 请求失败时，读取后端的 error.message 并抛出错误
-> 请求成功时，读取并返回后端的 data
```

后端成功时返回 `{ data: ... }`，所以用 `ApiSuccess<T>` 表示 `{ data: T }`。失败响应中虽然同时有 `code` 和 `message`，但当前函数只读取 `message`，所以 `ApiFailure` 只定义用到的字段。

#### 按照这个流程写代码

在 `admin-web-antd` 项目根目录新建 `lib/api-client.ts`。`lib` 不是 Next.js 的固定目录，这里用它存放不属于某个具体页面的通用请求代码：

```ts
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

类型不必列出后端对象的所有字段。没有写进 `ApiFailure` 的 `code`、`details` 仍然存在于真实对象中，不影响赋值和运行；只是 TypeScript 不允许当前代码直接读取它们，需要使用时再补进类型。`ApiFailure` 也不会验证真实响应。下一节会把第一次正式调用放进文章功能目录。

### 7.4 最后按文章功能整理文件

通用请求函数已经准备好，文章字段和文章接口也需要有明确位置。这里使用 `features/articles` 把文章相关代码放在一起；`features` 同样只是普通目录，不是 Next.js 规定的结构。

新建 `features/articles/types.ts`：

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

`ArticleStatus` 把状态限制为草稿或已发布。`Article` 从临时页面移到了文章功能目录，并补上正式列表需要的字段；编辑页需要的正文等字段，等写到编辑功能时再增加。

再新建 `features/articles/api.ts`：

```ts
import { apiRequest } from "@/lib/api-client";

import type { Article } from "./types";

export function getArticles() {
  return apiRequest<Article[]>("/api/articles");
}
```

整理后的调用顺序是：

```text
页面调用 getArticles()
-> getArticles() 写明文章接口路径
-> apiRequest() 完成通用请求流程
-> Express 返回文章数据
```

第 9 节会把 `getArticles()` 用于正式文章列表，其他文章请求等用到时再增加。当前临时首页已经完成验证，下一步直接替换成后台入口。

---

## 8. 建立后台页面骨架

第 6～7 节的首页只用于跑通和完善第一条请求。现在开始搭建正式后台，把首页改成跳转到文章列表。修改 `app/page.tsx`：

```tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/admin/articles");
}
```

文章列表、新建和编辑页面都会使用同一套侧边栏和顶部区域，所以把这部分放进 `app/admin/layout.tsx`：

```tsx
"use client";

import { FileTextOutlined } from "@ant-design/icons";
import { Layout, Menu, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const { Content, Header, Sider } = Layout;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={220}>
        <Typography.Title
          level={4}
          style={{ color: "white", margin: 24 }}
        >
          Mini CMS
        </Typography.Title>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[
            pathname.startsWith("/admin/articles") ? "/admin/articles" : "",
          ]}
          items={[
            {
              key: "/admin/articles",
              icon: <FileTextOutlined />,
              label: "文章管理",
            },
          ]}
          onClick={({ key }) => router.push(key)}
        />
      </Sider>

      <Layout>
        <Header style={{ background: "white", paddingInline: 24 }}>
          <Typography.Text strong>Ant Design 管理后台</Typography.Text>
        </Header>
        <Content style={{ margin: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
```

这个布局使用 `usePathname()`、`useRouter()` 和菜单点击事件，因此文件顶部需要 `"use client"`。

当前菜单只有文章管理。第 15 章真正完成标签 API 后，再增加“标签管理”入口，避免先放一个点进去就 404 的菜单。

---

## 9. 完成文章列表和删除

删除成功后要调用 `message.success()`。Ant Design 的 `App.useApp()` 只有放在 `<App>` 里面才能使用，所以现在再增加全局 Provider。

新建 `components/antd-provider.tsx`：

```tsx
"use client";

import { App } from "antd";
import type { ReactNode } from "react";

export function AntdProvider({ children }: { children: ReactNode }) {
  return <App>{children}</App>;
}
```

在 `app/layout.tsx` 中导入它，并把原来的 `{children}` 包起来：

```tsx
import { AntdProvider } from "@/components/antd-provider";

<AntdRegistry>
  <AntdProvider>{children}</AntdProvider>
</AntdRegistry>
```

Next.js 没有规定所有组件都必须放进 `_components`。本章把覆盖整个应用的 Provider 放在 `components`；第 10 节的文章表单只服务文章路由，所以放在 `app/admin/articles/_components`。下划线表示这个目录不参与路由。

列表还需要删除文章。回到 `features/articles/api.ts`，增加：

```ts
export function deleteArticle(id: number) {
  return apiRequest<Article>(`/api/articles/${id}`, {
    method: "DELETE",
  });
}
```

新建 `app/admin/articles/page.tsx`：

```tsx
"use client";

import {
  Alert,
  App,
  Button,
  Card,
  Flex,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  type TableColumnsType,
} from "antd";
import { useCallback, useEffect, useState } from "react";

import { deleteArticle, getArticles } from "@/features/articles/api";
import type {
  Article,
  ArticleStatus,
} from "@/features/articles/types";

export default function ArticleListPage() {
  const { message } = App.useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setArticles(await getArticles());
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "文章列表加载失败",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  async function handleDelete(id: number) {
    setDeletingId(id);
    setError(null);

    try {
      await deleteArticle(id);
      message.success("文章已删除");
      await loadArticles();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "删除失败",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const columns: TableColumnsType<Article> = [
    {
      title: "标题",
      dataIndex: "title",
    },
    {
      title: "Slug",
      dataIndex: "slug",
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (status: ArticleStatus) => (
        <Tag color={status === "published" ? "green" : "default"}>
          {status === "published" ? "已发布" : "草稿"}
        </Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      render: (value: string) => new Date(value).toLocaleString("zh-CN"),
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

  return (
    <Card>
      <Flex justify="space-between" align="center" gap={16} wrap>
        <div>
          <Typography.Title level={2}>文章管理</Typography.Title>
          <Typography.Text type="secondary">
            查看、新建、编辑和删除文章。
          </Typography.Text>
        </div>
        <Button type="primary" href="/admin/articles/new">
          新建文章
        </Button>
      </Flex>

      {error ? (
        <Alert
          type="error"
          showIcon
          message="文章列表加载失败"
          description={error}
          action={<Button onClick={() => void loadArticles()}>重试</Button>}
          style={{ marginBlock: 24 }}
        />
      ) : null}

      <Table<Article>
        rowKey="id"
        columns={columns}
        dataSource={articles}
        loading={loading}
        pagination={false}
        locale={{ emptyText: "还没有文章，先新建一篇" }}
        style={{ marginTop: 24 }}
      />
    </Card>
  );
}
```

这一个页面已经处理四种读取结果：

| 状态 | 页面表现 |
|---|---|
| loading | `Table` 显示加载状态 |
| empty | 没有数据时提示先新建文章 |
| error | 显示错误和重试按钮 |
| success | 显示文章表格 |

删除另外增加了确认、操作中状态和成功反馈。现在先打开 `/admin/articles`，确认列表和删除都能调用 Express，再继续写表单。

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
          style={{ marginBottom: 24 }}
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

import { App, Card, Typography } from "antd";
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
    <Card>
      <Typography.Title level={2}>新建文章</Typography.Title>
      <ArticleForm submitText="创建文章" onSubmit={handleSubmit} />
    </Card>
  );
}
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

import { Alert, App, Button, Card, Spin, Typography } from "antd";
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
    <Card>
      <Typography.Title level={2}>编辑文章</Typography.Title>
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
  );
}
```

编辑页比新建页多一步：先根据 URL 中的 `id` 请求文章详情，再把数据交给同一个 `ArticleForm`。表单结构和校验不需要复制第二份。

---

## 13. 按四条链路完成联调

同时启动两个项目：

```bash
# 终端 1：mini-cms/server
npm run dev

# 终端 2：mini-cms/admin-web-antd
npm run dev
```

依次检查：

### 13.1 列表

```text
打开 /admin/articles
-> 页面显示 loading
-> GET /api/articles 返回 200
-> 有数据时显示表格，无数据时显示空状态
```

### 13.2 新建

```text
打开 /admin/articles/new
-> 提交合法文章
-> POST /api/articles 返回 201
-> 回到列表并看到新文章
```

再提交一次相同 slug，确认 Express 返回 409，页面能显示后端给出的错误信息。

### 13.3 编辑

```text
进入 /admin/articles/[id]/edit
-> GET /api/articles/:id 返回详情
-> 修改后 PATCH /api/articles/:id 返回 200
-> 列表显示修改结果
```

### 13.4 删除

```text
点击删除
-> 先出现确认提示
-> DELETE /api/articles/:id 返回 200
-> 重新请求列表
-> 被删除文章消失
```

当前 Mini CMS 的删除接口返回 `200` 和被删除文章的 JSON，与 `apiRequest()` 读取 JSON 的写法一致。

---

## 14. 本章验收

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
│   │   └── layout.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── antd-provider.tsx
├── features/articles/
│   ├── api.ts
│   └── types.ts
└── lib/
    └── api-client.ts
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
- 为什么前端表单已经校验，Express 仍然要保留 Zod？
- 新建一篇文章时，数据经过了哪些文件和进程？
- loading、empty、error 和 success 分别怎样显示？

全部能运行、能操作、能解释，再回到[第 10 章项目总览](./10-MiniCMS项目总览.md)完成阶段 4 验收。

---

## 15. 下一步继续完善同一个系统

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
- [Next.js：环境变量](https://nextjs.org/docs/app/guides/environment-variables)
- [Ant Design：在 Next.js App Router 中使用](https://ant.design/docs/react/use-with-next/)
- [MDN：使用 Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)
