# 17A. 登录实操：用数据库 Session 和 HttpOnly Cookie 保护写接口

沿着[第 17 章的流程图](./17-登录Cookie和基本安全.md)，先在 Apifox 中跑通登录、身份验证和退出，再接入浏览器页面。每个阶段完成后立即验证，再继续下一步。

所有实现都放在真实 `mini-cms` 中。下文后端路径相对 `mini-cms/server`，前端路径相对 `mini-cms/admin-web-antd`。开始前确认文章、标签接口和第 16C 章的 ProComponents 后台能正常使用；登录继续接到现有请求封装与布局中。

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

确认 Apifox 允许后续请求携带这条 Cookie。之后所有 `POST`、`PATCH`、`DELETE` 请求都继续设置准确的 `Origin`，否则会先返回 403，尚未进入认证。浏览器页面接入后，`Origin` 由浏览器设置。

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

- 没有字符串形式的 Token、查不到 Session 或 Session 已过期，都抛出 `AppError(401, ...)`。当前函数在这里结束，由已有错误中间件返回 401，业务处理不会继续执行。
- 如果查到了过期记录，顺便用 `deleteMany()` 清理。这里按唯一的 `tokenHash` 删除，最多影响一条记录；记录已不存在时也不会因此报错。

**通过后，把管理员身份交给后续路由**

将查出的 `session.admin` 放进 `response.locals.admin`，后续处理函数就能使用这份身份信息。`locals` 是 Express 提供的对象，只在**当前这次请求**中共享数据；赋值不会写入数据库，也不会自动发送 JSON。

然后调用 `next()`，让 Express 继续执行后面注册的处理函数。下一节会把 `requireAuth` 放在 `/me` 的响应函数前面，由那个函数读取管理员信息并返回 JSON。

理解这三步后，新建 `src/middleware/require-auth.ts`，写入完整实现。`RequestHandler` 是 Express 提供的函数类型，用于标注这里的中间件：

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

在 `auth.routes.ts` 顶部增加 `requireAuth` 导入，在已有登录路由后增加 `/me`。下面的处理按注册顺序执行：`requireAuth` 检查身份并调用 `next()` 后，才会进入后面的响应函数，读取 `response.locals.admin` 并返回 JSON。

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

现在用 Apifox 请求 `GET http://localhost:3001/api/auth/me`：

- 携带第 2 节保存的 Cookie，应返回 200 和管理员信息。
- 关闭该请求的 Cookie 携带，应返回 401；确认 Cookie 管理没有自动补上它。

完成这两个请求后，恢复 Cookie 携带，继续保护业务接口。

### 3.3 接到文章和标签路由

在 `src/app.ts` 顶部增加：

```ts
import { requireAuth } from "./middleware/require-auth";
```

这次把 `requireAuth` 放在整个业务 Router 前面：验证通过并调用 `next()` 后，才进入 `articleRouter` 或 `tagRouter`。把原有文章、标签路由注册替换为：

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

对应图中 **③ 退出**。退出要同时处理服务器和浏览器：**先删除 Session，让旧 Token 失效；再清除 Cookie，让浏览器不再携带它。** 如果只清除 Cookie，旧 Token 对应的数据库记录仍然有效，再次发来仍可能通过认证。

