# 17A. 登录实操：用数据库 Session 和 HttpOnly Cookie 保护写接口

## 这一章要完成什么

第 17 章已经讲清 Session、Token 和 Cookie 的关系。这一章把它们接到现有 Mini CMS 中：

```text
管理员提交用户名和密码
-> Express 验证密码哈希
-> 创建一条数据库 Session
-> 浏览器保存 HttpOnly Cookie
-> 认证中间件验证后续请求
-> 未登录不能创建、修改和删除内容
```

完成后，Mini CMS 应该有下面三个接口：

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

第一版只有一个管理员，不做公开注册、找回密码、多角色和第三方登录。

所有代码都继续写在真实 `mini-cms` 中：后端增加认证模块和中间件，`admin-web-antd` 增加登录页和登录状态，不创建新的登录 demo。

前端沿用第 16C 章改造后的 ProComponents 后台。ProTable、DrawerForm 继续调用已有 API 函数；登录请求与认证状态独立接入，不把文章、标签页面改回普通 Table、Form。

先按第 1～4 节准备表和管理员；第 5～6 节完成登录，并用 Apifox 看到 Cookie 和数据库记录；第 7～9 节验证身份、退出和接口保护；最后在第 10 节接入浏览器页面。每条链路跑通后再继续。

下面后端文件路径均相对 `mini-cms/server`，前端文件路径相对 `mini-cms/admin-web-antd`。开始前确认现有文章、标签接口和后台页面能正常使用。

---

## 1. 先确定本章方案

本章使用：

```text
密码
-> 使用 Argon2id 生成和验证密码哈希

登录状态
-> 服务器生成随机 Session Token
-> Cookie 保存原始 Token
-> 数据库只保存 Token 的 SHA-256 哈希和过期时间
```

为什么两种哈希用途不同：

- 密码通常不够随机，必须使用专门的慢速密码哈希算法，例如 Argon2id。
- Session Token 由服务器随机生成，本身具有足够高的随机性，可以使用 SHA-256 后再存进数据库。
- 数据库泄露时，攻击者不能直接拿数据库中的 `tokenHash` 当作 Cookie 使用。

第 17 章已经比较过 JWT 和数据库 Session。这里直接复用项目的 PostgreSQL、Prisma 和 Express 中间件，逐步完成登录记录的创建、查询和删除。

---

## 2. 安装依赖

在 `mini-cms/server` 中执行：

```bash
npm install argon2 cookie-parser
npm install -D @types/cookie-parser
```

它们分别负责：

| 包 | 用途 |
|---|---|
| `argon2` | 生成和验证密码哈希 |
| `cookie-parser` | 把请求 Cookie 解析到 `request.cookies` |

随机 Token 和 SHA-256 使用 Node.js 自带的 `node:crypto`，不需要额外安装包。

---

## 3. 建立管理员和 Session 表

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

这里的关系表示：

```text
一个 Admin
-> 可以有多个 Session，例如分别登录电脑和手机

删除 Admin
-> 由 onDelete: Cascade 一起删除它的 Session
```

`admins` 保存账号，`sessions` 保存每次登录产生的记录。`tokenHash` 用于查找凭证，`adminId` 指向管理员，`expiresAt` 决定记录何时失效。创建管理员时还没有 Session，只有登录成功才会创建它。

生成并检查迁移：

```bash
npx prisma migrate dev --name add_admin_sessions
npx prisma generate
npx tsc --noEmit
```

检查迁移 SQL 中是否真的创建了：

- `admins` 和 `sessions` 表。
- `admins.username` 唯一约束。
- Session 到 Admin 的外键。
- `token_hash` 主键和过期时间索引。

---

## 4. 只通过环境变量创建初始管理员

不要把明文密码写进 migration、Git 或共享的 seed 文件。

先在本地 `.env` 临时增加：

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

在 `package.json` 增加：

```json
{
  "scripts": {
    "admin:create": "tsx scripts/create-admin.ts"
  }
}
```

执行：

```bash
npm run admin:create
```

然后用 TablePro 检查 `admins` 表。应该只能看到 `password_hash`，不能看到原始密码。

> `.env` 不能提交到 Git；`.env.example` 只保留变量名和说明，不放真实密码。

