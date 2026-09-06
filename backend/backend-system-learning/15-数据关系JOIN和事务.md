# 15. 多表关系和事务：给文章增加标签

> Mini CMS 阶段 5：继续修改第 14 章已经跑通的 `server` 和 `admin-web-antd`，为文章增加标签、筛选分页和发布规则，不创建新 demo。

本阶段不处理公开文章详情页和正文排版。`Article.content` 继续保持 Prisma `String`；后端只校验、保存和返回字符串，等阶段 8 接入个人网站时再决定使用现有的 Markdown 还是 MDX 渲染能力。

## 问题背景

阶段 4 结束时，`articles` 一张表就能完成文章 CRUD。现在要给文章打标签，这里出现了前面没遇到过的数据关系：

```text
一篇文章可以有多个标签
一个标签也可以属于多篇文章
```

两边都可以对应多条数据，这叫多对多关系。它没法只靠 `articles` 一张表保存，也没法只靠一次单表查询读出来。

本章要解决四个问题：

```text
标签数据放在哪张表，怎样保证关系引用的文章和标签真实存在
怎样一次查询同时读出文章和它的标签
怎样按标题、状态和标签筛选文章，并分页返回总数
更新文章标签需要多步修改数据库，中途失败时怎样不留下错误数据
```

最后一个问题需要事务，难度高于单表 CRUD，所以本章排在文章 CRUD 之后。

后端修改集中在第 11、12 章已经建立的三个文件里，不新增架构层：

```text
prisma/schema.prisma      增加 Tag、ArticleTag 和 publishedAt
article-schema.ts         增加列表查询参数和 tagIds
article-repository.ts     改写 getArticles / createArticle / updateArticle
article-router.ts         列表路由读取 query，并返回 pagination
```

这一章沿用第 09 章的 Prisma 7 方案，不切回手写 `pg` 查询。标签自己的模块和管理页面在第 10 节说明。

---

## 1. 为什么需要第三张表

先看一个不可行的做法：在 `articles` 里加一个文本字段，把标签拼进去，例如 `tags = "后端,数据库"`。它有两个问题：

- 数据库无法检查这些标签是否真的存在，写错一个字就会多出一个不存在的标签。
- 按标签筛选时只能做字符串匹配，搜索 `"后端"` 会连 `"后端工程化"` 一起匹配到。

关系型数据库的做法是用三张表：

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

`article_tags` 自己不保存标题和标签名，只保存两个 id。文章 42 有两个标签，标签 3 属于两篇文章，多对多关系就这样表示出来了。

这张中间表需要两条约束：

```text
外键（foreign key）
-> article_tags.article_id 的值必须真实存在于 articles.id 中
-> article_tags.tag_id 的值必须真实存在于 tags.id 中
-> 因此写不进一条指向不存在文章或不存在标签的关系

联合主键（composite primary key）
-> 把 article_id 和 tag_id 两列合起来当作主键
-> 因此 (42, 3) 只能出现一次，同一篇文章不会重复添加同一个标签
```

第 07 章的主键是单列的 `id`。这里的主键由两列组成，所以叫联合主键。它不需要额外的 `id` 列，因为“哪篇文章 + 哪个标签”本身就能唯一确定一行。

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

`articleId` 和 `article_id` 都不是 Prisma 规定的名字。Prisma 之所以知道 `articleId` 指向 `Article.id`，靠的是 `@relation` 的两个参数，而不是名字长得像：

```text
fields: [articleId]
-> 本模型（ArticleTag）里哪一列保存外键值

references: [id]
-> 关系字段的目标模型（article Article 中的 Article）里哪个字段被引用
```

把 `articleId` 改名成 `postId`，只要 `fields: [postId]` 跟着改，关系依然成立；`@map()` 决定的只是数据库列名，改它只影响 SQL 里看到的列名。保持 `articleId` / `article_id` 是命名习惯：Prisma 代码用小驼峰，PostgreSQL 列名用下划线。

三个关系字段和真实数据的对应是：

