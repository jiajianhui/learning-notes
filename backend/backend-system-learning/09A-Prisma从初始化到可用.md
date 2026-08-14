# 09A. Prisma 从初始化到可用：一条线看懂

## 问题背景

第 09 章已经完整跑通了 Prisma CRUD。这里不再重复操作，只串起 Prisma 从初始化到被业务代码调用的过程。

这一章也是对 CRUD 实操的快速收口：先用短主线检查自己是否真正理解 Prisma，再到 Mini CMS 中独立复现。

先看整条主线：

```text
prisma init
-> 配置 prisma.config.ts 和 schema.prisma
-> migrate 把模型变成数据库表结构
-> generate 把模型变成 Prisma Client 代码
-> 创建 PrismaClient 实例
-> 业务代码读写数据库
```

## 1. `init`：准备两个核心文件

在服务端工程中执行：

```bash
npx prisma init
```

初始化后，先只关心两个文件：

```text
server/
├── prisma.config.ts
└── prisma/
    └── schema.prisma
```

| 文件 | 作用 |
|---|---|
| `prisma.config.ts` | 告诉 Prisma CLI 去哪里找 Schema、迁移目录和数据库地址 |
| `schema.prisma` | 定义数据库类型、数据模型和 Client 生成位置 |

`.env` 保存 `DATABASE_URL`；`.gitignore` 避免把环境变量和生成的 Prisma Client 提交到 Git。

### `prisma.config.ts`：给 CLI 带路

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env["DATABASE_URL"] },
});
```

这份配置主要回答 Prisma CLI 的三个问题：

- Schema 文件在哪里？
- 迁移记录保存到哪里？
- CLI 要连接哪个数据库？

### `schema.prisma`：作为模型来源

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model Article {
  id      Int    @id @default(autoincrement())
  title   String
  slug    String @unique
  content String

  @@map("articles")
}
```

这份 Schema 则回答另外三个问题：

- 项目使用哪种数据库？
- 数据模型包含哪些字段和约束？
- Prisma Client 按什么方式生成，并保存到哪里？

## 2. `migrate` 和 `generate`：同一份 Schema，走向两边

修改 `schema.prisma` 后，依次执行：

```bash
npm run db:migrate -- --name init_articles
npm run db:generate
```

| 命令 | 产生的结果 |
|---|---|
| `migrate` | 生成 `migration.sql`，并把变化应用到 PostgreSQL |
| `generate` | 生成 Prisma Client API 和对应的 TypeScript 类型 |

它们的方向不同：

```text
schema.prisma
├── migrate  -> prisma/migrations/ -> PostgreSQL 表结构
└── generate -> src/generated/prisma/ -> 程序可调用的 Client
```

Prisma 7 中，`migrate` 不会自动执行 `generate`。所以模型变化后要分别更新数据库结构和 Client 代码。

`src/generated/prisma/` 是自动生成的目录，不在里面手动修改代码。

## 3. 创建实例：让运行中的程序连上数据库

`generate` 只生成了 `PrismaClient` 类，程序还需要创建实例。当前项目把这一步放在 `src/data/client.ts`：

```ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const databaseURL = process.env.DATABASE_URL;

if (!databaseURL) {
  throw new Error("DATABASE_URL 不存在");
}

const adapter = new PrismaPg({ connectionString: databaseURL });

export const prisma = new PrismaClient({ adapter });
```

这段代码按顺序做了三件事：

1. 从 `.env` 读取 `DATABASE_URL`。
2. 把数据库地址交给 `PrismaPg`，创建 PostgreSQL 适配器。
3. 把适配器交给 `PrismaClient`，创建并导出整个项目共用的 `prisma` 实例。

## 4. 业务调用：最终只使用 `prisma`

业务代码导入公共实例：

```ts
import { prisma } from "../../data/client";

export function getArticles() {
  return prisma.article.findMany();
}
```

运行时，请求最终按这条链路到达数据库：

```text
业务代码
-> Prisma Client API
-> @prisma/adapter-pg
-> pg
-> PostgreSQL
```

`prisma.article.findMany()` 是服务端内部使用的数据库 API；`GET /articles` 才是提供给客户端的 HTTP API。Express 路由负责接住 HTTP 请求，再在内部调用 Prisma Client。

## 回看导航

- 不清楚文件职责：回看第 1 节。
- 混淆 `migrate` 和 `generate`：回看第 2 节。
- 不清楚业务代码怎样连上 PostgreSQL：回看第 3、4 节。

## 下一步：把已学基础带入 Mini CMS

能不看第 09 章长篇代码说清下面这条线，demo 就完成了它的任务：

```text
schema.prisma
-> migrate 更新 PostgreSQL
-> generate 生成 Prisma Client
-> 公共 PrismaClient 实例
-> repository 调用 CRUD
```

接下来阅读[第 10 章 Mini CMS 项目总览](./10-MiniCMS项目总览.md)，把这次 CRUD 实操放进完整项目主线，了解 Mini CMS 的目标以及阶段 1～8 怎样推进。然后在独立 `mini-cms` 仓库中完成阶段 1～2。不要直接复制 demo 整个目录；先尝试根据已经理解的主线重新建立，卡住时再回看第 09 章的对应步骤。

第 10 章会总结 demo 已经完成的实操、它还存在的问题，以及 Mini CMS 后续如何逐项解决。从第 11 章开始，新知识只需要在 Mini CMS 中实现一次。
