# 17A. 登录实操：用数据库 Session 和 HttpOnly Cookie 保护写接口

沿着[第 17 章的流程图](./17-登录Cookie和基本安全.md)，先在 Apifox 中跑通登录、身份验证和退出，再接入浏览器页面。每个阶段完成后立即验证，再继续下一步。

所有实现都放在真实 `mini-cms` 中。下文后端路径相对 `mini-cms/server`，前端路径相对 `mini-cms/admin-web-antd`。开始前确认第 14、16 章的文章、标签接口和普通 Ant Design 后台能正常使用，无需先完成 16C；登录继续接到现有请求封装与布局中。

本章只做一个管理员，由脚本创建账号；公开注册、多角色和第三方登录留在本次范围之外。

## 1. 准备管理员：让数据库里有可验证的账号

这一步准备图中登录接口要查询的 `admins`，以及登录成功后要写入的 `sessions`。

### 1.1 安装依赖

先安装两个后端依赖：`argon2` 用来生成和验证密码哈希；`cookie-parser` 把请求中的 Cookie 整理成 `request.cookies` 对象，供后端读取。在 `server` 中执行：

```bash
npm install argon2 cookie-parser
npm install -D @types/cookie-parser
```

随机 Token 和 SHA-256 使用 Node.js 自带的 `node:crypto`，不用额外安装。

### 1.2 建表并检查迁移

先为登录流程准备两张表：

- `admins` 保存**管理员账号**：下一节用脚本创建，登录时查询它来验证用户名和密码。
- `sessions` 保存**每次登录的记录**：登录成功后创建，后续请求用它确认身份，退出时删除对应记录。

例如，管理员 `id = 1` 在电脑和手机分别登录，会产生两条 `adminId = 1` 的 Session。退出电脑上的登录，只删除其中一条，账号和手机上的登录仍然保留。这就是一个管理员对应多条 Session 的一对多关系。

