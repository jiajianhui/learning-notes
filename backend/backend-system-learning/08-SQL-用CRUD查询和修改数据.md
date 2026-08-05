# 08. SQL：用 CRUD 查询和修改数据

## 问题背景

表结构决定数据能不能保存，SQL 决定具体要读取或修改哪些数据。

CRUD 是四类最常见的数据操作：

| 操作 | 含义 | SQL |
|---|---|---|
| Create | 创建 | `INSERT` |
| Read | 查询 | `SELECT` |
| Update | 更新 | `UPDATE` |
| Delete | 删除 | `DELETE` |

个人 Web 项目的数据库工作，大部分都建立在这四类语句上。

第 07 章的 `CREATE TABLE` 修改的是表结构；这一章的 CRUD 主要修改和查询表中的数据行。

---

## 1. `INSERT`：增加一行

```sql
INSERT INTO articles (title, slug, content, status)
VALUES ($1, $2, $3, $4)
RETURNING id, title, slug, content, status;
```

可以按顺序读成：

```text
向 articles 表插入一行
-> 指定要写入的列
-> 按相同顺序提供值
-> 返回刚创建的数据
```

`$1` 到 `$4` 是参数位置。第 10 章会让 `pg` 把真实值和 SQL 分开传给 PostgreSQL。

`RETURNING` 是 PostgreSQL 的常用能力，可以直接拿到数据库生成的 id 和最终保存结果。

---

## 2. `SELECT`：读取数据

查询全部文章的部分字段：

```sql
SELECT id, title, slug, status
FROM articles;
```

只查询已发布文章，并让最新文章排在前面：

```sql
SELECT id, title, slug, status, created_at
FROM articles
WHERE status = $1
ORDER BY created_at DESC;
```

SQL 可以按下面顺序理解：

```text
SELECT
-> 要返回哪些列

FROM
-> 从哪张表读取

WHERE
-> 哪些行符合条件

ORDER BY
-> 结果怎样排序
```

`SELECT *` 适合临时查看数据。接口长期使用时明确列名，更容易知道返回了什么，也避免误带不需要的字段。

---

## 3. `WHERE`：只操作符合条件的行

按 id 查询一篇文章：

```sql
SELECT id, title, slug, content, status
FROM articles
WHERE id = $1;
```

组合多个条件：

```sql
SELECT id, title, status
FROM articles
WHERE status = $1
  AND title ILIKE '%' || $2 || '%';
```

`%` 表示任意长度的文本，所以参数传入 `camera` 时，可以匹配标题中包含 `camera` 的文章。

常用条件先掌握：

| 写法 | 含义 |
|---|---|
| `=` | 等于 |
| `<>` | 不等于 |
| `> / >= / < / <=` | 大小比较 |
| `IN (...)` | 属于一组值 |
| `IS NULL` | 没有值 |
| `LIKE / ILIKE` | 文本匹配，`ILIKE` 不区分大小写 |
| `AND / OR` | 组合条件 |

判断 `NULL` 要使用 `IS NULL`，不能写 `= NULL`。

---

## 4. `UPDATE`：修改已有数据

```sql
UPDATE articles
SET title = $1,
    status = $2,
    updated_at = NOW()
WHERE id = $3
RETURNING id, title, slug, content, status, updated_at;
```

`SET` 指定修改哪些列，`WHERE` 指定修改哪几行。

没有 `WHERE` 时，所有行都可能被修改。执行更新前先确认条件，是数据库操作中最重要的习惯之一。

如果 `RETURNING` 没有返回行，通常说明目标 id 不存在，需要由后端转换成 404。

---

## 5. `DELETE`：删除数据

```sql
DELETE FROM articles
WHERE id = $1
RETURNING id;
```

同样不能随意省略 `WHERE`。没有条件的 `DELETE FROM articles` 会删除表里的所有行。

返回被删除的 id，可以帮助后端判断目标是否原本存在。删除成功且不需要返回正文时，HTTP 接口通常返回 204。

---

## 6. 排序和分页

分页查询：

```sql
SELECT id, title, slug, status, created_at
FROM articles
ORDER BY created_at DESC
LIMIT $1
OFFSET $2;
```

```text
LIMIT
-> 本页最多返回多少行

OFFSET
-> 跳过前面多少行
```

页码分页的计算方式：

```text
offset = (page - 1) * pageSize
```

例如第 3 页、每页 20 条：

```text
(3 - 1) * 20 = 40
```

除了当前页数据，页面通常还需要总数：

```sql
SELECT COUNT(*)
FROM articles
WHERE status = $1;
```

---

## 7. 聚合：把多行计算成一个结果

最常用的是计数：

```sql
SELECT status, COUNT(*) AS article_count
FROM articles
GROUP BY status;
```

它会得到每种状态分别有多少篇文章。

```text
COUNT
-> 统计行数

GROUP BY
-> 先按某些列分组，再分别计算
```

---

## 8. 参数化查询：SQL 和用户输入分开

不要这样拼接输入：

```ts
const sql = `SELECT * FROM articles WHERE id = ${articleId}`;
```

应该把 SQL 和参数分别传递：

```ts
await pool.query(
  "SELECT id, title FROM articles WHERE id = $1",
  [articleId],
);
```

数据库把 `$1` 当作数据，而不是 SQL 结构的一部分。这是防止 SQL 注入的基本做法。`pool.query()` 的来源和返回结果会在第 10 章展开。

---

## 9. 索引：让常用查询更快

没有索引时，数据库可能需要逐行查找。索引类似书后的目录，可以更快定位符合条件的数据。

主键和唯一约束通常会自动建立对应索引。其他索引要根据真实查询增加，例如经常按状态筛选并按时间排序：

```sql
CREATE INDEX idx_articles_status_created_at
ON articles (status, created_at DESC);
```

索引不是越多越好：

- 会占用存储空间。
- `INSERT`、`UPDATE`、`DELETE` 时也要维护索引。
- 很少查询的字段通常不需要提前建立索引。

第一轮先理解索引解决什么问题。

---

## 小结

```text
INSERT
-> 向表中增加一行

SELECT
-> 从表中读取指定的列

WHERE
-> 只让符合条件的行被查询、修改或删除

UPDATE / DELETE
-> 修改或删除 WHERE 选中的行

ORDER BY / LIMIT / OFFSET
-> 设定排序方式和每页返回的数据

COUNT / GROUP BY
-> 统计总数，或分组后分别统计

参数化查询
-> SQL 只写结构，用户输入通过参数另外传入

索引
-> 帮助数据库更快找到经常查询的数据
```

下一章进入多张表，学习关系、JOIN 和事务。
