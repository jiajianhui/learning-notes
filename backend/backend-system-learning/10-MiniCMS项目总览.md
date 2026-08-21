# 10. 从 CRUD 实操到 Mini CMS：项目总览与实操路线

第 09 章的 demo 是一次阶段性实操：学完 Node.js、Express、SQL、Docker 和 Prisma 的基础后，先用一套小代码完整跑通文章 CRUD。09A 再把 Prisma 主线快速复习一遍。

接下来，学习主线进入最终落地项目 Mini CMS。前面练过的基础会先在 Mini CMS 中独立应用，后续章节再逐步增加校验、错误处理、管理页面、标签、登录、测试和部署。

本章负责总览 Mini CMS 的项目目标、功能范围、阶段划分和后续章节。第一次阅读先看完整体路线；以后每完成一个阶段，再回来对照验收标准。

## 1. demo 已经完成了什么

第 09 章已经完成下面这次练习：

```text
Docker 启动 PostgreSQL
-> Prisma Schema 定义 Article
-> Prisma Migrate 建立 articles 表
-> Prisma Client 读写数据库
-> Express 注册文章 CRUD 接口
-> Apifox 验证正常请求
```

代码也形成了最小请求链路：

```text
HTTP 请求
-> app.ts 匹配路由
-> article-repository.ts 调用 Prisma Client
-> PostgreSQL 查询或修改数据
-> Express 返回状态码和 JSON
```

这次练习解决的是一个学习问题：第 01～08 章的概念比较多，只读容易觉得自己会了，真正动手时却不容易写出来。第 09 章因此提供一次完整跟练，把分散的知识第一次连成可运行的单表 CRUD。

所以，demo 的完成标志不是做成一个内容管理系统，而是能说清并跑通上面两条链路。

```text
第 01～08 章学习基础
-> 第 09 章完成一次 CRUD 实操
-> 09A 复习 Prisma 主线
-> 第 10 章总览 Mini CMS
-> 按阶段持续完善 Mini CMS
```

如果 `mini-cms` 已经完成阶段 1～2，不需要重做；对照本章的验收标准确认后，直接进入阶段 3。

## 2. demo 还存在哪些问题

第 09 章 demo 只跑通了单表 CRUD 的正常流程，还不是一个完整的内容管理系统。它现在存在的问题，就是 Mini CMS 后续要逐项解决的问题：

| demo 当前情况 | 存在的问题 | Mini CMS 怎样解决 |
|---|---|---|
| `request.body` 直接传给 repository | 空标题、错误 slug 和多余字段可能进入数据库操作 | 使用 Zod 校验请求 |
| route 分别手写错误响应，Prisma 错误没有统一转换 | 客户端拿到的错误结构不稳定 | 增加 `AppError` 和错误中间件 |
| 路由、响应和 `app.listen()` 集中在 `app.ts` | 功能增加后难以寻找和测试 | 按文章模块拆分职责 |
| 只有 API，没有操作页面 | 还不能完成真实的文章管理流程 | 增加 Next.js 管理后台 |
| 只有 `articles` 一张表 | 还不能练习标签关系、筛选和事务 | 增加标签和多表关系 |
| 写接口没有身份检查 | 任何客户端都可以尝试修改内容 | 增加管理员登录和认证中间件 |
| 主要依赖 Apifox 手动验证 | 修改代码后容易漏掉旧行为 | 增加自动化测试 |
| 只能在本地运行，启动条件只在开发者脑中 | 项目难以复现，个人网站也还不能读取正式内容 | 补齐配置与启动说明，再增加公开 API 和部署流程 |

因此，Mini CMS 不是再做一遍无变化的 CRUD，而是以这条基础链路为起点，逐步补齐可靠性、页面、多表关系、登录、测试和部署。

## 3. Mini CMS 项目全览

CMS 全称是 Content Management System，即内容管理系统。Mini CMS 只保留文章管理、标签和管理员登录等核心功能：

