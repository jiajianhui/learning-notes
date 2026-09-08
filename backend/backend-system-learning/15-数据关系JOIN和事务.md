# 15. 多表关系和事务：给文章增加标签

> Mini CMS 阶段 5：继续修改第 14 章已经跑通的 `server` 和 `admin-web-antd`，为文章增加标签、筛选分页和发布规则，不创建新 demo。

本阶段不处理公开文章详情页和正文排版。`Article.content` 继续保持 Prisma `String`；后端只校验、保存和返回字符串，等阶段 8 接入个人网站时再决定使用现有的 Markdown 还是 MDX 渲染能力。

## 问题背景

阶段 4 结束时，`articles` 一张表就能完成文章 CRUD。现在要给文章打标签，这里出现了前面没遇到过的数据关系：

```text
一篇文章可以有多个标签
一个标签也可以属于多篇文章
```

两边都可以对应多条数据，这叫多对多关系。本章用独立的标签表和中间表保存它，才能统一管理标签，并让数据库检查关系是否合法。

本章要解决四个问题：

```text
标签数据放在哪张表，怎样保证关系引用的文章和标签真实存在
怎样一次查询同时读出文章和它的标签
怎样按标题、状态和标签筛选文章，并分页返回总数
更新文章标签需要多步修改数据库，中途失败时怎样不留下错误数据
```

本章先用 SQL 验证关系，再把查询和写入接回已有接口；事务放在多步更新出现时讲。

先修改 Prisma 模型，再修改第 11、12 章已经建立的文章模块：

```text
prisma/schema.prisma      增加 Tag、ArticleTag 和 publishedAt
article-schema.ts         增加列表查询参数和 tagIds
article-repository.ts     改写列表、详情、创建和更新函数
article-router.ts         列表路由读取 query，并返回 pagination
```

这一章沿用第 09 章的 Prisma 7 方案，不切回手写 `pg` 查询。标签自己的模块和管理页面在第 10 节说明。

---

## 1. 为什么需要第三张表

如果给 `articles` 加一个文本列，把标签保存成 `"后端,数据库"`，数据库确实能存下这串文字，但它不知道逗号两边是两个需要统一管理的标签。

例如，你本来想选“数据库”，却提交了 `"后端,数居库"`。普通文本列照样保存，它不会检查“数居库”是不是标签列表里的一个选项。以后把“后端”改名，也要找出每篇文章里的这段文字再修改。

筛选也容易混淆：如果用“包含后端这段文字”的条件查找，`"后端工程化"` 也会命中。本项目把标签单独保存在 `tags` 表中。文章选择标签时，保存对应的标签 id，例如用 `3` 表示“后端”。

所以这里用三张表：

```text
articles
-> 保存文章本身

tags
-> 保存标签本身

article_tags
-> 每一行保存“哪篇文章使用了哪个标签”
```

假设 `articles` 里有 id 为 42、43 的两篇文章，`tags` 里有 id 为 3（后端）、7（数据库）的两个标签，那么 `article_tags` 只保存它们之间的对应关系：

| article_id | tag_id | 表示 |
|---:|---:|---|
| 42 | 3 | 文章 42 使用标签 3 |
| 42 | 7 | 文章 42 使用标签 7 |
| 43 | 3 | 文章 43 也使用标签 3 |

文章标题保存在 `articles.title`，标签名称保存在 `tags.name`；`article_tags` 只保存文章 id 和标签 id。文章 42 有两个标签，标签 3 属于两篇文章，多对多关系就这样表示出来了。

---

## 2. 用显式 Prisma 模型写出中间表

Prisma 可以替你隐藏中间模型，这叫隐式多对多；也可以让你把 `ArticleTag` 明确写出来，这叫显式多对多。这套学习路线使用显式模型，好处是外键和联合主键仍然看得见，以后想给关系加字段（例如排序值）也不用重做结构。

修改 `prisma/schema.prisma`。`Article` 只增加 `publishedAt` 和 `articleTags` 两行，`Tag` 和 `ArticleTag` 是新模型：

```prisma
model Article {
  id          Int           @id @default(autoincrement())
  title       String
  slug        String        @unique
  summary     String?
  content     String
  status      ArticleStatus @default(draft)
  publishedAt DateTime?     @map("published_at") @db.Timestamptz(3)
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
  @@index([tagId])
  @@map("article_tags")
}
```

### 2.1 `ArticleTag` 里的每一行在做什么

| 写法 | 作用 |
|---|---|
| `articleId Int` | 真正的数据库列，保存文章 id 的数值 |
| `@map("article_id")` | 代码里叫 `articleId`，数据库列叫 `article_id` |
| `article Article` | 关系字段，只存在于 Prisma 代码中，不会生成数据库列 |
| `@relation(fields: [articleId], references: [id])` | 声明外键：用本模型的 `articleId` 列，指向 `Article` 的 `id` 字段 |
| `onDelete: Cascade` | 被引用的文章被删除时，连带删除这些关系行，第 7 节展开 |
| `@@id([articleId, tagId])` | 两列组成联合主键 |
| `@@index([tagId])` | 为“按标签查文章”单独建索引，第 3.2 节说明原因 |
| `@@map("article_tags")` | 模型叫 `ArticleTag`，数据库表叫 `article_tags` |

上面的 `@relation` 和 `@@id` 会让数据库执行两条防错规则：

- **外键**：`@relation(fields: [articleId], references: [id])` 要求关系行中的 `articleId` 能在 `Article.id` 中找到；`tag` 关系同样要求 `tagId` 能在 `Tag.id` 中找到。例如标签 9999 不存在，PostgreSQL 就会拒绝插入 `(42, 9999)`，不会保存“文章 42 使用标签 9999”这条关系。
- **联合主键**：`@@id([articleId, tagId])` 把文章 id 和标签 id 合起来标识一行，因此 `(42, 3)` 只能出现一次，文章 42 不会重复关联标签 3。文章表用一个 `id` 唯一确定一篇文章；中间表用 `articleId` 和 `tagId` 的组合，唯一确定一条文章与标签的关系，因此不需要额外的 `id` 列。

`Article` 和 `Tag` 中还有一行 `articleTags ArticleTag[]`：`articleTags` 是关系字段名，`ArticleTag[]` 表示它对应多条中间表记录。它不是数据库中的数组列，也不会创建名为 `articleTags` 的列。例如文章 42 对应 `(42, 3)`、`(42, 7)` 两行；查询时用 `include` 才把这些关系放进结果数组。

`articleId` 和 `article_id` 都不是 Prisma 规定的名字。Prisma 之所以知道 `articleId` 指向 `Article.id`，靠的是 `@relation` 的两个参数，而不是名字长得像：

```text
fields: [articleId]
-> 本模型（ArticleTag）里哪一列保存外键值

references: [id]
-> 关系字段的目标模型（article Article 中的 Article）里哪个字段被引用
```

把 `articleId` 改名成 `postId`，并同步 `fields`、`@@id` 和调用代码中的字段名，关系依然成立；`@map()` 决定对应的数据库列名。这里理解命名规则即可，不需要实际改名。保持 `articleId` / `article_id` 是命名习惯：Prisma 代码用小驼峰，PostgreSQL 列名用下划线。

关系字段和真实数据的对应是：

```text
ArticleTag.articleId = 42
-> articles 表中 id = 42 那一行
-> Prisma 中通过 articleTag.article 读到这篇文章

ArticleTag.tagId = 3
-> tags 表中 id = 3 那一行
-> Prisma 中通过 articleTag.tag 读到这个标签

Article.articleTags
-> article_tags 中所有 article_id = 当前文章 id 的行

Tag.articleTags
-> article_tags 中所有 tag_id = 当前标签 id 的行
```

`articleTags`、`article` 和 `tag` 都是 Prisma 用来表达关系的字段，不会在数据库里创建同名列。打开迁移 SQL 就能确认：`article_tags` 表只有 `article_id` 和 `tag_id` 两列。

### 2.2 为什么同时增加 `publishedAt`

`status` 只能回答“现在是不是已发布”，回答不了“什么时候发布的”。阶段 8 的公开 API 和个人网站需要按发布时间排序文章、在详情页显示发布日期，所以发布时间必须单独保存。

