# 09. 数据关系、JOIN 和事务：多张表怎样一起工作

## 问题背景

单张文章表可以完成基础 CRUD，但真实数据经常互相关联：

```text
作者拥有文章
文章拥有标签
订单包含商品
```

如果把所有内容塞进一张表或一个文本字段，重复数据会越来越多，也无法可靠检查引用的数据是否存在。

这一章解决两个问题：

```text
多张表怎样表达关系？
多条 SQL 怎样一起成功或一起失败？
```

---

## 1. 三种常见关系

### 一对一

```text
一个用户 <-> 一份个人设置
```

一边的一行最多对应另一边的一行。

### 一对多

```text
一个作者 -> 多篇文章
```

通常在“多”的一边保存外键：

```sql
author_id INTEGER NOT NULL REFERENCES authors(id)
```

### 多对多

```text
一篇文章有多个标签
一个标签也属于多篇文章
```

多对多需要第三张中间表记录两边的组合。

---

## 2. 中间表怎样保存多对多

```sql
CREATE TABLE tags (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE article_tags (
  article_id INTEGER NOT NULL
    REFERENCES articles(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL
    REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);
```

`article_tags` 的每一行只表达一个关系：

```text
文章 42 使用标签 3
```

联合主键 `(article_id, tag_id)` 防止同一篇文章重复添加同一个标签。

外键保证文章和标签都真实存在。

---

## 3. 删除一边时，关系怎么办

外键需要明确删除规则：

| 方式 | 含义 |
|---|---|
| `RESTRICT` | 还有数据引用时，不允许删除 |
| `SET NULL` | 删除后把外键设为 `NULL`，该列必须允许空值 |
| `CASCADE` | 删除主体后，一起删除引用它的关联记录 |

在 `article_tags` 中使用 `ON DELETE CASCADE`，表示删除文章后自动删除对应的“文章—标签关系”，不会把标签本身一起删除。

选择哪种方式取决于数据含义，不能所有外键都机械使用 `CASCADE`。

---

## 4. `JOIN` 把关联数据查回来

查询文章 42 的全部标签：

```sql
SELECT tags.id, tags.name, tags.slug
FROM tags
JOIN article_tags
  ON article_tags.tag_id = tags.id
WHERE article_tags.article_id = $1;
```

可以按关系读：

```text
从 tags 开始
-> 找到 tag id 相同的 article_tags
-> 只保留 article_id 为目标文章的关系
```

`JOIN` 不会永久合并表，只是在这一次查询中组合相关行。

### `JOIN` 和 `LEFT JOIN` 的区别

普通 `JOIN` 只返回两边都能匹配的数据。

`LEFT JOIN` 会保留左边所有数据，即使右边没有匹配项。例如列出所有文章，包括还没有标签的文章：

```sql
SELECT articles.id, articles.title, tags.name
FROM articles
LEFT JOIN article_tags
  ON article_tags.article_id = articles.id
LEFT JOIN tags
  ON tags.id = article_tags.tag_id;
```

一篇文章有三个标签时，查询结果可能出现三行相同文章信息。它们代表三条关系，不是三篇不同文章。后端需要按目标聚合标签，或者分两次查询后组合。

---

## 5. 事务让多条 SQL 成为一个整体

假设一次操作需要：

```text
1. 创建文章
2. 保存三个标签关系
```

第一步成功、第二步失败，会留下不完整数据。

事务把多条 SQL 包成一个整体：

```sql
BEGIN;

-- 创建文章
-- 保存标签关系

COMMIT;
```

```text
全部成功
-> COMMIT，正式保存

任何一步失败
-> ROLLBACK，撤销本次已经执行的修改
```

事务只保证这一组数据库修改的一致性，不会自动修复错误 SQL，也不会替代参数校验。

---

## 6. 什么时候需要事务

判断标准只有一个：

> 这些修改是否必须作为一个整体成功？

适合使用事务：

- 创建主体数据并保存多条关联关系。
- 扣减库存并创建订单。
- 转账时同时减少一边余额、增加另一边余额。

通常不需要额外事务：

- 单条普通 `SELECT`。
- 单条 `INSERT`、`UPDATE` 或 `DELETE`。
- 多条互不影响、允许部分失败的操作。

应用代码执行事务时，`BEGIN`、业务 SQL、`COMMIT` 或 `ROLLBACK` 必须使用同一个数据库连接。第 10 章会展示 `pg` 的具体写法。

---

## 当前阶段学到什么程度

个人 Web 项目先掌握：

```text
根据数据含义判断一对多和多对多
使用外键保护引用
使用中间表表达多对多
使用 JOIN 查询关联数据
使用事务保护必须一起完成的多步修改
```

---

## 小结

```text
外键
-> 要求保存的关联 id 必须在另一张表中真实存在

一对多
-> 在“多”的表中保存“一”的 id

多对多
-> 使用中间表，每一行保存两边的一次关联

JOIN
-> 根据关联 id，把多张表中的数据查到同一个结果里

事务
-> 让必须一起完成的多条 SQL 全部成功，或全部撤销
```

下一章把这些 SQL 放进 Node.js，通过 PostgreSQL 和 `pg` 真正执行。