```text
用 Node.js + Express + Prisma 7 + PostgreSQL 写内容 API
-> 用 Next.js 分别完成 Ant Design 和 shadcn/ui 两个管理后台
-> 完成一个可以管理和发布文章的小型内容系统
```

### 3.1 代码放在哪里

学习文档和产品代码分开：

```text
learning-notes/
└── backend/backend-system-learning/
    └── 保存学习文档和实操路线

mini-cms/
├── .git/        整个项目共用一份 Git 历史
├── server/      Express 后端
├── admin-web-antd/     Ant Design 后台项目
└── admin-web-shadcn/   shadcn/ui 后台项目
```

三个子工程各自有依赖和启动命令，但同属一个 Mini CMS，所以放在同一个 Git 仓库里。不要在子目录里再次运行 `git init`。

第一次按这套路线实践时，在本章创建 `mini-cms` 仓库。`admin-web-antd` 到阶段 4 才创建，不需要提前生成空工程。`admin-web-shadcn` 在共享 API 和 Ant Design 项目稳定后创建。这个顺序用于降低同时学习两套 UI 的难度，不代表两个前端项目有主次。

### 3.2 默认技术路线和请求链路

```text
后端：Node.js 22.x + Express + TypeScript
本地数据库：Docker + PostgreSQL
数据库访问：Prisma 7 + @prisma/adapter-pg + pg
请求校验：Zod
管理后台 A：Next.js + TypeScript + Ant Design
管理后台 B：Next.js + TypeScript + shadcn/ui + TanStack Table + React Hook Form
接口检查：Apifox
自动化测试：Vitest + Supertest
```

开发时，`admin-web-antd` 默认使用 `http://localhost:3000`，`server` 使用 `http://localhost:3001`，`admin-web-shadcn` 使用 `http://localhost:3002`，PostgreSQL 通常使用 `localhost:5432`。

整条数据流是：

```text
任一 Next.js 管理后台
-> HTTP 请求 Express API
-> Express 校验参数和业务规则
-> Prisma Client 生成带参数的 SQL
-> @prisma/adapter-pg 通过 pg 发送 SQL
-> PostgreSQL 查询或保存数据
-> Express 返回状态码和 JSON
-> 管理后台更新页面状态
```

这个项目中，Next.js 只负责管理页面；所有业务接口都由 Express 提供，Next.js 不直接连接 PostgreSQL。PostgreSQL 用来练习表、约束、关系、查询和事务；Prisma 负责让 Express 中的业务代码读写数据库。

## 4. Mini CMS 项目阶段总览

八个实操阶段可以先理解成三条大主线：

| 大主线 | 包含阶段 | 完成结果 |
|---|---|---|
| 后端基础闭环 | 1～3 | Express、PostgreSQL、Prisma、CRUD、Zod 和错误处理稳定可用 |
| 产品能力闭环 | 4～6 | 管理页面、标签多表关系和管理员登录完成 |
| 工程化与上线 | 7～8 | 核心 API 可自动验证，项目可复现并可向个人网站提供内容 |

阶段 1～2 先把已学基础应用到 Mini CMS，阶段 3 开始继续增加新的项目能力：

| 阶段 | 要解决的问题 | 完成目标 | 对应章节 |
|---|---|---|---|
| 1 | 先建立独立的 Mini CMS 工程 | Express 能接住请求 | 第 01～04 章 |
| 2 | 把 PostgreSQL 接入文章接口 | 文章基础 CRUD 接口可以读写真实数据 | 第 05～09A 章 |
| 3 | 基础 CRUD 只覆盖正常流程，失败响应不稳定 | Zod 请求校验、统一错误和后端结构可用 | 第 11、11A、12 章 |
| 4 | 只有 API，没有产品操作入口 | Ant Design 后台完成文章 CRUD 闭环 | 第 13、14 章 |
| 5 | 只有单表文章，没有标签和发布规则 | 多表关系、筛选分页、发布撤回和事务可用 | 第 06、08、15 章 |
| 6 | 写接口没有身份保护 | 管理员登录、Cookie 和认证中间件可用 | 第 16、16A 章 |
| 7 | 主要依赖手动检查，项目不易复现 | 核心 API 可自动验证，README 可以指导启动 | 第 17、17A 章 |
| 8（可选） | 内容只能在本地管理 | 个人网站读取已发布内容，并完成部署 | 第 06、18 章 |