在 `prisma/schema.prisma` 中增加下面两个模型，保留已有模型：

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

  @@map("sessions")
}
```

关键字段对应登录流程中的这些用途：

| 字段 | 用途 |
|---|---|
| `Admin.id`、`username` | `id` 是自增主键；用户名用于查找账号，`@unique` 保证不能重名 |
| `Admin.passwordHash` | 保存密码哈希，登录时验证输入的密码 |
| `Session.tokenHash` | 保存 Token 的哈希，后续请求凭它查找 Session；直接用作主键 `@id`，不再另设数字 ID |
| `Session.adminId` | 保存所属管理员的 ID，对应 `Admin.id` |
| `Session.expiresAt` | 后端用它判断登录是否过期；到时间不会自动删除记录 |

两边的 `createdAt` 记录创建时间，`Admin.updatedAt` 记录通过 Prisma 更新账号的时间。

再看两张表怎样关联：

- `adminId` 是数据库实际保存的外键列；`admin` 和 `sessions` 是 Prisma 的关系字段，分别用于查询所属管理员和该管理员的登录记录，不会额外存成对象列或数组列。
- `@relation(fields: [adminId], references: [id])` 声明外键指向 `Admin.id`；`onDelete: Cascade` 表示删除管理员时，一起删除他的 Session。

`@map`、`@@map` 沿用前面的命名方式，把字段、模型映射为数据库列名和表名，例如 `passwordHash → password_hash`、`Admin → admins`。

保存模型后执行迁移，才会真正创建数据库表；随后生成包含新模型的 Prisma Client，并检查类型：

```bash
npx prisma migrate dev --name add_admin_sessions
npx prisma generate
npx tsc --noEmit
```

查看迁移 SQL，确认创建了两张表、用户名唯一约束、Session 到 Admin 的外键，以及 `token_hash` 主键。

### 1.3 创建初始管理员

项目没有注册入口，所以先用脚本创建可登录的账号。脚本依次读取用户名和密码、生成密码哈希、写入 `admins`；它由你手动运行，不随每次后端启动执行。

在后端 `.env` 临时设置你自己选择的用户名和至少 12 个字符的密码。12 是本教程选择的长度下限，不是 Argon2 的技术要求。下面是占位示例，执行脚本前要替换：

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
  throw new Error("请提供 ADMIN_USERNAME 和至少 12 个字符的 ADMIN_PASSWORD");
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

密码可能被猜测，因此使用专门的慢速密码哈希算法 Argon2id，增加逐个尝试密码的成本。`argon2.hash()` 会生成随机盐（一段随机数据），把盐、计算参数和哈希结果一起编码为 `passwordHash` 字符串，后面验证密码时还会用到这些信息。

`upsert()` 按用户名查找：账号不存在就创建，已存在就更新密码哈希，因此重复运行脚本不会创建同名账号。

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

**先看谁生成、谁保存**

这里的后端就是 `mini-cms/server` 中由 Node.js 运行的 Express 程序。密码验证成功后，**后端生成一串随机字符串，叫 Session Token**，作为后续请求的登录凭证。前端页面不生成它，数据库也不生成它。

后端生成的同一个 Token 有两个去向：

```text
Node.js 后端生成原始 Token
├─ 后端计算 tokenHash → 通过 Prisma 写入 PostgreSQL 的 Session
└─ 后端通过 Set-Cookie 响应头发送原始 Token → 浏览器保存到 Cookie
```

**哈希与 SHA-256 的关系**

哈希是把原始数据按算法计算成一个结果，称为哈希值或摘要；**SHA-256 是一种具体的哈希算法，输出固定为 256 位**。本项目把它对 Token 的计算结果命名为 `tokenHash`。同一个 Token 用 SHA-256 计算，总会得到相同结果，后续请求才能用它找到登录记录，无需还原原始 Token。

密码和 Token 都要做哈希，但选择算法的原因不同：

- **密码用 Argon2id**：人设置的密码可能被猜中，较慢的计算能增加反复尝试密码的成本。
- **Token 用 SHA-256**：本章的 Token 由后端生成 32 字节随机数据得到，难以猜中，使用 SHA-256 计算用于查询的哈希即可。

原始 Token 是登录凭证，别人拿到它，就可能冒用你的登录状态。因此数据库只保存它的哈希 `tokenHash`；即使 Session 表的数据泄露，也不会直接暴露原始 Token。

**Cookie 是什么，怎样带回 Token**

Cookie 是浏览器保存的一小段带名称的数据，浏览器会在符合规则的请求中把它发回服务器。本项目的 Cookie 名称是 `mini_cms_session`，值是原始 Token。

登录时，后端通过 `Set-Cookie` 响应头让浏览器保存它；以后请求接口时，浏览器通过 `Cookie` 请求头把它带回来。配置为 HttpOnly 后，页面 JavaScript 不能直接读取这条 Cookie，但浏览器仍能保存和发送，所以页面不用把 Token 存进 `localStorage`。这些规则由下面的 `sessionCookieOptions` 指定。[MDN：Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)

**把后端要用的函数和配置放在一起**

登录、认证和退出需要共用 Cookie 名称与哈希方法，因此集中定义在 `src/modules/auth/session.ts`。下面只准备这些函数和配置，下一节的登录路由才会调用它们，写入数据库并设置 Cookie 响应头。

新建这个文件：

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

代码中的两个计算都发生在 Node.js 后端：

- `randomBytes(32)` 生成 32 字节随机数据，`toString("base64url")` 把它转成适合放入 Cookie 的文本，这就是原始 Token。
- `createHash("sha256")` 选择哈希算法，`update(token)` 传入原始 Token，`digest("hex")` 把结果输出为十六进制字符串，这就是 `tokenHash`。[Node.js：哈希 API](https://nodejs.org/api/crypto.html#class-hash)

`sessionCookieOptions` 的属性分别控制：

| 配置 | 本项目中的作用 |
|---|---|
| `httpOnly: true` | 禁止页面 JavaScript 直接读取这条 Cookie；浏览器仍可自动发送 |
| `sameSite: "lax"` | 限制从其他网站发起的请求携带这条 Cookie，减少其他网站借用登录状态的机会 |
| `secure` | 生产环境设为 true，仅通过 HTTPS 发送；本地 HTTP 开发时设为 false |
| `path: "/"` | 让 `/api/auth`、`/api/articles` 等路径都在这条 Cookie 的适用范围内 |
| `maxAge` | 指定浏览器保存多久，Express 这里按毫秒计；本章设置为 7 天 |

`createSessionExpiresAt()` 用同一段时长计算数据库的 `expiresAt`：当前时间加 7 天。`maxAge` 约束浏览器保存 Cookie 的时间，`expiresAt` 供后端判断 Session 是否有效；后端仍要检查它，不能只依赖浏览器。本章访问接口时不自动续期。

### 2.2 验证密码并返回登录结果

登录先经过两道检查：Zod 检查用户名、密码的格式；格式通过后，再查数据库并验证密码是否正确。格式合法并不代表能登录。

先新建 `src/modules/auth/auth.schema.ts`，定义输入规则。密码保留用户原始输入，不做 `trim()`，避免改变密码中的空格：

```ts
import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(50),
  password: z.string().min(1).max(200),
});
```

接着实现这条流程：**校验输入 → 查找账号 → 验证密码 → 创建 Session → 返回 Cookie 和管理员信息**。

新建 `src/modules/auth/auth.routes.ts`：

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
    throw new AppError(401, "INVALID_CREDENTIALS", "账户不存在或密码错误");
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

`argon2.verify(admin.passwordHash, password)` 接收数据库中的 `passwordHash` 和请求体中的原始密码 `password`。**验证的核心就是：重新计算输入密码的哈希，与已保存的哈希结果比较，匹配返回 `true`，不匹配返回 `false`。**

`passwordHash` 这串文本除了哈希结果，还包含算法、盐和计算参数：

- **盐**：创建账号时生成的一段随机数据，会和密码一起参与哈希计算。不同的盐能让相同密码得到不同的哈希结果。
- **计算参数**：内存用量、计算轮数等设置，决定当时怎样计算哈希。

`verify()` 会从 `passwordHash` 中取出原来的盐和参数，让这次计算与创建账号时使用相同规则。若自己再调用 `argon2.hash(password)`，默认会生成新的随机盐，即使输入同一个密码，得到的字符串通常也不同，不能直接与数据库中的整串 `passwordHash` 比较。因此验证时直接使用 `verify()`，由它完成重新计算和比较。[node-argon2：hash 与 verify 的实现](https://github.com/ranisalt/node-argon2/blob/master/argon2.cjs)

验证成功后，先 `await prisma.session.create()` 确认登录记录保存成功，再设置 Cookie，避免发出一份数据库尚未认可的凭证。

最后的 `response.cookie()` 设置 `Set-Cookie` 响应头，`response.json()` 返回管理员信息；一次响应同时完成两件事，JSON 中不包含 Token。

找不到账号或密码验证失败，都返回 401 `INVALID_CREDENTIALS`，提示“账户不存在或密码错误”，表示这次请求没有通过身份验证。本章先完成认证主链路，更完整的登录系统还需要登录频率限制等措施。

### 2.3 把登录路由接到 app

本地前端是 `http://localhost:3000`，后端是 `http://localhost:3001`。**来源（origin）由协议、主机和端口组成**，这里端口不同，浏览器会把它们之间的请求视为跨来源请求。CORS 就是后端通过响应头，告诉浏览器哪些来源可以读取跨来源响应的机制。

