# 15. 多表关系和事务：增加文章标签时再学

> Mini CMS 阶段 5：先按第 14 章完成 `admin-web-antd` 的文章管理。现在继续修改同一个 `server` 和同一个 Ant Design 后台，为文章增加标签、筛选和发布规则，不创建新 demo。

`JOIN` 是 SQL 中把多张表里有关的数据组合起来查询的操作。事务是把多步数据库修改当成一个整体：全部成功才保留，失败就撤销；这种撤销也叫“回滚”。

## 问题背景

一张 `articles` 表已经能完成文章 CRUD，但标签会带来新的关系：

```text
一篇文章可以有多个标签
一个标签也可以属于多篇文章
```

这种“两边都可以对应多条数据”的情况叫多对多。它需要中间表和关联查询，有些修改还需要事务。

事务的难度高于单表 CRUD，所以不放在第一轮入口中。

这一章沿用第 09 章介绍的 Prisma 7 方案，不切回手写 `pg` 查询。Schema、迁移和标签接口继续写进 `server`，标签管理页面写进 `admin-web-antd`，不再回到第 09 章 demo。

---

## 1. 为什么需要第三张中间表

如果直接把多个标签塞进文章表的一个文本字段，数据库很难保证标签真实存在，也很难按标签可靠筛选文章。

文章与标签通常使用三张表：

```text
articles
-> 保存文章

tags
-> 保存标签

article_tags
-> 每一行保存一篇文章和一个标签的关系
```

例如：

| article_id | tag_id |
|---:|---:|
| 42 | 3 |
| 42 | 7 |

表示文章 42 同时使用标签 3 和标签 7。

这里会用到两个新的约束概念：

```text
外键
-> article_id 必须引用 articles 表里真实存在的 id

联合主键
-> article_id 和 tag_id 两列合在一起唯一识别一条关系
```

---

## 2. 用显式 Prisma 模型保留中间表

Prisma 可以替你隐藏中间模型，这叫“隐式多对多”；也可以让代码明确写出 `ArticleTag`，这叫“显式多对多”。这套学习路线使用显式模型，让外键和联合主键仍然看得见。

下面模型中的 `@relation` 表达外键关系，`@@id` 表达联合主键；`onDelete: Cascade` 表示删除文章或标签时，同时清理中间表中引用它的关系。第 4 节再具体说明删除结果。

在 `prisma/schema.prisma` 中增加关系字段和两个模型：

```prisma
model Article {
  id          Int           @id @default(autoincrement())
  title       String
  slug        String        @unique
  summary     String?
  content     String
  status      ArticleStatus @default(draft)
  createdAt   DateTime      @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt   DateTime      @updatedAt @map("updated_at") @db.Timestamptz(3)
  articleTags ArticleTag[]

  @@map("articles")
}

model Tag {
  id          Int          @id @default(autoincrement())
  name        String
  slug        String       @unique
  articleTags ArticleTag[]

  @@map("tags")
}

model ArticleTag {
  articleId Int @map("article_id")
  tagId     Int @map("tag_id")

  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  tag     Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([articleId, tagId])
  @@map("article_tags")
}
```

这里有两层保护：

```text
@relation(... references: [id])
-> articleId 和 tagId 引用的数据必须真实存在

@@id([articleId, tagId])
-> 同一篇文章不能重复添加同一个标签
```

`articleTags`、`article` 和 `tag` 是 Prisma 用来表达关系的字段，不会额外创建同名数据库列。

修改模型后继续执行：

```bash
npm run db:migrate -- --name add_tags
npm run db:generate
```

然后打开新生成的 `migration.sql`，确认它创建了 `tags`、`article_tags`、外键和联合主键。

---

## 3. `JOIN` 是概念，Prisma 使用关系查询

如果手写 SQL，查询文章 42 的标签大致是：

```sql
SELECT tags.id, tags.name, tags.slug
FROM tags
JOIN article_tags
  ON article_tags.tag_id = tags.id
WHERE article_tags.article_id = 42;
```

按关系读：

```text
从 tags 表读取标签
-> 通过相同的 tag_id 连接 article_tags
-> 只保留目标文章的关系
```

使用 Prisma 关系字段可以表达同一需求。`include` 表示查询文章时，把指定的关联数据也放进返回结果：

```ts
export async function findArticleWithTags(articleId: number) {
  return prisma.article.findUnique({
    where: {
      id: articleId,
    },
    include: {
      articleTags: {
        include: {
          tag: true,
        },
      },
    },
  });
}
```