管理员创建完成后，从本地 `.env` 删除 `ADMIN_PASSWORD`。以后需要重置密码时再临时设置并重新运行脚本。

---

## 5. 封装 Session Token 和 Cookie 配置

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

这里要区分两个值：

```text
token
-> 只发送给浏览器，放在 Cookie 中

tokenHash
-> 只保存到数据库，用来查询 Session
```

例如用 `T` 表示随机 Token、`H` 表示它的哈希，完整对应关系是：

```text
登录时：生成 T → 计算 SHA-256(T) 得到 H → 数据库存 H，Cookie 存 T
请求时：Cookie 带回 T → 再计算得到 H → 用 H 查询同一条 Session
```

服务器每次都对收到的 Token 计算哈希，不需要从数据库里的哈希还原 Token。

`randomBytes(32)` 会产生 32 字节，也就是 256 位随机数据。不要用用户名、当前时间或自增 id 拼 Session Token。

`maxAge` 是浏览器 Cookie 的保存时长，`expiresAt` 是服务器检查的过期时间。本章都设为登录后的 7 天，访问接口时不自动续期；即使客户端继续发送旧 Cookie，后端仍会检查 `expiresAt`。`path: "/"` 让 Cookie 能覆盖本站的接口路径；其他安全属性见第 17 章。

---

## 6. 实现登录接口

### 6.1 验证密码，创建 Session，再设置 Cookie

先定义运行时校验规则。新建 `src/modules/auth/auth.schema.ts`：

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

无论用户名不存在还是密码错误，都返回同一个 401 信息。这样不会主动告诉请求者某个管理员账号是否存在。

密码验证成功后，这段代码产生三份结果：

| 位置 | 得到什么 | 谁使用 |
|---|---|---|
| PostgreSQL | `tokenHash`、`adminId`、`expiresAt` 等字段 | 后端在下次认证时查询 |
| 响应头 `Set-Cookie` | 原始 Token 和 Cookie 属性 | 浏览器保存凭证 |
| 响应 JSON 的 `data` | 管理员 ID 和用户名 | 前端显示用户信息 |

`response.cookie()` 设置响应头，`response.json()` 返回页面可读的数据。JSON 中没有 Token，前端也不需要从响应头中取出它。

更完整的系统还会增加登录频率限制和安全日志；当前先把认证主链路跑通。

### 6.2 注册解析、来源检查和登录路由

先让 `/login` 真正能被调用。在后端 `.env` 中增加下面的配置，并在 `.env.example` 中保留对应示例：

```dotenv
ADMIN_WEB_ORIGIN=http://localhost:3000
```

在 `src/app.ts` 顶部补齐以下导入，已有的不要重复导入：

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

第 12 章原来把健康检查放在 `articleRouter` 的 `/health` 中。这里移成公开的 `/api/health`，同时删除旧 handler。原有文章、标签路由继续放在上面代码之后，第 9 节再为它们接入认证；404 处理和错误中间件仍在所有路由之后，错误中间件放最后。

当前请求按以下顺序进入登录接口：

```text
CORS 允许配置的后台来源和凭证
→ express.json() 把 JSON 请求体放到 request.body
→ cookieParser() 把已有 Cookie 放到 request.cookies
→ 写请求的 Origin 与后台来源一致才继续
→ /api/auth/login 验证密码并创建 Session
```

登录时可以还没有 Cookie。`cookie-parser` 只解析 Cookie，不会判断用户是否已经登录。`Origin` 检查用于降低跨站请求伪造（CSRF）风险，也不能替代下一节的身份认证。

### 6.3 先用 Apifox 观察登录结果

在 `server` 中执行 `npx tsc --noEmit`，然后运行 `npm run dev`。先请求 `GET http://localhost:3001/api/health`，应得到 200 和 `{ server: "server is running" }`。

再创建 `POST http://localhost:3001/api/auth/login` 请求：

- 请求头设置 `Content-Type: application/json` 和 `Origin: http://localhost:3000`。
- JSON 请求体使用 `{ "username": "你的管理员名", "password": "创建管理员时的密码" }`，替换为第 4 节创建的账号。
- 先使用错误密码，确认返回 401；再使用正确密码，确认返回 200。

