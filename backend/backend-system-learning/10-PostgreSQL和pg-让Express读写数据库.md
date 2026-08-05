# 10. PostgreSQL 和 pg：让 Node.js 真正执行 SQL

## 问题背景

前面已经知道怎样设计表、编写 CRUD、查询关系和使用事务，但 Express 不会自动连接数据库。

先分清三个名字：

```text
PostgreSQL
-> 真正保存数据并执行 SQL 的数据库系统

SQL
-> 查询和修改关系型数据的语言

pg / node-postgres
-> Node.js 连接 PostgreSQL 的驱动
```

这一章完成的链路是：

```text
Express handler
-> 数据访问函数
-> pg
-> PostgreSQL
-> 查询结果
-> Express response
```

---

## 1. PostgreSQL 中的数据放在哪里

初学阶段先记住：

```text
PostgreSQL 服务
-> database
-> schema
-> table
-> row
```

- 一个 PostgreSQL 服务可以管理多个 database。
- 一个 database 中可以有多个 schema。
- schema 用来组织表等数据库对象。
- 没有特殊需求时，可以先使用默认的 `public` schema。

这些层级和文件夹不完全一样，但可以先用“从大到小组织数据库对象”理解。

---

## 2. 连接信息放在服务器环境变量

```text
DATABASE_URL=postgresql://用户名:密码@localhost:5432/database_name
```

它包含：

```text
协议
用户名和密码
主机和端口
database 名称
```

代码通过 `process.env.DATABASE_URL` 读取。真实 `.env` 不能提交到 Git，也不能放进浏览器能够读取的环境变量。

项目应该提供 `.env.example`，只列变量名和示例格式，不放真实密码。

---

## 3. Web 应用使用连接池

```ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export { pool };
```

数据库连接的建立和关闭都有成本。Pool 会维护有限数量的连接，让多个 HTTP 请求重复使用。

```text
应用启动
-> 创建一个 Pool

请求到达
-> Pool 提供可用连接执行查询

查询结束
-> 连接回到池中，等待下次使用
```

不要在每个 route 或每次请求中重新 `new Pool()`。

---

## 4. `pool.query()` 执行普通查询

查询文章列表：

```ts
const result = await pool.query(
  `SELECT id, title, slug, status, created_at
   FROM articles
   ORDER BY created_at DESC`,
);

return result.rows;
```

`pool.query()` 返回查询结果对象，最常用的是：

```text
result.rows
-> 查询返回的行数组

result.rowCount
-> 这次查询影响或返回了多少行
```

查单条数据时仍然得到数组：

```ts
const result = await pool.query(
  `SELECT id, title, slug, content, status
   FROM articles
   WHERE id = $1`,
  [articleId],
);

return result.rows[0] ?? null;
```

没有查询到时，`rows[0]` 是 `undefined`。数据访问函数可以返回 `null`，再由上层决定是否返回 404。

---

## 5. 参数化查询怎样传入真实值

```ts
const result = await pool.query(
  `INSERT INTO articles (title, slug, content, status)
   VALUES ($1, $2, $3, $4)
   RETURNING id, title, slug, content, status`,
  [title, slug, content, status],
);
```

对应关系：

```text
$1 -> title
$2 -> slug
$3 -> content
$4 -> status
```

SQL 字符串描述结构，数组保存数据。不要为了省事把输入拼进 SQL。

参数顺序写错不会自动报出“顺序错了”，可能只是把值放进错误的列，所以列顺序、占位符和参数数组要一起核对。

---

## 6. 数据访问函数不要直接处理 HTTP

```ts
export async function findArticleById(articleId: number) {
  const result = await pool.query(
    `SELECT id, title, slug, content, status
     FROM articles
     WHERE id = $1`,
    [articleId],
  );

  return result.rows[0] ?? null;
}
```

这个函数只负责：

```text
接收已经处理过的查询参数
-> 执行 SQL
-> 返回数据库结果
```

它不读取 `request.params`，也不调用 `response.json()`。HTTP 输入输出由 route 或 controller 处理，项目怎样拆文件会在第 11 章展开。

---

## 7. 使用同一个 client 执行事务

`pool.query()` 适合单条独立 SQL。事务必须先从 Pool 借出一条确定连接：

```ts
const client = await pool.connect();

try {
  await client.query("BEGIN");

  const articleResult = await client.query(
    `INSERT INTO articles (title, slug, content, status)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [title, slug, content, status],
  );

  await client.query(
    `INSERT INTO article_tags (article_id, tag_id)
     VALUES ($1, $2)`,
    [articleResult.rows[0].id, tagId],
  );

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
}
```

`client` 是从连接池临时借出的一条连接。`BEGIN`、业务 SQL、`COMMIT` 或 `ROLLBACK` 都必须在这条连接上执行，最后无论成功还是失败都要归还。

---

## 8. 表结构必须有可重复执行的记录

不要只在图形工具里手动创建表。换一台电脑或新建测试数据库时，别人无法知道你做过什么。

学习阶段可以先保存有顺序的 SQL 文件：

```text
sql/
├── 001-create-articles.sql
├── 002-create-tags.sql
├── 003-create-article-tags.sql
└── 004-add-article-indexes.sql
```

每个文件描述一次结构变化，并按顺序执行。这就是迁移的基本思想：

```text
数据库结构的每次变化
-> 保存成有顺序、可追踪的文件
-> 所有环境执行相同变化
```

第一轮可以使用 SQL 文件理解过程；结构变化变多后，再选择正式 migration 工具。

---

## 9. 数据库错误要交给上层判断

数据库可能返回：

```text
唯一约束冲突
外键不存在
连接失败
SQL 写错
```

数据访问函数不应该把 PostgreSQL 原始错误直接发送给浏览器。后端需要区分：

```text
已知情况，例如 slug 重复
-> 返回明确状态码和提示

未知故障，例如数据库断开
-> 服务器记录细节，客户端返回 500
```

错误怎样统一变成 HTTP 响应，可以回看第 05 章。

---

## 小结

```text
PostgreSQL
-> 保存表中的数据，并执行收到的 SQL

pg
-> 让 Node.js 可以向 PostgreSQL 发送 SQL 和参数

Pool
-> 保留并复用一组数据库连接

pool.query()
-> 借用一条连接执行一次独立查询

result.rows
-> 保存数据库返回的行数组

事务中的 client
-> 让 BEGIN、业务 SQL 和 COMMIT 在同一条连接上执行

迁移文件
-> 按顺序记录表结构的每次变化
```

到这里，数据库学习已经从表结构走到 Node.js 实际读写。下一章再把 route、业务函数和 SQL 按职责拆进项目文件。
