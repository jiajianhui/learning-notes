# 09. Docker 和 Prisma 7：让 Express 完成单表 CRUD

## 问题背景

第 07 章已经知道表、列、数据类型和约束，第 08 章也亲手读写过最小 SQL。

从这一章开始，不要求每个 CRUD 都手写 SQL。但在安装工具之前，先逐个认识代码模型、数据库开发工具和底层连接工具分别负责什么。

---

## 1. 先分清本章各个工具的职责

### 1.1 SQL 和 PostgreSQL

前两章已经用过它们：

```text
SQL
-> 描述查询和修改数据的语言

PostgreSQL
-> 保存数据并执行 SQL 的数据库软件
```

无论业务代码是否手写 SQL，PostgreSQL 最终执行的都是 SQL。

### 1.2 先认识对象关系映射

ORM 负责在代码模型和数据库表之间建立对应关系：

| 代码中的概念 | 关系型数据库中的概念 |
|---|---|
| `Article` 模型 | `articles` 表 |
| `article.id` 字段 | `id` 列 |
| 一条 Article 数据 | 表中的一行 |

Prisma 这类 ORM 会把模型方法转换成 SQL：

```text
代码中的模型和方法
-> ORM 转换
-> 关系型数据库能够执行的 SQL
```

ORM 没有替代 PostgreSQL，也没有让 SQL 消失。它只是让业务代码通过模型 API 表达查询和修改，底层仍然由 PostgreSQL 执行 SQL。

### 1.3 Prisma：这一章选择的 ORM 工具

Prisma 不是数据库，也不是 SQL。它是一套用于 TypeScript 数据库开发的 ORM 工具：

| 组成 | 负责什么 |
|---|---|
| Prisma Schema | 定义模型、字段、约束和关系 |
| Prisma Client | 提供模型 API，并把调用转换成 SQL |
| Prisma Migrate | 根据模型变化生成和执行表结构修改 SQL |
| Prisma Studio | 在开发阶段查看和编辑数据 |

这里的“迁移”不是搬运文章数据，而是把建表、加列、增加约束等结构变化保存成有顺序的 SQL 文件，再应用到数据库。

这一章使用 Prisma 7，所以业务代码主要调用 `prisma.article.findMany()`、`create()`、`update()` 和 `delete()`，而不是直接拼接 SQL 字符串。

### 1.4 连接 Node.js 与 PostgreSQL 的数据库驱动

`pg` 是 PostgreSQL 在 Node.js 中使用的数据库驱动。它主要负责：

```text
建立和复用数据库连接
-> 把 SQL 和参数发送给 PostgreSQL
-> 接收 PostgreSQL 返回的结果
```

`pg` 不负责定义 Prisma 模型，也不负责生成迁移。只使用 `pg` 时，通常需要自己写 SQL；使用 Prisma 7 时，`pg` 留在更底层负责通信。

### 1.5 驱动适配器：连接 Prisma 与 `pg`

`@prisma/adapter-pg` 的作用是把 Prisma Client 与 `pg` 接起来：

```text
Express 中的业务代码
-> 调用 Prisma Client 的模型 API
-> Prisma Client 生成 SQL
-> @prisma/adapter-pg 把 Prisma 接到 pg
-> pg 发送 SQL 和参数
-> PostgreSQL 执行 SQL 并返回结果
```

把职责压缩成一句话：

```text
Prisma 负责“生成什么 SQL”
pg 负责“把 SQL 送过去”
PostgreSQL 负责“执行 SQL 并保存数据”
```

第一轮只要先理解这条链路，不需要研究 ORM 内部怎样生成 SQL。

---

## 2. 它和 SwiftData 有什么相似之处

如果以前使用过 SwiftData，可以先这样建立对应关系：

| SwiftData | Prisma |
|---|---|
| `@Model class Article` | `model Article` |
| `ModelContext` | `PrismaClient`，只是大致对应 |
| `modelContext.insert()` | `prisma.article.create()` |
| fetch / `@Query` | `findMany()` / `findUnique()` |

两者都是先定义模型，再通过模型 API 把数据长期保存下来。

