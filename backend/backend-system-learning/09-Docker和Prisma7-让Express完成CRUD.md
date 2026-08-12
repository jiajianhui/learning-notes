# 09. Docker、TablePro 和 Prisma 7：让 Express 读写 PostgreSQL

## 问题背景

第 07 章介绍了表、列、数据类型和约束，第 08 章介绍了最小 SQL 语句的结构。前两章不要求已经连接数据库或亲手执行 SQL。

这一章会先让 PostgreSQL 真正运行起来，亲手执行一轮 SQL，再用 Prisma 完成项目中的 CRUD。业务代码不需要把每个 CRUD 都改成手写 SQL。

---

## 1. 先分清本章各个工具的职责

### 1.1 SQL 和 PostgreSQL

前两章已经介绍过它们：

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

Prisma 不是数据库，也不是 SQL。它是一套用于 Node.js 后端数据库开发的 ORM 工具；本章的 Express 工程使用 TypeScript：

| 组成 | 负责什么 |
|---|---|
| Prisma Schema | 定义模型、字段、约束和关系 |
| Prisma Client | 提供模型 API，并把调用转换成 SQL |
| Prisma Migrate | 负责数据库结构迁移：根据模型变化生成并执行修改表结构的 SQL |
| Prisma Studio | 在开发阶段查看和编辑数据 |

数据库结构迁移（migration）是指把当前项目连接的 PostgreSQL 数据库从旧表结构更新到新表结构。Prisma Migrate 会根据 `schema.prisma` 的变化生成 SQL，例如第一次为 `Article` 模型创建 `articles` 表，或者模型增加字段后为 `articles` 表增加一列。变化记录保存在 `prisma/migrations/` 中。

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
业务代码
-> Prisma Client API
-> @prisma/adapter-pg
-> pg
-> PostgreSQL
```

业务代码只直接调用 Prisma Client。Prisma Client 负责生成 SQL，适配器负责把 Prisma Client 接到 `pg`，`pg` 再把 SQL 发送给 PostgreSQL。

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

然后在本章独立练习工程 `backend/code-demos/09-prisma-crud/` 的根目录创建 `compose.yaml`。这个 demo 只用于练习第 09 章，不是 Mini CMS：

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

启动数据库时，终端要位于 `compose.yaml` 所在的 demo 根目录，不是后面的 `server/` 目录。如果当前位于 `learning-notes` 根目录，执行：

```bash
cd backend/code-demos/09-prisma-crud
docker compose up -d
docker compose ps
```

Docker Compose 默认会读取当前目录的 `compose.yaml`，所以后面的 `logs`、`stop`、`up` 和 `down` 也都在这个目录执行。

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

| 命令 | 作用 |
|---|---|
| `docker compose logs postgres` | 查看 `postgres` 服务的运行日志，数据库启动失败或连接异常时先看这里 |
| `docker compose stop` | 停止当前 Compose 项目中的容器，但保留容器和数据卷 |
| `docker compose up -d` | 按 `compose.yaml` 确保服务已创建并启动；`-d` 表示在后台运行，终端不会一直被占用 |

Docker Desktop 的启动按钮主要是启动已有容器；`docker compose up -d` 还会读取 `compose.yaml`，容器不存在时会创建，配置发生变化时会按新配置更新。因此，初次启动或修改 `compose.yaml` 后，优先使用 `docker compose up -d`。

`docker compose down -v` 会连同数据卷一起删除，相当于清空本地数据库。只有明确要重置数据时才使用。

---

## 4. 创建 Express + TypeScript 练习工程

先确认电脑当前使用的 Node.js 版本：

```bash
node --version
```

本项目使用 Node.js 22.x，并保持在 22.12.0 或更高版本，以满足后面 Prisma 7 的运行要求。

从 `learning-notes` 根目录创建 `server` 工程：

```bash
cd backend/code-demos/09-prisma-crud
mkdir server
cd server

