# 15A. 从单表 CRUD 到关系维护：文章和标签怎样一起保存

## 问题背景

第 15 章已经给文章接上了标签。这里像第 09A 章一样，不重复跟练，串起一次创建、更新和读取到底动了哪些数据。

以前，一个“创建文章”操作主要通过 `Article` 模型向 `articles` 表插入一行。增加标签关系后，Prisma 没有把文章、标签和关系合并到一张表中；三个模型仍通过各自的 `@@map` 对应三张数据库表：

```text
Prisma 模型  -> 数据库表       -> 每一行保存什么
Article     -> articles      -> 一篇文章本身
Tag         -> tags          -> 一个可以反复使用的标签
ArticleTag  -> article_tags  -> 一篇文章使用一个标签的关系
```

变化发生在一次业务操作涉及的数据上：创建文章时，除了向 `articles` 表写入文章，还可能向 `article_tags` 表写入多条关系；已经存在的标签继续保存在 `tags` 表中。**因此，现在不仅要保存文章字段，还要维护文章与标签的对应关系。**

## 1. 标签和“文章使用标签”是两件事

假设已有标签 3“后端”和标签 7“数据库”，文章 42 使用它们：

| 数据 | 保存的内容 |
|---|---|
| `Article` | 文章 42 的标题、正文、状态等 |
| `Tag` | 标签 3、7 各自的名称和 slug |
| `ArticleTag` | `(42, 3)`、`(42, 7)` 两行关系 |

再给文章 43 选择“后端”，只需要新增 `(43, 3)`，不需要再创建一个“后端”标签。

`Article.articleTags` 是 Prisma 的关系字段，表示这篇文章对应的中间表记录；它不会变成 `articles` 中的某一列。真正存进中间表的是 `article_id` 和 `tag_id`。

## 2. 创建文章：保存文章，再建立它到已有标签的关系

没有标签时，创建函数主要是：

```ts
prisma.article.create({ data: input });
```

现在客户端可以提交 `tagIds: [3, 7]`。这是“选择了哪些标签”的输入，后端要把它变成两条关系，不能当成文章的一列保存。

```text
请求体：文章字段 + tagIds: [3, 7]
-> createArticleSchema 校验输入
-> createArticle() 取出 tagIds，其余字段组成 articleInput
-> 创建 Article，假设新 id 为 42
-> 创建 ArticleTag(42, 3) 和 ArticleTag(42, 7)
-> 返回文章及其标签关系
```

第 15 章 `createArticle()` 中负责关系写入的是下面这段局部代码。这里保留外层的 `article.create()`，用来表示 `articleTags.create` 正嵌在新文章的创建过程中：

```ts
prisma.article.create({
  data: {
    ...articleInput,
    articleTags: {
      create: tagIds?.map((tagId) => ({
        tag: { connect: { id: tagId } },
      })),
    },
  },
});
```

这段嵌套写入要和 `ArticleTag` 模型一起看：

```prisma
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

`articleId` 和 `tagId` 保存外键值，是真正的数据字段；`article` 和 `tag` 是 Prisma 的关系字段。`@relation` 进一步说明当前模型使用哪个外键字段，以及这个外键指向目标模型的哪个字段。

接下来只看一件事：**新建一条 `ArticleTag` 记录时，`articleId` 和 `tagId` 分别从哪里来？**

假设外层刚创建的文章 id 为 42，客户端提交 `tagIds: [3, 7]`。`map()` 第一次处理 `tagId = 3` 时：

```text
articleTags.create 嵌在当前文章的创建过程中
-> Prisma 知道这条关系属于刚创建的文章 42
-> 自动填入 ArticleTag.articleId = 42

tag.connect.id = 3
-> 连接 tags 表中已经存在的 id = 3 的标签
-> 填入 ArticleTag.tagId = 3

两个外键都有值
-> 新增 ArticleTag(articleId: 42, tagId: 3)
-> article_tags 表新增一行 (article_id: 42, tag_id: 3)
```

`map()` 接着处理 `tagId = 7`，同样得到 `(42, 7)`。因此，外层只创建一篇文章，内层会根据两个 `tagId` 创建两条关系；`connect` 只连接已有标签，不会向 `tags` 表新建标签。

关系记录写入后，模型中的两行 `@relation` 又规定了怎样从关系读回两端。以 `(42, 3)` 为例：

```text
查询 ArticleTag.article 关系
-> fields: [articleId]：读取当前关系记录的 articleId，也就是 42
-> references: [id]：到 Article 对应的 articles 表中查找 id = 42 的文章

查询 ArticleTag.tag 关系
-> fields: [tagId]：读取当前关系记录的 tagId，也就是 3
-> references: [id]：到 Tag 对应的 tags 表中查找 id = 3 的标签
```

这里还要注意：

- `ArticleTag` 模型已经定义在 Prisma Schema 中，`article_tags` 中间表也已经通过迁移创建。
- 创建文章前，`tagIds` 对应的 `Tag` 记录必须已经存在。
- 本次调用只新建 `Article` 记录和对应的 `ArticleTag` 关系记录，不会新建 `Tag`。
- 这次 nested write 有事务保护。只要一个标签不存在，Prisma 就会撤销本次新建的文章和关系；数据库中已有的标签不受影响。
- 标签不是必填项。不传 `tagIds` 或传 `[]`，都可以只创建文章。

## 3. 更新文章：先判断是否要修改关系

修改标题时，更新的是 `Article.title`。把标签从 `[3, 7]` 改成 `[7]` 时，更新的却是 `ArticleTag` 中哪些关系行应该保留，`Tag` 本身不用改。

先看输入的区别：

| 更新请求中的 tagIds | 用户意图 | 中间表操作 |
|---|---|---|
| 不提交 | 这次不修改标签 | 保留旧关系 |
| `[]` | 清空文章的标签 | 删除旧关系，不创建新关系 |
| `[7]` | 最终只使用标签 7 | 删除旧关系，再创建 `(文章 id, 7)` |

第 15 章采用整体替换，完整顺序是：

```text
updateArticleSchema 校验输入
-> 开启 $transaction，函数内使用 tx
-> 查询旧文章，确认存在并计算发布状态变化
-> 更新 Article 的字段
-> 判断 tagIds 是否提交
   ├─ 没提交：不动 ArticleTag
   └─ 已提交：删除旧关系；数组非空时创建新关系
