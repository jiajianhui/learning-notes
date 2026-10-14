# 18A. 测试实操：用 Vitest、Supertest 和独立数据库验证 API

本章在真实 `mini-cms` 中完成：**准备测试库 → 健康检查 → 登录后创建文章 → 补核心场景。** 沿用第 17A 章的接口，不修改前端。

## 1. 准备独立测试数据库

在 `mini-cms/server` 安装测试工具；`dotenv` 沿用已有依赖，若尚未安装，执行 `npm install dotenv`：

```bash
npm install -D vitest supertest @types/supertest
```

修改项目根目录的 `compose.yaml`，把 `postgres-test` 与原来的 `postgres` 放在同一个 `services` 下。合并后的完整配置如下，整个文件只写一次 `services:`：

```yaml
name: mini-cms

services:
  postgres:
    image: postgres:18
    environment:
      POSTGRES_USER: mini_cms
      POSTGRES_PASSWORD: mini_cms_password
      POSTGRES_DB: mini_cms
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql

  postgres-test:
    image: postgres:18
    environment:
      POSTGRES_USER: mini_cms_test
      POSTGRES_PASSWORD: mini_cms_test_password
      POSTGRES_DB: mini_cms_test
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql

volumes:
  postgres_data:
```

在项目根目录启动并确认数据库可以连接：

```bash
docker compose up -d postgres-test
docker compose exec postgres-test pg_isready -U mini_cms_test -d mini_cms_test
```

第二条命令显示 `accepting connections` 后继续；尚未就绪时稍等再检查。测试库使用 5433 端口，与开发库分开。`tmpfs` 中的数据和表结构在容器停止后会丢失，重新启动后要再次执行下面的迁移命令。

新建 `server/.env.test`：

```dotenv
NODE_ENV=test
DATABASE_URL=postgresql://mini_cms_test:mini_cms_test_password@localhost:5433/mini_cms_test?schema=public
ADMIN_WEB_ORIGIN=http://localhost:3000
```

将 `.env.test` 加入 `.gitignore`，另存一份只含本机测试示例值的 `.env.test.example`，供以后重建环境。

## 2. 配置环境检查和测试命令

**以下文件路径和命令均以 `mini-cms/server` 为起点。**

本节新增的三个配置文件统一放在 `tests/`，命令仍在 `server` 中运行。

测试会清理数据，所以先新建 `tests/setup-env.ts`，加载测试配置并确认数据库地址，避免误操作开发库：

```ts
import { config } from "dotenv";

const result = config({ path: ".env.test", override: true });
if (result.error) throw result.error;

const databaseUrl = new URL(process.env.DATABASE_URL ?? "");

if (
  process.env.NODE_ENV !== "test" ||
  databaseUrl.hostname !== "localhost" ||
  databaseUrl.port !== "5433" ||
  databaseUrl.pathname !== "/mini_cms_test"
) {
  throw new Error("测试已停止：只允许连接 localhost:5433/mini_cms_test");
}
```

这段代码按“加载配置 → 拆解地址 → 检查目标”执行：

- `config()` 读取 `path` 指定的 `.env.test`，把变量放入 `process.env`；`override: true` 覆盖已有的同名值。读取失败时，`result.error` 保存错误，`throw` 让执行停止。
- `new URL()` 是 Node.js 内置的地址解析工具。它把连接字符串拆成 `hostname`（主机）、`port`（端口）、`pathname`（数据库路径，含开头的 `/`）；这一步只解析地址。
- 最后的 `if` 要求环境为 `test`、主机为 `localhost`、端口为 `5433`、数据库路径为 `/mini_cms_test`。`||` 表示任何一项不符合就停止。

新建 `tests/prisma.test.config.ts`。它供**测试库迁移命令**使用，告诉 Prisma 表结构在哪里、迁移文件在哪里、连接哪个数据库：

```ts
import "./setup-env";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "../prisma/schema.prisma",
  migrations: {
    path: "../prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
```

`import "./setup-env"` 会先执行 `setup-env.ts` 中的代码：读取 `.env.test`，检查数据库地址。检查通过后，`datasource.url` 使用加载到 `process.env.DATABASE_URL` 中的测试库地址。

`schema` 和 `migrations.path` 从当前配置文件所在的 `tests/` 出发，`../` 回到 `server/`，指向开发库已有的表结构和迁移文件。`defineConfig()` 定义这份 Prisma 配置，`export default` 将它导出，供 Prisma 命令读取。

新建 `tests/vitest.config.ts`。它供**测试运行命令**使用，告诉 Vitest 在什么环境运行、测试前先执行哪个文件：

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup-env.ts"],
    fileParallelism: false,
  },
});
```

这里的 `defineConfig()` 来自 Vitest。`environment: "node"` 表示在 Node.js 中运行；`setupFiles` 在加载每个测试文件前执行环境检查，路径从 `server/` 出发；`fileParallelism: false` 让测试文件依次运行，避免同时清理数据库。

在 `package.json` 的现有 `scripts` 中增加：

```json
{
  "scripts": {
    "db:test:migrate": "prisma migrate deploy --config tests/prisma.test.config.ts",
    "test": "vitest run --config tests/vitest.config.ts",
    "test:watch": "vitest --config tests/vitest.config.ts"
  }
}
```

`--config` 指定使用 `tests/` 中的配置：Prisma 负责给测试库建表，Vitest 负责运行后面的测试代码。

执行迁移，为测试库建表：

```bash
npm run db:test:migrate
```

它会应用已有 `prisma/migrations` 中的迁移，不生成新的迁移文件。成功后再开始写测试。

## 3. 跑通健康检查

新建 `tests/health.test.ts`：

```ts
import request from "supertest";
import { expect, it } from "vitest";
import { app } from "../src/app";