npm init -y
npm install express
npm install -D typescript tsx @types/node @types/express

npx tsc --init
mkdir src
```

`npm init -y` 使用默认值创建 `package.json`，项目名默认是当前文件夹名 `server`。后续如果想改项目名，修改 `package.json` 中的 `name`，然后执行 `npm i` 同步 `package-lock.json`。

`npx tsc --init` 调用当前项目安装的 TypeScript 编译器，在 `server/` 中生成 `tsconfig.json`。这个文件用来配置当前 TypeScript 工程怎样检查和处理 `.ts` 文件。

两条安装命令分工不同：

- `npm install express` 安装服务器运行时真正使用的 Express，记录到 `dependencies`。
- `npm install -D ...` 安装只在开发和类型检查时使用的工具，记录到 `devDependencies`。

| 开发依赖 | 作用 |
|---|---|
| `typescript` | 提供 TypeScript 编译器和类型检查能力 |
| `tsx`（npm 包） | 直接运行 `.ts` 文件，并在代码变化后重新启动服务器 |
| `@types/node` | 提供 Node.js API 的类型说明 |
| `@types/express` | 提供 Express API 的类型说明 |

这里的 `tsx` 是 npm 包和命令，不是前端常见的 `.tsx` 文件扩展名。当前 Express 后端不写 JSX，所以源文件使用 `.ts`。

TypeScript 安装在当前 `server` 项目的 `node_modules/` 中。可以用下面的命令查看项目内版本，不需要全局安装 TypeScript：

```bash
npx tsc --version
```

在 `package.json` 中启用 ESM，并加入开发命令：

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/app.ts"
  }
}
```

把 `tsconfig.json` 中与本项目相关的选项调整为：

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

| 选项 | 当前作用 |
|---|---|
| `module: "ESNext"` | 使用 `import` 和 `export` |
| `moduleResolution: "bundler"` | 按 `tsx` 的方式查找导入的文件和 npm 包 |
| `target: "ES2023"` | 以 Node.js 22 能运行的现代 JavaScript 为目标 |
| `strict: true` | 开启严格类型检查 |
| `esModuleInterop: true` | 方便导入使用 CommonJS 的 npm 包 |

`tsconfig.json` 只配置当前 TypeScript 工程，不负责配置 Prisma 或 PostgreSQL。

创建 `src/app.ts`，先确认 Express 可以收到请求：

```ts
import express from "express";

const app = express();

app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
```

先启动 Express 服务器：

```bash
npm run dev
```

保持终端中的服务器继续运行，再在浏览器访问 `http://localhost:3000/api/health`。看到 `{"ok":true}`，说明这个 demo 已经是一个可以运行的 Express 项目。这里没有使用 `express-generator`，但使用的框架仍然是 Express。

---

## 5. 安装并初始化 Prisma 7

TypeScript 不是使用 Prisma 的必需项，JavaScript 项目也可以使用 Prisma。本项目选择 TypeScript；Prisma 7 要求 TypeScript 为 5.4.0 或更高版本。第 4 节的 `npm install -D typescript` 已经把 TypeScript 安装在当前 `server` 项目中。

保持终端位于 `server/`，安装 Prisma、PostgreSQL adapter 和驱动：

```bash
npm install @prisma/client@7 @prisma/adapter-pg@7 pg dotenv
npm install -D prisma@7 @types/pg
```

| 包 | 当前作用 |
|---|---|
| `prisma` | 提供 `prisma init`、`migrate`、`generate`、`studio` 等命令 |
| `@prisma/client` | Prisma Client 的运行依赖 |
| `@prisma/adapter-pg` | 把 Prisma Client 接到 PostgreSQL 驱动 |
| `pg` | 与 PostgreSQL 建立连接并传递查询 |
| `@types/pg` | 为 `pg` 提供 TypeScript 类型定义 |
| `dotenv` | 读取 `.env` |

