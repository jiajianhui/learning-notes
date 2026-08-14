# 现代后端体系与学习方法

## 这套文档解决什么问题

这不是 Express API 手册，也不是只有项目任务的操作清单。它用一条连续的文章管理主线讲后端知识，最终落地项目是独立仓库 `mini-cms`。

第一次阅读先打开 [00-阅读导引和最小实战主线.md](./00-阅读导引和最小实战主线.md)。第 00 章只提前说明数据库和 ORM 这条线里的几个新概念，不重复科普 Next.js、Express 和 CRUD。

它要帮助你建立一条连续的后端主线：

```text
浏览器怎样发出请求
-> Node.js 和 Express 怎样接住请求
-> 后端怎样校验和处理数据
-> SQL 怎样读写关系型数据库
-> 登录、测试和部署怎样让接口可以长期使用
```

整套学习有三个明确角色：

| 对象 | 作用 | 什么时候停止 |
|---|---|---|
| 第 09 章 CRUD demo | 第一次集中练习 Docker、PostgreSQL、Prisma 和单表 CRUD | 读完 09A 后冻结，不再增加标签、登录和测试 |
| `mini-cms` | 独立复现基础能力，并承接第 10～16 章的所有后续实操 | 持续成长为最终项目 |
| 本目录的学习文档 | 讲清通用知识，并指导修改真实 Mini CMS | 不保存项目最终运行代码 |

项目导航和进度：

- [MiniCMS-项目路线.md](./MiniCMS-项目路线.md)

---

## 先记住这一条请求链路

```text
浏览器发出 HTTP 请求
-> Node.js 运行 Express 服务器
-> Express 匹配路由和中间件
-> 后端校验输入并执行业务规则
-> 数据库访问层把代码操作转换成 SQL 并发送
-> PostgreSQL 执行 SQL，查询或修改数据
-> Express 返回状态码和 JSON
-> 前端根据结果更新页面
```

后面的章节分别解释这条链路中的某一段。

---

## 后端知识地图

```text
运行环境
Node.js / npm / module / environment

网络和接口
HTTP / method / URL / headers / body / status code

Web 框架
Express / route / middleware / request / response

接口可靠性
异步 / 错误处理 / API contract / 参数校验

关系型数据库第一轮
表结构 / 数据类型 / 约束 / SQL CRUD

数据库接入
Docker / PostgreSQL / Prisma 7 / pg adapter / migration

多表扩展
外键 / 中间表 / JOIN / 事务

项目组织
route / controller / service / repository / config

身份与安全
密码哈希 / Cookie / 认证 / 授权 / CORS / CSRF

产品和工程
Next.js 管理页面 / 测试 / 部署 / 日志 / 排错
```

这些不是互相独立的术语，而是一次请求从页面进入数据库，再返回页面时经过的不同职责。

---

## 推荐阅读顺序

### 第一阶段：看懂服务器怎样接住请求

```text
00 阅读导引和请求主线
01 页面、服务器和数据库
02 Node.js 运行环境
03 HTTP 请求和响应
04 Express 路由和中间件
```

读完后应该能解释：

```text
Node.js、Express 和 HTTP 分别负责什么？
req 从哪里读取输入？
res 怎样返回状态码和 JSON？
中间件为什么需要 next？
```

### 第二阶段：把接口的成功和失败说清楚

```text
05 异步流程和错误处理
06 API 设计和参数校验
```

读完后应该能区分：

```text
Promise 和真正查询结果
业务错误和未知系统错误
字段格式检查和产品规则检查
TypeScript 类型和运行时校验
```

### 第三阶段：跑通单表 CRUD

```text
07 表结构、数据类型和约束
08 SQL CRUD（第一遍只读第 1～5 节）
09 Docker、PostgreSQL、TablePro、Prisma 7 和单表 CRUD
09A Prisma 从初始化到可用：一条线看懂
```

这是 PostgreSQL 入门的优先主线：

```text
先设计一张 articles 表
-> 读懂 INSERT / SELECT / UPDATE / DELETE 的最小 SQL
-> 用 Docker 启动 PostgreSQL
-> 用 Prisma Schema 和 Migrate 建立 articles 表
-> 用 TablePro 查看表，亲手执行一轮 CRUD SQL
-> 再用 Prisma Client 完成项目 CRUD
```

第 08 章负责读懂最小 SQL。第 09 章先启动 PostgreSQL 并建表，再用 TablePro 亲手执行一轮 SQL，然后才使用 Prisma Client 完成项目 CRUD。第 09A 章从目录角度收口 Prisma 的初始化、迁移、Client 生成和业务代码接入过程，适合完成练习后快速复习。

第一轮只要求单表 CRUD。多表关系不是 PostgreSQL 的入门前提，不要因为还不会 `JOIN`（把多张表中有关的数据组合起来查询）和事务（让多步修改一起成功或失败）而停下项目。

第 09 章的独立 demo 是一次阶段性跟练。读完 09A 后就结束 demo，打开 Mini CMS 项目路线，在独立 `mini-cms` 仓库中复现阶段 1～2。准备进入阶段 3 时，再学习第 10 章的请求校验和统一错误处理。