```text
ArticleTag.articleId = 42
-> articles 表中 id = 42 那一行
-> Prisma 中通过 articleTag.article 读到这篇文章

ArticleTag.tagId = 3
-> tags 表中 id = 3 那一行
-> Prisma 中通过 articleTag.tag 读到这个标签

Article.articleTags
-> article_tags 中所有 article_id = 当前文章 id 的行
```

`articleTags`、`article` 和 `tag` 都是 Prisma 用来表达关系的字段，不会在数据库里创建同名列。打开迁移 SQL 就能确认：`article_tags` 表只有 `article_id` 和 `tag_id` 两列。

### 2.2 为什么同时增加 `publishedAt`

`status` 只能回答“现在是不是已发布”，回答不了“什么时候发布的”。阶段 8 的公开 API 和个人网站需要按发布时间排序文章、在详情页显示发布日期，所以发布时间必须单独保存。

`createdAt` 代替不了它：草稿可能今天创建、下周才发布，撤回后重新发布时间还会再变。

`publishedAt` 写成 `DateTime?`，因为草稿没有发布时间。它由后端按发布规则维护，第 6 节实现。

### 2.3 执行迁移

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

`published_at` 必须是可以为空的列，否则表里已有的文章过不了这次迁移。

---

## 3. 先用 SQL 确认关系真的建立起来了

Prisma Client 还没写一行标签代码，但表和约束已经在数据库里了。这一节先在 TablePro 里插入几条假数据，用 SQL 验证关系是否符合预期。这样做的好处是：后面 Prisma 查询结果不对时，你已经知道数据库这一层是好的。

按第 09 章的方式连接本地 PostgreSQL，按 `⌘T` 打开查询标签，把光标放在一条 SQL 上按 `⌘↩︎` 逐条执行。

### 3.1 插入假数据

```sql
INSERT INTO articles (title, slug, content, status, updated_at)
VALUES
  ('Prisma 入门', 'prisma-intro', '关系查询练习', 'draft', CURRENT_TIMESTAMP),
  ('Express 中间件', 'express-middleware', '中间件练习', 'draft', CURRENT_TIMESTAMP)
RETURNING id, title, slug;

INSERT INTO tags (name, slug)
VALUES ('后端', 'backend'), ('数据库', 'database')
RETURNING id, name, slug;
```

记下两次 `RETURNING` 返回的 id。下面的 SQL 用 `42`、`43`、`3`、`7` 举例，执行时替换成你自己拿到的数字：

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

这条查询正是 `@@index([tagId])` 服务的场景。联合主键 `(article_id, tag_id)` 的索引按 `article_id` 排在前面，只给定 `tag_id` 时用不上它，所以要额外给 `tag_id` 建一个索引。数据量小时看不出差别，但按标签筛选文章是管理后台的常用操作，第 5 节的接口会一直用到。

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

两条都报错，说明第 1 节的两条约束真的由 PostgreSQL 执行，而不只是写在文档里。

### 3.4 清理练习数据

后面要用 API 操作真实数据，先删掉这一节的假数据：

```sql
DELETE FROM articles WHERE slug IN ('prisma-intro', 'express-middleware');
DELETE FROM tags WHERE slug IN ('backend', 'database');

SELECT COUNT(*) FROM article_tags;
```

删除文章和标签时都不需要手动清理 `article_tags`，最后的 `COUNT(*)` 应该回到 0。这就是 `ON DELETE CASCADE` 在起作用，第 7 节说明它的完整规则。

---

## 4. Prisma 用关系查询代替手写 JOIN

项目代码不手写上面的 SQL，而是使用模型上的关系字段。`include` 表示查询主体时，把指定的关联数据一起放进返回结果：

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

外层 `include` 取出这篇文章的关系行，内层 `include` 再沿每条关系行取出对应的标签。返回的是嵌套对象，而不是 SQL 那样的扁平结果表：

```text
article
├── id / title / slug / status / ...
└── articleTags[]
    └── tag
        └── id / name / slug
```

所以读取标签名要写成 `article.articleTags.map((item) => item.tag.name)`。中间多一层 `articleTags`，正是因为用了显式中间模型。

