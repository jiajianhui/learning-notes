# 08. SQL：用 CRUD 查询和修改数据

## 问题背景

SQL 全称是 Structured Query Language，中文叫结构化查询语言。它是关系型数据库用来创建结构、查询数据和修改数据的语言。

表结构决定数据能不能保存，SQL 决定具体要读取或修改哪些数据。

本章练习 CRUD 对应的四类 SQL 操作：

| 操作 | 含义 | SQL |
|---|---|---|
| Create | 创建 | `INSERT` |
| Read | 查询 | `SELECT` |
| Update | 更新 | `UPDATE` |
| Delete | 删除 | `DELETE` |

这一章先读懂 SQL 语句的结构，不要求现在已经连接数据库或执行 SQL。下一章会用 Docker 启动 PostgreSQL，再介绍 Prisma 怎样通过模型方法完成相同操作。

第一遍只读第 1～5 节，先掌握 CRUD。排序分页、统计和索引放在后半章，项目需要时再看。

---

## 1. `INSERT`：增加一行

`INSERT INTO` 表示向哪张表增加数据，`VALUES` 提供每一列的值，`RETURNING` 让 PostgreSQL 返回刚保存的数据：

```sql
INSERT INTO articles (title, slug, content, status)
VALUES ('我的第一篇文章', 'my-first-article', '正文', 'draft')
RETURNING id, title, slug, content, status;
```

可以按顺序读成：

```text
向 articles 表插入一行
-> 指定要写入的列
-> 按相同顺序提供值
-> 返回刚创建的数据
```

---

## 2. `SELECT`：读取数据

先认识查询中的四部分：`SELECT` 选择返回哪些列，`FROM` 指定从哪张表读取，`WHERE` 筛选符合条件的行，`ORDER BY` 决定排序。`DESC` 表示从大到小排列。

查询全部文章的部分字段：

```sql
SELECT id, title, slug, status
FROM articles;
```

只查询已发布文章，并让最新文章排在前面：

```sql
SELECT id, title, slug, status, created_at
FROM articles
WHERE status = 'published'
ORDER BY created_at DESC;
```

时间越晚，值越大，所以按创建时间从大到小排列时，最新文章会排在前面。

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

组合条件时会使用下面这些写法：

| 写法 | 含义 |
|---|---|
| `=` | 等于 |
| `<>` | 不等于 |
| `> / >= / < / <=` | 大小比较 |
| `IN (...)` | 属于一组值 |
| `IS NULL` | 没有值 |
| `LIKE / ILIKE` | 文本匹配，`ILIKE` 不区分大小写 |
| `AND / OR` | 组合条件 |

按 id 查询一篇文章：

```sql
SELECT id, title, slug, content, status
FROM articles
WHERE id = 42;
```

组合多个条件：

```sql
SELECT id, title, status
FROM articles
WHERE status = 'published'
  AND title ILIKE '%camera%';
```

`%` 表示任意长度的文本，所以 `'%camera%'` 可以匹配标题中包含 `camera` 的文章。

判断 `NULL` 要使用 `IS NULL`，不能写 `= NULL`。

---

## 4. `UPDATE`：修改已有数据

`SET` 指定修改哪些列，`WHERE` 指定只修改哪些行，`NOW()` 得到 PostgreSQL 执行 SQL 时的当前时间：

```sql
UPDATE articles
SET title = '修改后的标题',
    status = 'published',
    updated_at = NOW()
WHERE id = 42
RETURNING id, title, slug, content, status, updated_at;
```

`NOW()` 会得到执行这条 SQL 时的当前时间。把它写入 `updated_at`，表示这篇文章刚在此时被更新。

没有 `WHERE` 时，所有行都可能被修改。执行前要检查 SQL 里的 `WHERE` 是否准确。

`RETURNING` 会直接返回数据库修改后的文章数据。

---

## 5. `DELETE`：删除数据

`DELETE FROM` 表示从哪张表删除数据，`WHERE` 限定只删除符合条件的行：

```sql
DELETE FROM articles
WHERE id = 42;
```

同样不能随意省略 `WHERE`。没有条件的 `DELETE FROM articles` 会删除表里的所有行。

删除成功且不需要返回正文时，HTTP 接口可以返回 204。

---

## 完成 CRUD 后再看的查询能力

第一遍读到这里，就可以直接进入第 09 章。第 09 章启动 PostgreSQL 并建好表后，会安排一次真正的手写 SQL 练习。下面不是这次练习的前置知识。

### 6. 排序和分页

`LIMIT` 表示本页最多返回多少行，`OFFSET` 表示跳过前面多少行。分页查询示例：

```sql
SELECT id, title, slug, status, created_at
FROM articles
ORDER BY created_at DESC
LIMIT 20
OFFSET 40;
```

页码分页的计算方式：

```text
offset = (page - 1) * pageSize
```

例如第 3 页、每页 20 条：

```text
(3 - 1) * 20 = 40
```

除了当前页数据，页面通常还需要总数。`COUNT(*)` 表示统计符合条件的行数：

```sql
SELECT COUNT(*)
FROM articles
WHERE status = 'published';
```

---

### 7. 聚合：把多行计算成一个结果

“聚合”表示把多行数据计算成一个结果。`GROUP BY` 先按某些列分组，再让 `COUNT(*)` 分别统计每组有多少行。`AS` 用来给计算结果起列名：

```sql
SELECT status, COUNT(*) AS article_count
FROM articles
GROUP BY status;
```

它会得到每种状态分别有多少篇文章。

这里的 `AS article_count` 把计数结果命名为 `article_count`，代码读取结果时就能使用这个名称。

---

### 8. 索引：让常用查询更快

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

项目出现明确的查询性能问题后，再根据真实查询考虑索引。

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
```

第一遍先掌握上面四类操作。排序分页、统计和索引不影响继续连接 PostgreSQL。

下一章用 Docker 启动 PostgreSQL，再用 Prisma 7 跑通同一套单表 CRUD。
