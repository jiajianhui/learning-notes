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

这一章只练习 SQL 本身，所以示例直接写入固定值。下一章进入项目后改用 Prisma Client 完成相同操作，并理解 ORM 怎样把模型操作转换成数据库查询。

第一遍只读第 1～5 节，先掌握 CRUD。排序分页、统计和索引放在后半章，项目需要时再看。

---

## 1. `INSERT`：增加一行

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
WHERE status = 'published'
ORDER BY created_at DESC;
```

`DESC` 表示从大到小排序。时间越晚，值越大，所以最新文章会排在前面。

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
SET title = '修改后的标题',
    status = 'published',
    updated_at = NOW()
WHERE id = 42
RETURNING id, title, slug, content, status, updated_at;
```

`SET` 指定修改哪些列，`WHERE` 指定修改哪几行。

`NOW()` 会得到执行这条 SQL 时的当前时间。把它写入 `updated_at`，表示这篇文章刚在此时被更新。

没有 `WHERE` 时，所有行都可能被修改。执行前要检查 SQL 里的 `WHERE` 是否准确。

这里不需要先用 `SELECT` 查询文章。`UPDATE` 成功匹配到 id 时，`RETURNING` 会返回修改后的数据；没有返回行时，说明没有文章匹配这个 id，后端可以返回 404。

---

## 5. `DELETE`：删除数据

```sql
DELETE FROM articles
WHERE id = 42
RETURNING id;
```

同样不能随意省略 `WHERE`。没有条件的 `DELETE FROM articles` 会删除表里的所有行。

这里也不需要先用 `SELECT` 查询文章。`DELETE` 匹配到 id 时，会删除该行并返回 id；没有返回行时，说明没有文章匹配这个 id，后端可以返回 404。删除成功且不需要返回正文时，HTTP 接口返回 204。

---

## 完成 CRUD 后再看的查询能力

到这里已经学完最小 CRUD，可以直接进入第 09 章。下面不是第一次连接 PostgreSQL 的前置知识。

### 6. 排序和分页

分页查询：

```sql
SELECT id, title, slug, status, created_at
FROM articles
ORDER BY created_at DESC
LIMIT 20
OFFSET 40;
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
WHERE status = 'published';
```

---

### 7. 聚合：把多行计算成一个结果

最常用的是计数：

```sql
SELECT status, COUNT(*) AS article_count
FROM articles
GROUP BY status;
```

它会得到每种状态分别有多少篇文章。

`AS article_count` 给计数结果起一个列名，读取结果时就能使用 `article_count`。

```text
COUNT
-> 统计行数

GROUP BY
-> 先按某些列分组，再分别计算
```

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
