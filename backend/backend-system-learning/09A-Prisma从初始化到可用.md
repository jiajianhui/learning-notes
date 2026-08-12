# 09A. Prisma 从初始化到可用：两个文件、两条命令

## 问题背景

第 09 章已经完整跑通了 Docker、PostgreSQL、Prisma 和 Express CRUD。本章不重复具体操作，只收口一个很重要的过程：Prisma 从初始化到能够在业务代码中使用，项目目录发生了什么变化。

先记住主线：

```text
初始化 Prisma
-> 得到 prisma.config.ts 和 prisma/schema.prisma
-> 在 schema.prisma 中配置数据库类型、数据模型和 Client 生成方式
-> migrate 根据 Schema 生成迁移文件并应用到数据库
-> generate 生成 Prisma Client API 和对应的 TypeScript 类型
-> 创建 PrismaClient 实例
-> 业务代码调用数据库
```

---

## 1. 初始化后得到两个核心文件

在服务端工程中初始化 Prisma：

```bash
npx prisma init
```

先从目录角度理解结果：

```text
server/
├── .env
├── .gitignore
├── prisma.config.ts
└── prisma/
    └── schema.prisma
```

这些文件的职责不同：

| 文件 | 负责什么 |
|---|---|
| `.env` | 保存 `DATABASE_URL` 等环境变量 |
| `.gitignore` | 避免把环境变量、依赖和生成代码等内容提交到 Git |
| `prisma.config.ts` | 配置 Prisma CLI 怎样找到 Schema、迁移目录和数据库地址 |
| `prisma/schema.prisma` | 配置数据库类型、数据模型和 Prisma Client 的生成方式 |

其中最重要的是 `prisma.config.ts` 和 `schema.prisma`。前者管理 Prisma 工具怎样运行，后者集中配置数据库类型、数据模型和 Prisma Client 的生成方式。

---

## 2. `prisma.config.ts`：告诉 Prisma CLI 去哪里工作

当前练习工程的核心配置是：

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

可以把它翻译成三句话：

```text
Prisma Schema 文件在哪里？
-> prisma/schema.prisma

把迁移记录保存在哪里？
-> prisma/migrations

数据库连接地址从哪里读取？
-> DATABASE_URL 指向的数据库
```

它主要服务于 `prisma migrate`、`prisma generate` 和 `prisma studio` 等 Prisma CLI 命令。

---

## 3. `schema.prisma`：配置数据库、数据模型和 Client 生成方式

当前工程在 `schema.prisma` 中配置了三类信息。

### 3.1 数据库类型

```prisma
datasource db {
  provider = "postgresql"
}
```

这里说明项目使用 PostgreSQL。

### 3.2 数据模型

```prisma
model Article {
  id      Int    @id @default(autoincrement())
  title   String
  slug    String @unique
  content String

  @@map("articles")
}
```

它描述了代码中的 `Article` 模型，也描述了 PostgreSQL 中 `articles` 表应该具有什么字段和约束。

### 3.3 Prisma Client 的生成方式和位置

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

这段配置告诉 `prisma generate`：把生成的 TypeScript 客户端代码放进 `src/generated/prisma/`。

后面执行 `migrate` 和 `generate` 时，都会读取 `schema.prisma`，但目的不同：

```text
migrate
-> 根据 datasource、model 和 enum 生成并执行数据库迁移

generate
-> 读取 schema.prisma 配置，根据 generator、model 和 enum 生成 Prisma Client API 和 TypeScript 类型
```

---

## 4. `migrate`：把 Schema 变化变成迁移并应用到数据库

执行：

```bash
npm run db:migrate
```

对应的 Prisma 命令是：

```bash
prisma migrate dev
```

从当前练习最容易观察到两项结果：

```text
读取 schema.prisma
-> 根据模型变化生成 migration.sql
-> 在 PostgreSQL 中执行迁移
```

执行后会出现迁移目录：

```text
server/
└── prisma/
    ├── schema.prisma
    └── migrations/
        └── 20260809093507_init_articles/
            └── migration.sql
```