`include` 和 JOIN 的关系是：Prisma 把关系查询翻译成 SQL 交给 PostgreSQL 执行。翻译结果可能是一条带 JOIN 的查询，也可能是几条查询后在 Prisma 里组装数据，这由 Prisma 版本和查询形状决定，不由 `include` 的写法决定。分工是：

```text
理解数据关系
-> 看 JOIN，它说明“按哪一列把哪两张表连起来”

写项目代码
-> 用 include / select，不需要预测 Prisma 生成哪种 SQL
```

真的需要看实际 SQL 时，可以给 `PrismaClient` 打开查询日志再观察，但这不是本阶段的必修内容。

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

在 `src/modules/articles/article-schema.ts` 末尾增加：

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

URL 查询字符串里的值都是字符串，`?page=2` 到达 Express 后是 `"2"`，所以 `tagId`、`page` 和 `pageSize` 用第 11 章路径参数用过的 `z.coerce.number()` 先转数字再检查。`title` 和 `status` 本来就是字符串，不需要转换。

`default()` 让没有提交分页参数的请求也能得到确定的值，因此校验通过后 `page` 和 `pageSize` 一定有值，repository 里不用再判断。`max(100)` 防止客户端一次请求上万条。

这里继续用 `z.strictObject()`，多余的查询参数会返回 422。所以前端拼 URL 时只能带这五个参数，加新的筛选条件要先在这里声明。

### 5.3 第二步：把参数转换成 Prisma 查询条件

替换 `article-repository.ts` 中的 `getArticles()`，并在文件顶部增加两个类型导入：

```ts
import type { Prisma } from "../../generated/prisma/client";
import type { ListArticlesQuery } from "./article-schema";
```

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
      orderBy: {
        createdAt: "desc",
      },
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
| `Prisma.ArticleWhereInput` | Prisma 生成的类型，描述文章查询条件对象允许写什么；字段名写错时类型检查会报错 |
| 条件值为 `undefined` | Prisma 忽略这一条，等于不筛选。这里不能写 `null`，`null` 表示“这一列的值是 NULL” |
| `contains` + `mode: "insensitive"` | 标题包含指定文字，且不区分大小写 |
| `articleTags: { some: { tagId } }` | 这篇文章的多条关系行中，至少有一条的 `tagId` 等于给定值 |
| `skip` / `take` | 跳过前面几条、最多取几条，这是分页在数据库层的做法 |
| `count({ where })` | 只统计符合条件的行数，不返回文章内容 |

`status` 用简写属性直接放进 `where`：它的值是 `"draft"`、`"published"` 或 `undefined`，正好对应“筛选这个状态”和“不筛选状态”。

两次查询必须使用同一个 `where` 变量。如果 `findMany()` 带标签条件而 `count()` 不带，页面就会出现“分页器显示 100 条，翻到第 2 页却是空的”。`Promise.all()` 让两条查询并发执行（第 05 章），返回值改成 `{ articles, total }`，因为 router 两个都要用。

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

先看第 11 章写下的 `updateArticleSchema`：

```ts
export const updateArticleSchema = z
  .strictObject({
    title: titleSchema.optional(),
    slug: slugSchema.optional(),
    summary: summarySchema.nullable().optional(),
    content: contentSchema.optional(),
    status: statusSchema.optional(),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: "至少提交一个可修改字段",
  });
```

这里不需要增加 `publishedAt`，要确认的恰恰是它不能加：`z.strictObject()` 只允许列出的字段，客户端提交 `publishedAt` 会直接得到 422。`UpdateArticleInput` 由这个 Schema 推导出来，所以它同样没有 `publishedAt` 属性。

这一点是下一步的前提。`updateArticle()` 会执行 `data: { ...input, publishedAt }`，正因为 `input` 里不可能出现 `publishedAt`，后端算出的值才不会被客户端提交的值覆盖。

这个 Schema 后面还要再改一次：更新文章时也要能提交标签，`tagIds` 在第 8.2 节和创建 Schema 一起增加。