成功后同时检查三处：响应 JSON 有管理员信息；响应头有 `Set-Cookie: mini_cms_session=...`；TablePro 的 `sessions` 表新增了对应记录，`admin_id` 指向管理员，`expires_at` 约为 7 天后。数据库里保存的是哈希，它与 Cookie 中的 Token 不相同。

在 Apifox 的 Cookie 管理中确认当前地址的 Cookie 已保存，并允许后续请求携带。后面每次发送 `POST`、`PATCH`、`DELETE` 都保留准确的 `Origin`，否则会先收到 403，尚未进入账号或 Session 验证。浏览器页面接入后，这个请求头由浏览器设置。

---

## 7. 写认证中间件

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

中间件不是只检查“有没有 Cookie”，而是继续检查：

```text
Cookie 中是否有 Token
-> 数据库中是否存在对应 Session
-> Session 是否过期
-> 全部通过才调用 next()
```

`include.admin.select` 沿 `adminId` 关系取出管理员的 ID 和用户名，不把密码哈希带给后续路由。`response.locals.admin` 是**当前这次请求**里供后续处理函数读取的数据；它不会自动保存到浏览器，也不会跨请求保留。下一节的 `/me` 会使用它。

过期记录使用 `deleteMany()` 清理，即使另一条请求已经删除了它，本次认证仍能正常返回 401。

这一步先完成中间件定义；接上 `/me` 后，就能立即验证它是否放行。

---

## 8. 完成当前管理员和退出接口

### 8.1 用 /me 验证当前身份

在 `auth.routes.ts` 顶部增加 `requireAuth` 导入，再在已有登录路由后增加 `/me`：

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

`requireAuth` 先验证 Cookie，并把查到的管理员放进 `response.locals.admin`；后面的 handler 只负责返回这份信息。因此 `/me` 不需要提交用户名和密码。

现在用 Apifox 请求 `GET http://localhost:3001/api/auth/me`：携带第 6 节保存的 Cookie，应返回 200 和管理员信息；关闭该请求的 Cookie 携带后，应返回 401。只移除手写的 `Cookie` 请求头还不够，要确认 Cookie 管理没有自动补上它。验证后恢复携带，再继续退出流程。

### 8.2 删除当前 Session，并清除 Cookie

继续在同一文件的路由定义后增加：

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

退出接口使用 `deleteMany()`，即使 Session 已经不存在也能安全返回 204。清除 Cookie 时，`path` 等关键选项要和设置 Cookie 时保持一致。

退出接口不挂 `requireAuth`：即使凭证已过期或已被删除，也应允许客户端完成 Cookie 清理。带上 Cookie 和 `Origin` 请求 `POST /api/auth/logout`，确认返回 204、数据库中当前 Session 被删除；随后再请求 `/me`，应返回 401。再次退出仍应返回 204。

---

## 9. 用认证中间件保护管理接口

第 6 节已经注册解析、来源检查和登录路由。现在在 `src/app.ts` 顶部增加认证中间件导入：

```ts
import { requireAuth } from "./middleware/require-auth";
```

把原有的文章、标签路由注册替换为：

```ts
app.use("/api/articles", requireAuth, articleRouter);
app.use("/api/tags", requireAuth, tagRouter);
```

只保留加上 `requireAuth` 后的这两条注册，避免旧的未保护路由提前接走请求。整个 router 都受到保护，因此列表、详情、创建、修改和删除都会先验证身份。阶段 8 再增加只返回已发布文章的公开 router，例如 `/api/public/articles`。

认证路由仍注册为 `app.use("/api/auth", authRouter)`。其中 `/login`、`/logout` 可以匿名调用，`/me` 已在路由内部单独接入 `requireAuth`，不用给整个 `authRouter` 加认证。

路由处理函数继续使用第 11 章的 Zod Schema 解析输入；如果提取成独立校验中间件，就放在 `requireAuth` 之后。写请求依次经过来源检查、身份认证和业务参数校验。

立即验证：退出状态下请求 `GET /api/articles` 和 `GET /api/tags`，都应返回 401；重新登录后，携带 Cookie 读取列表应成功，再用已有的合法文章请求体创建文章，应返回 201。写请求继续设置准确的 `Origin`。完成后再接前端，这样页面出现问题时，可以先确认后端链路已经通过。

---

## 10. 接通前端登录、刷新和退出