路由写好后，要先让请求经过下面的配置，再交给它处理：

- **CORS**：`origin` 指定允许的前端来源，`credentials: true` 允许该前端读取带凭证的响应。这里的凭证主要指 Cookie 中的登录 Token。
- **请求解析**：`express.json()` 得到 `request.body`，`cookieParser()` 得到 `request.cookies`，供后续路由和认证中间件使用。
- **来源检查**：浏览器会用 `Origin` 请求头标明请求来自哪个来源。CORS 不能保证其他网站的写请求不会到达服务器，因此在执行业务前检查这个值，来源不符就返回 403。

第 5.1 节接浏览器时，前端还会设置 `credentials: "include"`，允许请求接收和携带 Cookie；前后端两处需要配合。虽然上面的 localhost 地址跨来源，但仍属于同站，端口不同不会让 `SameSite=Lax` 阻止这里的 Cookie。

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

`safeMethods` 中的 GET、HEAD 用于读取；OPTIONS 是浏览器在部分跨来源请求前，询问服务器是否允许该请求的“预检”。这三种请求跳过写入来源检查，其余请求的 `Origin` 必须与配置一致。解析 Cookie 和检查来源都不能确认管理员身份，第 3 节再实现认证。

`app.use("/api/auth", authRouter)` 把 Router 内的 `/login` 接成 `/api/auth/login`。

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
| 响应区的 Header 标签 | `Set-Cookie` 设置了 `mini_cms_session`，其中包含 `HttpOnly` 和 `SameSite=Lax` |
| Apifox Cookie 管理 | 已保存 `mini_cms_session`，值为登录时生成的原始 Token |
| TablePro 的 `sessions` 表 | 新记录的 `admin_id` 指向管理员，`expires_at` 约为 7 天后；`token_hash` 与 Cookie 的原始 Token 不同 |

Cookie 标签可能没有展示 `SameSite`；是否设置了 `SameSite=Lax`，以 Header 标签中的 `Set-Cookie` 为准。