### 6.3 第二步：在 repository 里先读旧状态再计算

原来的 `updateArticle()` 直接把 `input` 交给 Prisma：

```ts
export function updateArticle(
  articleId: number,
  input: UpdateArticleInput,
) {
  return prisma.article.update({
    where: {
      id: articleId,
    },
    data: input,
  });
}
```

它执行不了发布规则，因为它不知道这篇文章原来是什么状态。改成先把当前文章读出来：

```ts
export async function updateArticle(
  articleId: number,
  input: UpdateArticleInput,
) {
  const article = await prisma.article.findUnique({
    where: {
      id: articleId,
    },
    select: {
      id: true,
      status: true,
      publishedAt: true,
    },
  });

  if (!article) {
    throw new AppError(
      404,
      "ARTICLE_NOT_FOUND",
      "文章不存在",
    );
  }

  let publishedAt = article.publishedAt;

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

`article` 就是这篇文章修改之前在数据库里的样子，所以 `article.publishedAt` 是它原来的发布时间，`article.status` 是它原来的状态。函数开头多这一次 `findUnique()`，就是为了拿到这两个值；`select` 只取用得到的三个字段。

`AppError` 需要在文件顶部导入：

```ts
import { AppError } from "../../errors/app-error";
```

第 11 章的做法是让 `update()` 找不到数据时抛出 Prisma 的 `P2025`，再由错误中间件转成 404。现在 repository 自己先查了一次，所以在这里直接抛出同一个 `AppError`，两条路径返回的响应结构一致。

条件判断覆盖三种情况：

```text
input.status 没有提交
-> 条件不成立，publishedAt 保持 article.publishedAt
-> 只改标题或正文不会影响发布时间

input.status 与原状态相同
-> 条件不成立，重复提交“发布”不会刷新发布时间

input.status 与原状态不同
-> published 写入 new Date()，draft 写回 null
```

`data: { ...input, publishedAt }` 先展开客户端提交的字段，再用后端算出的 `publishedAt` 收尾。撤回后不会留下一个仍然像“已发布”的时间，重新发布也会得到新的发布时间。

创建文章时同样要计算 `publishedAt`。那处改动和标签写入在同一个函数里，放到第 8 节一起完成。

### 6.4 验证

| 请求 | 预期 |
|---|---|
| `PATCH` 提交 `status=published` | 200，`publishedAt` 变成当前时间 |
| 再次提交 `status=published` | `publishedAt` 不变 |
| `PATCH` 提交 `status=draft` | `publishedAt` 变回 `null` |
| `PATCH` 只提交 `title` | `status` 和 `publishedAt` 都不变 |
| `PATCH` 提交 `publishedAt` | 422 `VALIDATION_ERROR` |

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

第 3.4 节删掉练习文章和标签后 `article_tags` 回到 0 行，就是这两条规则在起作用。

如果不写 `onDelete: Cascade`，外键会默认拒绝删除：只要 `article_tags` 里还有引用某篇文章的关系行，`DELETE FROM articles` 就会失败。这个默认行为在别的场景里才是对的，例如删除一个下面还有文章的分类时，应该先要求用户处理那些文章，而不是悄悄断开关系。

所以级联删除要按产品规则选：

```text
关系行只是“文章和标签之间的连线”，主体被删除后它没有意义
-> 用 Cascade 让数据库自动清理

