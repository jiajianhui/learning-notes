# 14A. 登录实操：用数据库 Session 和 HttpOnly Cookie 保护写接口

## 这一章要完成什么

第 14 章先解释认证、Cookie 和基本安全。这一章只做一条可运行的登录闭环：

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

这里选择数据库 Session，是因为它容易理解、可以主动退出，也能在服务器端立即撤销。JWT 是另一种方案，但不是“有登录就必须用 JWT”。

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

`randomBytes(32)` 会产生 32 字节，也就是 256 位随机数据。不要用用户名、当前时间或自增 id 拼 Session Token。

---

## 6. 实现登录接口

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

更完整的系统还会增加登录频率限制和安全日志；当前先把认证主链路跑通。

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
      await prisma.session.delete({ where: { tokenHash } });
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

---

## 8. 完成当前管理员和退出接口

继续在 `auth.routes.ts` 中增加：

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

---

## 9. 注册 Cookie、CORS、CSRF 检查和路由

在配置中增加准确的后台来源：

```dotenv
ADMIN_WEB_ORIGIN=http://localhost:3000
```

在 `app.ts` 中，顺序应该是：

```ts
import cookieParser from "cookie-parser";
import cors from "cors";
import { AppError } from "./errors/app-error";
import { errorHandler } from "./middleware/error-handler";
import { requireAuth } from "./middleware/require-auth";
import { articleRouter } from "./modules/articles/article.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { tagRouter } from "./modules/tags/tag.routes";

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

app.use("/api/auth", authRouter);
app.use("/api/articles", requireAuth, articleRouter);
app.use("/api/tags", requireAuth, tagRouter);

// 在这里继续注册 404 处理，错误中间件始终放在最后。
app.use(errorHandler);
```

这里把 `/api/articles` 和 `/api/tags` 当作管理后台接口，整个 router 都受到保护。这样创建、修改、删除和读取草稿都会先验证登录。以后第 21 章阶段 7 再增加只返回已发布文章的公开 router，例如 `/api/public/articles`，不要让公开接口复用“返回全部管理数据”的查询。

如果某个 router 同时包含公开和后台接口，就逐条声明 `requireAuth`。controller 继续使用第 10 章的 Zod Schema 解析输入；如果把解析提取成独立校验中间件，就放在 `requireAuth` 之后。关键不是写法，而是后端真正拦截所有敏感接口。

`SameSite=Lax` 能降低一部分 CSRF 风险，但不是所有部署方式下的完整答案。本项目又增加了写请求的 `Origin` 精确检查。CORS 仍然不能代替认证或 CSRF 防护。

> 现在用 Apifox 调试 `POST`、`PATCH` 和 `DELETE` 时，也要手动添加 `Origin: http://localhost:3000`。

---

## 10. Next.js 请求必须携带 Cookie

封装请求函数时增加：

```ts
const response = await fetch(`${API_URL}/api/auth/me`, {
  credentials: "include",
});
```

登录、退出和所有受保护请求都要使用 `credentials: "include"`。登录请求示例：

```ts
await fetch(`${API_URL}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ username, password }),
});
```

不要把 Session Token 保存到 `localStorage`，也不要尝试从前端 JavaScript 读取 HttpOnly Cookie。浏览器会按 Cookie 规则自动保存和发送它。

---

## 11. 按四个检查点验证

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

最后执行：

```bash
npx tsc --noEmit
```

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

## 官方参考

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Node.js `crypto.randomBytes`](https://nodejs.org/docs/latest/api/crypto.html#cryptorandombytessize-callback)