it("健康检查返回 200", async () => {
  const response = await request(app).get("/api/health");

  expect(response.status).toBe(200);
  expect(response.body).toEqual({ server: "server is running" });
});
```

`it()` 定义一条测试；`request(app)` 发出请求；`expect()` 检查响应。不符合预期时，这条测试失败。

```bash
npm test
```

通过说明测试已接上 Express，能访问第 17A 章的公开健康检查。它没有读写数据库，下一节再验证数据库链路。

## 4. 跑通登录后创建文章

先新建 `tests/helpers/reset-database.ts`，清理测试数据：

```ts
import { prisma } from "../../src/db/client";

export async function resetDatabase() {
  await prisma.session.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.article.deleteMany();
  await prisma.admin.deleteMany();
}
```

按外键关系先删 Session、中间表，再删它们关联的数据。

新建 `tests/articles.test.ts`。先只运行下面这条成功测试：

```ts
import argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeEach, expect, it } from "vitest";
import { app } from "../src/app";
import { prisma } from "../src/db/client";
import { resetDatabase } from "./helpers/reset-database";

const origin = "http://localhost:3000";
const username = "admin";
const password = "test-password-123";
const articleInput = {
  title: "测试文章",
  slug: "test-article",
  content: "正文",
  status: "draft",
};

beforeEach(async () => {
  await resetDatabase();
  await prisma.admin.create({
    data: {
      username,
      passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
    },
  });
});

afterAll(async () => {
  await resetDatabase();
  await prisma.$disconnect();
});

async function createLoggedInAgent() {
  const agent = request.agent(app);
  await agent
    .post("/api/auth/login")
    .set("Origin", origin)
    .send({ username, password })
    .expect(200);
  return agent;
}

it("登录后创建文章并返回 201", async () => {
  const agent = await createLoggedInAgent();
  const response = await agent
    .post("/api/articles")
    .set("Origin", origin)
    .send(articleInput);

  expect(response.status).toBe(201);
  expect(response.body.data.slug).toBe(articleInput.slug);

  const article = await prisma.article.findUnique({
    where: { slug: articleInput.slug },
  });
  expect(article).not.toBeNull();
});
```

顺着这次执行理解四点：

- `beforeEach` 在每条测试前清空数据并创建管理员，测试之间不依赖旧数据。
- `request.agent(app)` 保存登录响应中的 Cookie，后续请求自动携带；写请求仍需设置第 17A 章要求的 `Origin`。
- 先检查响应，再查询数据库，确认文章确实保存了。链式 `.expect(200)` 是 Supertest 的状态码检查，`expect(实际值)` 则来自 Vitest。
- `afterAll` 在本文件的测试全部结束后清理数据并断开数据库连接。

```bash
npm test -- tests/articles.test.ts
```

这条测试通过后，再增加下面的场景。

## 5. 补核心场景

在同一个 `tests/articles.test.ts` 末尾增加未登录测试，复用已有变量和准备步骤：

```ts
it("未登录时返回 401", async () => {
  const response = await request(app)
    .post("/api/articles")
    .set("Origin", origin)
    .send(articleInput);

  expect(response.status).toBe(401);
  expect(response.body.error.code).toBe("UNAUTHORIZED");
});
```

这里用普通 `request(app)`，没有登录 Cookie。再照着现有写法，每行新增一个 `it()`：

| 场景 | 怎样准备和请求 | 检查什么 |
|---|---|---|
| slug 重复 | 登录后，用同一份 `articleInput` 连续创建两次 | 第一次 201；第二次 409、`SLUG_CONFLICT` |
| 缺少标题 | 登录后，提交只有 slug、content、status 的请求体 | 422、`VALIDATION_ERROR` |
| 文章不存在 | 登录后创建文章，取响应中的 id，删除它，再 GET 同一个 id | 删除返回 200，最后 GET 返回 404、`ARTICLE_NOT_FOUND` |
| 发布文章 | 登录后创建草稿，再 PATCH 该 id，提交 `{ status: "published" }` | 200，`data.status` 为 `published`，`data.publishedAt` 不为 `null` |

表中四条测试各自调用 `createLoggedInAgent()`；写请求都带 `Origin`。每补一条就运行 `npm test`，不要依赖上一条测试创建的文章。

## 6. 以后怎样使用

平时改完接口，在 `server` 中执行：

```bash
npm test
npx tsc --noEmit
```

需要边改边测时，用 `npm run test:watch`。

**测试容器停止后重新启动**，先在项目根目录启动并确认可连接，再回到 `server` 执行 `npm run db:test:migrate`，最后 `npm test`。模型有变化时，先在开发流程生成并检查迁移、执行 `npx prisma generate`，再同步迁移到测试库。

常见失败先查三处：表不存在就检查迁移；登录后仍是 401 就检查是否复用同一个 agent；写请求返回 403 就检查 `Origin`。

健康检查和上面的六个文章场景都通过、类型检查通过，就完成本章。接口测试不能验证页面跳转，浏览器里的登录、创建和退出仍手动走一遍。

把环境配置、迁移和测试命令补进 Mini CMS README，按[第 10 章](./10-MiniCMS项目总览.md)验收阶段 7。接着学习[第 25～29 章](./25-shadcn-ui为什么不是传统组件库.md)的 shadcn/ui 后台，再用[第 19 章](./19-文章写作预览与内容排版.md)完成写作、预览和公开阅读，最后进入第 20、20A 章准备上线与部署。

## 官方参考

- [Vitest 配置](https://vitest.dev/config/)
- [Supertest](https://github.com/ladjs/supertest)
- [Prisma Config](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [Docker tmpfs](https://docs.docker.com/engine/storage/tmpfs/)