清除 Cookie 使用 `response.clearCookie()`：它发送一个 `Set-Cookie` 响应头，把过期时间设到过去，让浏览器删除 Cookie。名称、`path` 等配置沿用登录时的设置；这里不传保存 7 天的 `maxAge`，过期时间由 `clearCookie()` 设置。[Express：clearCookie](https://expressjs.com/en/5x/api/response/#res.clearCookie)

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

`deleteMany()` 只删除当前 Token 对应的记录，其他设备的登录不受影响；记录不存在也允许继续。最后返回 204，表示退出处理完成，没有响应体。

退出接口不挂 `requireAuth`，这样过期或已被删除的凭证也能完成 Cookie 清理。写请求的 `Origin` 检查仍然执行。

带上 Cookie 和准确的 `Origin` 调用 `POST /api/auth/logout`，确认返回 204、当前 Session 从数据库删除、Apifox 中该 Cookie 被清除；随后请求 `/me` 和文章列表，都应返回 401。再次调用退出接口仍应返回 204。

## 5. 接入前端：把三条请求连到页面操作

后端三条链路已用 Apifox 验证。现在继续修改 `admin-web-antd`，沿用第 16C 章的 ProLayout、ProTable、DrawerForm 和 API 函数。

### 5.1 统一携带 Cookie，并保留错误状态码

第 16 章已经把请求集中到 `lib/api-client.ts`。现在继续修改这个文件，让它支持登录需要的 Cookie、401 错误和退出接口的 204 响应。原来的 `ApiFailure`、`API_BASE_URL`、`apiRequest()` 和 `apiListRequest()` 保留，下面依次调整三个位置。

**让错误同时携带状态码和提示文字**

原来只抛出 `Error(message)`，页面只能拿到文字。现在页面需要知道失败是否由登录失效引起，所以新增 `ApiError`：沿用 `Error` 的 `message`，再通过 `public status` 把传入的 HTTP 状态码保存成对象属性。

```ts
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}
```

例如后端返回 401，请求层就抛出带有 `status: 401` 的 `ApiError`。页面先用 `error instanceof ApiError` 确认错误类型，再读 `error.status`，就能判断是否需要重新登录。

**让公共请求函数携带 Cookie，并分别处理响应**

`fetch` 默认只为同来源请求处理凭证。这里前后端端口不同，要设置 `credentials: "include"`，让浏览器接收登录响应中的 Cookie，并在后续请求中携带它。第一次登录也必须使用这个配置；后端的 `credentials: true` 则允许页面读取带凭证的跨来源响应。[MDN：credentials](https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials)

收到响应后，按下面三种情况处理：

| 响应 | 请求函数怎样处理 |
|---|---|
| 失败，例如 401 | 读取后端错误文案，连同状态码一起放入 `ApiError` 抛出 |
| 成功且为 204 | 没有响应体，直接结束，不调用 `response.json()` |
| 其他成功响应 | 沿用原来的方式解析并返回 JSON |

用下面代码替换原来的 `requestJson()`：

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

`S` 沿用原来“整个成功响应”的类型参数。204 分支中的 `as S` 是类型断言，运行时返回的值仍然是 `undefined`。

**给退出接口准备一个不读取 data 的入口**

原来的 `apiRequest()` 会从 JSON 中取出 `body.data`，而退出接口没有 JSON，所以新增下面的函数。`requestJson<void>` 表示成功后没有业务数据返回，调用方仍然需要 `await` 等待请求完成。

```ts
export function apiRequestNoContent(path: string, options?: RequestInit) {
  return requestJson<void>(path, options);
}
```

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

刷新页面后，React 中的管理员状态会重新初始化，但浏览器仍可能保存着未过期的 Cookie。因此布局挂载时调用 `/me`，让后端检查这份 Cookie 是否仍有效，再返回管理员信息，重新填入页面状态。

把检查放在共用的后台布局中，文章、标签页面就能统一等待身份确认后再显示。请求需要等待，也可能失败，因此页面要区分四种状态：

| 状态 | 页面怎样响应 |
|---|---|
| `checking` | 身份尚未确认，显示检查提示 |
| `authenticated` | `/me` 成功，显示管理员信息和后台内容 |
| `unauthenticated` | `/me` 返回 401，跳转登录页，等待跳转时不显示后台 |
| `error` | 网络或服务器出错，显示重试入口；请求失败尚不能证明用户未登录 |

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

在组件外增加状态类型。`status` 标记当前处于哪一种情况：确认登录后才有 `admin`，检查出错时才有错误文案 `message`。

```ts
type AuthState =
  | { status: "checking" }
  | { status: "authenticated"; admin: Admin }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };
```

在现有 `AdminLayout` 函数体内增加下面的状态：`auth` 保存当前检查结果，初始值为 `checking`；`checkVersion` 是重试计数，后面的 Effect 监听它，数值增加时就重新请求 `/me`。`router` 若已声明就复用；这些 Hook 和原有 Hook 都放在任何提前 `return` 之前：

```tsx
const router = useRouter();
const [auth, setAuth] = useState<AuthState>({ status: "checking" });
const [checkVersion, setCheckVersion] = useState(0);
```

**请求 /me，把结果写入状态**

紧接着加入下面的 Effect。布局初次挂载或 `checkVersion` 变化时，它调用 `getCurrentAdmin()`：成功就把返回的管理员放入 `auth.admin`；401 就转到登录页；其他失败保留重试入口。

这里的 `active` 表示“这次检查的结果是否还需要处理”。组件卸载或开始下一次检查时，清理函数将它设为 `false`，旧请求即使稍后完成，也不再更新状态或触发跳转。它只负责忽略旧结果，不会取消已经发出的请求。

```tsx
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

**按状态决定显示什么**

请求完成后，`setAuth()` 会让组件重新渲染。下面先处理检查中、等待跳转、检查出错三种情况，剩下的已登录状态再显示后台。在原有布局 JSX 的 `return` 之前加入这些分支，ProLayout、菜单和 `{children}` 继续放在它们之后：

重试按钮做两件事：把 `auth` 改回 `checking`，显示检查提示；把 `checkVersion` 加一，触发 Effect 再次请求。只改 `auth` 不会重新执行上面的 Effect，因为它的依赖中没有 `auth`。

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

`/login` 在 `app/admin` 之外，不会套用这段后台检查。

现在验证：正常刷新时 `/me` 返回 200 后显示后台；删除浏览器 Cookie 再刷新，应跳转登录页；重新登录后停止后端再刷新，应看到重试入口，启动后端并重试应恢复页面。

### 5.4 退出按钮：等待退出成功再跳转

退出按钮先调用 `logout()`，等后端完成 Session 删除和 Cookie 清理，再清空页面中的管理员状态并跳转。请求失败时保留页面、提示重试，避免页面已经显示退出，服务器却仍保留登录记录。

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
   └─ 原有 ProLayout 的 return
      ├─ 显示 admin.username、退出按钮
      └─ 原来的菜单和 children
```

### 5.5 处理后台使用过程中的登录失效

布局完成登录检查后，使用期间 Session 仍可能过期。此时页面里的管理员状态不会自动变化，下一次文章或标签请求才会从后端得知凭证已失效。错误会沿着这条路径传到页面：

```text
后端 requireAuth 检查失败 → 返回 401 和错误 JSON
→ 前端 requestJson() 抛出带有 status: 401 的 ApiError
→ 列表的 onRequestError 或提交、删除操作的 catch 收到错误
```

所以这些位置也要判断 `error instanceof ApiError && error.status === 401`，再按当前操作给出反馈：

- 列表的 `onRequestError` 遇到 401，提示登录已失效并跳转 `/login`。
- 表单提交遇到 401，提示“登录已失效，请先保留输入并重新登录”，保留抽屉和输入，`onFinish` 返回 `false`。先保留内容，再由用户重新登录，避免直接跳转丢失编辑内容。
- 删除遇到 401，提示登录已失效，不显示删除成功，也不移除列表数据。
- 其他网络、服务器或业务错误继续使用原来的反馈。

以保留表单输入为例：从 `@/lib/api-client` 导入 `ApiError`，在现有 DrawerForm 的 `onFinish` 回调中，把下面的分支放到 **`catch (error)` 内最前面**，后面的普通错误处理保留：

```ts
if (error instanceof ApiError && error.status === 401) {
  setSubmitError("登录已失效，请先保留输入并重新登录");
  return false;
}
```

`setSubmitError` 沿用现有表单的 Alert 显示错误；`return false` 让 DrawerForm 保留抽屉和输入。这个分支不执行跳转，用户先保留内容，再重新登录。

可以在浏览器登录后，用 TablePro 按 `admin_id` 和 `created_at` 找到本次登录产生的 Session，删除这条记录后再操作页面，观察失效反馈。前端 Cookie 此时仍可能存在，但后端已经不会认可它；验证后重新登录。

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