八个阶段组织共享后端和产品能力，两个前端项目则是并列交付：

| 前端项目 | 目录 | 主要章节 | 完成要求 |
|---|---|---|---|
| A：Ant Design | `admin-web-antd` | 第 13 章过渡，第 14 章跟练，并跟随阶段 5～6 补齐功能 | 完成登录、文章和标签管理 |
| B：shadcn/ui | `admin-web-shadcn` | 第 23～27 章 | 完成同等核心链路，并掌握 TanStack Table、React Hook Form |

项目 A 先实现，项目 B 后实现。顺序用于控制学习难度，最终验收时两者地位相同。

第 13A 章只比较 Next.js 自带服务端能力和独立 Express 的边界，是架构选读，不属于任何项目阶段。

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

页面只处理与当前功能有关的状态：请求数据时处理 `loading`、`error` 和 `success`，列表页额外处理 `empty`，删除操作增加确认，表单显示校验失败，受保护页面处理登录失效。后台视觉只要求结构清楚、操作顺手，不再做新的视觉临摹。

### 范围边界

- 只做一个管理员，不做公开注册和多角色权限矩阵。
- 正文使用普通多行文本或 Markdown，不做富文本编辑器。
- 不做评论、点赞、收藏、全文搜索引擎和云存储。
- 不为了架构形式机械拆很多层。
- 发布和撤回先作为文章状态更新，基本 CRUD 稳定后再决定是否拆成独立接口。
- 不在 Mini CMS 主体完成前替换现有个人网站的数据来源。

## 5. 八个实操阶段与双前端项目

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
- 跑通 `GET /api/articles/health`。
- 用 Apifox 检查正常响应和不存在路径。

验收：

- 能独立启动服务器，修改路径或响应字段时知道改哪里。
- 知道 `app.get("/api/articles/health", handler)` 定义了一个只匹配 `GET /api/articles/health` 的路由。
- 知道健康检查没有读取请求数据，只通过 `res.json()` 返回 JSON。
- 用其他 HTTP 方法或不存在的路径请求时，不会进入这个路由的 handler。

### 阶段 2：接入 PostgreSQL 并完成基础文章 CRUD

开始前回看：

- [05-异步和错误](./05-异步流程和错误处理.md)
- [06-API 设计和校验](./06-API设计和参数校验.md)
- [07-表结构和约束](./07-关系型数据库-表结构和约束.md)
- [08-SQL CRUD](./08-SQL-用CRUD查询和修改数据.md)
- [09-Docker、TablePro 和 Prisma 7](./09-Docker和Prisma7-让Express完成CRUD.md)
- [09A-Prisma 从初始化到可用](./09A-Prisma从初始化到可用.md)

完成：

- 确认第 09 章已安装的 Docker Desktop 可用，并在 `mini-cms` 仓库中用 `compose.yaml` 启动 PostgreSQL。
- 配置 `DATABASE_URL` 和 `.env.example`。
- 安装 `@prisma/client@7`、`prisma@7`、`@prisma/adapter-pg` 和 `pg`。
- 用 `schema.prisma` 定义 `Article` 模型。
- 执行 Prisma Migrate，打开迁移 SQL 对照表、列和约束。
- 用 TablePro 连接本地 PostgreSQL，并在 SQL Editor 中执行一轮 `INSERT / SELECT / UPDATE / DELETE`。
- 显式执行 `prisma generate`，创建并复用一份 `PrismaClient`。
- 在写接口之前注册 `express.json()`，让 JSON 请求体可以从 `request.body` 读取。
- 用 Prisma Client 完成五个基础文章接口：

```text
GET    /api/articles
GET    /api/articles/:id
POST   /api/articles
PATCH  /api/articles/:id
DELETE /api/articles/:id
```

