# 17A. 测试实操：用 Vitest、Supertest 和独立数据库验证 API

## 这一章要完成什么

第 17 章先区分手动检查、产品流程和自动化测试。这一章把 Mini CMS 的核心 API 变成可重复执行的测试：

```text
启动独立测试数据库
-> 执行同一套 Prisma migration
-> Supertest 直接请求 Express app
-> Vitest 检查状态码和响应
-> 每条测试自己准备并清理数据
```

第一轮重点是接口集成测试。它会同时经过：

```text
route
-> middleware
-> controller / service / repository
-> Prisma
-> PostgreSQL 测试数据库
```

这比只测试一个函数慢，但最接近当前 Mini CMS 最重要的风险。

本章继续修改真实 `mini-cms`，测试已有的文章、标签和认证接口；不再复制一套只用于测试的业务代码。

---

## 1. 先把 `app` 和端口监听分开

测试不应该导入一个文件后立刻占用 3001 端口。

`src/app.ts` 只负责组装并导出 Express app：

```ts
import express from "express";

export const app = express();

app.use(express.json());

// 在这里继续注册 CORS、Cookie、路由、404 和错误中间件。
```

新建 `src/server.ts`，只负责真正启动服务：

```ts
import "dotenv/config";
import { app } from "./app";

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

把开发命令改为：

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts"
  }
}
```

Supertest 可以直接接收 `app`，自动使用临时端口，所以运行测试前不需要先启动 `npm run dev`。

---

## 2. 安装测试依赖

在 `mini-cms/server` 中执行：

```bash
npm install -D vitest supertest @types/supertest dotenv-cli
```

如果项目还没有 `dotenv`，同时安装：

```bash
npm install dotenv
```

各自负责：

| 工具 | 用途 |
|---|---|
| Vitest | 组织测试、运行 hooks、提供断言 |
| Supertest | 直接向 Express app 发送 HTTP 测试请求 |
| `dotenv-cli` | 让 Prisma CLI 明确读取 `.env.test` |

---

## 3. 创建完全独立的测试数据库

不要让自动化测试连接开发数据库。测试经常会清空文章、Session 和管理员数据。

在项目根目录的 `compose.yaml` 中增加第二个服务：

```yaml
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

两个数据库的关键区别：

```text
开发数据库
-> localhost:5432 / mini_cms
-> 使用持久化 volume

测试数据库
-> localhost:5433 / mini_cms_test
-> 使用临时文件系统，容器重建后数据可以丢弃
```

启动并确认：

```bash
docker compose up -d postgres postgres-test
docker compose ps
```

---

## 4. 配置 `.env.test`

新建 `.env.test`：

```dotenv
NODE_ENV=test
DATABASE_URL=postgresql://mini_cms_test:mini_cms_test_password@localhost:5433/mini_cms_test?schema=public
ADMIN_WEB_ORIGIN=http://localhost:3000
```

`.env.test` 可以包含本机测试配置，但仍建议加入 `.gitignore`。仓库提交 `.env.test.example`：

```dotenv
NODE_ENV=test
DATABASE_URL=postgresql://用户名:密码@localhost:5433/数据库名?schema=public
ADMIN_WEB_ORIGIN=http://localhost:3000
```

增加一条强制保护。新建 `tests/setup-env.ts`：

```ts
import { config } from "dotenv";

config({ path: ".env.test", override: true });

const rawDatabaseUrl = process.env.DATABASE_URL;

if (!rawDatabaseUrl) {
  throw new Error("测试已停止：缺少 DATABASE_URL");
}

const databaseUrl = new URL(rawDatabaseUrl);

