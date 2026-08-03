# 08. PostgreSQL 和 pg：让 Express 真正读写数据库

## 问题背景

PostgreSQL 是数据库服务器，Express 不会自动和它连接。

这次使用 `pg`，也叫 node-postgres，让 Node.js：

```text
建立数据库连接
-> 发送参数化 SQL
-> 等待查询结果
-> 把结果交给业务代码
```

---

## 核心解释

### 1. PostgreSQL 里有哪些层级

初学阶段先记：

```text
PostgreSQL 服务
-> database
-> schema
-> table
-> row
```

Mini CMS 可以有一个 database，第一轮使用默认 schema，在里面建立文章和标签表。

### 2. 连接信息放在环境变量

```text
DATABASE_URL=postgresql://用户名:密码@localhost:5432/mini_cms
```

数据库密码不写死在代码里，也不提交真实 `.env`。

项目应提供：

```text
.env.example
```

只说明需要哪些变量，不放真实密码。

### 3. Web 应用使用连接池

```ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export { pool };
```

连接池复用有限数量的数据库连接，不需要每次请求都重新创建连接。

---

## 最小查询

```ts
const result = await pool.query(
  `SELECT id, title, slug, status
   FROM articles
   ORDER BY created_at DESC`,
);

return result.rows;
```

带用户输入时使用参数：

```ts
const result = await pool.query(
  `SELECT id, title, slug, status
   FROM articles
   WHERE id = $1`,
  [articleId],
);
```

`result.rows` 是查询返回的行数组。

### 创建并返回数据

```ts
const result = await pool.query(
  `INSERT INTO articles (title, slug, content, status)
   VALUES ($1, $2, $3, $4)
   RETURNING *`,
  [title, slug, content, status],
);

return result.rows[0];
```

PostgreSQL 的 `RETURNING` 可以直接返回刚创建或更新的记录。

---

## 表结构怎样保存

不要只在数据库图形工具里点出一张表，却没有可重复执行的记录。

学习阶段可以先保存 SQL：

```text
server/
└── sql/
    ├── 001-create-articles.sql
    ├── 002-create-tags.sql
    └── 003-create-admins.sql
```

以后再引入正式迁移工具。

---

## Mini CMS 中用在哪里

```text
article repository
-> 调用 pool.query
-> 执行文章 SQL
-> 返回数据库结果

article service
-> 根据结果判断文章是否存在、是否冲突

route handler
-> 把结果变成 HTTP 响应
```

这三个职责不要全部混成“数据库函数”。

---

## 常见误区

- 每次请求都创建一个新的 Pool。
- 把 `DATABASE_URL` 放进浏览器可读取的环境变量。
- 拼接用户输入，而不是参数化查询。
- 只改线上数据库，不保留建表或迁移记录。
- 忘记查询返回的是 `rows` 数组。
- 把数据库列名和前端字段完全随意混用。

---

## 小结

```text
PostgreSQL 负责运行数据库
SQL 描述要执行的操作
pg 负责从 Node.js 发送 SQL
Pool 负责复用连接
参数化查询负责把 SQL 结构和用户数据分开
```

到这里，文章已经可以从 Express 真正进入 PostgreSQL。
