# 现代后端体系与学习方法

## 这套文档解决什么问题

这不是 Express API 手册，也不是项目任务清单。

第一次阅读先打开 [00-阅读导引和最小实战主线.md](./00-阅读导引和最小实战主线.md)。第 00 章只提前说明数据库和 ORM 这条线里的几个新概念，不重复科普 Next.js、Express 和 CRUD。

它要帮助你建立一条连续的后端主线：

```text
浏览器怎样发出请求
-> Node.js 和 Express 怎样接住请求
-> 后端怎样校验和处理数据
-> SQL 怎样读写关系型数据库
-> 登录、测试和部署怎样让接口可以长期使用
```

概念章节使用文章接口作为统一示例，但知识结构不依赖某个具体项目。最终实践项目单独放在第 20 章。

项目实操路线：

- [20-项目实操路线.md](./20-项目实操路线.md)

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

### 第三阶段：先跑通单表 CRUD

```text
07 表结构、数据类型和约束
08 SQL CRUD（第一遍只读第 1～5 节）
09 Docker、PostgreSQL、Postico 2、Prisma 7 和单表 CRUD
```

这是 PostgreSQL 入门的优先主线：

```text
先设计一张 articles 表
-> 读懂 INSERT / SELECT / UPDATE / DELETE 的最小 SQL
-> 用 Docker 启动 PostgreSQL
-> 用 Prisma Schema 和 Migrate 建立 articles 表
-> 用 Postico 2 查看表，亲手执行一轮 CRUD SQL
-> 再用 Prisma Client 完成项目 CRUD
-> 尽快跑通文章 CRUD
```

第 08 章负责读懂最小 SQL。第 09 章先启动 PostgreSQL 并建表，再用 Postico 2 亲手执行一轮 SQL，然后才使用 Prisma Client 完成项目 CRUD。这样既不会跳过 SQL 练习，也不用在业务代码里重复手写查询字符串。

第一轮只要求单表 CRUD。多表关系不是 PostgreSQL 的入门前提，不要因为还不会 `JOIN`（把多张表中有关的数据组合起来查询）和事务（让多步修改一起成功或失败）而停下项目。

读完第 09 章就可以打开第 20 章开始实操，不需要先读完后面所有章节。

### 第四阶段：项目做到哪里，文档看到哪里

```text
阶段 1：先启动 Express
阶段 2：接入 Docker、Prisma 7 和 PostgreSQL
阶段 3：阅读 11 项目结构、12 前后端联调
阶段 4：阅读 10 多表关系、JOIN 和事务
阶段 5：阅读 13 登录、Cookie 和安全
阶段 6：阅读 14 后端测试
```

`12A` 是 Next.js 架构对比选读，完成第一轮文章 CRUD 后再看，不影响任何实操阶段。

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

### 第五阶段：按需回看的工程章节

```text
15 从开发环境到线上运行
16 如何阅读一个后端项目
17 开始实践后怎样排错
18 数据库与 ORM 术语速查
19 练习题
```

第 15 章在准备部署时看；第 16～19 章用于阅读、排错和复习，不要求第一次连续背完。

### 最终实践：把知识组合起来

```text
20 项目实操路线
```

前面的概念章节负责建立通用知识，第 20 章只负责安排项目范围、实现顺序和完成标准。

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

第一次阅读只跟正常流程，不要求提前记住大量故障和工程误区。开始写代码后，再使用第 17 章排错，并对照第 20 章每个阶段的“实现时检查”。

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

单表 CRUD 跑通后，再按第 20 章逐步增加项目结构、管理页面、标签、登录、测试和部署。增加文章标签时，才要求掌握中间表、`JOIN` 和事务。

---

## 小结

整套文档按照下面的顺序展开：

```text
运行环境
-> HTTP 和 Express
-> 异步、错误和 API
-> 最小 SQL 基础、Docker、PostgreSQL 和 Prisma CRUD
-> 打开第 20 章开始实操
-> 按阶段学习项目组织、多表、登录和测试
-> 部署、阅读和排错
```

先按这个顺序理解一次完整请求，再到第 20 章把每一步实际做出来。

## 官方参考

- [Node.js 文档](https://nodejs.org/docs/latest/api/)
- [Express 文档](https://expressjs.com/)
- [PostgreSQL 官方教程](https://www.postgresql.org/docs/current/tutorial.html)
- [Docker PostgreSQL 官方镜像](https://hub.docker.com/_/postgres)
- [Postico 2](https://eggerapps.at/postico2/)
- [Prisma 文档](https://www.prisma.io/docs/orm)
- [node-postgres 文档](https://node-postgres.com/)
- [Next.js App Router 文档](https://nextjs.org/docs/app)
- [Ant Design 文档](https://ant.design/docs/react/introduce)