`createdAt` 代替不了它：草稿可能今天创建、下周才发布，撤回后重新发布时间还会再变。

`publishedAt` 写成 `DateTime?`，因为草稿没有发布时间。它由后端按发布规则维护，第 6 节实现。

### 2.3 执行迁移

在 `mini-cms/server` 目录执行；本章后面的类型检查也在这个目录运行：

```bash
npm run db:migrate -- --name add_tags_and_publishing
npm run db:generate
```

`--name add_tags_and_publishing` 是这次迁移的名字，由你自己决定。Prisma 用它生成迁移目录，例如 `prisma/migrations/20260904103000_add_tags_and_publishing/migration.sql`。名字只影响目录名和迁移历史的可读性，不影响生成的 SQL；写清楚“这次改了什么”，以后回看历史才能直接看懂。

打开新生成的 `migration.sql`，确认里面出现了：

```text
CREATE TABLE "tags"
CREATE TABLE "article_tags"
ALTER TABLE "articles" ADD COLUMN "published_at"
PRIMARY KEY ("article_id", "tag_id")
FOREIGN KEY ("article_id") REFERENCES "articles"("id") ... ON DELETE CASCADE
FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ... ON DELETE CASCADE
```

这里使用可为空的列，既表示草稿没有发布时间，也让已有文章可以完成迁移。迁移后，旧文章的 `published_at` 都是 `NULL`；第 6 节验证时，已有的 published 练习文章先撤回再发布，生成新的发布时间，不猜测它过去的真实发布时间。

---

## 3. 先用 SQL 确认关系真的建立起来了

Prisma Client 还没写一行标签代码，但表和约束已经在数据库里了。这一节先在 TablePro 里插入几条假数据，用 SQL 验证关系是否符合预期。这样做的好处是：后面 Prisma 查询结果不对时，你已经知道数据库这一层是好的。

按第 09 章的方式连接本地 PostgreSQL，按 `⌘T` 打开查询标签，把光标放在一条 SQL 上按 `⌘↩︎` 逐条执行。

### 3.1 插入假数据

```sql
INSERT INTO articles (title, slug, content, status, updated_at)
VALUES
  ('Prisma 入门', 'ch15-prisma-intro', '关系查询练习', 'draft', CURRENT_TIMESTAMP),
  ('Express 中间件', 'ch15-express-middleware', '中间件练习', 'draft', CURRENT_TIMESTAMP)
RETURNING id, title, slug;

INSERT INTO tags (name, slug)
VALUES ('后端', 'ch15-backend'), ('数据库', 'ch15-database')
RETURNING id, name, slug;
```

这些 slug 带 `ch15-`，便于识别练习数据；同一组 INSERT 只执行一次。记下两次 `RETURNING` 返回的 id。本章后面的 SQL、请求 URL 和 JSON 都用文章 `42、43`、标签 `3、7` 举例，执行时统一替换成你的真实 id；`9999` 也要确认是不存在的标签 id：

```sql
INSERT INTO article_tags (article_id, tag_id)
VALUES (42, 3), (42, 7), (43, 3);
```

这三行就是第 1 节表格里的关系数据。

### 3.2 用 JOIN 把两张表的数据组合起来

`JOIN` 是 SQL 中按关联列把多张表的行拼到一起查询的操作。查询文章 42 的所有标签：

```sql
SELECT tags.id, tags.name, tags.slug
FROM tags
JOIN article_tags
  ON article_tags.tag_id = tags.id
WHERE article_tags.article_id = 42;
```

按关系读：

```text
从 tags 表取标签
-> 只保留 article_tags 中 tag_id 与之相等的行（JOIN ... ON）
-> 再只保留 article_id = 42 的关系（WHERE）
-> 得到文章 42 的标签列表
```

反过来查“标签 3 下面有哪些文章”，只是交换了两张表的位置：

```sql
SELECT articles.id, articles.title
FROM articles
JOIN article_tags
  ON article_tags.article_id = articles.id
WHERE article_tags.tag_id = 3;
```

这条查询正是 `@@index([tagId])` 服务的场景。联合主键 `(article_id, tag_id)` 的索引以 `article_id` 为前导列，更适合先按文章查关系；只按 `tag_id` 查询时，单独的标签索引通常更高效。数据量小时看不出差别，但按标签筛选文章是管理后台的常用操作，第 5 节的接口会一直用到。

### 3.3 让两条约束真的报错一次

约束写进 schema 很容易，确认它生效更重要。下面两条 SQL 预期都失败：

```sql
INSERT INTO article_tags (article_id, tag_id)
VALUES (42, 9999);
```

```text
外键拦住它
-> tags 表里没有 id = 9999 的标签
-> 报错信息包含 violates foreign key constraint
```

```sql
INSERT INTO article_tags (article_id, tag_id)
VALUES (42, 3);
```

```text
联合主键拦住它
-> (42, 3) 这条关系已经存在
-> 报错信息包含 duplicate key value violates unique constraint
```

两条都报错，说明第 2.1 节的两条约束真的由 PostgreSQL 执行，而不只是写在文档里。

### 3.4 保留数据，继续用接口验证

先保留这两篇文章、两个标签和三行关系。第 4～9 节会用它们验证详情、筛选、发布和标签更新，不必等标签 CRUD 接口写完才继续。

如果后面验证失败，先在 TablePro 中查看当前数据：关系会随着你的 PATCH 请求变化，不一定还保持第 1 节的样子。全部练习结束后，再按第 10 节清理。

---

## 4. Prisma 用关系查询代替手写 JOIN

第 09 章的 `getArticleById()` 只返回文章字段，第 14 章编辑抽屉也通过它读取详情。现在让这个已有接口同时返回标签。

在 `server/src/modules/articles/article-repository.ts` 中替换 `getArticleById()`，保留原函数名和参数，`article-router.ts` 的详情路由不用改。`include` 表示查询主体时，把指定的关联数据一起放进返回结果：

```ts
export async function getArticleById(articleId: number) {
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

外层 `include` 取出这篇文章的关系行，内层 `include` 再沿每条关系行取出对应的标签。返回的是嵌套对象，而不是 SQL 那样的扁平结果表：

```text
article
├── id / title / slug / status / ...
└── articleTags[]
    └── tag
        └── id / name / slug