后端已经能验证身份。前端沿用第 16C 章的后台，在 `/login` 和现有 `app/admin/layout.tsx` 接上下面的流程。

### 10.1 请求层保留状态码并携带 Cookie

第 16 章的 `lib/api-client.ts` 只抛出普通 `Error`，页面无法区分 401 和其他失败。在同一文件新增 `ApiError`，并替换公共的 `requestJson()`；原来的 `ApiFailure`、`API_BASE_URL`、`apiRequest()` 和 `apiListRequest()` 保留：

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

`credentials` 由这一处统一设置。退出接口返回 204，没有 JSON；用 `apiRequestNoContent()` 等待成功即可，不经过读取 `body.data` 的 `apiRequest()`。

新建 `features/auth/api.ts`：

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

### 10.2 登录页只提交账号密码

新建客户端页面 `app/login/page.tsx`，顶部使用 `"use client"`。Form、异步提交和页面反馈沿用第 14 章已经练过的做法：

- 用 `Form` 收集 `username`、`password`，密码输入使用 `Input.Password`。
- 从 `@/features/auth/api` 导入 `login`，从 `next/navigation` 导入并调用 `useRouter()`。
- 提交时等待 `login(values)` 成功，再执行 `router.replace("/admin/articles")`。
- 提交期间显示加载状态；失败时留在登录页显示错误，并在 `finally` 中结束加载状态。

`replace()` 用后台地址替换当前登录页的历史记录。这里不需要读取或保存 Token；`login()` 内部已经通过统一请求层设置了 `credentials: "include"`。

现在在浏览器中先试错误密码，再试正确密码。开发者工具的 Network 中，登录成功响应应同时有管理员 JSON 和 `Set-Cookie`；Cookie 存储中应看到 `mini_cms_session`，并标记 `HttpOnly`。随后文章请求会携带 Cookie。

Apifox 和浏览器各自保存 Cookie，前面在 Apifox 登录成功后，仍需要在浏览器登录。如果浏览器登录返回 200，但下一次请求是 401，先检查登录和后续请求是否都经过这份请求封装，以及前后端是否统一使用 `localhost`。

### 10.3 在现有布局中恢复登录身份

刷新后台时，React 的状态会重新初始化，因此先请求 `/me`。这次请求用已有 Cookie 查询 Session，成功后才能显示后台内容。

在现有客户端布局 `app/admin/layout.tsx` 中补齐导入，已有导入合并使用：

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

`status` 决定现在能显示什么；只有 `authenticated` 状态带有管理员信息，`error` 状态带有错误文案。这样可以明确区分“尚未查完”和“已经确认未登录”。

下面是加进现有 `AdminLayout` 函数体的代码。复用已有的 `router`，所有 Hook 都放在任何提前 `return` 之前：

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

初次挂载会执行检查；点击重试时增加 `checkVersion`，就会重新检查。`active` 的作用与第 16 章列表请求相同：组件卸载或开始下一次检查后，旧请求的结果不再更新页面，也不再触发跳转。

接着在**原有布局 JSX 的 `return` 之前**增加下面的分支，原来的 ProLayout、菜单和 `{children}` 继续保留在它们之后：

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

执行到原来的布局 `return` 时，状态一定是 `authenticated`，可以用 `admin.username` 显示当前管理员。检查期间没有返回后台的 `{children}`，文章、标签客户端页面也就暂时不会挂载并发起业务请求。

`/login` 位于 `app/admin` 之外，不会套用这个受保护布局。`unauthenticated` 返回 `null` 是等待前面的跳转完成；网络错误则保留错误和重试入口，因为请求失败尚不能证明用户未登录。

验证三次：正常刷新后台，`/me` 返回 200 后显示页面；删除浏览器 Cookie 再刷新，返回 401 并进入登录页；重新登录后停止后端再刷新，应显示重试入口，启动后端并重试应恢复后台。

### 10.4 在后台布局中接通退出

在同一个布局中，从 `antd` 增加 `App` 导入，从 `@/features/auth/api` 增加 `logout` 导入。将下面代码放在组件体内、前面所有提前 `return` 之前：

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

第 14 章的根布局已经通过 `AntdProvider` 提供了 `<App>`，因此这里可以用 `App.useApp()` 显示消息。在现有布局的用户区域加入下面的按钮；如果已经有退出按钮，就给它接上这两个属性：