被引用的数据本身有价值，误删代价大
-> 不用 Cascade，让数据库拒绝删除，再由业务代码给出提示
```

`article_tags` 属于第一种，所以阶段 5 用 Cascade。

---

## 8. 用 nested write 在一次调用里写入文章和标签

### 8.1 现在的问题

新建文章时，页面会同时提交标题、正文和选中的标签。这需要往两张表写数据：`articles` 插入一行，`article_tags` 插入若干行。

如果分成两次独立操作，中间失败就会留下一篇没有标签的文章，而客户端收到的是错误响应。Prisma 的 nested write（嵌套写入）可以在一次调用里完成主体和关联数据的写入，并且这次调用整体成功或整体失败。

### 8.2 第一步：让创建接口接受 tagIds

修改 `article-schema.ts` 中的 `createArticleSchema`，最后增加一个字段：

```ts
export const createArticleSchema = z.strictObject({
  title: titleSchema,
  slug: slugSchema,
  summary: summarySchema.optional(),
  content: contentSchema,
  status: statusSchema.optional(),
  tagIds: z.array(z.number().int().positive()).max(20).optional(),
});
```

`CreateArticleInput` 由这个 Schema 推导，所以它自动多了一个可选的 `tagIds`，router 里的 `createArticleSchema.parse(request.body)` 也不用改。

请求体里的 `tagIds` 是 JSON 数组，本来就是数字，不需要 `coerce`；第 5 节的 `tagId` 来自 URL 查询字符串，才需要转换。

`updateArticleSchema` 里也增加同一行（第 9 节要用）：

```ts
tagIds: z.array(z.number().int().positive()).max(20).optional(),
```

### 8.3 第二步：用 nested write 创建文章和关系

`createArticle()` 现在是：

```ts
export function createArticle(input: CreateArticleInput) {
  return prisma.article.create({
    data: input,
  });
}
```

`input` 里多了 `tagIds` 之后不能再整个交给 Prisma，因为 `Article` 模型没有 `tagIds` 字段。改成：

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
  });
}
```

逐段说明：

```text
const { tagIds, ...articleInput } = input
-> 把 tagIds 单独取出来，剩下的字段才是 articles 表的列

publishedAt: input.status === "published" ? new Date() : null
-> 第 6 节发布规则在创建时的形式：直接以 published 创建就写入当前时间

articleTags: { create: [...] }
-> 在 article_tags 中为每个标签插入一行关系
-> 文章 id 由 Prisma 自动填入，此时它才刚刚生成

tag: { connect: { id: tagId } }
-> 关系行的另一端连接一个已经存在的标签，而不是新建标签
```

`create` 表示新建关联记录，`connect` 表示连接已有记录。这里两个都用到了：关系行是新的，标签是已有的。

`tagIds?.map(...)` 在客户端没提交 `tagIds` 时得到 `undefined`，Prisma 会忽略这次关系写入，等于只创建文章。

末尾的 `include` 让响应里带上刚写入的标签，页面创建成功后可以直接显示。

这次调用要么全部生效，要么全部不生效：

```text
文章和所有关系都写入成功
-> 一起保存

任何一步失败，例如某个 tagId 不存在
-> 整条 create 失败，文章也不会留在数据库里
```

原因是 Prisma 把一次 nested write 作为一个数据库事务执行。所以这里不需要你自己写 `$transaction`——不是“能省一层就省一层”，而是这次调用已经在事务里了，外面再包一层不会增加任何保护。第 9 节会遇到 nested write 表达不了的情况。

### 8.4 验证

| 请求 | 预期 |
|---|---|
| `POST` 带两个有效 `tagIds` | 201，响应里的 `articleTags` 有两条 |
| `POST` 带一个不存在的 `tagId` | 失败，且 TablePro 里查不到这篇文章 |
| `POST` 不带 `tagIds` | 201，`articleTags` 是空数组 |
| `POST` 带 `status=published` | `publishedAt` 有值 |

第二条最值得亲手试一次：请求失败后去数据库确认文章确实没有被创建，这就是“整体成功或整体失败”的实际含义。

这次失败当前会命中第 11 章错误中间件里的 `P2025`，返回 404 和“文章不存在”，文案与真实原因（标签不存在）不符。阶段 5 的验收要求关联失败返回可理解的业务错误，所以之后可以在错误中间件里为标签相关的失败补一条更准确的映射，例如 `TAG_NOT_FOUND`。

---

## 9. 用 $transaction 替换文章的标签

### 9.1 现在的问题

编辑文章时，页面提交的是“这篇文章最终应该有哪些标签”。数据库里已经存着一批旧关系行，所以要做三件事：