`prisma` 用于执行 `init`、`migrate`、`generate` 和 `studio` 等开发命令；`@types/pg` 用于 TypeScript 类型检查。两者都只在开发阶段使用，因此使用 `-D` 安装。

执行初始化：

```bash
npx prisma init --no-skills
```

`npx prisma init` 会运行当前项目安装的 Prisma CLI，并创建基础配置。当前 Prisma 7 默认使用 PostgreSQL 和 `prisma-client` 生成器；本项目已经存在 `src/`，因此还会自动把 Client 输出位置设为 `../src/generated/prisma`。这里不需要重复指定 `--datasource-provider` 和 `--output`。

`--no-skills` 不是 Prisma 的默认配置，它只是不安装供 AI 编程工具使用的 Prisma Skills，让练习工程保持精简。Prisma 的默认输出目录会参考 `tsconfig.json` 和已有的 `src/`、`lib/` 或 `app/` 目录，因此其他项目初始化后仍应以实际生成的 `schema.prisma` 为准。

执行后主要得到：

```text
server/
├── .env
├── prisma.config.ts
└── prisma/
    └── schema.prisma
```

`.env` 是 Prisma CLI 创建的配置文件；`dotenv` 是读取这个文件的 npm 包。即使没有安装 `dotenv`，`prisma init` 仍会创建 `.env`，但后续读取其中的 `DATABASE_URL` 时需要 `dotenv`。

自动生成的 `output = "../src/generated/prisma"` 从 `server/prisma/` 出发：`..` 先回到 `server/`，再进入 `src/generated/prisma/`。

此时只是完成初始化，Client 代码还没有生成。第 8 节执行 `generate` 后，`src/generated/prisma/` 才会真正出现。

这里使用的是 Docker 中已经运行的 PostgreSQL，因此不执行会创建 Prisma 托管数据库的 `prisma init --db`。

---

## 6. 配置本地 PostgreSQL 连接

第 5 节生成了 `server/.env`。现在把其中的 `DATABASE_URL` 修改为第 3 节 Docker PostgreSQL 的连接信息：

```text
DATABASE_URL=postgresql://backend_learning:backend_learning_password@localhost:5432/backend_learning
```

这个地址的基本结构是 `postgresql://用户名:密码@主机:端口/数据库名`。对照本章的值可以拆成：

| 部分 | 含义 |
|---|---|
| `backend_learning` | PostgreSQL 用户名 |
| `backend_learning_password` | 密码 |
| `localhost` | Express 通过当前电脑访问 Docker 暴露的端口 |
| `5432` | PostgreSQL 对外端口 |
| 最后的 `backend_learning` | 要连接的数据库名称 |

这些值必须与 `compose.yaml` 中的 `POSTGRES_USER`、`POSTGRES_PASSWORD`、`POSTGRES_DB` 和端口保持一致：

```text
Prisma
-> 读取 DATABASE_URL
-> 连接 localhost:5432
-> 进入 Docker 中的 backend_learning 数据库
```

这里填 `localhost`，是因为 Express 目前直接运行在 macOS 上，它通过 `compose.yaml` 暴露的 `5432` 端口访问容器。修改 `.env` 只是告诉 Prisma 去哪里连接，不会自动启动数据库。

真实 `.env` 不提交到 Git。项目可以提交 `.env.example`，只说明需要 `DATABASE_URL`，不要放生产环境的真实密码。

---

## 7. Prisma Schema：同时驱动数据库结构和程序 API

`prisma/schema.prisma` 是 Prisma 的模型来源。它主要回答三个问题：

- 项目使用哪种数据库？
- 数据模型包含哪些字段和约束？
- Prisma Client 按什么方式生成，并保存到哪里？

### 7.1 先定义 Article 模型

第 07 章的 `CREATE TABLE` 用来理解数据库表结构。进入 Prisma 项目后，以 `prisma/schema.prisma` 作为模型定义来源，不要先手动创建一次 `articles` 表，再让 Prisma 重复创建。