但它们并不完全相同：SwiftData 会跟踪内存模型的变化，再由 context 保存；调用 Prisma 的 `create`、`update` 和 `delete` 时，Prisma 会生成并执行相应 SQL，也不会自动让前端页面刷新。

---

## 3. 先用 Docker 运行 PostgreSQL

Docker 可以根据配置启动一个隔离的运行环境，用来运行 PostgreSQL。先分清四个词：

| 名词 | 现在先怎么理解 |
|---|---|
| image（镜像） | 创建运行环境时使用的只读模板，例如 `postgres:18` |
| container（容器） | 根据镜像真正启动出来的运行环境 |
| volume（数据卷） | 独立保存数据库数据的存储位置，容器重建后仍可保留 |
| Docker Compose | 读取配置文件，并按文件中的说明管理容器 |

Docker Compose 的配置文件通常叫 `compose.yaml`。`.yaml` 是一种用缩进表达层级的配置文件格式；这里不需要系统学习 YAML 语法，只要按示例保持缩进即可。

这套路线不要求先把 PostgreSQL 直接安装进 macOS。先安装 [Docker Desktop](https://docs.docker.com/desktop/)，启动后确认命令可用：

```bash
docker --version
docker compose version
```

然后在后端练习工程的根目录创建 `compose.yaml`：

```yaml
services:
  postgres:
    image: postgres:18
    environment:
      POSTGRES_USER: backend_learning
      POSTGRES_PASSWORD: backend_learning_password
      POSTGRES_DB: backend_learning
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql

volumes:
  postgres_data:
```

这里固定 PostgreSQL 的主版本，避免以后拉取镜像时突然跨大版本变化。上面的用户名和密码只用于本地学习环境。

启动数据库：

```bash
docker compose up -d
docker compose ps
```

现在发生的是：

```text
postgres 镜像
-> 创建并启动 PostgreSQL 容器

5432:5432
-> 让电脑上的 Express 可以访问容器

postgres_data
-> 容器重建后仍然保留数据库数据
```

常用命令先记三个：

```bash
docker compose logs postgres
docker compose stop
docker compose up -d
```

`docker compose down -v` 会连同数据卷一起删除，相当于清空本地数据库。只有明确要重置数据时才使用。

---

## 4. 配置数据库地址

在 `server/.env` 中保存：

```text
DATABASE_URL=postgresql://backend_learning:backend_learning_password@localhost:5432/backend_learning
```

这段地址可以拆成：

```text
backend_learning
-> 用户名

backend_learning_password
-> 密码

localhost:5432
-> 数据库地址和端口

最后一个 backend_learning
-> 数据库名称
```

真实 `.env` 不提交到 Git。项目提交 `.env.example`，只说明需要哪些变量，不放线上真实密码。

---

## 5. 安装并初始化 Prisma 7

先确认运行环境：

```bash
node --version
npx tsc --version
```

Prisma 7 至少需要 Node.js 20.19.0 和 TypeScript 5.4.0。这套项目直接使用 Node.js 22.x，并保持 ESM 配置：

```json
{
  "type": "module"
}
```

`tsconfig.json` 至少保持下面这些相关选项：

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2023",
    "strict": true,
    "esModuleInterop": true
  }
}
```

如果第 02～04 章的 Express 工程已经采用这套 ESM 配置，不要重复创建工程，只继续安装依赖。

在 `server` 工程安装：

```bash
npm install @prisma/client@7 @prisma/adapter-pg@7 pg dotenv
npm install -D prisma@7 @types/pg
```

这些包的职责不同：

| 包 | 当前作用 |
|---|---|
| `prisma` | 提供初始化、生成、迁移和 Studio 命令 |
| `@prisma/client` | Prisma Client 的运行依赖 |
| `@prisma/adapter-pg` | Prisma 7 使用的 PostgreSQL 驱动适配器 |
| `pg` | adapter 底层使用的 PostgreSQL 驱动 |
| `dotenv` | 读取 `.env` |

初始化：

```bash
npx prisma init \
  --datasource-provider postgresql \
  --output ../src/generated/prisma
