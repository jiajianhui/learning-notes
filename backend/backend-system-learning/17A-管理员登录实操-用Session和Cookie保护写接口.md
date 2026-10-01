# 17A. 登录实操：用数据库 Session 和 HttpOnly Cookie 保护写接口

沿着[第 17 章的流程图](./17-登录Cookie和基本安全.md)，先在 Apifox 中跑通登录、身份验证和退出，再接入浏览器页面。每个阶段完成后立即验证，再继续下一步。

所有实现都放在真实 `mini-cms` 中。下文后端路径相对 `mini-cms/server`，前端路径相对 `mini-cms/admin-web-antd`。开始前确认文章、标签接口和第 16C 章的 ProComponents 后台能正常使用；登录继续接到现有请求封装与布局中。

本章只做一个管理员，由脚本创建账号；公开注册、多角色和第三方登录留在本次范围之外。

## 1. 准备管理员：让数据库里有可验证的账号

这一步准备图中登录接口要查询的 `admins`，以及登录成功后要写入的 `sessions`。

### 1.1 安装依赖

在 `server` 中执行：

```bash
npm install argon2 cookie-parser
npm install -D @types/cookie-parser
```

`argon2` 负责密码哈希，`cookie-parser` 把请求 Cookie 解析到 `request.cookies`。随机 Token 和 SHA-256 使用 Node.js 自带的 `node:crypto`。

### 1.2 建表并检查迁移

在 `prisma/schema.prisma` 中增加：

```prisma
model Admin {
  id           Int       @id @default(autoincrement())
  username     String    @unique
  passwordHash String    @map("password_hash")
  sessions     Session[]
  createdAt    DateTime  @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt    DateTime  @updatedAt @map("updated_at") @db.Timestamptz(3)

  @@map("admins")
}

model Session {
  tokenHash String   @id @map("token_hash")
  adminId   Int      @map("admin_id")
  expiresAt DateTime @map("expires_at") @db.Timestamptz(3)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  admin     Admin    @relation(fields: [adminId], references: [id], onDelete: Cascade)

  @@index([adminId])
  @@index([expiresAt])
  @@map("sessions")
}
```

`Admin` 保存账号，`Session` 保存登录记录；`adminId` 把两者关联起来。一个管理员可以有多个 Session，`onDelete: Cascade` 表示删除管理员时一起删除对应 Session。

执行：

```bash
npx prisma migrate dev --name add_admin_sessions
npx prisma generate
npx tsc --noEmit
```

查看迁移 SQL，确认创建了两张表、用户名唯一约束、Session 到 Admin 的外键，以及 `token_hash` 主键和声明的索引。

### 1.3 创建初始管理员

在后端 `.env` 临时设置你自己选择的用户名和至少 12 位密码。下面是占位示例，执行脚本前要替换：

```dotenv
ADMIN_USERNAME=admin
ADMIN_PASSWORD=请换成只在本地使用的长密码
```

新建 `scripts/create-admin.ts`：

```ts
import "dotenv/config";
import argon2 from "argon2";
import { prisma } from "../src/db/client";

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

if (!username || !password || password.length < 12) {
  throw new Error("请提供 ADMIN_USERNAME 和至少 12 位的 ADMIN_PASSWORD");
}

try {
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  await prisma.admin.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  console.log(`管理员 ${username} 已创建或更新`);
} finally {
  await prisma.$disconnect();
}
```

密码通常不够随机，这里使用专门的慢速密码哈希算法 Argon2id。`upsert()` 按用户名查找：账号不存在就创建，已存在就更新密码哈希。

在 `package.json` 已有的 `scripts` 中增加：

```json
{
  "scripts": {
    "admin:create": "tsx scripts/create-admin.ts"
  }
}
```

执行 `npm run admin:create`，然后用 TablePro 查看 `admins`：应能看到用户名和 `password_hash`，看不到原始密码。此时还没有登录，也就没有新 Session。

创建成功后自己保管密码，并从 `.env` 删除 `ADMIN_PASSWORD`。以后需要重设密码时，用同一用户名和新密码重新运行脚本。真实 `.env` 不提交，`.env.example` 只保留变量名和说明；密码也不写进 migration 或共享的 seed 文件。

## 2. 跑通登录：创建 Session，让客户端拿到 Cookie

对应图中 **① 登录**。这一阶段完成 `POST /api/auth/login`，直到 Apifox 能看到响应，TablePro 能看到登录记录。

