# 现代后端体系与学习方法

## 问题背景

00～18 不是 Express API 手册，也不是 Mini CMS 的任务清单。它们负责建立系统知识；最后的第 19 章再集中给出项目实操路线。

它要解决的是：

```text
看到 Node.js、HTTP、Express、PostgreSQL、Cookie、CORS、测试和部署，
你能判断它们分别在哪一层、解决什么问题、怎样连成一个后端系统。
```

整套文档最后的练习项目已经确定为：

```text
Mini CMS
```

学习文档和实际代码分开管理：

```text
learning-notes/backend/backend-system-learning
-> 建立后端技术地图，保存项目实操路线

独立的 mini-cms Git 仓库
-> 保存 Express 和 Next.js 管理后台代码
```

项目实操路线：

- [19-Mini-CMS项目实操路线.md](./19-Mini-CMS项目实操路线.md)

---

## 先记住这一条主线

```text
浏览器发出 HTTP 请求
-> Node.js 运行 Express 服务器
-> Express 匹配路由和中间件
-> 业务代码校验并处理数据
-> pg 执行 SQL
-> PostgreSQL 返回结果
-> Express 返回 JSON
-> Next.js 管理后台更新页面
```

后面的所有章节都在解释这条链路里的某一层。

---

## 后端九层技术地图

```text
第九层：运行和部署
环境变量 / 日志 / 数据迁移 / HTTPS / 健康检查

第八层：前后端联调
Next.js 管理后台 / CORS / Cookie / 页面状态

第七层：可靠性
参数校验 / 错误处理 / 自动化测试 / 安全

第六层：身份和权限
登录 / 密码哈希 / Cookie / 认证 / 授权

第五层：项目组织
route / service / repository / middleware / config

第四层：数据持久化
PostgreSQL / SQL / 关系 / 约束 / 事务

第三层：Web 框架
Express / route / middleware

第二层：网络协议
HTTP / method / URL / header / body / status code

第一层：运行环境
Node.js / npm / module / process / environment
```

这九层不是九个互相独立的技术，而是一次请求从外到内经过的不同职责。

---

## 推荐阅读顺序

### 第一阶段：先看懂服务器怎样接住请求

```text
00 阅读导引和最小实战主线
01 后端大图景
02 Node.js 运行环境
03 HTTP 请求和响应
04 Express 路由和中间件
```

读完 04 后，你已经能理解 Mini CMS 阶段 1 的健康检查和内存版文章列表；现在可以继续阅读，等到第 19 章再集中实操。

### 第二阶段：把请求变成真实数据接口

```text
05 异步流程和错误处理
06 API 设计和参数校验
07 关系型数据库和 SQL
08 PostgreSQL 和 pg
```

这一阶段结束时，你已经具备把文章数据从内存数组迁移到 PostgreSQL 所需的知识。

### 第三阶段：把接口做成完整产品

```text
09 后端项目怎么拆文件
10 Next.js 管理后台怎样接 Express
10A Next.js 也能写后端：具体什么时候用
11 数据关系和事务
12 登录、Cookie 和基本安全
13 后端测试怎么分层
```

第 10A 章用于比较“Next.js 全栈”和“Next.js + Express”两条路线。然后继续学习数据关系、登录和测试。

这一阶段覆盖完成 Mini CMS 主体所需的知识：管理页面、标签关系、登录和自动化测试。

主线到这里结束。接下来可以直接跳到最后的第 19 章开始项目；第 14～18 章在实操中按需回看。

### 参考章节：收尾、阅读和排错

```text
14 从开发环境到线上运行
15 如何阅读一个后端项目
16 常见误区和排疑
17 术语表
18 练习题
```

第 14 章在项目准备运行和部署时看；第 15～18 章不要求连续读完，遇到阅读、排错或复习需求时再回看。

### 最终实操章：按完整路线完成 Mini CMS

```text
19 Mini CMS 项目实操路线
```

第 19 章集中记录代码仓库结构、产品范围、数据表、API、管理页面、七个实操阶段和完成标准。

阅读导引看 [00-阅读导引和最小实战主线.md](./00-阅读导引和最小实战主线.md)。

---

## 每章怎么读

每个知识点都按同一套问题理解：

```text
它是什么？
为什么需要？
它和前一层是什么关系？
最小写法是什么？
Mini CMS 在哪里会用到？
常见错误是什么？
```

不要求背下所有函数名和配置。

真正重要的是能判断：

```text
问题发生在哪一层？
应该从哪个文件开始找？
数据现在走到了哪里？
```

---

## 技术主线

```text
后端：Node.js + Express + TypeScript
数据库：PostgreSQL + SQL + pg
管理后台：Next.js + TypeScript + Ant Design
接口检查：Apifox
自动化测试：Vitest + Supertest
```

第一轮先不用 ORM。完成 Mini CMS 后，再看 Prisma 或 Drizzle。

---

## 小结

这套文档最终要建立的是判断力：

```text
这个概念属于哪一层？
它解决什么问题？
它依赖什么基础？
一次请求怎样经过它？
我在真实项目里怎么找到它？
```

00～18 负责把地图讲清楚，第 19 章负责指导 Mini CMS 实操，真正代码放在独立的 `mini-cms` Git 仓库。

## 官方参考

- [Node.js 文档](https://nodejs.org/docs/latest/api/)
- [Express 文档](https://expressjs.com/)
- [PostgreSQL 官方教程](https://www.postgresql.org/docs/current/tutorial.html)
- [node-postgres 文档](https://node-postgres.com/)
- [Next.js App Router 文档](https://nextjs.org/docs/app)
- [Ant Design 文档](https://ant.design/docs/react/introduce)