修改 `prisma/schema.prisma`：

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

### 7.2 四个代码块分别负责什么

| 代码块 | 作用 |
|---|---|
| `generator client` | 使用 `prisma-client` 生成器，并把 Client 代码保存到 `src/generated/prisma/` |
| `datasource db` | 指定数据库类型为 PostgreSQL；连接地址仍由 `prisma.config.ts` 读取 |
| `enum ArticleStatus` | 把文章状态限制为 `draft` 或 `published` |
| `model Article` | 定义文章的字段、类型和约束 |

模型中的主要写法对应第 07 章学过的数据库规则：

| Prisma 写法 | 表达的数据库规则 |
|---|---|
| `Int @id @default(autoincrement())` | id 是自动增长的主键 |
| `String` | 必填文本 |
| `String?` | 可以是 `NULL` |
| `@unique` | 值不能重复 |
| `@default(draft)` | 没有提供状态时使用草稿 |
| `@map` / `@@map` | 让 Prisma 代码名称和数据库名称分别保持各自的命名习惯 |
| `@db.Timestamptz(3)` | 使用 PostgreSQL 带时区、精确到毫秒的时间类型 |

`@map` 和 `@@map` 都是名称映射，但作用范围不同：

- `@map` 写在字段后面，负责一个字段和数据库列之间的名称对应。例如 `createdAt @map("created_at")` 表示代码使用 `createdAt`，数据库列使用 `created_at`。
- `@@map` 写在 `model` 或 `enum` 内部，负责整个模型、表或枚举的名称对应。例如 `@@map("articles")` 表示代码模型叫 `Article`，数据库表叫 `articles`。

一个 `@` 作用于当前字段，两个 `@@` 作用于当前整个代码块。它们只建立名称对应关系，不是在两个地方复制或搬运数据。

`@updatedAt` 表示通过 Prisma Client 修改文章时，Prisma 自动更新这个时间。它是 Prisma 的行为，不是 PostgreSQL 触发器。

---

## 8. 执行迁移并生成 Prisma Client

Schema 只是模型描述。接下来要把它分别变成数据库表结构和程序可调用的 Client：

```text
schema.prisma
├── migrate  -> prisma/migrations/ -> PostgreSQL 表结构
└── generate -> src/generated/prisma/ -> Prisma Client 代码和类型
```

### 8.1 确认 Prisma CLI 配置

第 5 节执行 `prisma init` 时已经生成了 `prisma.config.ts`。确认内容如下：

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

这个文件回答 Prisma CLI 的三个问题：

- Schema 文件在哪里？
- 迁移记录保存到哪里？
- CLI 要连接哪个数据库？

运行 Prisma 命令时会自动加载这个文件，业务代码不需要手动导入它。

### 8.2 在 package.json 中增加快捷命令

在现有的 `scripts` 中追加三个命令，不要删除第 4 节已经添加的 `dev`：

```json
{
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  }
}
```

左边的 `db:migrate`、`db:generate` 和 `db:studio` 是我们自己取的快捷命令名称；右边才是实际执行的 Prisma 命令。它们只是方便记忆，没有改变 Prisma 的行为。

### 8.3 执行第一次 `migrate` 和 `generate`

保持终端位于 `server/`，依次运行：

```bash
npm run db:migrate -- --name init_articles
npm run db:generate
```

- `db:migrate` 根据 Schema 生成迁移 SQL，并让 PostgreSQL 建立 `articles` 表。
- `db:generate` 根据 Schema 生成 Prisma Client API 和对应的 TypeScript 类型。

第一条命令中的 `--` 表示把后面的 `--name init_articles` 继续传给 Prisma；`init_articles` 是这次迁移的名称。

执行完成后检查两个位置：