```

主要会得到：

```text
server/
├── prisma/
│   └── schema.prisma
├── prisma.config.ts
└── .env
```

这里连接的是 Docker 中已经运行的 PostgreSQL，不需要执行 `prisma init --db`，也不需要创建 Prisma 托管数据库。

---

## 6. 用 Prisma Schema 定义 `articles` 表

第 07 章的 `CREATE TABLE` 只用于理解表结构。实际使用 Prisma 时，以 `prisma/schema.prisma` 和迁移文件为准，不要先手动建一次表，再让 Prisma 重复创建。

修改 `prisma/schema.prisma`：

下面代码先分成四块读：`generator` 决定怎样生成 Prisma Client，`datasource` 指定使用 PostgreSQL，`enum` 声明固定选项，`model Article` 定义文章模型。

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum ArticleStatus {
  draft
  published

  @@map("article_status")
}

model Article {
  id        Int           @id @default(autoincrement())
  title     String
  slug      String        @unique
  summary   String?
  content   String
  status    ArticleStatus @default(draft)
  createdAt DateTime      @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt DateTime      @updatedAt @map("updated_at") @db.Timestamptz(3)

  @@map("articles")
}
```

`enum ArticleStatus` 只允许 `draft` 和 `published`，对应第 07 章对文章状态的限制。

这不是另学一套数据库概念，而是把第 07 章的表结构写成 Prisma 模型：

| Prisma 写法 | 表达的数据库规则 |
|---|---|
| `generator client` | 指定怎样生成 Prisma Client |
| `datasource db` | 指定使用 PostgreSQL 数据源 |
| `Int @id @default(autoincrement())` | id 是自动增长的主键 |
| `String` | 必填文本 |
| `String?` | 可以是 `NULL` |
| `@unique` | 值不能重复 |
| `@default(draft)` | 没有提供状态时使用草稿 |
| `@map` / `@@map` | 代码使用驼峰命名，数据库保留下划线命名 |

`@updatedAt` 表示通过 Prisma Client 修改文章时，Prisma 自动更新这个时间。它是 Prisma 的行为，不是 PostgreSQL 触发器。

---

## 7. 生成迁移和 Prisma Client

`prisma.config.ts` 使用 Prisma 7 的配置方式读取数据库地址：

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

在 `package.json` 增加：

```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  }
}
```

第一次建立表：

```bash
npm run db:migrate -- --name init_articles
npm run db:generate
```

两个命令负责不同的结果：

```text
prisma migrate dev
-> 根据 schema.prisma 生成并执行 prisma/migrations 中的迁移 SQL

prisma generate
-> 根据模型生成类型安全的 Prisma Client
```

Prisma 7 的 `migrate dev` 不再自动执行 `prisma generate`，所以修改模型后要显式运行生成命令。

打开 `prisma/migrations/.../migration.sql`，把它和第 07～08 章学过的表、列、约束和 SQL 对照起来。生成目录 `src/generated/prisma` 不要手动修改。

开发时还可以运行：

```bash
npm run db:studio
```

Prisma Studio 用于在开发阶段查看和编辑数据库数据，不能代替自己开发的管理页面。

---

## 8. 创建一份 Prisma Client

创建 `src/db/client.ts`：

```ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({ adapter });
```

整个应用只创建并复用这一份 `prisma`：

```text
PrismaClient
-> 提供和 Article 模型对应的类型安全 API

PrismaPg
-> 使用 pg 连接并复用 PostgreSQL 连接
```

底层会通过连接池管理这些连接。连接池就是预先维护少量可复用连接，避免每次请求都重新建立数据库连接。

不要在每个 route 或每次请求中重新 `new PrismaClient()`。

---

## 9. 用 Prisma Client 完成查询和创建

### 查询文章列表

`findMany()` 表示查询多条记录，`select` 选择要返回的字段，`orderBy` 指定排序方式：

```ts
import { prisma } from "../../db/client.js";

export async function listArticles() {
  return prisma.article.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
```

对应第 08 章的概念仍然是：

```text
select
-> 返回哪些字段

findMany
-> 查询多行

orderBy
-> 按创建时间倒序排列
```

### 按 id 查询一篇文章

