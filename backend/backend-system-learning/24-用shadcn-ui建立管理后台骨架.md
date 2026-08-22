# 24. 用 shadcn/ui 和 Axios 建立管理后台骨架

## 这一章要完成什么

第 23 章已经分清 shadcn/ui 与传统组件库的区别。本章开始创建：

```text
mini-cms/admin-web-shadcn/
```

先只完成四件事：

```text
Next.js 项目运行在 3002
-> shadcn/ui 组件可以使用
-> Axios 可以调用 Express 并携带 Cookie
-> 受保护页面显示统一后台骨架
```

文章表格和文章表单还不在本章实现。开始前，Ant Design 后台项目和阶段 6 的登录闭环应该已经可用。先后顺序只服务于学习节奏，两个前端项目的完成要求相同。

---

## 1. 创建第三个项目

终端进入 `mini-cms` 根目录，不要进入 `server` 或 `admin-web-antd`：

```bash
cd mini-cms

npx create-next-app@latest admin-web-shadcn \
  --ts \
  --tailwind \
  --eslint \
  --app \
  --import-alias "@/*" \
  --use-npm \
  --disable-git
```

如果命令询问是否把代码放进 `src/`，选择 `No`。本项目使用根目录的 `app/`。

`--disable-git` 避免子项目再次初始化 Git。三个子项目共用 `mini-cms/.git`。

进入新项目，把开发端口改成 3002：

`admin-web-shadcn/package.json`：

```json
{
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "next build",
    "start": "next start -p 3002",
    "lint": "eslint"
  }
}
```

启动并检查：

```bash
cd admin-web-shadcn
npm run dev
```

此时三个服务的职责是：

| 地址 | 项目 | 负责什么 |
|---|---|---|
| `http://localhost:3000` | `admin-web-antd` | Ant Design 后台项目 |
| `http://localhost:3001` | `server` | Express API |
| `http://localhost:3002` | `admin-web-shadcn` | shadcn/ui 后台项目 |

---

## 2. 初始化 shadcn/ui

在 `admin-web-shadcn` 中执行：

```bash
npx shadcn@latest init
```

shadcn/ui 项目使用 Base UI 作为底层方案，其余选项保持项目生成的默认值。初始化完成后，先检查：

```text
admin-web-shadcn/
├── components.json
├── app/
│   └── globals.css
└── lib/
    └── utils.ts
```

然后加入本章需要的组件：

```bash
npx shadcn@latest add \
  alert \
  breadcrumb \
  button \
  card \
  field \
  input \
  separator \
  sidebar \
  spinner \
  toast
```

执行命令后，组件源码会进入 `components/ui/`。不要把这些文件当作不能阅读的生成产物；它们就是当前项目的 UI 基础代码。

再安装本项目使用的请求客户端：

```bash
npm install axios
```

Axios 只负责 HTTP 请求，不是 shadcn/ui 的依赖。这里使用它，是为了在完成 Ant Design 的 `fetch` 练习后，再用同一套 API 学习常见的请求客户端。

---

## 3. 配置 API 地址

新建 `admin-web-shadcn/.env.local`：

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

Next.js 规定，浏览器端代码读取的环境变量必须以 `NEXT_PUBLIC_` 开头。这里用它保存 Express API 地址。

同时在 `.env.example` 中留下变量名：

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

真实 `.env.local` 保持在 `.gitignore` 中。

如果 `.gitignore` 使用 `.env*`，增加 `!.env.example`，只让示例文件进入 Git：

```gitignore
.env*
!.env.example
```

---

## 4. 用 Axios 建立统一请求函数

新建 `lib/api.ts`：