这一阶段先跑通正常的新建、查询、修改和删除流程。请求校验和统一错误留到阶段 3。

验收：

- `docker compose ps` 能看到 PostgreSQL 正常运行。
- 真实 `.env` 已忽略，仓库中有不包含真实密码的 `.env.example`，用来说明 `DATABASE_URL` 等必需变量。
- TablePro 连接的数据库名、用户名和端口与 `compose.yaml` 一致。
- 重启服务器后数据仍然存在，TablePro 和 API 能看到同一条数据。
- 能不看完整示例写出最小 CRUD SQL。
- 修改模型时知道按 `migrate -> 检查 SQL -> generate` 执行，不手动修改生成的 Client。
- 能用 Apifox 跑通文章的新建、查询、修改和删除，并在 TablePro 中看到对应数据变化。
- Prisma 的 `update` 和 `delete` 都有明确的 `where`，用 `data` 传入修改内容，不拼接用户输入。
- `Article` 使用 `@updatedAt` 管理更新时间。

### 阶段 3：为基础 CRUD 补上请求校验和统一错误

开始前回看：

- [11-请求校验和统一错误处理](./11-请求校验和统一错误处理.md)
- [11A-错误处理中间件拆解](./11A-错误处理中间件怎样接住不同错误.md)
- [12-后端项目结构](./12-后端项目怎么拆文件.md)

完成：

- 用 Zod 校验路径参数和请求体，只让合法数据进入 repository。
- 增加 `AppError`、404 中间件和统一错误中间件。
- 把 Prisma `P2002` 和 `P2025` 等已知错误转换成稳定的 409 和 404 响应。
- 统一处理 404、409、422 和 500 等失败结果。
- 在错误流程稳定后，把启动文件和文章路由从 `app.ts` 中拆开。

验收：

- 空标题、错误 slug、非法 id 和多余字段不会进入 repository，并返回可理解的 422 响应。
- 重复 slug 返回 409，文章不存在返回 404，未知错误统一返回 500。
- 错误响应使用统一 JSON 结构，不向客户端暴露 Prisma 错误或堆栈。
- 阶段 2 已经跑通的文章 CRUD 接口仍然可用，正常流程没有被破坏。
- 能沿着 article Router、Schema、Repository 和错误中间件追踪一次请求和失败响应。

### 阶段 4：完成 Ant Design 文章管理页面

这是 Mini CMS 的前端起点。第 13 章先讲清前后端之间的 HTTP 边界和两个前端项目总览，第 14 章再创建真实 `admin-web-antd`，不会新建临时前端 demo。

开始前回看：

- [13-前后端怎样通过 HTTP 协作](./13-前后端怎样通过HTTP协作.md)
- [14-Ant Design 管理后台跟练](./14-Ant-Design管理后台跟练.md)

完成：

```text
/admin/articles
/admin/articles/new
/admin/articles/[id]/edit
```

- 创建 `admin-web-antd` Next.js 工程。
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

- [06-API 设计和校验](./06-API设计和参数校验.md)
- [08-SQL CRUD](./08-SQL-用CRUD查询和修改数据.md)
- [15-数据关系、JOIN 和事务](./15-数据关系JOIN和事务.md)

标签自身的 CRUD 复用阶段 2 的文章 CRUD 做法，标签管理页复用阶段 4 的页面流程。本阶段真正新增的是发布规则、多表关系、关联查询和事务。

完成：

- 创建 `tags` 和 `article_tags` 表，建立文章和标签的多对多关系。
- 完成标签接口和 `admin-web-antd` 中的 `/admin/tags` 管理页：

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

本阶段新增的业务规则：

- 标签 slug 不能重复。
- 草稿的 `publishedAt` 为 `null`；发布时写入当前时间，撤回时重新设为 `null`。
- 删除标签不能误删文章。
- 筛选和分页由后端执行。

验收：