```ts
export async function findArticleById(articleId: number) {
  return prisma.article.findUnique({
    where: {
      id: articleId,
    },
  });
}
```

找到时返回文章对象，没有匹配数据时返回 `null`，再由上层转换成 404。

### 创建文章

`create()` 表示创建一条记录，`data` 是要写入数据库的字段和值：

```ts
export async function createArticle(input: {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  status?: "draft" | "published";
}) {
  return prisma.article.create({
    data: input,
  });
}
```

`prisma.article.create()` 对应 SQL `INSERT`，并直接返回数据库最终创建的文章。

---

## 10. 用同一种方式完成修改和删除

### 修改文章

```ts
export async function updateArticle(
  articleId: number,
  input: {
    title?: string;
    slug?: string;
    summary?: string | null;
    content?: string;
    status?: "draft" | "published";
  },
) {
  return prisma.article.update({
    where: {
      id: articleId,
    },
    data: input,
  });
}
```

这里不用手动写 `updatedAt`，因为模型已经声明了 `@updatedAt`。

### 删除文章

```ts
export async function deleteArticle(articleId: number) {
  await prisma.article.delete({
    where: {
      id: articleId,
    },
  });
}
```

---

## 11. 把 Prisma 错误转换成 API 错误

Prisma 会给常见数据库错误分配固定代码。单表 CRUD 先识别下面两个：

```text
P2002
-> 唯一约束冲突，例如 slug 已存在
-> API 返回 409

P2025
-> update 或 delete 需要的目标不存在
-> API 返回 404
```

其他未知数据库故障由服务器记录细节，客户端只接收 500，不直接看到 Prisma 原始错误。

---

## 12. 参数化查询现在由 Prisma 完成

参数化查询表示“SQL 结构”和“用户提供的值”分开传递。这样用户输入只会被当成数据，不会被当成 SQL 语法执行。

直接使用 `pg` 写 SQL 时，通常用 `$1`、`$2` 作为值的位置，再把真实值单独传入。使用 Prisma Client 时，不需要自己写这些占位符；Prisma 会把 `data` 和 `where` 中的值作为参数交给数据库驱动。

例如：

```ts
await prisma.article.update({
  where: { id: articleId },
  data: { title: input.title },
});
```

可以按下面的关系理解：

```text
查询结构
-> 由 Prisma Client API 表达

用户输入
-> 作为值传给 Prisma，再交给 PostgreSQL
```

业务代码不要为了“灵活”再把用户输入拼进原生 SQL 字符串。以后确实需要原生 SQL 时，也必须继续使用参数化能力。

---

## 第一轮学到这里就够了

现在应该能够完成：

```text
GET    /api/articles
GET    /api/articles/:id
POST   /api/articles
PATCH  /api/articles/:id
DELETE /api/articles/:id
```

这一章的重点不是记住 Prisma 的全部 API，而是建立下面的对应关系：

```text
Docker
-> 运行本地 PostgreSQL

schema.prisma
-> 定义数据模型

Prisma Migrate
-> 生成并执行数据库迁移

prisma generate
-> 生成类型安全的 Prisma Client

Prisma Client CRUD
-> 生成并执行 CRUD 对应的 SQL

Prisma Studio
-> 在开发阶段查看数据
```

第一轮直接打开第 20 章开始实操；项目做到阶段 3 时再读第 11～12 章。需要文章标签时，再回来学习第 10 章的多表关系和事务。

## 官方参考

- [Docker PostgreSQL 官方镜像](https://hub.docker.com/_/postgres)
- [Prisma 7 升级说明和运行要求](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7)
- [Prisma 7 初始化命令](https://docs.prisma.io/docs/cli/init)
- [Prisma Client generator](https://docs.prisma.io/docs/orm/prisma-schema/overview/generators)
- [Prisma Migrate 开发命令](https://docs.prisma.io/docs/cli/migrate/dev)
- [Prisma CRUD 文档](https://docs.prisma.io/docs/orm/prisma-client/queries/crud)
- [Prisma Studio](https://docs.prisma.io/docs/studio)
- [`pg`（node-postgres）文档](https://node-postgres.com/)