-> 重新查询文章，带上最终关系和标签
-> 事务成功，返回结果
```

这里删除的是文章的关系行，不是标签。例如删掉 `(42, 3)`，只是文章 42 不再使用“后端”；标签 3 仍可被文章 43 使用。

## 4. 事务：关系写入失败时，文章也不能只改一半

假设原来文章 42 的标题为“旧标题”，标签为 `[3, 7]`。现在同时提交新标题和不存在的标签 9999：

```text
更新标题成功
-> 删除旧关系成功
-> 创建 (42, 9999) 时外键检查失败
-> 回滚本事务的修改
-> 旧标题仍在，(42, 3)、(42, 7) 也仍在
```

如果没有共同的事务，前两步可能已经保存，接口虽然报错，文章却变了、标签也丢了。

第 15 章的创建和更新函数都使用数据库事务，只是写法不同：

| 函数 | 写法 | 事务怎样产生 |
|---|---|---|
| `createArticle()` | `article.create()` 内嵌 `articleTags.create`，即 nested write | Prisma 自动把文章和关系的写入放进同一个事务 |
| `updateArticle()` | `$transaction(async (tx) => ...)` | 我们明确把更新文章、删除旧关系、创建新关系放进同一个事务，内部使用 `tx` |

涉及多张表，不代表操作自动属于同一个事务。分开调用 `prisma.article.create()` 和 `prisma.articleTag.create()`，第二次失败不会自动撤销第一次；需要使用嵌套写入或显式事务，才能保证这些写入一起成功或回滚。

nested write 也能表达关联更新。本章把更新展开，是为了看清各步操作与回滚，不是把“创建”固定归给 nested write、“更新”固定归给 `$transaction`。

失败后，repository 把标签相关的数据库异常转成 `AppError`，错误中间件再返回 JSON。**回滚负责撤销修改，错误响应负责告诉客户端为什么失败，二者不是同一件事。**

## 5. 返回标签：写完关系，还要把关系读出来

更新文章字段的 `tx.article.update()` 发生在关系替换之前，而且默认不会返回标签关系。直接把它的结果交给页面，页面拿不到最终的标签。

所以第 15 章在事务末尾再次查询，局部代码是：

```ts
return tx.article.findUniqueOrThrow({
  where: { id: article.id },
  include: { articleTags: { include: { tag: true } } },
});
```

返回结果沿三层组织：

```text
article
-> articleTags：这篇文章的关系行
-> 每条关系中的 tag：由 ArticleTag.tag 找到的 tags 表记录，包含 id、name、slug
```

例如文章 42 关联标签 3，局部结果是：

```ts
{
  id: 42,
  articleTags: [
    {
      articleId: 42,
      tagId: 3,
      tag: {
        id: 3,
        name: "后端",
        slug: "backend",
      },
    },
  ],
}
```

这里的 `tag` 对象对应 `tags` 表中 `id = 3` 的那一行。因为当前 `Tag` 模型只有 `id`、`name`、`slug` 三个普通字段，`tag: true` 会把这三个字段读进结果。

同一份结果在 UI 中有两种用途：

- 展示名称：`article.articleTags.map((item) => item.tag.name)`，显示为文字或标签块。
- 回填编辑：`article.articleTags.map((item) => item.tag.id)`，作为多选 Select 的已选值。

多选框的全部选项来自 `GET /api/tags`，已选值来自当前文章详情。保存后，更新响应带上最新关系；启用筛选分页的列表还会重新请求当前页，让列表内容和总数同步。

## 回看导航

- 不清楚两个外键来自哪里：回看[第 15 章第 2、8 节](./15-数据关系JOIN和事务.md)。
- 不清楚列表条件与分页怎么配合：回看第 15 章第 5 节。
- 不清楚不传标签与清空标签的区别：回看本章第 3 节。
- 不清楚为什么失败后旧标签还在：回看本章第 4 节，再做第 15 章第 9 节的失败验证。
- 不清楚数据库异常怎样变成错误响应：回看[第 15 章第 10 节](./15-数据关系JOIN和事务.md)。
- 不清楚页面怎样接入：阅读 [15B-标签管理与页面联调](./15B-标签管理与页面联调.md) 第 3 节。

能说清“创建文章时新增哪些行、更新标签时替换哪些行、失败时撤销哪些修改、页面需要读回什么”，就继续阅读 [15B-标签管理与页面联调](./15B-标签管理与页面联调.md)，完成标签管理、页面联调和测试数据，再用 [15C-从表单到数据库再回到页面](./15C-从表单到数据库再回到页面.md) 复习数据流，回到第 10 章验收阶段 5。