```text
1. 更新文章本身（标题、正文、状态、发布时间）
2. 删除这篇文章现有的全部关系行
3. 按新的 tagIds 插入关系行
```

nested write 表达不了这种“先整体删除再整体插入”的替换逻辑（`create` 只会追加关系），所以这三步必须由你自己写成三次数据库操作。

问题就出在这里。假设第 2 步成功、第 3 步失败：

```text
旧关系已经被删除
-> 新关系没有写进去
-> 这篇文章的标签全部丢失，而客户端收到的是一个错误响应
```

用户看到“更新失败”，但数据已经被改坏了，而且没有任何地方记录原来的标签是什么。

### 9.2 事务解决什么

事务（transaction）是把多步数据库修改当成一个整体交给数据库：全部成功才真正保留，任何一步失败就把这一批修改全部撤销，数据库回到这批操作开始之前的状态。这种撤销叫回滚（rollback）。

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

### 9.3 在第 6 节的基础上改写 updateArticle

```ts
export async function updateArticle(
  articleId: number,
  input: UpdateArticleInput,
) {
  const article = await prisma.article.findUnique({
    where: {
      id: articleId,
    },
    select: {
      id: true,
      status: true,
      publishedAt: true,
    },
  });

  if (!article) {
    throw new AppError(
      404,
      "ARTICLE_NOT_FOUND",
      "文章不存在",
    );
  }

  const { tagIds, ...articleInput } = input;

  let publishedAt = article.publishedAt;

  if (input.status !== undefined && input.status !== article.status) {
    publishedAt = input.status === "published" ? new Date() : null;
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.article.update({
      where: {
        id: article.id,
      },
      data: {
        ...articleInput,
        publishedAt,
      },
    });

    if (tagIds !== undefined) {
      await tx.articleTag.deleteMany({
        where: {
          articleId: article.id,
        },
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

    return updated;
  });
}
```

和第 6 节相比只有四处变化：

```text
const { tagIds, ...articleInput } = input
-> 与创建时同理，tagIds 不是 articles 表的列

findUnique 和发布时间计算留在事务外
-> 它们只是读数据和算值，不修改数据库

三次写操作放进 $transaction，并且全部使用 tx
-> 它们属于同一个事务

if (tagIds !== undefined)
-> 客户端没提交 tagIds 时完全不动标签
-> 提交空数组 [] 表示“清空这篇文章的标签”
```

`deleteMany()` 按条件删除多行，一行都没匹配到也不报错；`createMany()` 一次插入多行。它们与 `delete()`、`create()` 的区别是不要求“必须正好命中一行”，正适合这种整体替换。

如果某个 `tagId` 不存在，`createMany()` 会触发外键约束错误，函数抛出异常，Prisma 回滚整个事务——前面的 `update` 和 `deleteMany` 都不会保留。

两条使用要求：

```text
事务里的每次数据库操作都用 tx
-> 写成 prisma 的那一次不受事务保护

事务里不要放网络请求或其他慢操作
-> 事务期间数据库会持有锁，事务越短越好
```

### 9.4 验证

| 请求 | 预期 |
|---|---|
| `PATCH` 提交 `tagIds=[3, 7]` | 200，`article_tags` 里这篇文章正好两行 |
| 再提交 `tagIds=[3]` | 只剩一行，标签 7 的关系被删除，标签 7 本身还在 |
| 提交 `tagIds=[]` | 这篇文章没有关系行，`tags` 表不变 |
| 提交 `tagIds=[9999]` | 失败，且 TablePro 里这篇文章的旧标签仍然完整 |
| 只提交 `title` | 标签不变 |

第四条是这一节的重点：请求失败后旧标签还在，说明回滚生效了。如果这时发现标签被清空了，检查 `deleteMany` 是不是误写成了 `prisma.articleTag.deleteMany` 而不是 `tx.articleTag.deleteMany`。

这条请求当前会返回 500，因为外键失败的 Prisma 错误码是 `P2003`，第 11 章的错误中间件只认识 `P2002` 和 `P2025`。回滚本身已经正确，缺的是错误响应；和第 8 节一样，之后在错误中间件里补上标签相关的映射即可。