### 第四阶段：项目做到哪里，文档看到哪里

```text
阶段 1：先启动 Express
阶段 2：接入 Docker、Prisma 7 和 PostgreSQL
阶段 3：阅读 10 请求校验、11 项目结构
阶段 4：阅读 12 前后端联调
阶段 5：阅读 13 多表关系、JOIN 和事务
阶段 6：阅读 14 登录与安全、14A 登录实操
阶段 7：阅读 15 测试分层、15A 接口测试实操
阶段 8：阅读 16 运行和部署
```

`12A` 是 Next.js 架构对比选读，完成第一轮文章 CRUD 后再看，不影响任何实操阶段。

两章新增的动手收口：

- [14A-管理员登录实操](./14A-管理员登录实操-用Session和Cookie保护写接口.md)：把密码哈希、数据库 Session、HttpOnly Cookie 和认证中间件连起来。
- [15A-接口测试实操](./15A-接口测试实操-用Vitest和Supertest验证API.md)：用独立测试数据库、Vitest 和 Supertest 验证核心 API。

这样每次只补当前功能需要的知识。项目逐步完成后，应该能把一条文章请求追踪成：

```text
页面操作
-> HTTP API
-> route / controller / service / repository
-> Prisma Client
-> PostgreSQL 执行 SQL
-> 当前阶段的业务和错误处理
-> 页面反馈
-> 自动化测试
```

### 第五阶段：按需回看的辅助章节

```text
17 如何阅读一个后端项目
18 开始实践后怎样排错
19 数据库与 ORM 术语速查
20 练习题
```

第 16 章已经对应 Mini CMS 可选阶段 8；第 17～20 章用于阅读、排错和复习，不要求第一次连续背完。

### Mini CMS 项目路线怎样使用

```text
读当前阶段对应的知识章
-> 按步骤修改真实 mini-cms
-> 用 Apifox、页面或测试验证
-> 回到项目路线对照验收
```

项目路线只负责项目范围、实现顺序和完成标准。第 10～16 章负责讲清当前知识，并把它落到真实 Mini CMS 中。

---

## 每章怎么读

每个概念都按下面几个问题理解：

```text
它是什么？
为什么需要？
数据从哪里来？
最小写法是什么？
它在请求链路的哪一步？
```

第一次阅读只跟正常流程，不要求提前记住大量故障和工程误区。开始写代码后，再使用第 18 章排错，并对照 Mini CMS 项目路线每个阶段的验收标准。

也不要求背下所有函数和配置。

真正重要的是能判断：

```text
问题发生在哪一层？
应该从哪个文件开始找？
数据现在走到了哪里？
下一步应该交给谁处理？
```

---

## 技术主线

```text
后端：Node.js + Express + TypeScript
本地数据库：Docker + PostgreSQL
数据库访问：Prisma 7 + @prisma/adapter-pg + pg
请求校验：Zod
管理页面：Next.js + TypeScript + Ant Design
接口检查：Apifox
自动化测试：Vitest + Supertest
```

---

## 当前学习深度

这套文档的目标不是让你成为数据库管理员或运维工程师，而是建立个人网站项目所需的完整后端基础。

当前第一轮先掌握：

- 能设计一张字段和防错规则清楚的文章表。
- 能读懂常见的单表 CRUD SQL，并知道 Prisma 模型方法对应什么操作。
- 能用 Docker 启动 PostgreSQL，并用 Prisma 记录表结构变化和管理数据。

读完第 09 章后，先用 09A 收口 Prisma 主线，再打开 Mini CMS 项目路线。阶段 3 先补上请求校验、统一错误处理和项目结构，阶段 4 再完成管理页面，后面逐步增加标签、登录、测试和部署。阶段 5 增加文章标签时，才要求掌握中间表、`JOIN` 和事务。

---

## 小结

整套文档按照下面的顺序展开：

```text
运行环境
-> HTTP 和 Express
-> 异步、错误和 API
-> 最小 SQL 基础、Docker、PostgreSQL 和 Prisma CRUD
-> 用第 09 章 demo 第一次跑通单表 CRUD
-> 用 09A 复习后结束 demo，打开 Mini CMS 项目路线
-> 阶段 3 前学习请求校验、统一错误处理和项目组织
-> 阶段 4 学习前后端联调并完成管理页面
-> 按阶段学习多表、登录和测试
-> 部署、阅读和排错
```

按这条路线边学边做：第 09 章之后就进入项目，后续知识在对应实操阶段开始前补齐。

## 官方参考

- [Node.js 文档](https://nodejs.org/docs/latest/api/)
- [Express 文档](https://expressjs.com/)
- [PostgreSQL 官方教程](https://www.postgresql.org/docs/current/tutorial.html)
- [Docker PostgreSQL 官方镜像](https://hub.docker.com/_/postgres)
- [TablePro](https://tablepro.app/)
- [Prisma 文档](https://www.prisma.io/docs/orm)
- [node-postgres 文档](https://node-postgres.com/)
- [Next.js App Router 文档](https://nextjs.org/docs/app)
- [Ant Design 文档](https://ant.design/docs/react/introduce)