### 2.1 准备 Token 和 Cookie 配置

新建 `src/modules/auth/session.ts`：

```ts
import { createHash, randomBytes } from "node:crypto";

const sessionMaxAgeMs = 7 * 24 * 60 * 60 * 1000;

export const sessionCookieName = "mini_cms_session";

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: sessionMaxAgeMs,
};

export const createSessionToken = () => {
  return randomBytes(32).toString("base64url");
};

export const hashSessionToken = (token: string) => {
  return createHash("sha256").update(token).digest("hex");
};

export const createSessionExpiresAt = () => {
  return new Date(Date.now() + sessionMaxAgeMs);
};
```

这里的函数和配置直接对应图中的数据变化：

| 代码 | 作用 |
|---|---|
| `createSessionToken()` | 生成 32 字节随机数据，转成可放入 Cookie 的字符串 |
| `hashSessionToken(token)` | 计算 Token 的 SHA-256 哈希；登录存记录和后续查询用同一种方法 |
| `createSessionExpiresAt()` | 计算本次登录 7 天后的过期时间 |
| `sessionCookieOptions` | 设置 Cookie 的使用规则和保存时长 |

随机 Token 已有足够高的随机性，因此使用 SHA-256；密码继续使用上一节的 Argon2id。数据库保存 `hashSessionToken(token)` 的结果，Cookie 保存原始 `token`。

`maxAge` 是 Cookie 的保存时长，`expiresAt` 是服务器检查的过期时间。本章都设为登录后的 7 天，访问接口时不自动续期；即使客户端继续发送旧 Cookie，后端仍会检查过期时间。`path: "/"` 覆盖本站接口路径，本地 HTTP 下 `secure` 为 false，生产 HTTPS 环境为 true。

### 2.2 验证密码并返回登录结果

新建 `src/modules/auth/auth.schema.ts`：

```ts
import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(50),
  password: z.string().min(1).max(200),
});
```

再新建 `src/modules/auth/auth.routes.ts`：

```ts
import { Router } from "express";
import argon2 from "argon2";
import { prisma } from "../../db/client";
import { AppError } from "../../errors/app-error";
import { loginSchema } from "./auth.schema";
import {
  createSessionExpiresAt,
  createSessionToken,
  hashSessionToken,
  sessionCookieName,
  sessionCookieOptions,
} from "./session";

export const authRouter = Router();

authRouter.post("/login", async (request, response) => {
  const { username, password } = loginSchema.parse(request.body);
  const admin = await prisma.admin.findUnique({ where: { username } });

  if (!admin || !(await argon2.verify(admin.passwordHash, password))) {
    throw new AppError(401, "INVALID_CREDENTIALS", "用户名或密码错误");
  }

  const token = createSessionToken();

  await prisma.session.create({
    data: {
      tokenHash: hashSessionToken(token),
      adminId: admin.id,
      expiresAt: createSessionExpiresAt(),
    },
  });

  response.cookie(sessionCookieName, token, sessionCookieOptions);
  response.status(200).json({
    data: {
      id: admin.id,
      username: admin.username,
    },
  });
});
```

`argon2.verify()` 验证输入的密码，`prisma.session.create()` 写入图中的登录记录。最后两行响应调用分工不同：`response.cookie()` 设置 `Set-Cookie` 响应头，`response.json()` 返回管理员信息，JSON 中不包含 Token。

用户名不存在和密码错误都返回 401 `INVALID_CREDENTIALS`。本章先完成认证主链路，更完整的登录系统还需要登录频率限制等措施。

### 2.3 把登录路由接到 app

在后端 `.env` 中增加后台来源，并在 `.env.example` 中保留对应示例：

```dotenv
ADMIN_WEB_ORIGIN=http://localhost:3000
```

在 `src/app.ts` 顶部补齐下面的导入，已有导入合并使用：

```ts
import cookieParser from "cookie-parser";
import cors from "cors";
import { AppError } from "./errors/app-error";
import { authRouter } from "./modules/auth/auth.routes";
```

保留 `express` 导入和 `app` 的创建。把原来的 CORS、`express.json()` 配置替换为下面这一段，位置在文章、标签等业务路由之前：