---

## 10. 标签自己的 CRUD 和页面怎么办

到这里，后端已经能处理关系、筛选和发布规则，但标签本身还不能被管理，页面上也还没有标签相关的操作入口。这两件事不需要新知识，本章不再跟练，只说明要做什么。

### 10.1 标签接口

标签 CRUD 与文章 CRUD 结构完全相同，按第 11、12 章的三层新建一个模块：

```text
src/modules/tags/
├── tag-schema.ts       Zod 校验和推导类型
├── tag-repository.ts   Prisma 查询
└── tag-router.ts       四个路由
```

在 `app.ts` 中注册：

```ts
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
| `slug` 唯一 | 和文章一样用 `@unique`，重复时由错误中间件的 `P2002` 转成 409 |
| 不需要分页 | 标签数量少，列表全部返回；文章筛选下拉框也要用这份数据 |
| 删除有连带影响 | 按第 7 节，删除标签会清掉相关关系行，但不会删掉文章 |

### 10.2 管理页面

`admin-web-antd` 需要三处改动，都在第 14 章跟练过的组件范围内：

```text
/admin/tags 页面
-> 复用第 14 章的 Table + Drawer + Form 流程，完成标签增删改查

/admin/articles 的筛选和分页
-> 增加标题输入框、状态和标签下拉框，把条件拼进请求 URL 的查询字符串
-> Table 改成受控分页，页码和总数使用接口返回的 pagination

文章表单的标签选择
-> 增加一个多选 Select，选项来自 GET /api/tags
-> 提交时把选中的标签 id 数组作为 tagIds 发出去
-> 编辑时用 article.articleTags.map((item) => item.tag.id) 回填初始值
```

发布和撤回先做成状态更新：表单里的状态下拉框已经能提交 `draft` 或 `published`，后端按第 6 节写入或清空 `publishedAt`，暂时不需要独立的发布接口。

第 5、6、8、9 节的接口在 Apifox 里都能单独验证，不依赖页面。页面的作用是把这些接口变成真实的操作流程，所以先用 Apifox 确认接口正确，再改页面；出问题时更容易判断是前端还是后端。

---

## 本章新名词

| 名词 | 含义 |
|---|---|
| 多对多 | 两张表的记录可以互相对应多条，需要中间表保存关系 |
| 中间表 / 关系表 | 只保存两个外键的表，本项目中是 `article_tags` |
| 外键 | 一列的值必须真实存在于另一张表的指定列中 |
| 联合主键 | 由多列共同组成的主键，本项目中是 `(article_id, tag_id)` |
| 索引 | 为某一列建立的查找结构，让按这列筛选更快 |
| 级联删除 | 被引用的记录被删除时，连带删除引用它的关系行 |
| JOIN | SQL 中按关联列把多张表的行拼到一起查询 |
| 关系查询 | Prisma 的 `include` / `select`，用模型关系读取关联数据 |
| `some` | Prisma 关系条件：关联记录中至少有一条满足条件 |
| `skip` / `take` | 分页在数据库层的做法：跳过几条、最多取几条 |
| 事务 | 多步数据库修改作为一个整体，全部成功才保留 |
| 回滚 | 事务失败时撤销这批修改，数据库回到开始前的状态 |
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
能说清哪种修改用 nested write，哪种必须用 $transaction
```

自动隐藏中间模型、复杂嵌套关系和更细的事务隔离级别暂时不展开。

标签接口、文章关联、筛选分页和发布撤回都能在 Mini CMS 中走通后，回到[第 10 章项目总览](./10-MiniCMS项目总览.md)完成阶段 5 验收。下一步再读第 16、16A 章，增加管理员登录和接口保护。

## 官方参考

- [Prisma 关系查询和 nested write](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries)
- [Prisma 事务文档](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)
- [Prisma Schema 参考](https://docs.prisma.io/docs/orm/reference/prisma-schema-reference)
- [PostgreSQL 外键约束](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
