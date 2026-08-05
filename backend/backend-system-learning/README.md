# 现代后端体系与学习方法

## 这套文档解决什么问题

这不是 Express API 手册，也不是项目任务清单。

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

- [20-Mini-CMS项目实操路线.md](./20-Mini-CMS项目实操路线.md)

---

## 先记住这一条请求链路

```text
浏览器发出 HTTP 请求
-> Node.js 运行 Express 服务器
-> Express 匹配路由和中间件
-> 后端校验输入并执行业务规则
-> pg 把参数化 SQL 发给 PostgreSQL
-> PostgreSQL 查询或修改数据
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

关系型数据库
表结构 / 数据类型 / 约束 / SQL CRUD / JOIN / 事务 / 索引

数据库接入
PostgreSQL / pg / Pool / 参数化查询 / migration

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

### 第三阶段：连续学习数据库 CRUD

```text
07 表结构、数据类型和约束
08 SQL CRUD、筛选、排序、分页和索引
09 数据关系、JOIN 和事务
10 PostgreSQL、pg、连接池和迁移
```

这四章是一条连续主线：

```text
先决定数据怎样存
-> 再用 SQL 增删改查
-> 再处理多张表和多步修改
-> 最后让 Node.js 真正执行 SQL
```

这一阶段先掌握个人 Web 项目常用的数据库操作。

### 第四阶段：把接口组成可使用的产品

```text
11 后端项目怎样拆文件
12 Next.js 管理后台怎样接 Express
12A Next.js 自己写后端的使用场景
13 登录、Cookie 和基本安全
14 后端测试怎样分层
```

读完后应该能把一条文章请求追踪成：

```text
页面操作
-> HTTP API
-> route / controller / service / repository
-> PostgreSQL
-> 登录和错误处理
-> 页面反馈
-> 自动化测试
```

### 第五阶段：按需回看的工程章节

```text
15 从开发环境到线上运行
16 如何阅读一个后端项目
17 开始实践后怎样排错
18 术语表
19 练习题
```

第 15 章在准备部署时看；第 16～19 章用于阅读、排错和复习，不要求第一次连续背完。

### 最终实践：把知识组合起来

```text
20 Mini CMS 项目实操路线
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

也不要求背下所有 API 和配置。

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
数据库：PostgreSQL + SQL + pg
管理页面：Next.js + TypeScript + Ant Design
接口检查：Apifox
自动化测试：Vitest + Supertest
```

---

## 当前学习深度

这套文档的目标不是让你成为数据库管理员或运维工程师，而是建立个人 Web 项目所需的完整后端基础。

应该掌握：

- 能设计几张有明确关系的表。
- 能写常见 CRUD、筛选、排序和分页 SQL。
- 能理解约束、JOIN、事务和索引解决什么问题。
- 能让 Express 安全地读写 PostgreSQL。
- 能完成登录、错误处理和自动化测试。
- 能把系统在开发环境和简单线上环境运行起来。

---

## 小结

整套文档按照下面的顺序展开：

```text
运行环境
-> HTTP 和 Express
-> 异步、错误和 API
-> 数据库结构和 CRUD
-> 项目组织和前后端联调
-> 登录和测试
-> 部署、阅读和排错
-> 最终项目实践
```

先按这个顺序理解一次完整请求，再在 Mini CMS 中把每一步实际做出来。

## 官方参考

- [Node.js 文档](https://nodejs.org/docs/latest/api/)
- [Express 文档](https://expressjs.com/)
- [PostgreSQL 官方教程](https://www.postgresql.org/docs/current/tutorial.html)
- [node-postgres 文档](https://node-postgres.com/)
- [Next.js App Router 文档](https://nextjs.org/docs/app)
- [Ant Design 文档](https://ant.design/docs/react/introduce)