```ts
const adminWebOrigin = process.env.ADMIN_WEB_ORIGIN;

if (!adminWebOrigin) {
  throw new Error("缺少 ADMIN_WEB_ORIGIN");
}

app.use(cors({
  origin: adminWebOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use((request, _response, next) => {
  const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

  if (!safeMethods.has(request.method)) {
    const origin = request.get("origin");

    if (origin !== adminWebOrigin) {
      throw new AppError(403, "INVALID_ORIGIN", "请求来源不受信任");
    }
  }

  next();
});

app.get("/api/health", (_request, response) => {
  response.json({ server: "server is running" });
});

app.use("/api/auth", authRouter);
```

第 12 章原来的 `articleRouter` 中有一个 `/health` handler，现在删除它，使用上面的公开 `/api/health`。原有文章、标签路由继续放在这段代码之后，第 3 节再接入认证；404 处理和错误中间件仍在所有路由之后，错误中间件放最后。

理解这几个注册位置即可：

- `express.json()` 先解析登录请求的 JSON，handler 才能读取 `request.body`。
- `cookieParser()` 先解析 Cookie，后面的认证中间件才能读取 `request.cookies`；它本身不判断是否登录。
- 写请求先检查 `Origin`，与配置的后台来源一致才继续；CORS 负责浏览器的跨来源响应访问。
- `app.use("/api/auth", authRouter)` 把 Router 内的 `/login` 接成 `/api/auth/login`。

### 2.4 验证登录，观察两边保存的数据

在 `server` 中执行 `npx tsc --noEmit`，再运行 `npm run dev`。先请求 `GET http://localhost:3001/api/health`，应返回 200 和 `{ server: "server is running" }`。

在 Apifox 创建 `POST http://localhost:3001/api/auth/login` 请求：

```http
Content-Type: application/json
Origin: http://localhost:3000
```

JSON 请求体填入第 1.3 节创建的账号密码：

```json
{
  "username": "你的管理员名",
  "password": "创建管理员时的密码"
}
```

先用错误密码确认返回 401，再用正确密码登录，检查：

| 观察位置 | 成功时应该看到什么 |
|---|---|
| 响应 JSON | 200，`data` 中有管理员 ID、用户名 |
| 响应头与 Apifox Cookie 管理 | `mini_cms_session` 被设置并保存，包含 HttpOnly 和 SameSite=Lax |
| TablePro 的 `sessions` 表 | 新记录的 `admin_id` 指向管理员，`expires_at` 约为 7 天后；`token_hash` 与 Cookie 的原始 Token 不同 |

确认 Apifox 允许后续请求携带这条 Cookie。之后所有 `POST`、`PATCH`、`DELETE` 请求都继续设置准确的 `Origin`，否则会先返回 403，尚未进入认证。浏览器页面接入后，`Origin` 由浏览器设置。

## 3. 验证身份：让管理接口只接受有效凭证

对应图中 **② 后续请求**。先用 `/me` 验证同一份 Cookie 能找到管理员，再把这段检查接到文章、标签接口。

### 3.1 实现 requireAuth

新建 `src/middleware/require-auth.ts`：

```ts
import type { RequestHandler } from "express";
import { prisma } from "../db/client";
import { AppError } from "../errors/app-error";
import { hashSessionToken, sessionCookieName } from "../modules/auth/session";

export const requireAuth: RequestHandler = async (request, response, next) => {
  const token = request.cookies[sessionCookieName];

  if (typeof token !== "string") {
    throw new AppError(401, "UNAUTHORIZED", "请先登录");
  }

  const tokenHash = hashSessionToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      admin: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await prisma.session.deleteMany({ where: { tokenHash } });
    }

    throw new AppError(401, "UNAUTHORIZED", "登录已失效，请重新登录");
  }

  response.locals.admin = session.admin;
  next();
};
```

`findUnique()` 用收到的 Token 哈希查 Session，`include.admin.select` 沿关联取出管理员 ID 和用户名。没有 Token、没有记录或已过期，都返回 401；全部通过才执行 `next()`。

`response.locals.admin` 保存**当前这次请求**已经验证的管理员，后面的 handler 可以直接读取。它不会跨请求保留，也不会自动发送给前端。过期记录用 `deleteMany()` 清理，即使另一条请求已删除它，也能继续正常返回 401。

### 3.2 用 /me 读取已经验证的管理员

在 `auth.routes.ts` 顶部增加 `requireAuth` 导入，在已有登录路由后增加 `/me`：