```tsx
<Button onClick={handleLogout} loading={signingOut}>
  退出登录
</Button>
```

等待后端删除 Session、清除 Cookie 后再跳转。请求失败时保留当前页面并显示错误。

点击退出，确认 `/logout` 返回 204；再次直接打开 `/admin/articles`，应经过 `/me` 检查回到登录页。

### 10.5 处理使用过程中的登录失效

布局挂载时检查一次身份，浏览器打开期间 Session 仍可能过期。因此文章、标签请求也要识别 `error instanceof ApiError && error.status === 401`：

- 列表的 `onRequestError` 遇到 401，提示登录已失效并跳转 `/login`。
- 表单提交遇到 401，显示“登录已失效，请先保留输入并重新登录”，保持抽屉和输入，不立即跳转导致内容丢失；DrawerForm 的 `onFinish` 返回 `false`。
- 删除遇到 401，提示登录已失效；不能显示删除成功或从列表移除数据。
- 其他网络、服务器或业务错误继续使用原来的错误反馈。

前端检查负责页面反馈，后端 `requireAuth` 仍负责每次请求的身份验证。前端状态里只保存用于显示的管理员信息，浏览器负责管理 HttpOnly Cookie。

---

## 11. 按四个检查点验证

前面已经逐步验证接口和页面，这里用同一套浏览器操作收尾。写请求的来源检查保持开启；用 Apifox 复查时仍要设置准确的 `Origin`。

### 检查点一：密码保存

```text
运行 admin:create
-> TablePro 查看 admins
-> 只有 password_hash，没有明文密码
```

### 检查点二：登录和 Cookie

```text
错误密码登录
-> 401 INVALID_CREDENTIALS

正确密码登录
-> 200
-> 响应包含 Set-Cookie
-> Cookie 包含 HttpOnly 和 SameSite=Lax
```

本地 HTTP 环境下 `Secure` 为 false；正式 HTTPS 环境必须为 true。

先匿名请求 `GET /api/health`，应返回 200 和 `{ server: "server is running" }`。随后验证受保护接口：

### 检查点三：接口保护

```text
不带 Cookie 读取草稿或创建文章
-> 401

登录后用同一 Cookie 创建文章
-> 201

刷新管理页面并调用 /api/auth/me
-> 仍能返回当前管理员
```

### 检查点四：退出

```text
调用 /api/auth/logout
-> 204
-> 数据库 Session 被删除
-> 再访问受保护接口返回 401
```

最后分别在 `server` 和 `admin-web-antd` 中执行：

```bash
npx tsc --noEmit
```

再在 `admin-web-antd` 中执行 `npm run build`，检查新增页面和布局能否完成构建。

---

## 暂时不做什么

本章故意不加入：

- 公开注册和邮箱验证。
- 找回密码和修改密码流程。
- 管理员、编辑者等多角色权限矩阵。
- 多因素认证。
- OAuth 或第三方身份提供商。
- 自动清理全部过期 Session 的定时任务。

它们不是不重要，而是应该建立在当前登录闭环已经可靠的基础上。

---

## 小结

```text
Argon2id
-> 保护数据库中的密码哈希

随机 Session Token
-> 作为浏览器的登录凭证

数据库 Session
-> 记录凭证属于谁、何时过期，并允许主动撤销

HttpOnly Cookie
-> 让浏览器自动携带凭证，同时禁止前端脚本直接读取

认证中间件
-> 在每个敏感请求进入业务代码前验证身份
```

做到这里，登录才从“有一个登录页面”变成“服务器能够持续验证管理员身份”。

登录、退出、刷新恢复身份和写接口保护都能走通后，回到[第 10 章项目总览](./10-MiniCMS项目总览.md)完成阶段 6 验收。下一步再读第 18、18A 章，为核心 API 增加自动化测试。

## 官方参考

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Node.js `crypto.randomBytes`](https://nodejs.org/docs/latest/api/crypto.html#cryptorandombytessize-callback)
- [MDN：Set-Cookie 与 HttpOnly](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)
- [React：Effect 中的数据请求与清理](https://react.dev/reference/react/useEffect#fetching-data-with-effects)