if (databaseUrl.port !== "5433" || databaseUrl.pathname !== "/mini_cms_test") {
  throw new Error("测试已停止：DATABASE_URL 不是 mini_cms_test 数据库");
}
```

这不是为了判断所有数据库地址，而是给当前学习项目加一道明确的防误删护栏。

---

## 5. 让测试库执行同一套 migration

测试库和开发库应该使用同一份 `prisma/migrations`，不要为测试手写另一套表结构。

在 `package.json` 中增加：

```json
{
  "scripts": {
    "db:test:migrate": "dotenv -e .env.test -- prisma migrate deploy",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

执行：

```bash
npm run db:test:migrate
```

`migrate deploy` 会执行仓库里已经存在、但测试数据库还没有执行的 migration。它不会为 Schema 变化自动生成新 migration；模型变化仍然先在开发流程中使用 `migrate dev` 生成并检查。

---

## 6. 配置 Vitest

在 `server` 根目录新建 `vitest.config.ts`：

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

这里暂时关闭测试文件并行，因为多个接口测试文件会清理同一个测试数据库。等以后学会为每个 worker 分配独立 Schema 或数据库，再考虑并行。

---

## 7. 写第一个健康检查测试

新建 `tests/health.test.ts`：

```ts
import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("GET /api/health", () => {
  it("返回服务器状态", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ server: "server is running" });
  });
});
```

运行：

```bash
npm test
```

如果这个测试通过，至少证明：

- 测试能加载环境变量。
- `app.ts` 可以被导入而不自动监听固定端口。
- Supertest 能命中 Express 路由。

---

## 8. 为数据库测试准备统一清理函数

新建 `tests/helpers/reset-database.ts`：

```ts
import { prisma } from "../../src/db/client";

export const resetDatabase = async () => {
  await prisma.session.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.article.deleteMany();
  await prisma.admin.deleteMany();
};
```

删除顺序要遵守外键关系：先删依赖别人的 Session 和中间表，再删 Admin、Article 和 Tag。

如果当前项目还没有 `ArticleTag` 或 `Tag` 模型，就先删除对应两行；测试代码必须和当前阶段已经存在的 Schema 一致。

---

## 9. 用 `request.agent()` 保留登录 Cookie

普通 `request(app)` 每次是一次独立请求。登录后的接口测试需要让多个请求共享 Cookie，因此使用 Supertest agent：

```ts
const agent = request.agent(app);

await agent
  .post("/api/auth/login")
  .set("Origin", "http://localhost:3000")
  .send({ username: "admin", password: "test-password-123" })
  .expect(200);

await agent
  .post("/api/articles")
  .set("Origin", "http://localhost:3000")
  .send({
    title: "测试文章",
    slug: "test-article",
    content: "正文",
    status: "draft",
  })
  .expect(201);
```

agent 会保存登录响应中的 Cookie，并在后面的请求中自动携带。

---

## 10. 写文章接口集成测试

新建 `tests/articles.test.ts`：

```ts
import argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import { prisma } from "../src/db/client";
import { resetDatabase } from "./helpers/reset-database";

const origin = "http://localhost:3000";
const username = "admin";
const password = "test-password-123";

const createAdmin = async () => {
  await prisma.admin.create({
    data: {
      username,
      passwordHash: await argon2.hash(password, {
        type: argon2.argon2id,
      }),
    },
  });
};

const createLoggedInAgent = async () => {
  const agent = request.agent(app);

  await agent
    .post("/api/auth/login")
    .set("Origin", origin)
    .send({ username, password })
    .expect(200);

  return agent;
};

beforeEach(async () => {
  await resetDatabase();
  await createAdmin();
});

afterAll(async () => {
  await resetDatabase();
  await prisma.$disconnect();
});

describe("POST /api/articles", () => {
  it("未登录时返回 401", async () => {
    const response = await request(app)
      .post("/api/articles")
      .set("Origin", origin)
      .send({
        title: "未登录文章",
        slug: "unauthorized-article",
        content: "正文",
        status: "draft",
      });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("登录后创建文章并返回 201", async () => {
    const agent = await createLoggedInAgent();
    const response = await agent
      .post("/api/articles")
      .set("Origin", origin)
      .send({
        title: "第一篇测试文章",
        slug: "first-test-article",
        content: "正文",
        status: "draft",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.slug).toBe("first-test-article");

    const article = await prisma.article.findUnique({
      where: { slug: "first-test-article" },
    });
    expect(article).not.toBeNull();
  });

  it("slug 重复时返回 409", async () => {
    const agent = await createLoggedInAgent();
    const body = {
      title: "重复 slug",
      slug: "duplicate-slug",
      content: "正文",
      status: "draft",
    };

    await agent
      .post("/api/articles")
      .set("Origin", origin)
      .send(body)
      .expect(201);

    const response = await agent
      .post("/api/articles")
      .set("Origin", origin)
      .send(body);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("SLUG_CONFLICT");
  });
});
```

示例与前文保持一致：状态使用小写 `draft`，slug 冲突使用 `SLUG_CONFLICT`。如果你在 Mini CMS 中主动修改了 API contract，就同步修改测试，不要为了照抄示例而改坏已经确定的契约。

---

## 11. 再补三条高价值场景

主链路通过后，再增加：

```text
缺少 title
-> 422
-> error.code 是 VALIDATION_ERROR

GET 不存在的文章
-> 404

登录后发布文章
-> 200
-> status 和 publishedAt 符合业务规则
```

先覆盖成功、无权限、参数错误、数据冲突和不存在，不要一开始追求覆盖率数字。

---

## 12. 常用运行顺序

第一次准备测试环境：

```bash
docker compose up -d postgres-test
npm run db:test:migrate
npm test
```

平时修改接口后：

```bash
npm test
```

开发时持续观察：

```bash
npm run test:watch
```

模型发生变化时：

```text
先在开发流程中生成并检查 migration
-> npx prisma generate
-> npm run db:test:migrate
-> npm test
```

最后做类型检查：

```bash
npx tsc --noEmit
```

---

## 排错顺序

### 测试意外删除开发数据

立刻停止测试，检查：

```text
.env.test 是否被加载
DATABASE_URL 是否包含 mini_cms_test
端口是否是 5433
setup-env.ts 是否在 vitest.config.ts 中注册
```

### 提示表不存在

```bash
npm run db:test:migrate
```

### 登录成功但下一次请求仍然 401

检查是否对同一组请求使用 `request.agent(app)`，以及登录响应是否真的返回 `Set-Cookie`。

### 测试单独运行通过，一起运行失败

通常说明测试共享了旧数据、依赖执行顺序或并行清理互相影响。先确认 `beforeEach` 准备和清理了本测试需要的数据。

---

## 完成标准

- 测试只连接 `mini_cms_test`，不触碰开发数据库。
- 不启动 3001 端口也能运行接口测试。
- 每条测试自己准备前置数据。
- 未登录、创建成功、校验失败、slug 冲突和 404 都能自动验证。
- 修改接口契约造成回归时，`npm test` 会失败并指出具体场景。
- `npm test` 和 `npx tsc --noEmit` 都能通过。

---

## 小结

```text
Vitest
-> 组织场景和断言

Supertest
-> 不启动固定端口也能请求 Express app

独立测试数据库
-> 允许测试自由准备和清理数据，不污染开发环境

request.agent(app)
-> 在多个测试请求之间保存登录 Cookie
```

测试的价值不是“证明现在写完了”，而是让以后修改代码时，旧行为一旦被破坏就能尽早发现。

核心测试和项目 README 都完成后，回到[第 10 章项目总览](./10-MiniCMS项目总览.md)完成阶段 7 验收。下一步进入必做阶段 8：用第 18 章增加公开文章 API、接入个人网站文章详情页并准备生产运行，再用第 18A 章完成真实部署。

## 官方参考

- [Vitest 配置](https://vitest.dev/config/)
- [Vitest `setupFiles`](https://vitest.dev/config/setupfiles)
- [Vitest `fileParallelism`](https://vitest.dev/config/fileparallelism)
- [Supertest](https://github.com/ladjs/supertest)