Apifox 会自动保存登录响应中的 Cookie，并在后续符合域名和路径的请求中自动携带，无需手动复制 Token。[Apifox：登录态如何处理](https://docs.apifox.com/5802184m0)

之后所有 `POST`、`PATCH`、`DELETE` 请求都继续设置准确的 `Origin`，否则会先返回 403，尚未进入认证。浏览器页面接入后，`Origin` 由浏览器设置。

## 3. 验证身份：让管理接口只接受有效凭证

对应图中 **② 后续请求**。先用 `/me` 验证同一份 Cookie 能找到管理员，再把这段检查接到文章、标签接口。

### 3.1 实现 requireAuth

登录成功后，客户端已保存 Cookie 中的 Token。现在要处理的是下一次请求：**后端收到这个 Token，怎样确认它仍然对应一次有效登录？** 查询身份、管理文章和管理标签都需要这段检查，所以把它写成共用的 `requireAuth` 中间件，放在业务处理之前。

**先从 Cookie 找到登录记录**

前面注册的 `cookieParser()` 把 Cookie 请求头整理成对象，`requireAuth` 再按名称取出 Token。下面的 `example-token` 仅用于示意：

```text
客户端发送：Cookie: mini_cms_session=example-token
后端解析为：request.cookies = { mini_cms_session: "example-token" }
中间件读取：request.cookies[sessionCookieName] → "example-token"
```

如果请求没带这条 Cookie，读到的 `token` 就是 `undefined`。因此先用 `typeof token !== "string"` 拦住缺少或类型不对的凭证，返回 401「请先登录」。拿到字符串也不代表登录有效，还要继续查询和检查 Session。

拿到 Token 后，用第 2.1 节的 `hashSessionToken()` 重新计算哈希，再用 `findUnique({ where: { tokenHash } })` 查找登录时保存的 Session。查不到时，结果是 `null`。

查到 Session 后，还需要知道它属于哪个管理员。因此查询中用 `include.admin` 带出关联的管理员，再用 `select` 只取 `id` 和 `username`。例如 Session 的 `adminId` 为 `1`，就关联 `Admin.id = 1` 的账号，查询结果会包含：

```text
session（只列出后面要用的字段）
├─ adminId: 1
├─ expiresAt: 登录时设定的过期时间（Date 对象）
└─ admin: { id: 1, username: "admin" }
```

这里的 `session.admin` 是 Prisma 根据表关系查出的管理员对象；本次请求用 Token 验证身份，不需要再读取密码哈希。

**再判断这次登录是否仍有效**

有记录不代表还有效：数据库不会在 `expiresAt` 到期时自动删除它，所以还要比较 `session.expiresAt <= new Date()`，判断是否已经到期。

- 查不到 Session 或 Session 已过期，都抛出 `AppError(401, ...)`，提示「登录已失效，请重新登录」。Session 是登录记录，查不到它不代表管理员账号不存在。当前函数在这里结束，由已有错误中间件返回 401，业务处理不会继续执行。
- 如果查到了过期记录，顺便用 `deleteMany()` 清理。这里按唯一的 `tokenHash` 删除，最多影响一条记录；记录已不存在时也不会因此报错。

**通过后，把管理员身份交给后续路由**

将查出的 `session.admin` 放进 `response.locals.admin`，后续处理函数就能直接使用这份身份信息，不必再次查询管理员。`locals` 是 Express 提供的对象，只在**当前这次请求**中共享数据；赋值不会写入数据库，也不会自动发送 JSON。

然后调用 `next()`，让 Express 继续执行后面注册的处理函数。下一节会把 `requireAuth` 放在 `/me` 的响应函数前面，由那个函数读取管理员信息并返回 JSON。

理解这三步后，新建 `src/middleware/require-auth.ts`，写入完整实现。`RequestHandler` 为 `request`、`response`、`next` 提供类型信息，不会生成 `cookies`；`request.cookies` 的实际数据由前面的 `cookieParser()` 填入，类型声明由 `@types/cookie-parser` 补充：

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

现在只是定义好了检查函数，下一节把它接到 `/me`，通过真实请求验证。

### 3.2 用 /me 读取已经验证的管理员

`/me` 表示“当前请求对应的管理员”。前端带着已有 Cookie 请求它，后端返回管理员 ID 和用户名，供页面显示。这个接口只查询已有登录记录，不要求再次提交密码，也不创建新的 Session。

在 `auth.routes.ts` 顶部增加 `requireAuth` 导入，在已有登录路由后增加 `/me`。

请求先经过 `requireAuth` 检查 Token 和 Session。检查失败时，由统一错误处理中间件返回 401 和提示；检查通过并调用 `next()` 后，才执行后面的响应函数，读取 `response.locals.admin` 并返回管理员 JSON。

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

Apifox 会自动保存登录时的 Cookie，后续请求 `/me` 时自动携带其中的 Token，无需手动设置。

用 `GET http://localhost:3001/api/auth/me` 验证：

1. 登录后直接请求，应返回 200 和管理员信息。
2. 在「Cookie 管理」中删除 `localhost` 下的 `mini_cms_session`，再次请求，应返回 401「请先登录」。
3. 重新调用 `/login` 恢复 Cookie，再请求 `/me` 确认返回 200，然后继续后面的练习。

### 3.3 接到文章和标签路由

在 `src/app.ts` 顶部增加：

```ts
import { requireAuth } from "./middleware/require-auth";
```

将原来的文章、标签路由注册替换为下面两行，让这些接口先检查登录凭证：

```ts
app.use("/api/articles", requireAuth, articleRouter);
app.use("/api/tags", requireAuth, tagRouter);
```

`app.use("/api/auth", authRouter)` 保持原样，其中 `/me` 已单独接入认证，登录和稍后增加的退出接口允许匿名调用。健康检查仍公开，阶段 8 再增加读取已发布内容的公开接口。

立即用 Apifox 验证：

| 请求 | 不带 Cookie | 携带有效 Cookie |
|---|---|---|
| `GET /api/articles`、`GET /api/tags` | 401 | 200 和列表 |
| `POST /api/articles`，使用已有合法请求体和准确的 `Origin` | 401 | 201 和新文章 |

这一步成功，说明同一个认证中间件已经同时用于查询身份和保护业务接口。

## 4. 跑通退出：让当前凭证失效

对应图中 **③ 退出**。退出要同时处理服务器和浏览器：**先删除 Session，让旧 Token 失效；再清除 Cookie，让浏览器不再携带它。** 如果只清除 Cookie，旧 Token 对应的数据库记录仍然有效，再次发来仍可能通过认证。

这里用 `deleteMany()` 删除当前 Token 对应的 Session。记录不存在时返回 `{ count: 0 }`，仍可继续退出；数据库连接失败等异常则通过 `await` 传给统一错误处理中间件，返回 500。

`response.clearCookie()` 通过 `Set-Cookie` 把 Cookie 的过期时间设到过去，让浏览器删除它。名称、`path` 等配置沿用登录时的设置，不再传保存 7 天的 `maxAge`。[Express：clearCookie](https://expressjs.com/en/5x/api/response/#res.clearCookie)

在 `auth.routes.ts` 已有路由后增加：

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

204 表示退出成功，没有响应体；“退出成功”的提示文字可以由前端显示。

退出接口不挂 `requireAuth`，允许登录已失效的请求继续清除 Cookie。例如退出时 Session 已删除，但网络中断，浏览器没收到清除 Cookie 的响应；再次退出时，就不应因查不到 Session 而提前返回 401。调用退出接口时，`Origin` 请求头必须与配置的前端地址一致，否则返回 403。

在 Apifox 中验证：

1. 登录后，设置准确的 `Origin`，调用 `POST /api/auth/logout`。应返回 204，当前 Session 和保存的登录 Cookie 都被删除。
2. 再请求 `/me` 和文章列表，都应返回 401。
3. 再次调用退出接口，仍应返回 204。

## 5. 接入前端：把三条请求连到页面操作

后端三条链路已用 Apifox 验证。现在继续修改 `admin-web-antd`，沿用已有的 Layout、Table、Drawer、Form 和 API 函数，接入登录页、后台身份检查和退出按钮。

### 5.1 统一携带 Cookie，并保留错误状态码

继续修改 `lib/api-client.ts`，先沿用 `apiRequest()` 和 `apiListRequest()` 各自发送请求的写法，补上 Cookie 和错误状态码处理。等登录流程跑通后，再到 5.6 整理重复代码。

保留原来的响应类型、分页类型和 API 地址配置。下文用 `API_BASE_URL` 表示后端地址；如果你的变量叫 `BASE_URL`，代码中沿用原名即可。两个对外请求函数的名称和调用方式保持不变。

**让错误同时携带状态码和提示文字**

如果页面只显示错误文字，原来的 `Error(message)` 就够了。现在还需要根据错误决定下一步。比如加载文章列表失败：

- **401**：未登录或登录已失效，跳转登录页。
- **500**：服务器出错，留在当前页显示错误；重新登录解决不了这个问题。

后端已有的 `AppError` 会由错误中间件转换成 HTTP 状态码和错误 JSON，前端不会收到那个 `AppError` 对象。因此在前端新增 `ApiError`，让页面的 `catch` 同时拿到两项信息：`message` 用于显示提示，`status` 用于判断怎样处理。按状态码判断，也不会受提示文案变化影响。

```ts
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}
```

`public status` 把传入的状态码保存为对象属性，`super(message)` 保留错误文字。页面在 `catch` 中先用 `error instanceof ApiError` 确认类型，再通过 `error.status === 401` 判断是否需要重新登录。

**在两个现有函数中补上 Cookie 和错误状态码**

`fetch` 默认只在同源请求中携带 Cookie。这里前后端端口不同，需要设置 `credentials: "include"`，让浏览器保存登录响应中的 Cookie，并在后续请求中自动携带它。后端的 `credentials: true` 则允许页面读取这类跨来源请求的响应。[MDN：credentials](https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials)

在 `apiRequest()` 和 `apiListRequest()` 中，分别将原来的 `fetch` 调用替换为：

```ts
const response = await fetch(`${API_BASE_URL}${path}`, {
  ...options,
  credentials: "include",
});
```

`fetch` 收到 401、500 等响应时不会自动抛错，需要自己检查 `response.ok`。把两个函数中原来的失败判断替换为下面这段，将响应的状态码和错误文字一起交给页面：

```ts
if (!response.ok) {
  const errorBody: ApiFailure = await response.json();
  throw new ApiError(response.status, errorBody.error.message);
}
```

成功后的 JSON 解析和返回值保持原样：`apiRequest()` 取出 `data`，`apiListRequest()` 返回完整的 `data + pagination`。

保存后刷新现有列表；尚未登录时，请求应抛出带 `status: 401` 的 `ApiError`。页面如何跳转在后面接入。

**给退出请求单独准备一个函数**

退出成功返回 204，没有 JSON，不能继续调用 `response.json()` 或读取 `body.data`。因此在同一文件中新增 `apiRequestNoContent()`：同样携带 Cookie、处理失败，成功后直接结束。

```ts
export async function apiRequestNoContent(
  path: string,
  options?: RequestInit,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
  });

  if (!response.ok) {
    const errorBody: ApiFailure = await response.json();
    throw new ApiError(response.status, errorBody.error.message);
  }
}
```

`Promise<void>` 表示成功后没有业务数据，调用方仍要 `await` 等待退出完成。

**把三个后端接口封装成页面函数**

`login()` 和 `getCurrentAdmin()` 都通过 `apiRequest<Admin>()` 取得管理员对象；`logout()` 使用刚增加的 `apiRequestNoContent()`，只等待退出完成。新建 `features/auth/api.ts`：

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

### 5.2 实现登录页：登录成功后进入后台

新建客户端页面 `app/login/page.tsx`，顶部使用 `"use client"`。这页完成一件事：收集账号密码，调用 `login()`；成功进入后台，失败留在登录页显示提示。

从 `@/features/auth/api` 导入 `login`，从 `react` 导入 `useState`，从 `next/navigation` 导入 `useRouter`。下面代码放在页面组件函数内：

```tsx
const router = useRouter();
const [submitting, setSubmitting] = useState(false);
const [submitError, setSubmitError] = useState<string | null>(null);

async function handleFinish(values: { username: string; password: string }) {
  setSubmitting(true);
  setSubmitError(null);
  try {
    await login(values);
    router.replace("/admin/articles");
  } catch (error) {
    setSubmitError(error instanceof Error ? error.message : "登录失败，请重试");
  } finally {
    setSubmitting(false);
  }
}
```

页面使用已学过的 Ant Design 表单组件，按下面方式连接：

- `Form` 设置 `onFinish={handleFinish}`；两个 `Form.Item` 的 `name` 分别为 `username`、`password`，输入框使用 `Input`、`Input.Password`，都设为必填。
- 登录按钮设置 `htmlType="submit"`、`loading={submitting}`。
- `submitError` 有值时，用 `Alert` 显示错误文字。

`replace()` 用后台地址替换当前登录页的历史记录。Cookie 由浏览器保存和携带，页面不需要手动读取 Token。

在浏览器先试错误密码，再试正确密码。Network 中应能看到成功响应的管理员 JSON 和 `Set-Cookie`，Cookie 存储中能看到标记 HttpOnly 的 `mini_cms_session`，随后文章请求携带 Cookie。

Apifox 和浏览器各自保存 Cookie，因此需要在浏览器重新登录。如果登录是 200、下一次请求却是 401，先检查两次请求是否都经过统一封装，以及前后端是否都使用 `localhost`。

### 5.3 进入后台时检查登录状态，未登录则跳转登录页

进入后台或刷新页面时，浏览器可能已有 Cookie，但前端还不知道登录是否有效。因此在共用的后台布局中请求 `/me`，确认身份后再显示文章、标签页面。

主线是：**请求 `/me` → 把结果存入 `auth` → 显示后台或跳转登录页**。网络或服务器出错时显示重试入口，不能直接当作未登录。

修改现有客户端布局 `app/admin/layout.tsx`，先补齐导入，已有导入合并使用：

```tsx
import { Button } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentAdmin } from "@/features/auth/api";
import type { Admin } from "@/features/auth/api";
import { ApiError } from "@/lib/api-client";
```

**用状态记录检查结果**

在组件外定义四种检查结果。已登录时保存管理员信息，检查出错时保存提示文字：

```ts
type AuthState =
  | { status: "checking" } // 检查中
  | { status: "authenticated"; admin: Admin } // 已登录
  | { status: "unauthenticated" } // 未登录
  | { status: "error"; message: string }; // 检查失败
```

在 `AdminLayout` 函数体内增加状态：`auth` 保存检查结果，`checkVersion` 用于稍后的重试。已有的 `router` 直接复用，所有 Hook 都放在提前 `return` 之前：

```tsx
const router = useRouter();
const [auth, setAuth] = useState<AuthState>({ status: "checking" });
const [checkVersion, setCheckVersion] = useState(0);
```

**请求 /me，把结果写入状态**

紧接着加入 Effect。它通过 `getCurrentAdmin()` 请求 `/me`：成功保存管理员信息，401 跳转登录页，其他错误交给页面显示。

```tsx
useEffect(() => {
  let active = true; // 本次检查的结果是否还需要处理

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
    active = false; // 卸载或重新检查时，忽略旧请求的结果
  };
}, [router, checkVersion]);
```

**按状态决定显示什么**

`setAuth()` 更新状态后，组件会重新渲染。在原有布局的 `return` 之前加入下面的判断，让检查中、未登录和检查失败先返回对应内容：

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

重试时，把 `auth` 改回 `checking` 显示检查提示，再把 `checkVersion` 加一。Effect 监听这个计数，变化后就重新请求 `/me`。

只有已登录才继续显示原有 Layout 和 `{children}`。在现有 `Header` 的用户位置显示 `<span>{admin.username}</span>`，下一节再接上退出按钮。

`/login` 在 `app/admin` 之外，不会套用这段后台检查。

现在验证：正常刷新时 `/me` 返回 200 后显示后台；删除浏览器 Cookie 再刷新，应跳转登录页；重新登录后停止后端再刷新，应看到重试入口，启动后端并重试应恢复页面。

### 5.4 退出按钮：等待退出成功再跳转

退出按钮先调用 `logout()`，等后端完成 Session 删除和 Cookie 清理，再清空页面中的管理员状态并跳转。请求失败时保留页面、提示重试，避免页面已经显示退出，服务器却仍保留登录记录。

在同一个布局文件中，从 `antd` 增加 `App`、`Space` 导入，从 `@/features/auth/api` 增加 `logout` 导入。下面代码放在组件体内、5.3 的所有提前 `return` 之前：

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

第 14 章的根布局已经通过 `AntdProvider` 提供 `<App>`，因此能用 `App.useApp()` 显示消息。在现有 `Header` 内，把显示用户名的位置替换成下面这一组，保留原来的标题和样式：

```tsx
<Space>
  <span>{admin.username}</span>
  <Button onClick={handleLogout} loading={signingOut}>
    退出登录
  </Button>
</Space>
```

点击退出后，再直接打开 `/admin/articles`，应经过 `/me` 检查回到登录页。

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
   └─ 原有 Layout 的 return
      ├─ Header：标题、admin.username、退出按钮
      ├─ Sider / Menu：原来的导航
      └─ Content：原来的 children
```

### 5.5 处理后台使用过程中的登录失效

布局完成登录检查后，使用期间 Session 仍可能过期。此时页面里的管理员状态不会自动变化，下一次文章或标签请求才会从后端得知凭证已失效。错误会沿着这条路径传到页面：

```text
后端 requireAuth 检查失败 → 返回 401 和错误 JSON
→ 前端 apiRequest() 或 apiListRequest() 抛出带有 status: 401 的 ApiError
→ 列表请求、表单提交或删除操作的 catch 收到错误
```

从 `@/lib/api-client` 导入 `ApiError`，在已有的 `catch` 中判断 `error instanceof ApiError && error.status === 401`：

- 列表加载遇到 401，跳转 `/login`。
- 表单提交遇到 401，提示“登录已失效，请先保留输入并重新登录”，保留抽屉和输入，避免直接跳转丢失编辑内容。
- 删除遇到 401，提示登录已失效，不显示删除成功，也不移除列表数据。
- 其他网络、服务器或业务错误继续使用原来的反馈。

**列表：在加载请求的 catch 中跳转**

在文章、标签页面从 `next/navigation` 导入 `useRouter`，在组件内调用 `const router = useRouter()`。把下面的分支放入 `loadArticles()`、`loadTags()` 的 `catch (error)` 中，位于原有普通错误提示之前；如果已有 `active` 检查，先确认请求结果仍有效，再处理 401：

```ts
if (error instanceof ApiError && error.status === 401) {
  router.replace("/login");
  return;
}
```

这些列表请求位于 Effect 中，所以原有依赖数组也要补上 `router`。文章详情等读取请求遇到 401 时，同样可以在对应的 `catch` 中跳转。

**表单：在提交的 catch 中保留输入**

文章和标签表单仍使用普通 `Form`。在各自 `handleFinish()` 的 `catch` 中加入下面的分支，捕获变量统一命名为 `error`；原来的普通错误提示放在后面，`finally` 中的加载状态恢复保留：

```ts
if (error instanceof ApiError && error.status === 401) {
  setSubmitError("登录已失效，请先保留输入并重新登录");
  return;
}
```

父页面原本就在创建、更新请求成功后才关闭 Drawer；请求失败时不会执行到关闭操作，因此输入会保留。这里的 `return` 只结束本次提交处理，`finally` 仍会执行，按钮会结束加载；错误由原有 `submitError` 显示。

可以在浏览器登录后，用 TablePro 按 `admin_id` 和 `created_at` 找到本次登录产生的 Session，删除这条记录后再操作页面，观察失效反馈。前端 Cookie 此时仍可能存在，但后端已经不会认可它；验证后重新登录。

### 5.6 跑通后再整理：合并重复的请求代码

完成前面的登录、刷新、退出和失效检查后，再回到 `lib/api-client.ts`。三个请求函数都在重复发送请求、携带 Cookie 和判断错误，现在把这些步骤提取为 `requestJson()`，以后只需在一处维护。

**先新增公共函数**

公共函数负责取得完整响应：失败时抛出 `ApiError`，成功为 204 时直接结束，其他成功响应解析 JSON。`S` 描述返回的整份响应类型，由调用它的函数指定。

```ts
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
```

204 分支返回的值是 `undefined`；`as S` 是类型断言，不会生成数据。下面的退出函数用 `void` 指明它不需要返回数据。

**再替换三个原有函数**

保留 `ApiError`、API 地址配置和原有响应类型。下面沿用你现有的文章分页类型 `ApiListSuccess`，只替换三个请求函数的实现：

```ts
export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const body = await requestJson<{ data: T }>(path, options);
  return body.data;
}

export function apiListRequest(
  path: string,
  options?: RequestInit,
): Promise<ApiListSuccess> {
  return requestJson<ApiListSuccess>(path, options);
}

export function apiRequestNoContent(path: string, options?: RequestInit) {
  return requestJson<void>(path, options);
}
```

`apiRequest()` 仍只返回 `data`，`apiListRequest()` 仍返回包含分页信息的完整 JSON，`apiRequestNoContent()` 仍只等待退出完成。页面及 `features/auth/api.ts` 的调用方式无需修改。

整理后再验证登录、分页列表、退出及 401 提示，确认行为与 5.1～5.5 一致。

## 6. 走完完整流程，再进入测试章节

使用浏览器完成一轮：登录 → 新建草稿 → 刷新后台 → 编辑或删除文章 → 退出 → 再访问后台回到登录页。检查 Network 中的请求顺序，并在 TablePro 对照 Session 的创建和删除。

再用 Apifox 不带 Cookie 请求文章、标签接口，应返回 401；写请求仍带准确的 `Origin`，以便真正验证身份检查。匿名请求 `/api/health` 应返回 200。

分别在 `server` 和 `admin-web-antd` 中执行：

```bash
npx tsc --noEmit
```

再在 `admin-web-antd` 中执行 `npm run build`。接口、页面和检查都通过后，回看[第 17 章的流程图](./17-登录Cookie和基本安全.md)，把登录路由、认证中间件、退出路由和前端操作对应起来。然后回到[第 10 章项目总览](./10-MiniCMS项目总览.md)验收阶段 6，再进入[第 18 章](./18-后端测试怎么分层.md)和[第 18A 章](./18A-接口测试实操-用Vitest和Supertest验证API.md)，把这些行为写成自动化测试。

## 官方参考

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [node-argon2：生成与验证密码哈希](https://github.com/ranisalt/node-argon2#usage)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Node.js crypto.randomBytes](https://nodejs.org/docs/latest/api/crypto.html#cryptorandombytessize-callback)
- [MDN：Set-Cookie 与 HttpOnly](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)
- [React：Effect 中的数据请求与清理](https://react.dev/reference/react/useEffect#fetching-data-with-effects)