| 位置 | 检查什么 |
|---|---|
| `prisma/migrations/..._init_articles/migration.sql` | 对照 Schema 检查生成的表、列和约束 |
| `src/generated/prisma/` | 确认 Client 代码已经生成，不要手动修改其中的文件 |

Prisma 7 中，`migrate` 不会自动执行 `generate`。以后修改 Schema，仍然按这个顺序分别更新数据库结构和 Client 代码。

---

## 9. 用 TablePro 查看数据库并亲手执行 SQL

迁移执行后，`articles` 表已经真正存在于 PostgreSQL 中。现在先不写 Prisma Client 代码，而是使用数据库工具亲手执行第 08 章的 SQL。

TablePro 是 macOS 上的数据库客户端。它不是数据库，也不是 ORM；它负责连接 PostgreSQL、查看表和数据，以及编写和执行 SQL。

可以从 [TablePro 官方页面](https://tablepro.app/) 下载。

### 9.1 连接 Docker 中的 PostgreSQL

在 TablePro 中新建 PostgreSQL 连接，填入与 `compose.yaml` 相同的信息：

| 连接项 | 值 |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Database | `backend_learning` |
| Username | `backend_learning` |
| Password | `backend_learning_password` |

先点击 `Test Connection`。测试成功后点击 `Save & Connect`。如果提示无法连接，回到 `compose.yaml` 所在的 `backend/code-demos/09-prisma-crud/` 目录，使用 `docker compose ps` 确认 PostgreSQL 容器正常运行。

### 9.2 找到 Prisma Migrate 建立的表

连接成功后，在左侧边栏找到 `articles` 表并打开。如果没看到，按 `⌘R` 重新加载，再确认第 8 节的迁移命令已经执行成功。

```text
backend_learning
-> articles
```

打开 `articles` 后，先切换查看表内容和表结构，把其中的列、约束和数据与 `schema.prisma` 和 `migration.sql` 对照起来。

### 9.3 亲手执行一轮 CRUD SQL

在 TablePro 中按 `⌘T` 打开查询标签。按照下面的顺序，每次把光标放在一条 SQL 中，按 `⌘↩︎` 执行当前语句，并观察下方的结果表格。

这次是直接执行 SQL，没有经过 Prisma Client，因此模型中的 `@updatedAt` 不会生效。数据库里的 `updated_at` 又是必填列，所以 `INSERT` 和 `UPDATE` 都要自己写入当前时间。PostgreSQL 的 `CURRENT_TIMESTAMP` 后面不加括号，也可以改用 `NOW()`。

```sql
INSERT INTO articles (title, slug, content, status, updated_at)
VALUES (
  'SQL 练习文章',
  'sql-practice',
  '用 TablePro 亲手执行 SQL',
  'draft',
  CURRENT_TIMESTAMP
)
RETURNING id, title, slug, content, status, created_at, updated_at;

SELECT *
FROM articles
WHERE slug = 'sql-practice';

UPDATE articles
SET title = 'SQL 练习文章（已修改）',
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'sql-practice'
RETURNING id, title, slug, status, updated_at;

DELETE FROM articles
WHERE slug = 'sql-practice'
RETURNING id, title, slug;

SELECT id, title, slug
FROM articles
WHERE slug = 'sql-practice';
```

`INSERT` 中的字段列表决定写入哪些列，`RETURNING` 只决定执行成功后让 PostgreSQL 返回哪些字段。TablePro 会把这些字段显示在下方的结果表格中；如果不写 `RETURNING`，数据仍会改变，但通常只会显示受影响的行数。

`SELECT` 本身就会返回查询结果，所以后面不能再写 `RETURNING`。`SELECT *` 返回匹配记录的全部字段，这里用它检查刚插入的完整文章；`SELECT id, title, slug` 则只返回指定的三个字段，其他字段仍保存在数据库中。实际接口通常只选择需要返回的字段。

这五步分别能看到：

```text
INSERT
-> 文章被创建，并返回刚写入的数据

SELECT
-> 能查到刚创建的文章

UPDATE
-> 标题和 updated_at 发生变化

DELETE
-> 练习数据被删除，并返回被删除文章的基本信息

最后一次 SELECT
-> 返回空结果
```

不要一次运行整段后只看最后结果。这一轮的目标就是亲眼看到每条 SQL 怎样改变数据库。

### 9.4 分清 TablePro、Prisma Studio 和 Prisma Client

```text
TablePro
-> 查看表结构和数据，亲手编写并执行 SQL

Prisma Studio
-> 用可视化界面查看和编辑数据

Prisma Client
-> 让项目代码通过模型 API 读写数据库
```

完成这轮手写 SQL 后，再继续下面的 Prisma Client 代码。

---

## 10. 创建并复用一个 Prisma Client 实例

先创建数据库访问目录：

```bash
mkdir -p src/data
```

创建 `src/data/client.ts`。下面代码与本章 demo 中的实际文件保持一致：

```ts
// 加载 dotenv，读取环境变量
import "dotenv/config";

// PostgreSQL 数据库适配器；项目使用 PostgreSQL，通过 PostgreSQL 驱动连接数据库。
import { PrismaPg } from "@prisma/adapter-pg";

// 导入根据 schema.prisma 生成的客户端
import { PrismaClient } from "../generated/prisma/client";

// 解包环境变量中的 DATABASE_URL
const databaseURL = process.env.DATABASE_URL;

if (!databaseURL) {
  throw new Error("DATABASE_URL 不存在");
}

// 配置 PostgreSQL 连接；创建一个 PostgreSQL 适配器，并把数据库连接地址交给它。
const adapter = new PrismaPg({ connectionString: databaseURL });

// 创建并导出数据库操作对象；创建整个项目共用的 Prisma Client，并把 PostgreSQL 适配器交给它。
export const prisma = new PrismaClient({ adapter });
```

这段代码先通过 `dotenv` 读取 `DATABASE_URL`。如果地址不存在，服务器会在启动阶段明确报错；地址存在时，再让 `PrismaPg` 使用它连接 PostgreSQL，最后通过生成的 `PrismaClient` 类创建并导出一个名为 `prisma` 的实例。其他文件需要读写数据库时，直接导入它：

```ts
import { prisma } from "../../data/client";

const articles = await prisma.article.findMany();
```

在同一次服务器运行期间，各个模块都复用这个 `prisma` 实例：

```text
prisma（PrismaClient 实例）
├── article.findMany()
├── article.create()
└── article.update()

PrismaPg
-> 把这个 PrismaClient 实例接到 PostgreSQL
```

底层会通过连接池管理这些连接。连接池就是预先维护少量可复用连接，避免每次请求都重新建立数据库连接。

不要在每个 route 文件或每次请求中重新执行 `new PrismaClient()`；直接导入 `client.ts` 已经导出的 `prisma` 即可。

---

## 11. 用 Prisma Client 完成文章 CRUD

这一节先编写文章的 CRUD 函数，再把每个函数注册成 Express 路由，跑通完整的增删改查链路。

### 11.1 创建文章数据库操作函数

先创建文章模块目录：

```bash
mkdir -p src/modules/articles
```

创建 `src/modules/articles/article-repository.ts`。下面代码与本章 demo 中的实际文件保持一致：

```ts
import { prisma } from "../../data/client";

// Prisma Client API：
// findMany 查询多篇文章；select 指定返回哪些字段；orderBy 定义查询结果的排序方式

// 查询所有文章
export async function getArticles() {
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

// 查询某篇文章
export async function getArticleById(articleId: number) {
  return prisma.article.findUnique({
    where: {
      id: articleId,
    },
  });
}

// 创建文章
export function createArticle(input: {
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

// 更新文章
export function updateArticle(
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

// 删除某篇文章
export async function deleteArticle(articleId: number) {
  return prisma.article.delete({
    where: {
      id: articleId,
    },
  });
}
```

这五个函数分别对应 Prisma Client 的五种常用操作：

| 函数 | Prisma Client API | 作用 |
|---|---|---|
| `getArticles()` | `findMany()` | 查询文章列表 |
| `getArticleById()` | `findUnique()` | 按 id 查询一篇文章 |
| `createArticle()` | `create()` | 创建文章 |
| `updateArticle()` | `update()` | 修改文章 |
| `deleteArticle()` | `delete()` | 删除文章 |

列表查询中的 `select` 指定返回哪些字段，`orderBy` 定义查询结果的排序方式。`getArticleById()` 找到数据时返回文章对象，没有匹配数据时返回 `null`。通过 Prisma Client 修改文章时，不用手动写 `updatedAt`，模型中的 `@updatedAt` 会自动更新时间。

### 11.2 把 CRUD 注册成 Express 路由

只有被路由调用后，这些函数才会成为浏览器或 Apifox 可以请求的 HTTP API。回到 `src/app.ts`，下面代码来自当前 `09-prisma-crud` demo，只保留健康检查和五个 CRUD 接口的用途注释：

```ts
import express from "express";

const app = express();

app.use(express.json());

import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} from "./modules/articles/article-repository";

// 健康检查接口
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// 获取文章列表接口
app.get("/api/articles", async (_req, res) => {
  const articles = await getArticles();
  res.json({ data: articles });
});

// 查询某篇文章接口
app.get("/api/articles/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: "文章 ID 不正确" });
    return;
  }

  const article = await getArticleById(id);

  if (!article) {
    res.status(404).json({ message: "文章不存在" });
    return;
  }

  res.json({ data: article });
});

// 创建文章接口
app.post("/api/articles", async (req, res) => {
  const article = await createArticle(req.body);

  res.status(201).json({ data: article });
});

// 修改文章接口
app.patch("/api/articles/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: "文章 ID 不正确" });
    return;
  }

  const article = await updateArticle(id, req.body);

  res.status(200).json({ data: article });
});

// 删除某篇文章接口
app.delete("/api/articles/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: "文章 ID 不正确" });
    return;
  }

  const article = await deleteArticle(id);

  res.json({ data: article });
});

app.listen(3000, () => {
  console.log("server is running");
});
```

现在五个 CRUD 地址已经全部注册：

| 请求 | 作用 |
|---|---|
| `GET /api/articles` | 查询文章列表 |
| `GET /api/articles/:id` | 查询一篇文章 |
| `POST /api/articles` | 创建文章 |
| `PATCH /api/articles/:id` | 修改文章 |
| `DELETE /api/articles/:id` | 删除文章 |

请求方法和 Body 格式是两回事：

- `PUT` 通常替换完整数据，`PATCH` 只修改传入的字段。
- `JSON` 和 `x-www-form-urlencoded` 只表示 Body 的数据格式。
- JSON 请求体使用 `express.json()` 解析，`x-www-form-urlencoded` 使用 `express.urlencoded({ extended: true })` 解析；需要同时支持时可以注册两个中间件。
- 当前 demo 注册的是 `PATCH` 路由，并使用 `express.json()`，因此在 Apifox 中选择 `PATCH + JSON`。

可以在浏览器中测试两个 `GET` 地址；`POST`、`PATCH` 和 `DELETE` 建议使用 Apifox。创建文章时，请求体可以先使用：

```json
{
  "title": "学习 Prisma CRUD",
  "slug": "learn-prisma-crud",
  "content": "用 Prisma Client 操作 PostgreSQL"
}
```

这时一条完整链路是：

```text
HTTP 请求
-> Express 匹配路由
-> 调用 article-repository 中的函数
-> Prisma Client 生成并执行数据库操作
-> PostgreSQL 返回结果
-> Express 返回 JSON
```

这一节先直接使用 `request.body` 跑通 CRUD，只练习正常请求链路。请求体校验和数据库错误到 HTTP 状态码的转换，将在第 10 章完成。

---

## 12. Prisma 会把用户输入当作数据，不当作 SQL

使用正常的 Prisma Client API 时，不需要自己拼接 SQL，也不需要自己写 `$1`、`$2` 这样的占位符。

例如修改文章标题：

```ts
await prisma.article.update({
  where: { id: articleId },
  data: { title: input.title },
});
```

这里：

- `update`、`where` 和 `data` 描述要执行什么数据库操作。
- `articleId` 和 `input.title` 是交给 Prisma 的数据。
- Prisma 会安全地把这些数据传给 PostgreSQL，不会把标题内容当成 SQL 命令执行。

因此业务代码不要把用户输入直接拼进原生 SQL：

```ts
// 不要这样写
const sql = `UPDATE articles SET title = '${input.title}'`;
```

还要注意：安全传递数据不等于数据内容合法。空标题、错误的 `slug` 和重复的 `slug` 仍然需要请求校验和数据库约束处理。

---

## 第一轮学到这里就够了

现在已经准备好下面五个 API 需要的数据库操作：

```text
GET    /api/articles
GET    /api/articles/:id
POST   /api/articles
PATCH  /api/articles/:id
DELETE /api/articles/:id
```

本章 demo 已经把五个 CRUD 地址全部注册到 Express，并跑通了 route、repository、Prisma Client 和 PostgreSQL 之间的调用链路。

这一章的重点不是记住 Prisma 的全部 API，而是建立下面的对应关系：

```text
Docker
-> 运行本地 PostgreSQL

schema.prisma
-> 定义数据模型

Prisma Migrate
-> 生成并执行数据库迁移

TablePro
-> 查看本地数据库，并亲手执行 SQL

prisma generate
-> 生成类型安全的 Prisma Client

Prisma Client CRUD
-> 在程序运行时把模型操作转换成 SQL 并执行

Prisma Studio
-> 在开发阶段查看数据
```

完成第 09 章的独立 demo 后，就打开第 21 章，正式创建 `mini-cms` 项目，并先完成实操阶段 1～2。

准备进入 Mini CMS 阶段 3 时，再读第 10、12～13 章，把文章 CRUD、请求校验和错误处理迁移到正式项目，并增加管理页面。等项目需要文章标签时，再学第 11 章的多表关系和事务。

## 官方参考

- [Express 官方安装说明](https://expressjs.com/en/5x/starter/installing/)
- [npm `npx` 命令](https://docs.npmjs.com/cli/commands/npx/)
- [npm `dependencies` 和 `devDependencies`](https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file/)
- [`tsx` 使用说明](https://tsx.is/getting-started)
- [`tsx` watch 模式](https://tsx.is/watch-mode)
- [TypeScript `tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json)
- [Docker PostgreSQL 官方镜像](https://hub.docker.com/_/postgres)
- [TablePro](https://tablepro.app/)
- [TablePro SQL Editor](https://docs.tablepro.app/features/sql-editor)
- [TablePro 快捷键](https://docs.tablepro.app/features/keyboard-shortcuts)
- [Prisma 7 升级说明和运行要求](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7)
- [Prisma 7 初始化命令](https://docs.prisma.io/docs/cli/init)
- [Prisma Config 配置](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [Prisma Client generator](https://docs.prisma.io/docs/orm/prisma-schema/overview/generators)
- [Prisma `@map` 和 `@@map`](https://www.prisma.io/docs/orm/prisma-schema/data-model/database-mapping)
- [Prisma Migrate 开发命令](https://docs.prisma.io/docs/cli/migrate/dev)
- [Prisma CRUD 文档](https://docs.prisma.io/docs/orm/prisma-client/queries/crud)
- [Prisma Studio](https://docs.prisma.io/docs/studio)
- [`pg`（node-postgres）文档](https://node-postgres.com/)
