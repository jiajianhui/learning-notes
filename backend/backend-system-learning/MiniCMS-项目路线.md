# Mini CMS（轻量内容管理系统）项目路线

## 问题背景

CMS 全称是 Content Management System，即内容管理系统。Mini CMS 只保留文章管理、标签和登录等核心功能。

第 01～08 章负责建立后端技术地图，第 09 章 demo 负责第一次跑通 Docker、PostgreSQL、Prisma 和单表 CRUD，09A 负责快速复习和收口。这份路线负责把已学知识连成一个可以操作的真实项目：

```text
用 Node.js + Express + Prisma 7 + PostgreSQL 写内容 API
-> 用 Next.js + Ant Design 做管理后台
-> 完成一个可以管理文章的 Mini CMS
```

这不是新的知识章节，而是项目的任务、进度和验收清单。读完 09A 就可以开始；后面遇到新任务时，再按各阶段的链接回看对应章节。`12A` 始终是选读。

第 09 章 demo 不会继续跟着这份路线成长。从阶段 3 开始，所有新知识和新功能只在独立 `mini-cms` 仓库中实践。

## 1. 代码放在哪里

学习文档和产品代码分开：

```text
learning-notes/
└── backend/backend-system-learning/
    └── 保存学习文档和实操路线

mini-cms/
├── .git/        整个项目共用一份 Git 历史
├── server/      Express 后端
└── admin-web/   Next.js 管理后台
```

`server` 和 `admin-web` 各自有依赖和启动命令，但同属一个 Mini CMS，所以放在同一个 Git 仓库里。不要在两个子目录里再次运行 `git init`。

等进入阶段 1 时再创建 `mini-cms` 仓库，现在不需要提前生成代码。

## 2. 默认技术路线

```text
后端：Node.js 22.x + Express + TypeScript
本地数据库：Docker + PostgreSQL
数据库访问：Prisma 7 + @prisma/adapter-pg + pg
请求校验：Zod
管理后台：Next.js + TypeScript + Ant Design
接口检查：Apifox
自动化测试：Vitest + Supertest
```

开发时，`admin-web` 默认使用 `http://localhost:3000`，`server` 使用 `http://localhost:3001`，PostgreSQL 通常使用 `localhost:5432`。

整条数据流是：

```text
Next.js 管理后台
-> HTTP 请求 Express API
-> Express 校验参数和业务规则
-> Prisma Client 生成带参数的 SQL
-> @prisma/adapter-pg 通过 pg 发送 SQL
-> PostgreSQL 查询或保存数据
-> Express 返回状态码和 JSON
-> 管理后台更新页面状态
```

这个项目中，Next.js 只负责管理页面；所有业务接口都由 Express 提供，Next.js 不直接连接 PostgreSQL。PostgreSQL 用来练习表、约束、关系、查询和事务；Prisma 负责让 Express 中的业务代码读写数据库。

## 3. 项目蓝图：按阶段增加，不要同时做

八个实操阶段可以先理解成三条大主线：

| 大主线 | 包含阶段 | 完成结果 |
|---|---|---|
| 后端基础闭环 | 1～3 | Express、PostgreSQL、Prisma、CRUD、Zod 和错误处理稳定可用 |
| 产品能力闭环 | 4～6 | 管理页面、标签多表关系和管理员登录完成 |
| 工程化与上线 | 7～8 | 核心 API 可自动验证，项目可复现并可向个人网站提供内容 |

| 阶段 | 交付结果 | 关键实现 |
|---|---|---|
| 1 | Express 能接住请求 | 完成服务器和健康检查接口 |
| 2 | PostgreSQL 真正保存文章 | 建立 `articles` 表，用 TablePro 查看和操作数据，用 Prisma 查询文章列表 |
| 3 | 文章 CRUD API 稳定可用 | 完成文章 CRUD，用 Zod 校验请求并统一处理错误 |
| 4 | 文章管理页面形成闭环 | 创建 Next.js 管理后台，完成文章列表、新建、编辑和删除 |
| 5 | 标签、筛选、分页和发布规则可用 | 建立文章标签多对多关系，完成标签管理、关联查询、筛选分页、发布撤回和事务更新 |
| 6 | 管理员登录和写接口保护完成 | 建立管理员和 Session 数据，用 Cookie 与认证中间件保护管理接口 |
| 7 | 核心 API 可自动验证，项目可复现 | 增加自动化测试、README 和项目复盘 |
| 8（可选） | 个人网站可以读取已发布内容 | 提供已发布文章 API，接入个人网站并完成部署 |