- 能解释文章、标签和关联表为什么这样设计。
- 标签的新建、查询、修改和删除都能通过 API 和管理页面完成。
- 文章发布时会写入 `publishedAt`，撤回后状态恢复为草稿且 `publishedAt` 恢复为 `null`。
- 标题、状态、标签筛选和分页都由 API 执行，管理页面只提交查询条件并展示结果。
- 能用 nested write 清楚表达的关联创建优先用 nested write。
- 自定义多步修改放进 `prisma.$transaction()`，函数内的 Prisma 操作全部使用 `tx`。
- 关联更新失败时事务会回滚，外键删除规则与产品行为一致。
- 标签 slug 重复、标签不存在或关联失败时，返回可理解的业务错误。

### 阶段 6：增加真正的管理员登录

开始前回看：

- [16-登录、Cookie 和安全](./16-登录Cookie和基本安全.md)
- [16A-管理员登录实操](./16A-管理员登录实操-用Session和Cookie保护写接口.md)

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
- 使用认证中间件保护管理后台使用的文章、标签读写接口；阶段 8 之前不另外提供公开内容 API。
- `POST /api/auth/login` 和幂等的退出接口不使用 `requireAuth`，`GET /api/auth/me` 必须通过认证。
- 在 `admin-web-antd` 中增加 `/login` 页面和前端登录状态。

验收：

- 前端请求设置 `credentials`，后端 CORS 同时允许准确来源和凭证。
- 未登录请求无法读取管理后台使用的文章和标签数据，也无法调用写接口；不能只隐藏前端按钮。
- 写请求检查准确的 `Origin`；Cookie 在生产 HTTPS 环境启用 `Secure`。
- Cookie、Token 和密钥不进入日志或浏览器可见环境变量。
- 数据库中没有明文密码，也没有可直接当作 Cookie 使用的原始 Session Token。
- 未登录请求受保护接口时返回 401；登录后刷新仍能识别管理员，退出后不能继续操作。

### 阶段 7：补自动化测试和项目说明

开始前回看：

- [17-后端测试](./17-后端测试怎么分层.md)
- [17A-接口测试实操](./17A-接口测试实操-用Vitest和Supertest验证API.md)

完成：

- 配置 Vitest 和 Supertest，使用独立测试数据库。
- 为测试命令增加数据库环境检查，防止测试误连开发数据库。
- 提供 `.env.test.example`，并让测试库执行与开发库相同的迁移。
- 写清 Mini CMS README：安装、环境变量、Docker、Prisma Migrate、Prisma Client 生成、`server` 和 `admin-web-antd` 的启动顺序。

优先测试：

- 健康检查成功。
- 未登录时不能创建或修改文章。
- 登录后创建文章成功。
- 登录后提交缺少必填字段或重复 slug 的文章时失败。
- 登录后查询不存在文章时返回 404。
- 登录后可以发布文章。

验收：

- 每条测试自行准备并清理所需数据，不污染开发数据库。
- 真实 `.env` 和 `.env.test` 不进入 Git，README 只引用 `.env.example` 和 `.env.test.example`。
- 不打开浏览器也能验证核心 API，旧行为被破坏时测试会提醒。
- 新环境按照 README 可以启动项目。

### 并列前端项目 B：shadcn/ui 管理后台

这是 Mini CMS 双前端目标中的必做项目。它不编号为第 9 个阶段，是因为没有增加新的后端业务能力，而是用同一套 API 完成第二种前端实现。

```text
完成 Ant Design 后台项目
-> 再完成 shadcn/ui 后台项目
-> 比较封装程度、状态管理和自定义方式
```

开始条件：

- 阶段 4～6 已经完成，Ant Design 后台项目可以独立操作。
- 文章、标签和登录 API 的 contract 已经稳定。
- 优先完成阶段 7 的自动化测试和 README，避免两个前端同时变化时难以判断问题来源。

阅读顺序：

```text
23 -> 24 -> 25 -> 25A -> 26 -> 26A -> 27
```

完成：

- 创建独立的 `admin-web-shadcn`，使用 3002 端口。
- 复用同一个 Express API、Cookie 登录和 PostgreSQL 数据。
- 完成后台骨架、文章列表、文章新建和编辑。
- 独立完成标签管理，作为知识迁移练习。
- 用相同功能记录 Ant Design 和 shadcn/ui 的真实代码差别。