```

所以读取标签名要写成 `article.articleTags.map((item) => item.tag.name)`。中间多一层 `articleTags`，正是因为用了显式中间模型。

`JOIN` 描述 SQL 怎样按列连接表；`include` 描述 Prisma 返回结果要带哪些关联数据。你写的是关系查询，Prisma 负责生成 SQL。当前只需能沿 `Article → ArticleTag → Tag` 读懂结果，不需要预测它执行一条还是多条 SQL。

保存后执行 `npx tsc --noEmit`，用 Apifox 请求 `GET /api/articles/42`。响应的 `data.articleTags` 应有两项，每项都有 `articleId`、`tagId` 和嵌套的 `tag` 对象；标签名分别为“后端”和“数据库”。没有标签的文章应返回 `articleTags: []`。

这份详情响应会用于第 10 节的编辑回填：`article.articleTags.map((item) => item.tag.id)` 得到多选框需要的标签 id 数组。

---

## 5. 让文章列表支持筛选和分页

### 5.1 现在的问题

`getArticles()` 从第 09 章写下后一直没变：

```ts
export async function getArticles() {
  return prisma.article.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
```

它一次返回全部文章，没有任何条件。管理后台需要的是按标题搜索、按状态和标签筛选、分页显示，并且分页器要显示“符合条件的总数”。这些都要由后端完成，页面只提交条件。

改动落在第 11、12 章建立的三层上：

```text
article-schema.ts
-> 增加列表查询参数的 Schema

article-repository.ts
-> 把参数转换成 Prisma 查询条件

article-router.ts
-> 校验 query，并返回带分页信息的响应
```

### 5.2 第一步：校验列表查询参数

先看一个列表请求：

```text
GET /api/articles?status=draft&tagId=3&page=2&pageSize=10
                 └─ ? 后面是查询字符串，多个“参数名=值”用 & 分隔
```

这里表示“筛选使用标签 3 的草稿，取第 2 页，每页 10 条”。这些简单参数到达 Express 时，`request.query` 中的值是 `"draft"`、`"3"`、`"2"`、`"10"`，数字也还没有转换成 JavaScript 的 number。

顺便分清 Express 从哪里读取输入。下面的 `req` 就是前面代码里的 `request`，只是变量名不同，属性名都使用小写：

| 位置 | 请求例子 | 读取结果 |
|---|---|---|
| `req.query` | `GET /api/articles?page=2` | `req.query.page` 是 `"2"`，用于筛选和分页 |
| `req.params` | 路由为 `/api/articles/:id`，请求 `/api/articles/42` | `req.params.id` 是 `"42"`，用于确定操作哪篇文章 |
| `req.body` | `PATCH /api/articles/42`，JSON 请求体为 `{"tagIds":[3,7]}` | 经 `express.json()` 解析后，`req.body.tagIds` 是数字数组，用于提交修改内容 |

这些输入都要经过对应 Schema 校验。先在 `src/modules/articles/article-schema.ts` 末尾增加列表查询规则：

```ts
export const listArticlesQuerySchema = z.strictObject({
  title: z.string().trim().min(1).optional(),
  status: statusSchema.optional(),
  tagId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type ListArticlesQuery = z.infer<
  typeof listArticlesQuerySchema
>;
```

`tagId`、`page` 和 `pageSize` 用 `z.coerce.number()` 先把字符串转成数字，再检查整数和范围；`title`、`status` 直接按字符串检查。

`default()` 让没有提交分页参数的请求也能得到确定的值，因此校验通过后 `page` 和 `pageSize` 一定有值，repository 里不用再判断。`max(100)` 防止客户端一次请求上万条。

Zod 也有 `z.object()`，它默认从校验结果中去掉未声明的字段；`z.strictObject()` 则直接报错。这里选择后者：例如误写 `?pages=2`，会返回 422，而不是丢掉 `pages` 后悄悄按第 1 页查询。新增查询参数时，要同步修改这个 Schema。

### 5.3 第二步：把参数转换成 Prisma 查询条件

**API 查询参数由我们设计，Prisma 查询条件由模型决定。** 例如可以把 URL 参数命名为 `keyword`，再把它转换成文章标题条件；它不一定与数据库列同名。本章为了直观，搜索参数仍叫 `title`。

`where` 是交给 Prisma 的筛选条件对象；`Prisma.ArticleWhereInput` 是 Prisma 根据 `Article` 模型生成的类型。条件中要使用它认识的字段、关系字段和运算符：`title`、`status` 属于文章，`articleTags` 是文章关系，`some` 表示至少一条关系满足条件。

因此，URL 中的 `tagId=3` 不能直接变成文章条件 `{ tagId: 3 }`，因为 `Article` 没有 `tagId`。要写成 `{ articleTags: { some: { tagId: 3 } } }`，沿关系筛选；`page`、`pageSize` 则转换成 `skip`、`take`，不放进 `where`。

替换 `article-repository.ts` 中的 `getArticles()`，并在文件顶部增加以下导入：

```ts
import { Prisma } from "../../generated/prisma/client";
import type { ListArticlesQuery } from "./article-schema";
```

`Prisma` 现在用于查询条件类型，第 8 节还会用它识别数据库异常，所以这里使用普通导入。已有的 `CreateArticleInput`、`UpdateArticleInput` 类型导入保留。

```ts
export async function getArticles(query: ListArticlesQuery) {
  const { title, status, tagId, page, pageSize } = query;

  const where: Prisma.ArticleWhereInput = {
    title: title
      ? {
          contains: title,
          mode: "insensitive",
        }
      : undefined,
    status,
    articleTags: tagId
      ? {
          some: {
            tagId,
          },
        }
      : undefined,
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        articleTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  return { articles, total };
}
```

新出现的写法：

| 写法 | 作用 |
|---|---|
| 条件值为 `undefined` | Prisma 忽略这一条，等于不筛选。这里不能写 `null`，`null` 表示“这一列的值是 NULL” |
| `contains` + `mode: "insensitive"` | 标题包含指定文字，且不区分大小写 |
| `articleTags: { some: { tagId } }` | 这篇文章的多条关系行中，至少有一条的 `tagId` 等于给定值 |
| `skip` / `take` | 跳过前面几条、最多取几条，这是分页在数据库层的做法 |
| `count({ where })` | 只统计符合条件的行数，不返回文章内容 |

`status` 用简写属性直接放进 `where`：它的值是 `"draft"`、`"published"` 或 `undefined`，正好对应“筛选这个状态”和“不筛选状态”。

`findMany()` 和 `count()` 各回答一个问题。假设符合筛选条件的文章一共 23 篇，当前请求第 2 页、每页 10 条：

| 查询 | 得到什么 | 页面用在哪里 |
|---|---|---|
| `findMany({ where, skip: 10, take: 10, ... })` | 排序后的第 11～20 篇文章，组成数组 | Table 显示这一页的 10 行 |
| `count({ where })` | 数字 `23`，没有 `skip` / `take`，统计所有符合条件的文章 | 分页器显示共 23 条、共 3 页 |

两次查询的筛选条件要相同，本章复用一个 `where` 变量，避免列表与总数各算各的。不是语法规定它们必须引用同一个变量，而是它们必须统计同一批符合条件的文章。

`Promise.all()` 同时发起这两次查询，并按传入数组的位置返回结果；谁先完成都不改变顺序。`const [articles, total] = ...` 是数组解构：第一个 `findMany()` 的结果赋给 `articles`，第二个 `count()` 的结果赋给 `total`。

最后返回 `{ articles, total }`。下一步 router 把 `articles` 放进响应的 `data`，把 `total` 放进 `pagination.total`，页面才同时拿到“本页内容”和“全部符合条件的数量”。

`orderBy` 先按创建时间倒序，同一时间再按 id 倒序，让分页的顺序确定。

`select` 里顺带取出了 `publishedAt` 和每篇文章的标签，列表页因此能直接显示标签和发布时间，不用为每一行再请求一次接口。

### 5.4 第三步：返回带分页信息的响应

`article-router.ts` 中的列表路由原来是：

```ts
articleRouter.get("/", async (_request, response) => {
  const articles = await getArticles();

  response.json({ data: articles });
});
```

改成：

```ts
articleRouter.get("/", async (request, response) => {
  const query = listArticlesQuerySchema.parse(request.query);
  const { articles, total } = await getArticles(query);

  response.json({
    data: articles,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
    },
  });
});
```

`_request` 改成 `request`，因为现在要读 `request.query` 了；同时把 `listArticlesQuerySchema` 加进文件顶部的 Schema 导入。

响应沿用第 06 章约定的列表结构：

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0
  }
}
```

### 5.5 验证

先执行 `npx tsc --noEmit`，再用 Apifox 请求：

| 请求 | 预期 |
|---|---|
| `GET /api/articles` | 200，`pagination` 是默认的第 1 页、20 条 |
| `GET /api/articles?title=prisma` | 只返回标题包含 prisma 的文章，大小写不敏感 |
| `GET /api/articles?status=draft` | 只返回草稿 |
| `GET /api/articles?tagId=3` | 只返回使用标签 3 的文章 |
| `GET /api/articles?page=2&pageSize=1` | 返回第 2 条，`total` 与不分页时相同 |
| `GET /api/articles?page=0` | 422 `VALIDATION_ERROR` |

`data` 仍然是文章数组，所以 `admin-web-antd` 的文章列表页现在还能正常显示第一页数据。把筛选表单和分页器接上去是页面任务，第 10 节说明。

---

## 6. 让 status 和 publishedAt 按同一条规则变化

### 6.1 现在的问题

`status` 表示文章现在是否公开，`publishedAt` 记录这一次发布发生的时间。产品规则是：

```text
新建草稿
-> status = draft，publishedAt = null

首次发布或重新发布
-> status = published，publishedAt = 当前时间

撤回文章
-> status = draft，publishedAt = null

只修改标题或正文
-> 保留原来的 status 和 publishedAt
```

这条规则只能由后端执行。如果让客户端提交 `publishedAt`，两个管理后台就要各写一遍相同规则，而且客户端可能提交一个与 `status` 互相矛盾的时间。

### 6.2 第一步：确认 Schema 不接受 publishedAt

`article-schema.ts` 暂时不用改：客户端提交 `status`，`publishedAt` 由后端计算，现有的 `z.strictObject()` 会拒绝客户端提交这个时间。

`UpdateArticleInput` 描述请求输入；下面的 `article` 是数据库查询结果。`article.publishedAt` 来自第 2 节新增的 Prisma 字段，不需要加入 `UpdateArticleInput`。

### 6.3 第二步：在 repository 里先读旧状态再计算

原来的 `updateArticle()` 直接用 `data: input` 更新。现在需要知道旧状态，才能判断是否发生了发布或撤回。

在 `server/src/modules/articles/article-repository.ts` 中替换 `updateArticle()`：

```ts
export async function updateArticle(
  articleId: number,
  input: UpdateArticleInput,
) {
  const article = await prisma.article.findUnique({
    where: {
      id: articleId,
    },
  });

  if (!article) {
    throw new AppError(
      404,
      "ARTICLE_NOT_FOUND",
      "文章不存在",
    );
  }

  let publishedAt = input.status === undefined ? undefined : article.publishedAt;

  if (input.status !== undefined && input.status !== article.status) {
    publishedAt = input.status === "published" ? new Date() : null;
  }

  return prisma.article.update({
    where: {
      id: article.id,
    },
    data: {
      ...input,
      publishedAt,
    },
  });
}
```

`findUnique()` 查出修改前的文章，`article.status` 和 `article.publishedAt` 就是原来的状态和时间。这里不必写 `select`：默认会返回文章自身的字段，包括这两个字段；关系数据仍要通过 `include` 等方式显式查询。

`AppError` 需要在文件顶部导入：

```ts
import { AppError } from "../../errors/app-error";
```

第 11 章的做法是让 `update()` 找不到数据时抛出 Prisma 的 `P2025`，再由错误中间件转成 404。现在 repository 自己先查了一次，所以在这里直接抛出同一个 `AppError`，两条路径返回的响应结构一致。

条件判断覆盖三种情况：

```text
input.status 没有提交
-> publishedAt 为 undefined，Prisma 不修改这一列
-> 只改标题或正文不会影响发布时间

input.status 与原状态相同
-> publishedAt 使用查出的原值，重复提交“发布”不会刷新发布时间

input.status 与原状态不同
-> published 写入 new Date()，draft 写回 null
```

`data: { ...input, publishedAt }` 先展开客户端提交的字段，再用后端算出的 `publishedAt` 收尾。撤回后不会留下一个仍然像“已发布”的时间，重新发布也会得到新的发布时间。

同一文件中的 `createArticle()` 也要同步修改，避免直接新建已发布文章时缺少时间：

```ts
export function createArticle(input: CreateArticleInput) {
  return prisma.article.create({
    data: {
      ...input,
      publishedAt: input.status === "published" ? new Date() : null,
    },
  });
}
```

第 8 节在这个函数上继续增加标签写入。

### 6.4 验证

先运行 `npx tsc --noEmit`，再在 Apifox 中依次操作第 3 节的草稿文章。表中的字段写进 JSON 请求体，例如 `{"status":"published"}`。迁移前已有的 published 练习文章先提交 `draft`，再提交 `published`，之后再检查时间；原地重复发布不会补写旧数据缺失的时间。

| 请求 | 预期 |
|---|---|
| `PATCH` 提交 `status=published` | 200，`publishedAt` 变成当前时间 |
| 再次提交 `status=published` | `publishedAt` 不变 |
| `PATCH` 提交 `status=draft` | `publishedAt` 变回 `null` |
| `PATCH` 只提交 `title` | `status` 和 `publishedAt` 都不变 |
| `PATCH` 提交 `publishedAt` | 422 `VALIDATION_ERROR` |
| `POST` 用新 slug 创建 `status=published` 的文章 | 201，`publishedAt` 有值 |

阶段 8 的公开接口只返回 `status = published` 且 `publishedAt` 不为 `null` 的文章，所以这里的数据规则会直接影响个人网站能否正确显示内容。

---

## 7. 删除文章和删除标签分别发生什么

`ArticleTag` 的两个关系字段都写了 `onDelete: Cascade`。它决定的是“被引用的那一行被删除时，引用它的关系行怎么办”：

```text
删除文章 42
-> PostgreSQL 自动删除 article_tags 中 article_id = 42 的关系行
-> 标签 3 和标签 7 本身不受影响，仍然可以给其他文章使用

删除标签 3
-> PostgreSQL 自动删除 article_tags 中 tag_id = 3 的关系行
-> 文章 42 和文章 43 本身不受影响，只是各少了一个标签
```

先记住这两条规则，完成第 9 节后再实际删除练习数据，验证关系行消失而另一端的文章或标签仍然存在。

本章两个外键都不可为空，省略 Prisma 的 `onDelete` 时默认使用 `Restrict`，有引用就拒绝删除：只要 `article_tags` 里还有引用某篇文章的关系行，`DELETE FROM articles` 就会失败。这个默认行为在别的场景里才是对的，例如删除一个下面还有文章的分类时，应该先要求用户处理那些文章，而不是悄悄断开关系。

这里选择 Cascade，是因为关系行只表示“文章使用了标签”。文章或标签删除后，这条关系也应该消失；它不会沿着中间表继续删除另一端的主体。

---

## 8. 用 nested write 在一次调用里写入文章和标签

### 8.1 现在的问题

标签不是文章必填项，创建和更新请求中的 `tagIds` 都是可选的：创建时不传表示不关联标签，更新时不传表示保留原来的标签；更新时传 `[]` 才表示清空。

当新建文章并选择标签时，需要新增一条文章记录和若干条关系记录。假设页面加载时标签 3、7 都存在，用户选中了它们，但提交前，标签 7 被另一个窗口删除了。如果后端先单独保存文章，再尝试关联标签 7，第二步就会失败，造成“接口报错，文章却已经创建”的结果。

nested write（嵌套写入）会把这些写入放在同一个事务里：文章和关系都写成功才保存；任一关系写失败，这次新增的文章和关系都撤销，原有标签不受影响。这就是这里所说的“整体成功或整体失败”。

### 8.2 第一步：让创建接口接受 tagIds

在 `article-schema.ts` 中先定义一个可复用的标签数组规则，再给 `createArticleSchema` 增加 `tagIds`：

```ts
const tagIdsSchema = z.array(z.number().int().positive()).max(20)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "标签不能重复",
  });

export const createArticleSchema = z.strictObject({
  title: titleSchema,
  slug: slugSchema,
  summary: summarySchema.optional(),
  content: contentSchema,
  status: statusSchema.optional(),
  tagIds: tagIdsSchema.optional(),
});
```

`CreateArticleInput` 由这个 Schema 推导，所以它自动多了一个可选的 `tagIds`，router 里的 `createArticleSchema.parse(request.body)` 也不用改。

请求体里的 `tagIds` 要提交 JSON 数字数组，例如 `[3, 7]`。`z.number()` 会拒绝 `["3", "7"]`，这里不做自动转换；第 5 节的 `tagId` 来自 URL 查询字符串，才需要 `coerce`。

`new Set(ids)` 会去掉重复值；去重后数量与原数组不同，就说明提交了重复标签，返回 422，避免 `(article_id, tag_id)` 联合主键冲突。更新接口到第 9 节再增加这个字段，与更新函数一起修改。

### 8.3 第二步：用 nested write 创建文章和关系

在 `server/src/modules/articles/article-repository.ts` 中替换第 6 节的 `createArticle()`。`tagIds` 表示客户端选中的标签 id。第 2 节已经建立 `ArticleTag` 模型及 `article_tags` 表，第 3 节已插入可供选择的标签记录。本次调用新增的是“这篇新文章使用了哪些标签”的关系行，不是创建中间表；被选择的标签记录必须已经存在。

```ts
export function createArticle(input: CreateArticleInput) {
  const { tagIds, ...articleInput } = input;

  return prisma.article.create({
    data: {
      ...articleInput,
      publishedAt: input.status === "published" ? new Date() : null,
      articleTags: {
        create: tagIds?.map((tagId) => ({
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
  }).catch((error: unknown) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025") {
      throw new AppError(422, "TAG_NOT_FOUND", "部分标签不存在，请重新选择");
    }
    throw error;
  });
}
```

**上面 `data.articleTags.create` 就是嵌套写入的位置**：外层 `prisma.article.create()` 创建文章，内层 `articleTags.create` 创建关系，再通过 `tag.connect` 连接已有标签。把关联写入放在主体写入的 `data` 中，就叫 nested write；它不是一个名为 `nestedWrite()` 的函数。后面的 `include` 用于读取返回数据，不负责写入。

`tagIds` 是用来选择标签的请求数据，不是数据库列。`Article` 模型没有 `tagIds` 字段，所以不能把整个 `input` 直接作为 `data` 交给 Prisma。先单独取出 `tagIds`，其余字段用于创建文章，再根据 `tagIds` 为这篇文章创建对应的 `ArticleTag` 记录。

沿着一次实际输入看这个函数。假设输入中有 `title`、`slug`、`content` 和 `tagIds: [3, 7]`，本次新文章生成的 id 为 42：

1. `const { tagIds, ...articleInput } = input` 是对象解构加剩余收集：单独取出 `tagIds`，其余字段重新组成一个新的 `articleInput` 对象。原来的 `input` 不会被删除字段。
2. `data` 中的 `...articleInput` 用来保存文章自身字段，`publishedAt` 继续按第 6 节计算。
3. `articleTags.create` 创建的是 `ArticleTag`。`map()` 把 `[3, 7]` 变成两份关系创建数据。每份里的 `tag.connect.id` 分别为 3、7，表示连接已经存在的 `Tag`。

两个外键的来源是：

```text
外层 prisma.article.create：新建 Article，得到 id = 42
└── articleTags.create：给“当前 Article”创建关系
    ├── tag.connect.id = 3  -> ArticleTag(articleId: 42, tagId: 3)
    └── tag.connect.id = 7  -> ArticleTag(articleId: 42, tagId: 7)
```

**`articleId` 由当前新建的 Article 自动提供，`tagId` 由 `tag.connect.id` 指定的 Tag 提供，两者组成一条中间表记录。** 所以这里不用自己先拿文章 id 再填写 `articleId`；也不会创建两个新标签。

没有提交 `tagIds` 时，`tagIds?.map(...)` 得到 `undefined`，不创建关系；传 `[]` 时也没有关系行可创建。文章仍可正常保存。

当 `connect` 找不到要连接的标签时，**Prisma 在后端抛出异常**。这里的 `catch` 捕获 `P2025`，再抛出 `AppError`，最后由错误中间件返回 422 和错误 JSON。

Apifox 和管理页面都请求同一个接口，所以都可能收到这个错误。例如第 8.1 节中，页面选中的标签在提交前被删除，后端仍会拒绝关联；前端请求函数检查 `response.ok` 后抛出错误，页面的 `catch` 再显示提示。Apifox 只是方便主动提交一个不存在的标签 id 来验证。

### 8.4 验证

先运行 `npx tsc --noEmit`。POST 使用第 11 章的完整创建请求体，并使用未占用的 slug，再增加例如 `"tagIds": [3, 7]` 的字段；不能只提交标签数组。

| 请求 | 预期 |
|---|---|
| `POST` 带两个有效 `tagIds` | 201，响应里的 `articleTags` 有两条 |
| `POST` 带一个不存在的 `tagId` | 422 `TAG_NOT_FOUND`，且 TablePro 里查不到这篇文章 |
| `POST` 带重复的 `tagIds=[3, 3]` | 422 `VALIDATION_ERROR` |
| `POST` 不带 `tagIds` | 201，`articleTags` 是空数组 |
| `POST` 带 `status=published` | `publishedAt` 有值 |

第二条最值得亲手试一次：请求失败后去数据库确认文章确实没有被创建，这就是“整体成功或整体失败”的实际含义。

文章 slug 重复等其他错误仍交给原错误中间件；第 10.2 节汇总新增错误的处理位置。

---

## 9. 用 $transaction 替换文章的标签

### 9.1 现在的问题

编辑文章时，页面提交的是“这篇文章最终应该有哪些标签”。数据库里已经存着一批旧关系行，所以要做三件事：

```text
1. 更新文章本身（标题、正文、状态、发布时间）
2. 删除这篇文章现有的全部关系行
3. 按新的 tagIds 插入关系行
```

本节把更新展开成多步，便于理解事务怎样保护这些修改。

如果这三次操作各自执行，假设第 2 步成功、第 3 步失败：

```text
旧关系已经被删除
-> 新关系没有写进去
-> 这篇文章的标签全部丢失，而客户端收到的是一个错误响应
```

用户看到“更新失败”，但数据已经被改坏了，而且没有任何地方记录原来的标签是什么。

### 9.2 事务解决什么

事务（transaction）是把多步数据库修改当成一个整体交给数据库：全部成功才真正保留，任何一步失败就撤销本事务已经做出的修改，不保留只完成了一半的结果。这种撤销叫回滚（rollback）。

放回上面的例子：

```text
不用事务
-> 每次操作各自独立生效，第 2 步的删除立刻是永久的
-> 第 3 步失败后，标签已经没了

用事务
-> 第 3 步失败时，第 2 步的删除也被回滚
-> 数据库里仍然是修改前的旧标签，与“更新失败”的响应一致
```

事务不会把失败变成成功，它保证的是“失败之后数据仍然完整可信”。

Prisma 的事务写法是 `prisma.$transaction()`。给它传一个函数，这个函数会收到一个参数，惯例命名为 `tx`；`tx` 是这次事务专用的 Prisma Client，用法和 `prisma` 完全一样。只有通过 `tx` 执行的操作才属于这个事务：函数里如果误用了外面的 `prisma`，那一次操作在事务之外，失败时不会被回滚。

### 9.3 先改更新 Schema，再替换 updateArticle

在 `server/src/modules/articles/article-schema.ts` 的 `updateArticleSchema` 中，紧接 `status` 增加一行，其他字段和“至少提交一个字段”的校验保留：

```ts
tagIds: tagIdsSchema.optional(),
```

`tagIdsSchema` 复用第 8 节的规则，`UpdateArticleInput` 会自动带上 `tagIds`。接着在 `article-repository.ts` 中替换第 6 节的 `updateArticle()`：

```ts
export async function updateArticle(
  articleId: number,
  input: UpdateArticleInput,
) {
  const { tagIds, ...articleInput } = input;

  return prisma.$transaction(async (tx) => {
    const article = await tx.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new AppError(404, "ARTICLE_NOT_FOUND", "文章不存在");
    }

    // 沿用第 6 节的规则；未提交 status 时不写发布时间。
    let publishedAt = input.status === undefined ? undefined : article.publishedAt;

    if (input.status !== undefined && input.status !== article.status) {
      publishedAt = input.status === "published" ? new Date() : null;
    }

    await tx.article.update({
      where: { id: article.id },
      data: { ...articleInput, publishedAt },
    });

    if (tagIds !== undefined) {
      await tx.articleTag.deleteMany({
        where: { articleId: article.id },
      });

      if (tagIds.length > 0) {
        await tx.articleTag.createMany({
          data: tagIds.map((tagId) => ({
            articleId: article.id,
            tagId,
          })),
        });
      }
    }

    return tx.article.findUniqueOrThrow({
      where: { id: article.id },
      include: { articleTags: { include: { tag: true } } },
    });
  }).catch((error: unknown) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003") {
      throw new AppError(422, "TAG_NOT_FOUND", "部分标签不存在，请重新选择");
    }
    throw error;
  });
}
```

和第 6 节相比，关键变化是：

- 把 `tagIds` 单独取出，其他字段仍用于更新文章。
- 查询旧状态、更新文章和替换关系都使用事务里的 `tx`。旧状态会参与后续写入，不能仅因为它是一次读取就认定它与事务无关。
- 不传 `tagIds` 就保留标签；传 `[]` 就清空关系；传 `[3, 7]` 就替换成这两个标签。
- 全部写完后重新查询文章和标签，让更新响应带上最终的 `articleTags`。

第 14 章保存成功后，会用接口返回的新文章对象，替换前端 `articles` 数组中同 id 的旧对象，Table 因此显示最新内容。这一步只是更新页面内存中的数据，不会再次修改数据库。接入筛选分页后，文章可能不再符合当前条件，总数也可能变化，因此按第 10.3 节重新请求当前页，让列表和分页器一起更新。

`deleteMany()` 删除所有匹配行，没有匹配行也不报错；`createMany()` 一次插入多行关系。

最后重新查询文章和最新标签，作为更新结果返回。这里使用 `findUniqueOrThrow()`，保证成功时返回文章对象；如果没有找到文章，就抛出异常，使本次事务回滚，避免接口返回成功却得到 `data: null`。也可以用 `findUnique()`，但要再判断结果是否为 `null`，并在找不到文章时手动抛错。

标签不存在时，插入关系会触发外键错误 `P2003`。事务先回滚文章和关系的修改，外面的 `catch` 再把错误转成 422。这里能写 `TAG_NOT_FOUND`，是因为已经在本次操作中确认文章存在，并且新增的是它到标签的关系；不要把整个项目的所有外键错误都翻译成“标签不存在”。

事务内的数据库操作全部使用 `tx`，也不要在里面加入网络请求等慢操作。本节验证的是多步写入共同成功或回滚；并发请求之间的隔离规则暂时不展开。

### 9.4 验证

先运行 `npx tsc --noEmit`。以下请求均为 `PATCH /api/articles/42`，请求体是 JSON，例如 `{"tagIds":[3,7]}`。

| 请求 | 预期 |
|---|---|
| `PATCH` 提交 `tagIds=[3, 7]` | 200，`article_tags` 里这篇文章正好两行 |
| 再提交 `tagIds=[3]` | 只剩一行，标签 7 的关系被删除，标签 7 本身还在 |
| 提交 `tagIds=[]` | 这篇文章没有关系行，`tags` 表不变 |
| 提交 `tagIds=[9999]`，同时修改 `title` | 422 `TAG_NOT_FOUND`，旧标题和旧标签都保留 |
| 只提交 `title` | 标签不变 |

验证第四条前，先提交 `[3, 7]` 恢复两条旧关系，并记下原来的标题。失败后确认标题和两条关系都没变，这才看得出回滚生效了。如果这时发现标签被清空了，检查 `deleteMany` 是不是误写成了 `prisma.articleTag.deleteMany` 而不是 `tx.articleTag.deleteMany`。

成功更新时还要检查响应：`data.articleTags` 应反映最终标签；再请求详情接口，结果应一致。

---

## 10. 标签自己的 CRUD 和页面怎么办

到这里，后端已经能处理关系、筛选和发布规则，但标签本身还不能被管理，页面上也还没有标签相关的操作入口。这两件事继续复用已学的 CRUD 和页面流程。下面给出修改位置与验收要求，作为本阶段的独立练习，不重复整套组件代码。

### 10.1 标签接口

标签 CRUD 与文章 CRUD 结构完全相同，按第 11、12 章的三层新建一个模块：

```text
src/modules/tags/
├── tag-schema.ts       Zod 校验和推导类型
├── tag-repository.ts   Prisma 查询
└── tag-router.ts       四个路由
```

在 `src/app.ts` 中导入并注册，放在 404 和错误中间件之前：

```ts
import { tagRouter } from "./modules/tags/tag-router";

app.use("/api/tags", tagRouter);
```

对应四个接口：

```text
GET    /api/tags
POST   /api/tags
PATCH  /api/tags/:id
DELETE /api/tags/:id
```

与文章模块的差别只有几处：

| 差别 | 说明 |
|---|---|
| 字段更少 | 只有 `name` 和 `slug`，没有状态、发布时间和正文 |
| `slug` 唯一 | 和文章一样用 `@unique`，重复时返回 409，提示应写“标签 slug 已经存在” |
| 不需要分页 | 标签数量少，列表全部返回；文章筛选下拉框也要用这份数据 |
| 删除有连带影响 | 按第 7 节，删除标签会清掉相关关系行，但不会删掉文章 |

创建 Schema 校验非空 `name` 和合法 `slug`；更新时字段可选，但拒绝空对象；路由 id 继续转数字并检查正整数。列表返回 `{ data: tags }`，创建、更新、删除返回 `{ data: tag }`，与文章接口结构一致。

标签 repository 的创建、更新捕获 `P2002`，抛出 `new AppError(409, "TAG_SLUG_CONFLICT", "标签 slug 已经存在")`；更新、删除捕获 `P2025`，抛出 `new AppError(404, "TAG_NOT_FOUND", "标签不存在")`。写法沿用第 8 节的局部 `catch`，其余错误继续抛出。这样复用原错误中间件时，不会把标签错误提示成文章错误。

### 10.2 新增错误怎样进入统一错误响应

错误处理仍沿用第 11 章的 `AppError → errorHandler → JSON`。本章需要补的是“当前操作的数据库错误对应哪个业务错误”：

| 场景 | 原始错误 | 映射位置 | 对外响应 |
|---|---|---|---|
| `tagIds` 类型错误或重复 | Zod 校验失败 | 原 `error-handler.ts` 的 Zod 分支 | 422 `VALIDATION_ERROR` |
| 创建文章时连接了不存在的标签 | `P2025` | 第 8 节 `createArticle()` 的 `catch` | 422 `TAG_NOT_FOUND` |
| 更新关系时标签不存在 | `P2003` | 第 9 节事务外的 `catch` | 422 `TAG_NOT_FOUND` |
| 标签 slug 重复 | `P2002` | 标签 repository 的创建、更新函数 | 409 `TAG_SLUG_CONFLICT` |
| 更新或删除的标签不存在 | `P2025` | 标签 repository 的更新、删除函数 | 404 `TAG_NOT_FOUND` |

同一个 `P2025` 既可能表示“文章不存在”，也可能表示“连接的标签不存在”。因此在知道当前操作的 repository 中转成 `AppError`，不能直接把中间件原来的 `P2025 → ARTICLE_NOT_FOUND` 全局改成标签错误。

检查 `server/src/middleware/error-handler.ts`，保留第 11 章已有的这个分支，并让它仍位于 Prisma 错误分支之前：

```ts
if (error instanceof AppError) {
  response.status(error.statusCode).json({
    error: {
      code: error.code,
      message: error.message,
    },
  });
  return;
}
```

它直接读取 `AppError` 的状态码、业务码和提示，所以新增 `TAG_NOT_FOUND` 后无需再为它写一个中间件分支。映射代码在第 8、9 节和标签 repository，统一输出仍在这个中间件；第 11 章的基础练习无需提前加入标签知识。

### 10.3 管理页面

本阶段没有独立的文章详情页，点击“编辑”仍打开第 14 章的 Drawer，并先请求文章详情。标签在不同位置使用不同 UI：

| 位置 | UI | 数据怎样使用 |
|---|---|---|
| 文章列表或只读详情展示 | Ant Design 的 `Tag` 标签块，或用文字列出名称 | 读取 `articleTags` 中每项的 `tag.name`，不是下拉框 |
| 新建、编辑文章的 Drawer 表单 | `Select` 设置 `mode="multiple"` | 全部选项来自 `GET /api/tags`；已选值来自文章详情里的标签 id |
| 文章列表的标签筛选 | 可清空的单选 `Select` | 选一个 id 作为 URL 参数 `tagId`；清空后不发送该参数 |

例如详情返回文章关联标签 3、7，编辑表单初始值就是 `tagIds: [3, 7]`。`GET /api/tags` 决定“有哪些可选项”，文章详情决定“这一篇选中了哪些”，两份数据用途不同。Ant Design 的 `Tag` 是显示组件，与 Prisma 的 `Tag` 模型名称相同，但职责不同。

先同步 `admin-web-antd` 的数据，再连接组件。前端类型不会因为后端修改了 Zod 或 Prisma 就自动更新：

| 修改位置（相对 admin-web-antd） | 要完成的改动 |
|---|---|
| `features/articles/types.ts` | 定义 `Tag = { id: number; name: string; slug: string }`。`Article` 增加 `publishedAt: string \| null`、`articleTags: { articleId: number; tagId: number; tag: Tag }[]`；`ArticleListItem` 的 `Pick` 同时包含这两个字段 |
| 同一类型文件 | `CreateArticleInput`、`UpdateArticleInput` 增加 `tagIds?: number[]`；`ArticleFormValues` 增加 `tagIds: number[]`，新建表单默认 `[]`。删除接口只使用返回的 id 时，把其响应类型改为 `Pick<Article, "id">`，不假定删除响应也有标签 |
| `lib/api-client.ts`、`features/articles/api.ts` | 列表请求接收查询参数，并保留响应里的 `pagination`；其他 CRUD 请求继续返回 `data` |
| `app/admin/articles/_components/article-form.tsx` | 添加多选 `Select`，选项来自 `GET /api/tags`，选项的 value 使用数字 id；编辑时用详情里的 `articleTags` 回填 `tagIds` |
| `app/admin/articles/page.tsx` | 管理标题、状态、标签、页码和每页条数；条件变化时重新请求，筛选变化时回到第 1 页。Table 的页码、每页条数、总数由接口结果提供 |
| `app/admin/tags/page.tsx` 与标签请求、类型文件 | 复用第 14 章 Table + Drawer + Form 的流程实现标签管理，并在公共导航中加入入口 |

**分页有一处容易遗漏：**第 14 章的 `apiRequest()` 只返回 `successBody.data`，即使后端已经返回 `pagination`，页面也拿不到它。可以在同一个请求文件中抽出“返回整个成功响应”的内部函数，继续让 `apiRequest<T>()` 取其中的 `data`，再提供 `apiListRequest<T>()` 返回 `{ data: T[], pagination }`。两者共享原来的 `response.ok` 和错误处理；不要只改类型却仍然返回 `data`。

拼查询字符串时，不发送空标题或已清空的筛选项；页码和每页条数始终带上。页面拿到列表结果后，分别保存 `result.data` 和 `result.pagination`。这就是“受控分页”：页码由页面状态决定，翻页会请求后端相应的一页。

新建、编辑和删除成功后，重新请求当前筛选条件下的列表，让行数据和总数同时更新；删除当前页最后一条后，必要时退到上一页。第 14 章原来直接插入、替换数组的做法适合未分页列表，现在还要考虑文章是否仍符合筛选条件。

文章表单还要同步第 14 章的 `isUnchanged` 判断：把标签集合纳入比较，否则只改标签会被当作“没有修改”。标签没有顺序，比较数量相同且每个 id 都在原集合中即可。

发布和撤回继续使用表单的状态下拉框，后端维护 `publishedAt`。先在 Apifox 验证接口，再到页面操作，可以分清问题发生在哪一层。

### 10.4 一次生成 100 篇测试文章

种子数据就是提前准备的一批测试记录。有了它，不用在页面上手动新建 100 次，就能测试翻页、筛选和标签显示。

先完成第 2 节的模型迁移，再把种子脚本保存在 `mini-cms/server` 中，以后运行命令即可重建数据。脚本用 SQL 清空 `articles`、`tags`、`article_tags` 三张表并重置自增 id，再用 Prisma 创建标签、文章和关系。

**先配置执行命令。** 在 `server/prisma.config.ts` 已有的 `migrations` 中增加 `seed`，其他配置保留：

```ts
migrations: {
  path: "prisma/migrations",
  // 运行 npx prisma db seed 时，通过 tsx 执行这个 TypeScript 文件。
  seed: "tsx prisma/seed.ts",
},
```

**再新建 `server/prisma/seed.ts`。** 复用项目现有的 `prisma` 实例。下面按 `src/db/client.ts` 导入；如果保留的是第 09 章的 `src/data/client.ts`，只需把导入路径改为 `../src/data/client`。

```ts
import { prisma } from "../src/db/client";

async function main() {
  // 先准备 5 个标签，后面的文章从中选择标签。
  const tags = [
    { name: "后端", slug: "backend" },
    { name: "数据库", slug: "database" },
    { name: "Prisma", slug: "prisma" },
    { name: "Express", slug: "express" },
    { name: "TypeScript", slug: "typescript" },
  ];
  // 用同一个当前时间作为基准，安排 100 篇文章的创建时间。
  const now = Date.now();

  // 清空和重新生成属于同一个事务；中途抛错时，全部回滚。
  // 事务内统一通过 tx 操作数据库。
  const counts = await prisma.$transaction(async (tx) => {
    // 执行 SQL：清空这三张表的数据，保留表结构。
    // RESTART IDENTITY 重置自增序列，文章和标签的新 id 都从 1 开始。
    await tx.$executeRaw`
      TRUNCATE TABLE article_tags, articles, tags RESTART IDENTITY
    `;

    // 先创建标签，收集数据库实际生成的 id，供文章建立关系时使用。
    const tagIds: number[] = [];
    for (const input of tags) {
      const tag = await tx.tag.create({ data: input });
      tagIds.push(tag.id);
    }

    for (let n = 1; n <= 100; n++) {
      // 把编号补成 001～100，用于标题和唯一的 slug。
      const number = String(n).padStart(3, "0");
      // % 表示取余数：每 5 篇中有 2 篇草稿，共 40 篇草稿、60 篇已发布。
      const isDraft = n % 5 === 0 || n % 5 === 1;
      // 时间单位是毫秒；每篇比前一篇晚 1 小时，方便验证列表倒序排列。
      const createdAt = new Date(now - (101 - n) * 60 * 60 * 1000);
      const selectedTagIds: number[] = [];

      // 每 5 篇中，第 5 篇不选标签，其余 4 篇先选一个标签。
      // 数组下标 0～4 分别对应前面创建的 5 个标签。
      if (n % 5 !== 0) {
        selectedTagIds.push(tagIds[(n - 1) % 5]);
      }
      // 第 3、4 篇再选一个不同的标签，形成无标签、单标签、多标签三种情况。
      if (n % 5 === 3 || n % 5 === 4) {
        selectedTagIds.push(tagIds[n % 5]);
      }

      await tx.article.create({
        data: {
          title: `分页测试文章 ${number}`,
          slug: `seed-article-${number}`,
          summary: `这是第 ${n} 篇文章的摘要`,
          content: `这是第 ${n} 篇文章的测试正文，用于练习列表、编辑和发布。`,
          status: isDraft ? "draft" : "published",
          createdAt,
          // 草稿没有发布时间；已发布文章设为创建后 30 分钟发布。
          publishedAt: isDraft
            ? null
            : new Date(createdAt.getTime() + 30 * 60 * 1000),
          articleTags: {
            // 嵌套写入：每个选中的标签生成一条 ArticleTag 关系记录。
            // articleId 由当前创建的文章提供，tagId 来自下面 connect 的 id。
            // selectedTagIds 为空数组时，不创建关系记录。
            create: selectedTagIds.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        },
      });
    }

    // 查询实际写入的数量，返回后在终端打印，方便核对生成结果。
    return {
      articles: await tx.article.count(),
      drafts: await tx.article.count({ where: { status: "draft" } }),
      published: await tx.article.count({ where: { status: "published" } }),
      tags: await tx.tag.count(),
      relations: await tx.articleTag.count(),
    };
  }, { timeout: 30_000 }); // 整个事务最多执行 30 秒。

  console.log("种子数据生成完成：", counts);
}

try {
  await main();
} catch (error) {
  console.error("种子数据生成失败：", error);
  // 用非零退出码告诉终端：本次脚本执行失败。
  process.exitCode = 1;
} finally {
  // 无论成功还是失败，都关闭这个种子进程的数据库连接。
  await prisma.$disconnect();
}
```

`tx.$executeRaw` 在当前事务中执行这条固定 SQL。`TRUNCATE ... RESTART IDENTITY` 清空三张表并重置序列；后面的 `tx.tag.create()`、`tx.article.create()` 再生成数据。清理和写入都属于同一个事务，中途抛错时一起回滚，不用另外在 TablePro 中清空。

标签先创建，返回的 id 收集到 `tagIds` 中；文章循环里的 `articleTags.create` 沿用第 8 节的嵌套写入。`%` 取余数，用于分配草稿和标签，数组下标落在 0～4，对应前面创建的 5 个标签；`padStart(3, "0")` 把编号补成 `001`～`100`。

脚本直接调用 Prisma，不经过文章接口，所以自行填写状态和发布时间；`updatedAt` 由 Prisma 的 `@updatedAt` 填写。`timeout: 30_000` 给批量写入最多 30 秒；执行结束后 `$disconnect()` 关闭种子进程的数据库连接。

**最后执行种子。** 在 `mini-cms/server` 目录运行：

```bash
# 先检查 TypeScript 类型，不生成编译文件；检查通过后再执行下一条。
npx tsc --noEmit
# 执行种子脚本：先清空三张表并重置 id，再生成测试数据。
npx prisma db seed
```

`prisma db seed` 会按配置执行 `tsx prisma/seed.ts`。Prisma 7 不会在迁移后自动运行种子，需要主动执行这条命令。成功后终端会打印数量统计；本次文章 id 为 1～100、标签 id 为 1～5，下一篇新文章的 id 为 101。文章创建时间逐篇递增，所以倒序列表从 id 100 开始。

执行后应有 **100 篇文章、40 篇草稿、60 篇已发布文章、5 个标签、120 条关系**。其中 20 篇没有标签、40 篇有一个标签、40 篇有两个标签。草稿没有发布时间，已发布文章有发布时间。

刷新管理页面，再按下面的结果检查：

| 操作 | 预期 |
|---|---|
| 不筛选，每页 10 条 | 共 100 条、10 页；第一页 id 为 100～91 |
| 翻到第 2 页 | id 为 90～81，总数仍是 100 |
| 每页改成 20 条 | 共 5 页，每页最多 20 条 |
| 状态选择草稿，每页 10 条 | 共 40 条、4 页 |
| 标签选择“数据库”（id 2） | 共 20 篇文章 |
| 标题搜索 `001` | 只返回“分页测试文章 001” |
| 打开 id 100、99 的编辑抽屉 | id 100 没选标签；id 99 选中 Express、TypeScript |

再次运行 `npx prisma db seed`，会清掉你在这三张表中新建或修改的数据，重新生成同一批测试记录，不会累计成 200 篇。重置后刷新页面，重新加载列表和标签选项；第 3 节记录过的旧 id 不再代表原来的练习数据。

### 10.5 完成阶段 5 前的检查

- 标签可以新建、编辑和删除；重复 slug 返回 409，操作不存在的标签返回 404，提示指向标签。
- 新建文章选择两个标签，重新打开编辑抽屉仍选中这两个；只改标签可以保存，清空后再次打开显示为空。
- 标题、状态、标签筛选能组合使用；翻页后总数仍是符合筛选条件的总数；清空筛选恢复列表。
- 发布、重复发布、撤回的时间符合第 6 节规则；包含无效标签的更新返回 422，旧标题和关系都保留。
- 删除带关系的文章后，标签仍在；删除仍被文章使用的标签后，文章仍在，详情里少了这个标签。

如果执行了第 10.4 节，第 3 节的旧数据已经清空，不必再执行下面的清理。若没有生成种子数据，可以在练习结束后按原来的 slug 清理：

```sql
DELETE FROM articles
WHERE slug IN ('ch15-prisma-intro', 'ch15-express-middleware');

DELETE FROM tags
WHERE slug IN ('ch15-backend', 'ch15-database');
```

在 TablePro 中按记录过的文章、标签 id 查询 `article_tags`，对应关系应已消失。第 8 节通过 API 新建的练习文章按你记录的 id 单独删除；若练习中改过 slug，也按实际 id 清理。

---

## 本章三种解构与展开写法

| 写法 | 叫什么 | 含义 |
|---|---|---|
| `const { tagIds, ...articleInput } = input` | 对象解构 + 剩余收集 | 从 `input` 中单独取出 `tagIds`，其余字段组成新对象，赋给变量 `articleInput` |
| `data: { ...input, publishedAt }` | 对象展开 | 把 `input` 的字段展开到新对象，再加入 `publishedAt`；同名字段以后面的值为准 |
| `const [articles, total] = await Promise.all([...])` | 数组解构 | 按位置赋值：第一个查询结果给 `articles`，第二个给 `total`，与完成先后无关 |

第一种在等号左侧收集字段，第二种在对象里面展开字段，第三种按数组位置取结果。第 9 节已经拆出标签，因此更新数据写成 `data: { ...articleInput, publishedAt }`。

---

## 本章新名词

| 名词 | 含义 |
|---|---|
| 多对多 | 两张表的记录可以互相对应多条，需要中间表保存关系 |
| 中间表 / 关系表 | 保存两端记录对应关系的表，本项目中是 `article_tags` |
| 外键 | 一列的值必须真实存在于另一张表的指定列中 |
| 联合主键 | 由多列共同组成的主键，本项目中是 `(article_id, tag_id)` |
| 索引 | 为一列或多列建立的查找结构，用来加快查询 |
| 级联删除 | 被引用的记录被删除时，连带删除引用它的关系行 |
| JOIN | SQL 中按关联列把多张表的行拼到一起查询 |
| 关系查询 | Prisma 的 `include` / `select`，用模型关系读取关联数据 |
| `some` | Prisma 关系条件：关联记录中至少有一条满足条件 |
| `skip` / `take` | 分页在数据库层的做法：跳过几条、最多取几条 |
| 事务 | 多步数据库修改作为一个整体，全部成功才保留 |
| 回滚 | 事务失败时撤销本事务已经做出的修改 |
| nested write | Prisma 在一次调用中写入主体和关联数据，它本身就是一个事务 |
| `$transaction` | Prisma 的事务函数，函数内的操作全部通过 `tx` 执行 |
| `tx` | `$transaction` 传入函数收到的事务专用 Prisma Client |

---

## 小结

本章的数据流是：

```text
管理页面提交筛选条件
-> Zod 校验 query 并补上分页默认值
-> Prisma 用同一份 where 执行 findMany 和 count
-> 返回 data 和 pagination

管理页面提交 tagIds
-> 创建走 nested write，更新走 $transaction
-> article_tags 整体写入，或整体回滚
```

阶段 5 掌握到下面这个程度即可：

```text
用显式 ArticleTag 模型保留中间表，看得见外键和联合主键
能用 SQL 和 Prisma 两种方式读出一篇文章的标签
用同一份 where 完成筛选、分页和总数统计
让 status 和 publishedAt 由后端按同一条规则维护
知道删除文章和删除标签分别会影响什么
知道 nested write 自带事务，拆开执行多步写入时用 $transaction 把它们放在一起
```

自动隐藏中间模型、复杂嵌套关系和更细的事务隔离级别暂时不展开。

标签接口、文章关联、筛选分页和发布撤回都能在 Mini CMS 中走通后，回到[第 10 章项目总览](./10-MiniCMS项目总览.md)完成阶段 5 验收。先用 [15A-从单表 CRUD 到关系维护](./15A-从单表CRUD到关系维护.md)复习创建、更新和返回标签的完整流程，再读第 16、16A 章增加管理员登录和接口保护。

## 官方参考

- [Prisma 7 种子脚本](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/seeding)
- [Zod 对象校验](https://zod.dev/api#objects)
- [Prisma 默认返回字段与 select](https://www.prisma.io/docs/orm/v7/prisma-client/queries/select-fields)

- [Prisma 关系查询和 nested write](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries)
- [Prisma 事务文档](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)
- [Prisma Schema 参考](https://docs.prisma.io/docs/orm/reference/prisma-schema-reference)
- [PostgreSQL 外键约束](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