```ts
import { requireAuth } from "../../middleware/require-auth";

authRouter.get("/me", requireAuth, (_request, response) => {
  const admin = response.locals.admin;

  response.status(200).json({
    data: {
      id: admin.id,
      username: admin.username,
    },
  });
});
```

`requireAuth` 先查出身份，后面的 handler 把 `response.locals.admin` 转成响应 JSON。现在用 Apifox 请求 `GET http://localhost:3001/api/auth/me`：

- 携带第 2 节保存的 Cookie，应返回 200 和管理员信息。
- 关闭该请求的 Cookie 携带，应返回 401；确认 Cookie 管理没有自动补上它。

完成这两个请求后，恢复 Cookie 携带，继续保护业务接口。

### 3.3 接到文章和标签路由

在 `src/app.ts` 顶部增加：

```ts
import { requireAuth } from "./middleware/require-auth";
```

把原有文章、标签路由注册替换为：

```ts
app.use("/api/articles", requireAuth, articleRouter);
app.use("/api/tags", requireAuth, tagRouter);
```

删除旧的未保护注册，避免它们提前接走请求。这样整个 router 的列表、详情、创建、修改和删除都会先验证身份，再进入已有的参数校验和业务处理。

`app.use("/api/auth", authRouter)` 保持原样，其中 `/me` 已单独接入认证，登录和稍后增加的退出接口允许匿名调用。健康检查仍公开，阶段 8 再增加读取已发布内容的公开接口。

立即用 Apifox 验证：

| 请求 | 不带 Cookie | 携带有效 Cookie |
|---|---|---|
| `GET /api/articles`、`GET /api/tags` | 401 | 200 和列表 |
| `POST /api/articles`，使用已有合法请求体和准确的 `Origin` | 401 | 201 和新文章 |

这一步成功，说明同一个认证中间件已经同时用于查询身份和保护业务接口。

## 4. 跑通退出：让当前凭证失效

对应图中 **③ 退出**。在 `auth.routes.ts` 已有路由后增加：

```ts
authRouter.post("/logout", async (request, response) => {
  const token = request.cookies[sessionCookieName];

  if (typeof token === "string") {
    await prisma.session.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  response.clearCookie(sessionCookieName, {
    httpOnly: sessionCookieOptions.httpOnly,
    sameSite: sessionCookieOptions.sameSite,
    secure: sessionCookieOptions.secure,
    path: sessionCookieOptions.path,
  });
  response.status(204).send();
});
```

`deleteMany()` 删除当前 Token 对应的记录，即使记录已不存在也允许继续。`response.clearCookie()` 设置让 Cookie 过期的响应头，`path` 等选项与创建 Cookie 时保持一致；204 响应不带 JSON。

退出接口不挂 `requireAuth`，这样过期或已被删除的凭证也能完成 Cookie 清理。写请求的 `Origin` 检查仍然执行。

带上 Cookie 和准确的 `Origin` 调用 `POST /api/auth/logout`，确认返回 204、当前 Session 从数据库删除、Apifox 中该 Cookie 被清除；随后请求 `/me` 和文章列表，都应返回 401。再次调用退出接口仍应返回 204。

## 5. 接入前端：把三条请求连到页面操作

后端三条链路已用 Apifox 验证。现在继续修改 `admin-web-antd`，沿用第 16C 章的 ProLayout、ProTable、DrawerForm 和 API 函数。

### 5.1 统一携带 Cookie，并保留错误状态码

第 16 章的 `lib/api-client.ts` 只抛出普通 `Error`，页面无法区分 401 和其他失败。在同一文件新增 `ApiError`，替换公共 `requestJson()`，并增加 `apiRequestNoContent()`；原来的 `ApiFailure`、`API_BASE_URL`、`apiRequest()` 和 `apiListRequest()` 保留：

```ts
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function requestJson<S>(path: string, options?: RequestInit): Promise<S> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
  });

  if (!response.ok) {
    const errorBody: ApiFailure = await response.json();
    throw new ApiError(response.status, errorBody.error.message);
  }

  if (response.status === 204) return undefined as S;
  return response.json();
}

export function apiRequestNoContent(path: string, options?: RequestInit) {
  return requestJson<void>(path, options);
}
```

所有请求从这里统一设置 `credentials`，包括第一次登录。退出返回 204，`apiRequestNoContent()` 只等待请求完成，避免交给读取 `body.data` 的 `apiRequest()`。

