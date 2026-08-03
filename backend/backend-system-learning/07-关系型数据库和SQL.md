# 07. 关系型数据库：把长期数据放进有规则的表里

## 问题背景

内存数组适合跑通接口，但服务器重启后数据就会消失，也很难可靠处理筛选、关联和多人同时操作。

关系型数据库把数据放进有结构、有约束、可以关联的表里。

---

## 核心解释

### 1. 表、行和列

`articles` 表可以先理解成：

| id | title | slug | status |
|---:|---|---|---|
| 1 | 第一篇文章 | first-article | draft |
| 2 | 第二篇文章 | second-article | published |

```text
表：同一类数据的集合
行：一条具体记录
列：这类数据有哪些字段
```

### 2. 主键和唯一约束

```text
id
-> 主键，用来稳定识别一条记录

slug
-> 唯一约束，防止两篇文章使用同一路径
```

标题可以相同，但 id 和 slug 有不同的唯一性要求。

### 3. 外键表达数据关系

文章和标签放在不同表里，再通过外键关联。

外键可以防止关联到一条根本不存在的数据。

---

## SQL 负责什么

SQL 是和关系型数据库沟通的语言。

### 创建

```sql
INSERT INTO articles (title, slug, content, status)
VALUES ($1, $2, $3, $4)
RETURNING *;
```

### 查询

```sql
SELECT *
FROM articles
WHERE status = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

### 更新

```sql
UPDATE articles
SET title = $1, updated_at = NOW()
WHERE id = $2
RETURNING *;
```

### 删除

```sql
DELETE FROM articles
WHERE id = $1;
```

`INSERT / SELECT / UPDATE / DELETE` 对应数据层的 CRUD。

---

## 为什么不能拼接用户输入

错误示例：

```ts
const sql = `SELECT * FROM articles WHERE id = ${request.params.id}`;
```

用户输入被直接拼进 SQL，可能造成 SQL 注入。

参数化查询：

```ts
await pool.query(
  "SELECT * FROM articles WHERE id = $1",
  [request.params.id],
);
```

SQL 结构和用户数据分开传递。

---

## MySQL 和 PostgreSQL 的关系

它们都是关系型数据库，也都使用 SQL。

你以前接触过的这些概念仍然有效：

- 表、行、列。
- 主键、外键、唯一约束。
- 增删改查。
- JOIN 和事务。

具体数据类型、函数和工具会有差异，但不是从完全无关的知识重新开始。

---

## Mini CMS 中用在哪里

第一版需要四张核心表：

```text
admins
articles
tags
article_tags
```

先从 `articles` 单表开始。文章 CRUD 稳定后，再增加标签关系。

---

## 常见误区

- 把数据库当成一个大 JSON 文件。
- 只在代码里检查唯一性，数据库没有唯一约束。
- 用标题代替稳定 id 关联数据。
- 先写复杂表结构，却没有明确业务规则。
- 直接拼接用户输入生成 SQL。

---

## 小结

```text
数据库负责长期保存和约束数据
表负责描述一类数据
主键负责稳定识别
外键负责建立关系
SQL 负责查询和修改
```

下一步是用 PostgreSQL 建立这些表，再让 Express 通过 `pg` 执行 SQL。