此时项目中新增了迁移记录，PostgreSQL 中也真正建立了 `articles` 表、字段、唯一约束和默认值等结构。

所以，`migrate` 的方向是：

```text
schema.prisma
-> migration.sql
-> PostgreSQL 数据库结构
```

---

## 5. `generate`：生成 Prisma Client API 和 TypeScript 类型

执行：

```bash
npm run db:generate
```

对应的 Prisma 命令是：

```bash
prisma generate
```

它读取 `schema.prisma` 中的模型和 `generator` 配置，生成供 TypeScript/JavaScript 程序使用的 Prisma Client API，以及对应的 TypeScript 类型：

```text
server/
└── src/
    └── generated/
        └── prisma/
            ├── client.ts
            ├── models/
            └── ...
```

生成后，程序可以调用和 `Article` 模型对应的数据库操作方法，例如：

```ts
prisma.article.findMany();
prisma.article.findUnique();
prisma.article.create();
prisma.article.update();
prisma.article.delete();
```

这里生成的是 **Prisma Client API**，不是 Express 的 HTTP API。`GET /articles`、`POST /articles` 等 HTTP 接口仍然需要自己编写。

`src/generated/prisma/` 是根据 Schema 自动生成的目录，不在里面手动修改代码。模型发生变化后，重新执行 `prisma generate` 即可更新它。

所以，`generate` 的方向是：

```text
schema.prisma
-> prisma generate
-> 得到 Prisma Client API 和对应的 TypeScript 类型
```

---

## 6. 创建客户端实例后，业务代码才真正能用

生成 Prisma Client 后，还需要在 `src/data/client.ts` 中创建实例：

```ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const databaseURL = process.env.DATABASE_URL;

if (!databaseURL) {
  throw new Error("DATABASE_URL 不存在");
}

const adapter = new PrismaPg({
  connectionString: databaseURL,
});

export const prisma = new PrismaClient({ adapter });
```

业务代码再导入这个公共实例：

```ts
import { prisma } from "../../data/client";

export function getArticles() {
  return prisma.article.findMany();
}
```

运行时的数据流是：

```text
业务代码
-> Prisma Client API
-> @prisma/adapter-pg
-> pg 驱动
-> PostgreSQL
```

---

## 7. 最终目录怎样对应整个过程

```text
server/
├── .env
│   └── 提供数据库连接地址
│
├── .gitignore
│   └── 忽略环境变量、依赖和生成代码等内容
│
├── prisma.config.ts
│   └── 配置 Prisma CLI
│
├── prisma/
│   ├── schema.prisma
│   │   └── 配置数据库类型、数据模型和 Client 生成方式
│   └── migrations/
│       └── migrate 生成的数据库迁移记录
│
└── src/
    ├── generated/prisma/
    │   └── generate 生成的 Prisma Client 代码
    ├── data/client.ts
    │   └── 创建并导出 PrismaClient 实例
    └── modules/articles/
        └── 调用 prisma.article 完成业务查询和修改
```

---

## 8. 最容易混淆的地方

### `migrate` 和 `generate` 不是一回事

```text
migrate
-> 修改数据库这一侧

generate
-> 生成 Prisma Client API 和对应的 TypeScript 类型
```

这两条命令要分别执行：

```text
npm run db:migrate
-> 更新 PostgreSQL 数据库结构

npm run db:generate
-> 根据 schema.prisma 重新生成 Prisma Client API 和 TypeScript 类型
```

例如给 `Article` 增加一个字段后，只执行 `migrate`，数据库里虽然有了新字段，原来的 Prisma Client API 和 TypeScript 类型还没有同步。继续执行 `generate` 后，程序才能通过新的 Client API 使用这个字段。

### Prisma Client API 不是 HTTP API

```text
prisma.article.create()
-> 服务端代码内部使用的数据库 API

POST /articles
-> 客户端可以请求的 HTTP API
```

Express 路由会接收 HTTP 请求，然后在内部调用 Prisma Client API。