新建 `features/auth/api.ts`，把三个接口封装成页面可调用的函数：

```ts
import { apiRequest, apiRequestNoContent } from "@/lib/api-client";

export type Admin = { id: number; username: string };

export function login(input: { username: string; password: string }) {
  return apiRequest<Admin>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function getCurrentAdmin() {
  return apiRequest<Admin>("/api/auth/me");
}

export function logout() {
  return apiRequestNoContent("/api/auth/logout", { method: "POST" });
}
```

### 5.2 登录页：提交账号密码

新建客户端页面 `app/login/page.tsx`，顶部使用 `"use client"`。Form、异步提交和反馈沿用第 14 章的写法：

- 用 `Form` 收集 `username`、`password`，密码字段使用 `Input.Password`。
- 从 `@/features/auth/api` 导入 `login`，从 `next/navigation` 导入并调用 `useRouter()`。
- 提交时等待 `login(values)` 成功，再执行 `router.replace("/admin/articles")`。
- 提交期间显示加载状态；失败时留在登录页显示错误，并在 `finally` 中结束加载。

`replace()` 用后台地址替换当前登录页的历史记录。登录函数内部已经允许浏览器接收 Cookie，页面只需要处理成功或失败。

在浏览器先试错误密码，再试正确密码。Network 中应能看到成功响应的管理员 JSON 和 `Set-Cookie`，Cookie 存储中能看到标记 HttpOnly 的 `mini_cms_session`，随后文章请求携带 Cookie。

Apifox 和浏览器各自保存 Cookie，因此需要在浏览器重新登录。如果登录是 200、下一次请求却是 401，先检查两次请求是否都经过统一封装，以及前后端是否都使用 `localhost`。

### 5.3 后台布局：查询身份，再显示页面

这里实现图中“刷新后调用 `/me`”。修改现有客户端布局 `app/admin/layout.tsx`，先补齐导入，已有导入合并使用：

```tsx
import { Button } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentAdmin } from "@/features/auth/api";
import type { Admin } from "@/features/auth/api";
import { ApiError } from "@/lib/api-client";
```

在组件外增加状态类型：

```ts
type AuthState =
  | { status: "checking" }
  | { status: "authenticated"; admin: Admin }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };
```

`status` 区分检查中、已登录、未登录和检查失败。只有已登录状态带 `admin`，检查失败状态带错误文案。

下面代码放在现有 `AdminLayout` 函数体内。`router` 若已声明就复用；这些 Hook 和原有 Hook 都放在任何提前 `return` 之前：

```tsx
const router = useRouter();
const [auth, setAuth] = useState<AuthState>({ status: "checking" });
const [checkVersion, setCheckVersion] = useState(0);

useEffect(() => {
  let active = true;

  async function checkSession() {
    try {
      const admin = await getCurrentAdmin();
      if (active) {
        setAuth({ status: "authenticated", admin });
      }
    } catch (error) {
      if (!active) return;

      if (error instanceof ApiError && error.status === 401) {
        setAuth({ status: "unauthenticated" });
        router.replace("/login");
      } else {
        setAuth({
          status: "error",
          message: "无法验证登录状态，请检查网络或服务器后重试",
        });
      }
    }
  }

  void checkSession();
  return () => {
    active = false;
  };
}, [router, checkVersion]);
```

初次挂载会检查身份，`checkVersion` 变化时重新检查。`active` 与第 16 章的请求清理用法相同：组件卸载或开始下一次检查后，旧请求不再更新状态或触发跳转。

在原有布局 JSX 的 `return` 之前加入以下分支，ProLayout、菜单和 `{children}` 继续放在它们之后：

```tsx
if (auth.status === "checking") {
  return <p role="status">正在确认登录状态……</p>;
}

if (auth.status === "unauthenticated") {
  return null;
}

if (auth.status === "error") {
  return (
    <div role="alert">
      <p>{auth.message}</p>
      <Button onClick={() => {
        setAuth({ status: "checking" });
        setCheckVersion((value) => value + 1);
      }}>
        重试
      </Button>
    </div>
  );
}

const admin = auth.admin;
```

只有 `authenticated` 状态会执行到原有布局，可以用 `admin.username` 显示管理员。检查期间不返回后台的 `{children}`，文章、标签客户端页面暂时不会挂载并请求数据。