阶段 2 的 `articles` 先包含：

```text
id
title
slug
summary
content
status
created_at
updated_at
```

到阶段 5 再增加发布时间和标签关系。封面只保存图片 URL，不在项目中实现文件上传。

所有页面都要根据当前功能处理 `loading`、`empty`、`error` 和 `success` 状态，以及删除确认、表单校验失败和登录失效。后台视觉只要求结构清楚、操作顺手，不再做新的视觉临摹。

### 范围边界

- 只做一个管理员，不做公开注册和多角色权限矩阵。
- 正文使用普通多行文本或 Markdown，不做富文本编辑器。
- 不做评论、点赞、收藏、全文搜索引擎和云存储。
- 不为了架构形式机械拆很多层。
- 发布和撤回先作为文章状态更新，基本 CRUD 稳定后再决定是否拆成独立接口。
- 不在 Mini CMS 主体完成前替换现有个人网站的数据来源。

## 4. 八个实操阶段

这份路线是 Mini CMS 项目任务和进度的唯一来源。从阶段 1 开始，一次只完成一个阶段。

### 阶段 1：让 Express 接到第一个请求

开始前回看：

- [01-后端大图景](./01-后端大图景-页面背后的系统.md)
- [02-Node.js](./02-Nodejs-让JavaScript运行在服务器.md)
- [03-HTTP](./03-HTTP-一次请求到底带了什么.md)
- [04-Express](./04-Express-路由和中间件怎样接住请求.md)

完成：

- 创建独立的 `mini-cms` Git 仓库。
- 创建 `server` 工程和 TypeScript 开发环境。
- 使用 Node.js 22.x，并把工程配置为 ESM。
- 跑通 `GET /api/health`。
- 用 Apifox 检查正常响应和不存在路径。

验收：

- 能独立启动服务器，修改路径或响应字段时知道改哪里。
- 能解释 `request`、`response`、route 和 middleware 的关系。
- 知道路由同时匹配 HTTP 方法和完整路径，一次请求只发送一次响应。
- `express.json()` 注册在需要读取 body 的路由之前。

### 阶段 2：用 Docker、TablePro 和 Prisma 7 接入 PostgreSQL

开始前回看：

- [05-异步和错误](./05-异步流程和错误处理.md)
- [06-API 设计和校验](./06-API设计和参数校验.md)
- [07-表结构和约束](./07-关系型数据库-表结构和约束.md)
- [08-SQL CRUD](./08-SQL-用CRUD查询和修改数据.md)
- [09-Docker、TablePro 和 Prisma 7](./09-Docker和Prisma7-让Express完成CRUD.md)
- [09A-Prisma 从初始化到可用](./09A-Prisma从初始化到可用.md)

完成：

- 安装 Docker Desktop，并用 `compose.yaml` 启动 PostgreSQL。
- 配置 `DATABASE_URL` 和 `.env.example`。
- 安装 `@prisma/client@7`、`prisma@7`、`@prisma/adapter-pg` 和 `pg`。
- 用 `schema.prisma` 定义 `Article` 模型。
- 执行 Prisma Migrate，打开迁移 SQL 对照表、列和约束。
- 用 TablePro 连接本地 PostgreSQL，并在 SQL Editor 中执行一轮 `INSERT / SELECT / UPDATE / DELETE`。
- 显式执行 `prisma generate`，创建并复用一份 `PrismaClient`。
- 用 `prisma.article.findMany()` 实现 `GET /api/articles`。

验收：