```ts
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
} from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_URL) {
  throw new Error("缺少 NEXT_PUBLIC_API_BASE_URL");
}

type ApiErrorDetail = {
  field?: string;
  message: string;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: ApiErrorDetail[] | null;
  };
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
};

export type ApiSuccessBody<T> = {
  data: T;
  pagination?: PaginationMeta;
};

export class ApiError extends Error {
  status?: number;
  code: string;
  details?: ApiErrorDetail[];

  constructor(
    status: number | undefined,
    code: string,
    message: string,
    details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const body = error.response?.data;

    return Promise.reject(
      new ApiError(
        error.response?.status,
        body?.error?.code ?? "REQUEST_FAILED",
        body?.error?.message ??
          (error.response ? "请求失败" : "无法连接服务器"),
        body?.error?.details ?? undefined,
      ),
    );
  },
);

export async function apiRequestResult<T>(
  path: string,
  config: AxiosRequestConfig = {},
): Promise<ApiSuccessBody<T>> {
  const response = await apiClient.request<ApiSuccessBody<T>>({
    ...config,
    url: path,
  });

  return response.data;
}

export async function apiRequest<T>(
  path: string,
  config: AxiosRequestConfig = {},
): Promise<T> {
  const body = await apiRequestResult<T>(path, config);

  if (!body || !("data" in body)) {
    throw new Error("API 成功响应缺少 data");
  }

  return body.data;
}

export async function apiRequestNoContent(
  path: string,
  config: AxiosRequestConfig = {},
) {
  await apiClient.request({
    ...config,
    url: path,
  });
}

export function isRequestCanceled(error: unknown) {
  return axios.isCancel(error);
}
```

这部分和 Ant Design 项目中的 `fetch` 请求函数解决同一个问题，但写法不同：

| Ant Design 中的 `fetch` | shadcn/ui 中的 Axios |
|---|---|
| 手动拼接 API 地址 | `baseURL` 统一保存 API 地址 |
| `credentials: "include"` | `withCredentials: true` |
| `JSON.stringify(input)` 放入 `body` | 直接把对象放入 `data` |
| 检查 `response.ok` | 非 2xx 响应自动进入错误处理 |
| `response.json()` 解析 JSON | 从 `response.data` 读取已解析的数据 |

`apiClient` 保存所有请求共用的地址和 Cookie 配置。响应拦截器把后端错误统一转换成 `ApiError`，页面仍然使用 `status`、`code` 和 `message` 判断结果。

三个请求函数分别服务不同响应：

- `apiRequest()` 返回普通成功响应中的 `data`。
- `apiRequestResult()` 同时保留列表需要的 `data` 和 `pagination`。
- `apiRequestNoContent()` 用于退出登录这类 204 响应。

第 25 章会使用 `isRequestCanceled()` 忽略已经取消的列表请求。页面不需要直接处理 `AxiosError`。

---

## 5. 让 Express 准确允许两个后台来源

阶段 6 只有一个后台时，`ADMIN_WEB_ORIGIN` 保存一个地址。现在改成：

`server/.env`：

```dotenv
ADMIN_WEB_ORIGINS=http://localhost:3000,http://localhost:3002
```

`server/.env.example` 只保留同样的开发示例，不写任何密钥。

在 `app.ts` 中把来源解析成集合：

```ts
const adminWebOrigins = process.env.ADMIN_WEB_ORIGINS;

if (!adminWebOrigins) {
  throw new Error("缺少 ADMIN_WEB_ORIGINS");
}

const allowedOrigins = new Set(
  adminWebOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
```

CORS 配置改为：

```ts
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
}));
```

写请求的 Origin 检查也使用同一个集合：

```ts
app.use((request, _response, next) => {
  const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

  if (!safeMethods.has(request.method)) {
    const origin = request.get("origin");

    if (!origin || !allowedOrigins.has(origin)) {
      throw new AppError(403, "INVALID_ORIGIN", "请求来源不受信任");
    }
  }

  next();
});
```

不要把 `origin` 改成 `*`。携带 Cookie 时需要准确返回受信任来源，CORS 也不能代替认证和写请求 Origin 检查。

以后用 Apifox 检查写请求时，仍然要手动传入允许列表中的 Origin。

---

## 6. 封装登录请求

新建 `features/auth/api.ts`：

```ts
import {
  apiRequest,
  apiRequestNoContent,
} from "@/lib/api";

export type Admin = {
  id: number;
  username: string;
};

export function getCurrentAdmin() {
  return apiRequest<Admin>("/api/auth/me");
}

export function login(input: { username: string; password: string }) {
  return apiRequest<Admin>("/api/auth/login", {
    method: "POST",
    data: input,
  });
}

export function logout() {
  return apiRequestNoContent("/api/auth/logout", {
    method: "POST",
  });
}
```

这三个函数继续调用阶段 6 已有的 Express 接口，不增加 Next.js Route Handler，也不直接读取数据库。

---

## 7. 先用普通 React 状态完成登录页

React Hook Form 留到第 26 章。登录页字段很少，本章先用最小状态完成认证闭环。

`app/login/page.tsx` 的核心结构：