`unauthenticated` 返回 `null`，等待前面的跳转完成。网络或服务器错误则显示重试，因为请求失败还不能证明用户未登录。`/login` 在 `app/admin` 之外，不会套用这段后台检查。

现在验证：正常刷新时 `/me` 返回 200 后显示后台；删除浏览器 Cookie 再刷新，应跳转登录页；重新登录后停止后端再刷新，应看到重试入口，启动后端并重试应恢复页面。

### 5.4 退出按钮：等待退出成功再跳转

在同一个布局文件中，从 `antd` 增加 `App` 导入，从 `@/features/auth/api` 增加 `logout` 导入。下面代码放在组件体内、5.3 的所有提前 `return` 之前：

```tsx
const { message: messageApi } = App.useApp();
const [signingOut, setSigningOut] = useState(false);

async function handleLogout() {
  setSigningOut(true);
  try {
    await logout();
    setAuth({ status: "unauthenticated" });
    router.replace("/login");
  } catch {
    messageApi.error("退出失败，请重试");
  } finally {
    setSigningOut(false);
  }
}
```

第 14 章的根布局已经通过 `AntdProvider` 提供 `<App>`，因此能用 `App.useApp()` 显示消息。在 ProLayout 的用户区域加入退出按钮；已有按钮则接上这两个属性：

```tsx
<Button onClick={handleLogout} loading={signingOut}>
  退出登录
</Button>
```

成功后清空管理员状态并跳转，失败时保留页面并提示。点击退出后，再直接打开 `/admin/articles`，应经过 `/me` 检查回到登录页。

完成后，布局文件中的新增内容应按下面的顺序排列。这是位置示意，不是替换现有布局的代码：

```text
app/admin/layout.tsx
├─ "use client" 与导入
├─ AuthState 类型（组件外）
└─ AdminLayout 函数
   ├─ 原有 Hook，以及 auth、checkVersion、signingOut 等状态
   ├─ App.useApp() 与登录检查 Effect
   ├─ handleLogout()
   ├─ checking / unauthenticated / error 的提前返回
   ├─ const admin = auth.admin
   └─ 原有 ProLayout 的 return
      ├─ 显示 admin.username、退出按钮
      └─ 原来的菜单和 children
```

### 5.5 处理后台使用过程中的登录失效

布局挂载时检查一次，使用期间 Session 仍可能过期。文章、标签请求也要识别 `error instanceof ApiError && error.status === 401`：

- 列表的 `onRequestError` 遇到 401，提示登录已失效并跳转 `/login`。
- 表单提交遇到 401，提示“登录已失效，请先保留输入并重新登录”，保留抽屉和输入，`onFinish` 返回 `false`。先保留内容，再由用户重新登录，避免直接跳转丢失编辑内容。
- 删除遇到 401，提示登录已失效，不显示删除成功，也不移除列表数据。
- 其他网络、服务器或业务错误继续使用原来的反馈。

可以在浏览器登录后，用 TablePro 按 `admin_id` 和 `created_at` 找到本次登录产生的 Session，删除这条记录后再操作页面，观察失效反馈。前端 Cookie 此时仍可能存在，但后端已经不会认可它；验证后重新登录。

## 6. 走完完整流程，再进入测试章节

使用浏览器完成一轮：登录 → 新建草稿 → 刷新后台 → 编辑或删除文章 → 退出 → 再访问后台回到登录页。检查 Network 中的请求顺序，并在 TablePro 对照 Session 的创建和删除。

再用 Apifox 不带 Cookie 请求文章、标签接口，应返回 401；写请求仍带准确的 `Origin`，以便真正验证身份检查。匿名请求 `/api/health` 应返回 200。

分别在 `server` 和 `admin-web-antd` 中执行：

```bash
npx tsc --noEmit
```

再在 `admin-web-antd` 中执行 `npm run build`。接口、页面和检查都通过后，回到[第 10 章项目总览](./10-MiniCMS项目总览.md)验收阶段 6，再进入[第 18 章](./18-后端测试怎么分层.md)和[第 18A 章](./18A-接口测试实操-用Vitest和Supertest验证API.md)，把这些行为写成自动化测试。

## 官方参考

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Node.js crypto.randomBytes](https://nodejs.org/docs/latest/api/crypto.html#cryptorandombytessize-callback)
- [MDN：Set-Cookie 与 HttpOnly](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)
- [React：Effect 中的数据请求与清理](https://react.dev/reference/react/useEffect#fetching-data-with-effects)