- `docker compose ps` 能看到 PostgreSQL 正常运行。
- TablePro 连接的数据库名、用户名和端口与 `compose.yaml` 一致。
- 重启服务器后数据仍然存在，TablePro 和 API 能看到同一条数据。
- 能不看完整示例写出最小 CRUD SQL。
- 修改模型时知道按 `migrate -> 检查 SQL -> generate` 执行，不手动修改生成的 Client。
- 能区分服务器没启动、数据库没运行、迁移没执行、Client 没重新生成和查询写错。

### 阶段 3：完成可靠的文章 CRUD API

开始前回看：

- [10-请求校验和统一错误处理](./10-请求校验和统一错误处理.md)
- [11-后端项目结构](./11-后端项目怎么拆文件.md)

完成：

```text
GET    /api/articles
GET    /api/articles/:id
POST   /api/articles
PATCH  /api/articles/:id
DELETE /api/articles/:id
```

- 用 Zod 校验请求参数，并统一错误结构。
- 处理 404、409、422 和 500 等状态码。
- 增加错误处理中间件，并按文章模块组织后端代码。

验收：

- Prisma 的 `update` 和 `delete` 都有明确的 `where`，用 `data` 传入数据，不拼接用户输入。
- 处理 `findUnique()` 的 `null`，并把 Prisma `P2002` 和 `P2025` 分别转成 409 和 404。
- `Article` 使用 `@updatedAt` 管理更新时间。
- 能用 Apifox 验证文章的新建、查询、编辑和删除，也能看到可理解的错误响应。

### 阶段 4：完成文章管理页面

开始前回看：

- [12-Next.js 管理后台](./12-Nextjs管理后台怎样接Express.md)

完成：

```text
/admin/articles
/admin/articles/new
/admin/articles/[id]/edit
```

- 创建 `admin-web` Next.js 工程。
- 配置只允许开发管理后台来源的 CORS。
- 完成文章列表、新建、编辑和删除确认。
- 处理 `loading`、`empty`、`error` 和 `success` 状态。

验收：

- 前端检查 `response.ok`，字段名、状态码和错误结构与 API 约定一致。
- 能在管理后台新建文章，经过 Express 校验后保存到 PostgreSQL，并继续编辑或删除。
- 同一接口既能在 Apifox 中检查，也能在管理后台中使用。
- Next.js 只请求 Express API，不直接连接 PostgreSQL。

### 阶段 5：增加标签、状态和事务

开始前回看：

- [13-数据关系、JOIN 和事务](./13-数据关系JOIN和事务.md)

完成：

- 创建 `tags` 和 `article_tags` 表，建立文章和标签的多对多关系。
- 完成标签接口和 `/admin/tags` 管理页：

```text
GET    /api/tags
POST   /api/tags
PATCH  /api/tags/:id
DELETE /api/tags/:id
```

- 完善草稿、发布和撤回规则。
- 增加 `publishedAt`，数据库列通过 `@map("published_at")` 使用 `published_at`。
- 增加标题、状态和标签筛选，以及分页和按创建时间排序。
- 更新文章和标签关系时使用 nested write 或事务。

业务规则：

- slug 不能重复。
- 草稿可以没有发布时间，发布时写入发布时间。
- 删除标签不能误删文章。
- 不存在的文章返回 404。
- 筛选和分页由后端执行。

验收：

- 能解释文章、标签和关联表为什么这样设计。
- 能用 nested write 清楚表达的关联创建优先用 nested write。
- 自定义多步修改放进 `prisma.$transaction()`，函数内的 Prisma 操作全部使用 `tx`。
- 关联更新失败时事务会回滚，外键删除规则与产品行为一致。
- 违反约束时返回可理解的业务错误。

### 阶段 6：增加真正的管理员登录

开始前回看：

- [14-登录、Cookie 和安全](./14-登录Cookie和基本安全.md)
- [14A-管理员登录实操](./14A-管理员登录实操-用Session和Cookie保护写接口.md)

完成：

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