两个项目的共同边界：

- `admin-web-antd` 和 `admin-web-shadcn` 是两个并列的管理后台项目，都要完成核心功能。
- 两个前端共享 API contract，不共享 UI 组件源码。
- 不复制 `server`、数据库或业务接口。
- 不为了让两套页面视觉一致而增加额外工作。

验收：

- 两个后台可以同时连接同一套 API，并看到同一份数据。
- 两边都能跑通登录、文章管理和标签管理。
- 能解释 shadcn/ui、TanStack Table、React Hook Form 和前端 Zod 分别负责什么。
- 能用实际文件和状态代码说明两种方案的取舍。

入口：[第 23 章](./23-shadcn-ui为什么不是传统组件库.md)。

### 阶段 8：把内容提供给个人网站，可选

开始前回看：

- [06-API 设计和校验](./06-API设计和参数校验.md)
- [18-运行和部署](./18-从开发环境到线上运行.md)

公开文章路由复用前面已经掌握的 GET 接口、筛选和错误处理；第 18 章重点解决构建、生产迁移、日志和部署。

完成：

- 提供只返回已发布文章的公开 API。
- 让个人网站读取文章列表和详情。
- 渲染 Markdown 正文，并接入封面图片地址。
- 为 `server`、`admin-web-antd` 和 `admin-web-shadcn` 补齐生产构建和启动命令。
- 配置生产环境变量，并使用 `prisma migrate deploy` 应用已提交的迁移。
- 保留健康检查，增加基础请求日志和错误日志，且不记录密码、Cookie 和密钥。
- 确认数据库备份方式，再部署 Express API、PostgreSQL 和计划上线的一套或两套管理后台。

验收：

- 未登录用户通过公开内容 API 只能读取已发布文章；访问草稿、管理数据或写接口时仍然被拒绝。
- 个人网站能展示来自 Mini CMS 的文章列表、详情和 Markdown 正文。
- 新环境可以根据 README 和环境变量完成构建、迁移和启动。
- 线上健康检查可用，失败时可以通过日志定位，日志中没有敏感信息。
- 数据库迁移记录与代码版本对应，并已经确认备份和恢复方式。

这是 Mini CMS 主体完成后的迁移阶段，不影响前七个阶段的完成。

## 6. 一个功能怎样从需求走到验收

不是每个功能都需要改数据库或增加页面。只执行当前功能真正需要的步骤：

```text
1. 写清用户要完成什么
2. 设计请求和响应
3. 如果数据模型变化，再调整 Prisma Schema、检查迁移并生成 Prisma Client
4. 如果需要新接口，用 Express 实现并补齐校验和错误处理
5. 用 Apifox 检查正常和错误情况
6. 如果需要用户操作，再接到 Next.js 管理后台
7. 进入阶段 7 后，为核心行为补自动化测试
```

可以使用 AI 工具搭骨架、解释报错和帮助重构，但每完成一个阶段都要能回答：

```text
请求从哪个文件进入？
数据在哪里校验？
如果读写数据库，业务代码调用了什么 Prisma Client 方法？
错误为什么返回这个状态码？
如果有页面，前端拿到结果后怎样更新？
```

忘记函数名或配置写法时可以查文档或问 AI，不要求脱离工具手写全部代码。

## 7. 怎样判断项目完成

分别在 Ant Design 和 shadcn/ui 两个后台走通一条完整的产品链路：

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
- 两个管理后台都有完整的 `loading`、`empty`、`error` 和 `success` 状态。
- 核心接口既能用 Apifox 检查，也有自动化测试。
- Mini CMS README 写清安装、环境变量、建表和三个子工程的启动方式。
- 能解释一次请求从 Next.js 到 PostgreSQL 再返回的完整过程。

每个阶段结束只问四个问题：

```text
能运行？
能操作？
能解释？
能验证？
```

四个答案都是“能”，再继续下一个阶段。