```tsx
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login } from "@/features/auth/api";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login({ username, password });
      router.replace("/admin/articles");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "网络异常，请稍后重试",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Mini CMS 登录</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">用户名</FieldLabel>
                <Input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">密码</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
                {error && <FieldError>{error}</FieldError>}
              </Field>

              <Button type="submit" disabled={submitting}>
                {submitting ? "登录中…" : "登录"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
```

用户名或密码错误时，Express 继续统一返回 `INVALID_CREDENTIALS`。页面显示错误，但不判断用户名是否存在。

---

## 8. 用 AuthGuard 保护后台页面

新建 `features/auth/auth-guard.tsx`：

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { getCurrentAdmin } from "./api";
import { ApiError } from "@/lib/api";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    getCurrentAdmin()
      .then(() => setStatus("ready"))
      .catch((error) => {
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/login");
          return;
        }

        setStatus("error");
      });
  }, [router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
        <span className="ml-2">正在检查登录状态</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>无法验证登录状态</AlertTitle>
          <AlertDescription>请检查 Express 是否运行，再刷新页面。</AlertDescription>
        </Alert>
      </div>
    );
  }

  return children;
}
```

AuthGuard 解决的是页面进入时的状态：

```text
调用 /api/auth/me
├── 200 -> 显示后台
├── 401 -> 跳转登录
└── 网络或服务错误 -> 显示错误
```

它不能代替 Express 的 `requireAuth`。真正的数据接口仍由后端保护。

---

## 9. 建立统一后台骨架

建议使用路由组：

```text
app/
├── login/
│   └── page.tsx
└── (admin)/
    ├── layout.tsx
    └── admin/
        ├── articles/
        │   └── page.tsx
        └── tags/
            └── page.tsx
```

`(admin)/layout.tsx` 不会进入 URL，只负责复用后台布局：

```tsx
import { AuthGuard } from "@/features/auth/auth-guard";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 items-center gap-3 border-b px-4">
            <SidebarTrigger />
            <span className="font-medium">Mini CMS</span>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
```

`AppSidebar` 第一轮只保留：

- 文章管理，链接到 `/admin/articles`。
- 标签管理，链接到 `/admin/tags`。
- 退出按钮，调用 `logout()` 后跳转 `/login`。

不需要先做多级菜单、工作区切换和复杂 Dashboard。

---

## 10. 在根布局注册 Toast

第 25 章删除文章、第 26 章保存文章都会用 Toast。把它放在根布局一次：

`app/layout.tsx`：

```tsx
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

页面以后通过下面的方式触发提示：

```ts
import { toast } from "@/components/ui/toast";

toast.add({
  type: "success",
  title: "保存成功",
});
```

---

## 11. 本章检查点

按顺序检查：

1. `server`、`admin-web-antd` 和 `admin-web-shadcn` 能同时启动。
2. 访问 3002 的登录页可以成功登录。
3. Axios 请求中包含 Cookie，刷新后 `/api/auth/me` 仍返回管理员。
4. 未登录访问 `/admin/articles` 会跳转到 `/login`。
5. Express 停止时，页面显示“无法验证登录状态”，不是无限 loading。
6. 3000 的 Ant Design 后台仍然可以正常登录和请求。
7. 来自其他 Origin 的写请求仍然被后端拒绝。
8. 在 `admin-web-shadcn` 中执行：

```bash
npm run lint
npx tsc --noEmit
npm run build
```

三个命令都通过后，本章完成。

---

## 本章不做什么

- 不实现文章 Table。
- 不引入 TanStack Table。
- 不引入 TanStack Query。
- 不引入 React Hook Form。
- 不改变 Express 登录方案。
- 不让两套后台共享 UI 组件；它们只共享 API contract。

下一章会读取真实文章列表，用 shadcn Table 和 TanStack Table 完成列、行操作、删除确认和服务端分页。

## 官方参考

- [shadcn/ui Next.js 安装](https://ui.shadcn.com/docs/installation/next)
- [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/base/sidebar)
- [shadcn/ui Toast](https://ui.shadcn.com/docs/components/base/toast)
- [Axios：创建实例](https://axios-http.com/docs/instance)
- [Axios：响应拦截器](https://axios-http.com/docs/interceptors)
- [Axios：错误处理](https://axios-http.com/docs/handling_errors)
- [Express cors middleware](https://expressjs.com/en/resources/middleware/cors.html)