- 创建 `admins` 和 `sessions` 表。
- 密码只保存哈希。
- Session Token 由服务器随机生成，数据库只保存 Token 哈希和过期时间。
- 用 HttpOnly Cookie 保存原始 Token，并增加认证中间件。
- 配置 CORS 和 Cookie credentials。
- 保护草稿管理数据以及文章和标签的写接口。
- 增加 `/login` 页面和前端登录状态。

验收：

- 前端请求设置 `credentials`，后端 CORS 同时允许准确来源和凭证。
- 后端认证中间件保护写接口，不能只隐藏前端按钮。
- 写请求检查准确的 `Origin`；Cookie 在生产 HTTPS 环境启用 `Secure`。
- Cookie、Token 和密钥不进入日志或浏览器可见环境变量。
- 数据库中没有明文密码，也没有可直接当作 Cookie 使用的原始 Session Token。
- 未登录请求受保护接口时返回 401；登录后刷新仍能识别管理员，退出后不能继续操作。

### 阶段 7：补自动化测试和项目说明

开始前回看：

- [15-后端测试](./15-后端测试怎么分层.md)
- [15A-接口测试实操](./15A-接口测试实操-用Vitest和Supertest验证API.md)

完成：

- 配置 Vitest 和 Supertest，使用独立测试数据库。
- 增加环境变量检查、基础请求日志和错误日志。
- 写清 Mini CMS README：安装、环境变量、Docker、Prisma Migrate、Prisma Client 生成、`server` 和 `admin-web` 的启动顺序。
- 记录项目复盘。

优先测试：

- 创建文章成功。
- 缺少必填字段时失败。
- slug 重复时失败。
- 查询不存在文章时返回 404。
- 未登录时不能修改文章。
- 登录后可以发布文章。

验收：

- 每条测试自行准备并清理所需数据，不污染开发数据库。
- 真实 `.env` 不进入 Git，README 只引用 `.env.example`。
- 不打开浏览器也能验证核心 API，旧行为被破坏时测试会提醒。
- 新环境按照 README 可以启动项目。

### 阶段 8：把内容提供给个人网站，可选

开始前回看：

- [16-运行和部署](./16-从开发环境到线上运行.md)

可以继续：

- 提供只返回已发布文章的公开 API。
- 让个人网站读取文章列表和详情。
- 渲染 Markdown 正文，并接入封面图片地址。
- 完成部署。

这是 Mini CMS 主体完成后的迁移阶段，不影响前七个阶段的完成。

## 5. 每个功能按同一套流程做

```text
1. 写清用户要完成什么
2. 设计请求和响应
3. 调整 Prisma Schema，生成并检查迁移，再生成 Prisma Client
4. 用 Express 实现接口
5. 用 Apifox 检查正常和错误情况
6. 接到 Next.js 管理后台
7. 进入阶段 7 后补核心自动化测试
```

可以使用 AI 工具搭骨架、解释报错和帮助重构，但每完成一个阶段都要能回答：

```text
请求从哪个文件进入？
数据在哪里校验？
业务代码调用了什么 Prisma Client 方法？
错误为什么返回这个状态码？
前端拿到结果后怎样更新？
```

忘记函数名或配置写法时可以查文档或问 AI，不要求脱离工具手写全部代码。

## 6. 怎样判断项目完成

先走通一条完整的产品链路：

```text
管理员登录
-> 新建一篇草稿
-> 设置标签
-> 编辑正文
-> 发布文章
-> 在列表中筛选到它
-> 撤回或删除
```

同时满足：

- 所有正式内容都保存在 PostgreSQL 中。
- 参数错误、未登录和资源不存在都有明确响应。
- 管理后台有完整的 `loading`、`empty`、`error` 和 `success` 状态。
- 核心接口既能用 Apifox 检查，也有自动化测试。
- Mini CMS README 写清安装、环境变量、建表和启动方式。
- 能解释一次请求从 Next.js 到 PostgreSQL 再返回的完整过程。

每个阶段结束只问四个问题：

```text
能运行？
能操作？
能解释？
能验证？
```

四个答案都是“能”，再继续下一个阶段。