Prisma 返回的结构大致是：

```text
article
└── articleTags[]
    └── tag
```

Prisma 会把关系查询转换成 SQL，再交给 PostgreSQL 执行。不要假设每个 `include` 都固定生成某一种 JOIN；`JOIN` 是 SQL 概念，关系查询是 Prisma 提供的代码 API。

---

## 4. 删除文章时怎样清理关系

`ArticleTag.article` 的关系使用了：

```prisma
onDelete: Cascade
```

它表示：

```text
删除文章
-> PostgreSQL 自动删除 article_tags 中对应的关系
-> 不会删除标签本身
```

删除标签时，也只会清理中间表里引用它的关系，不会删除文章。

级联删除不是默认万能选项。只有确认“删除主体时，关联记录也应该消失”符合产品规则时才使用。

---

## 5. 让一次关联写入整体成功或失败

Prisma 把“在一次调用中，同时写入主体和关联数据”叫作 nested write（嵌套写入）。例如创建文章时连接已有标签：

```ts
export async function createArticleWithTags(
  input: {
    title: string;
    slug: string;
    content: string;
    status?: "draft" | "published";
  },
  tagIds: number[],
) {
  return prisma.article.create({
    data: {
      ...input,
      articleTags: {
        create: tagIds.map((tagId) => ({
          tag: {
            connect: {
              id: tagId,
            },
          },
        })),
      },
    },
    include: {
      articleTags: {
        include: {
          tag: true,
        },
      },
    },
  });
}
```

```text
全部关联成功
-> 创建文章和关系

任何一步失败
-> Prisma 回滚整个 nested write
```

能用 nested write 清楚表达时，不需要再手动包一层事务。

---

## 6. 多步自定义逻辑再使用事务函数

Prisma 提供的事务函数叫 `$transaction`。传给它的函数会收到参数 `tx`，即这次事务专用的 Prisma Client；事务中的所有数据库操作都要通过它执行。

例如更新文章，并把旧标签关系整体替换为新关系：

```ts
export async function updateArticleWithTags(
  articleId: number,
  input: {
    title?: string;
    content?: string;
    status?: "draft" | "published";
  },
  tagIds: number[],
) {
  return prisma.$transaction(async (tx) => {
    const article = await tx.article.update({
      where: {
        id: articleId,
      },
      data: input,
    });

    await tx.articleTag.deleteMany({
      where: {
        articleId,
      },
    });

    if (tagIds.length > 0) {
      await tx.articleTag.createMany({
        data: tagIds.map((tagId) => ({
          articleId,
          tagId,
        })),
      });
    }

    return article;
  });
}
```

理解重点只有两个：

```text
传给 $transaction 的函数里，查询都使用 tx
-> 它们属于同一个事务

这个函数抛出错误
-> Prisma 回滚，不保留前面已经执行的修改
```

传给 `$transaction` 的函数中不要执行网络请求或其他耗时操作，尽量让事务保持短小。

---

## 当前阶段学到什么程度

练习文章标签时掌握下面五件事即可：

```text
使用显式 ArticleTag 模型保留中间表
使用关系和外键保证引用真实存在
理解 SQL JOIN 解决什么问题
使用 include 或 select 查询关联数据
使用 nested write 或 $transaction 保护多步修改
```

暂时不继续扩展自动隐藏中间模型、复杂嵌套关系等内容。

---

## 小结

```text
多对多
-> 一篇文章有多个标签，一个标签也属于多篇文章

ArticleTag
-> 显式保存文章和标签的关系

JOIN
-> SQL 根据关联 id 组合多张表的数据

include / select
-> Prisma 查询关联模型

nested write
-> 在一次 Prisma 调用中让关联修改整体成功或失败

$transaction
-> 让自定义的多步操作全部成功，或全部撤销
```

这一章是单表 CRUD 之后的项目扩展，不是 PostgreSQL 和 Prisma 的第一轮入门要求。标签 CRUD、文章关联、筛选分页和发布撤回都能在 Mini CMS 中走通后，回到[第 10 章项目总览](./10-MiniCMS项目总览.md)完成阶段 5 验收。下一步再读第 16、16A 章，增加管理员登录和接口保护。

## 官方参考

- [Prisma 关系查询和 nested write](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries)
- [Prisma 事务文档](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)
- [Prisma Schema 参考](https://docs.prisma.io/docs/orm/reference/prisma-schema-reference)
