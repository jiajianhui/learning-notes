# 14A. 从页面操作到数据库：一条线看懂管理后台 CRUD

完成第 14 章的 Ant Design 文章管理页面后，本章先建立整体地图。本章不增加新功能，也不重复搭建步骤，只把整个 CRUD 压缩成一条可以快速复习的全栈主线。

读完后，应该能回答四个问题：

```text
页面数据从哪里产生？
请求经过哪些文件到达数据库？
成功结果和错误怎样回到页面？
类型与状态分别解决什么问题？
```

---

## 1. 先把第 14 章压成三条线

### 数据向 API 和数据库前进

```text
用户操作
-> Ant Design 组件产生 values 或文章 id
-> ArticlesPage 决定执行哪项业务操作
-> 文章 API 函数确定路径和请求方法
-> apiRequest() 发送 fetch 请求
-> Express 校验并处理请求
-> Prisma 读写 PostgreSQL
```

### 成功结果或错误向页面返回

```text
PostgreSQL 执行结果
-> Express 返回 HTTP 响应
-> apiRequest() 解析成功数据，或者抛出 Error
-> 当前操作的函数得到数据，或者接收到错误
-> React 更新状态
-> Table、Drawer、Alert 或 message 显示结果
```

### 请求期间的状态留在受影响的界面附近

```text
列表请求   -> listLoading / listError
详情请求   -> detailLoading / detailError
表单提交   -> submitting / submitError
删除请求   -> deletingId；失败时使用 messageApi
```

这不是三套互不相关的代码，而是从三个角度观察同一次请求：数据怎样前进、结果怎样返回、页面怎样反映当前进度。

---

## 2. 每一层只负责一段

先按职责看当前项目中的主要文件：

| 位置 | 主要职责 | 不负责什么 |
|---|---|---|
| Ant Design `Form`、`Table`、`Drawer` | 收集输入、触发事件、显示数据和反馈 | 不直接读写数据库 |
| `article-form.tsx` | 校验表单、产生 `values`、管理提交状态和保存错误 | 不决定发送 POST 还是 PATCH |
| `page.tsx` | 决定列表、新建、编辑或删除；管理页面状态；更新 `articles` | 不重复处理通用 HTTP 细节 |
| `features/articles/api.ts` | 用业务函数名对应接口路径、方法和请求体 | 不控制 Drawer 和 Table |
| `lib/api-client.ts` | 拼接 API 地址、调用 `fetch()`、检查 `response.ok`、解析成功或失败响应 | 不知道请求是在新建还是编辑文章 |
| Express `app.ts` | 让请求依次经过日志、CORS、JSON 解析、路由和错误处理 | 不直接编写每个文章操作 |
| `article-router.ts` | 匹配 HTTP 方法和路径，组织校验、数据库调用与响应 | 不管理浏览器状态 |
| `article-schema.ts` | 在运行时校验并转换请求参数 | 不执行数据库 CRUD |
| `article-repository.ts` | 调用 Prisma Client 读写文章 | 不生成 HTTP 响应 |
| Prisma 和 PostgreSQL | 把数据操作变成 SQL 并真正查询或保存数据 | 不关心页面怎样展示 |

可以把这些职责再压缩成一句话：

```text
组件负责交互
-> 页面负责业务流程和状态
-> API 层负责 HTTP
-> Express 负责校验与调用
-> repository 和 Prisma 负责数据库
```

---

## 3. 用新建文章走完一次完整流程

新建最适合当作主线，因为它同时包含表单、POST 请求、数据库写入和列表更新。

### 3.1 从表单到页面

第 14B 章会详细拆解这一段，这里只保留它在完整链路中的位置：

```text
Form.Item 的 name 组成 values
-> Form 校验通过后调用 handleFinish(values)
-> ArticleForm 执行 onSubmit(values)
-> ArticlesPage 的 handleCreate(values)
```

`ArticleForm` 负责收集、校验和提交，`ArticlesPage` 再决定调用新建接口，以及成功后怎样更新列表、关闭 Drawer 和显示提示。

### 3.2 从页面到 Express

`createArticle()` 知道“新建文章”对应哪个接口：

```text
createArticle(values)
-> POST /api/articles
-> 把 values 转成 JSON 请求体
```

它再调用通用的 `apiRequest<Article>()`。后者不知道这是文章新建，只处理共有的 HTTP 规则：

```text
读取 NEXT_PUBLIC_API_BASE_URL
-> 调用 fetch()
-> 检查 response.ok
-> 成功时取出 response.data
-> 失败时取出 error.message 并抛出 Error
```

`page.tsx` 是客户端组件，`apiRequest()` 使用 Express 的 `http://localhost:3001`。浏览器直接发送：

```text
浏览器
-> POST http://localhost:3001/api/articles
-> Express
```

Next.js 开发服务器负责提供管理页面，但这次 API 请求不会先进入 Next.js Route Handler。封装 `fetch` 的目的也不只是少写代码，而是把 API 地址、成功解析和失败处理等重复规则集中到一个位置。

### 3.3 从 Express 到 PostgreSQL

请求进入 Express 后，依次经过：

```text
app.ts
-> 日志中间件记录开始时间
-> CORS 检查来源
-> express.json() 解析 JSON 请求体
-> articleRouter 匹配 POST /
-> createArticleSchema.parse(req.body) 校验数据
-> article-repository.ts 调用 prisma.article.create()
-> PostgreSQL 保存文章
```

保存成功后，路由返回：

```text
201 Created
{ data: 新文章 }
```

### 3.4 新文章沿原路返回 Table

```text
Express 返回 { data: 新文章 }
-> apiRequest<Article>() 解析 JSON 并取出 data
-> createArticle() 返回 Article
-> handleCreate() 得到 newArticle
-> setArticles() 生成新的文章数组
-> React 重新渲染 ArticlesPage
-> Table 读取新的 articles
-> 页面出现新文章
```

数据库不会主动刷新浏览器。真正让 Table 立刻变化的是 `setArticles()`；数据库负责保存数据，让刷新页面后重新 GET 时仍能查到它。

---

## 4. 列表、编辑和删除只是同一主线的变体

四个操作都会经过“页面 -> API 层 -> Express -> Prisma -> PostgreSQL -> 页面”，区别主要在起点、HTTP 请求和成功后的列表更新方式：

| 操作 | 从哪里开始 | HTTP 请求 | 成功后怎样更新 UI |
|---|---|---|---|
| 加载列表 | 页面挂载后执行 `useEffect` | `GET /api/articles` | `setArticles(result)` 保存整个列表 |
| 新建 | Form 产生 `values` | `POST /api/articles` | 把返回的新文章放到数组最前面 |
| 编辑 | 行数据提供 `id`，详情接口提供 `initialValues`，Form 产生新 `values` | 先 `GET /api/articles/:id`，保存时再 `PATCH /api/articles/:id` | 用 `map()` 把旧文章替换成返回的新文章 |
| 删除 | 当前行提供 `id`，用户在 Popconfirm 中确认 | `DELETE /api/articles/:id` | 用 `filter()` 从数组排除这个 `id` |

编辑比新建多出“加载详情”和“填入初始值”：

```text
点击编辑
-> 用 id 请求完整 Article
-> 把 Article 转成表单 initialValues
-> 用户修改并提交 values
-> handleUpdate(id, values)
```

如果最终 `values` 和 `editingArticle` 相同，`handleUpdate()` 会直接提示“内容没有变化”并返回，不发送 PATCH。

新建、编辑和删除成功后，都直接修改当前 `articles`，所以 UI 可以立刻变化，不需要再请求一次列表。刷新页面时，才会重新执行 GET，从数据库取得最新列表。

---

## 5. 类型说明“数据应该长什么样”

第 14 章不是只有请求函数，还为数据经过的不同边界补上了类型：

| 类型 | 描述的数据 |
|---|---|
| `ArticleFormValues` | Ant Design Form 提交的字段 |
| `CreateArticleInput` | POST 接口允许发送的请求体 |
| `UpdateArticleInput` | PATCH 接口允许发送的请求体 |
| `Article` | 详情、新建和更新接口返回的完整文章 |
| `ArticleListItem` | 列表接口返回的精简文章，不包含正文 |

新建和列表分别使用下面两条类型链路：

```text
新建：Form 产生 ArticleFormValues
-> createArticle() 接收 CreateArticleInput
-> apiRequest<Article>() 返回 Article

列表：getArticles()
-> apiRequest<ArticleListItem[]>() 返回精简文章数组
-> Table 使用 ArticleListItem[]
```

当前 `ArticleFormValues` 的字段满足 `CreateArticleInput`，所以可以把 `values` 直接传给 `createArticle(values)`。它们的名字表示不同职责：一个描述表单结果，一个描述 API 输入。新建接口返回的完整 `Article` 也包含 `ArticleListItem` 需要的全部字段，因此可以直接插入当前列表。

还要分清 TypeScript 类型和 Zod Schema：

| 工具 | 什么时候工作 | 解决什么问题 |
|---|---|---|
| TypeScript 类型 | 编写和构建代码时 | 提示字段、发现代码中的类型错误 |
| Zod Schema | Express 真正收到请求时 | 检查外部数据是否真的符合接口要求 |

`apiRequest<Article>()` 告诉 TypeScript 这次成功数据按 `Article` 使用，但不会在浏览器运行时逐字段验证响应。后端仍然要用 Zod 检查请求，因为来自网络的数据不能只靠前端类型保证。

泛型怎样把具体类型带进 `apiRequest<T>()`，以及完整 `Article` 为什么能作为 `ArticleListItem` 使用，留到第 14C 章集中解释。

---

## 6. 状态说明“界面现在发生了什么”

类型说明数据应该长什么样，状态说明界面现在显示什么。当前代码中的状态可以压缩成三类：

| 状态类别 | 当前例子 | 解决什么问题 |
|---|---|---|
| 页面数据 | `articles`、`editingArticle` | Table 和编辑表单现在使用什么数据 |
| 页面控制 | `drawerOpen`、`drawerMode` | Drawer 是否打开，以及用于新建还是编辑 |
| 请求反馈 | 列表、详情、提交和删除对应的 loading / error | 请求正在进行、成功还是失败 |

状态放在哪里，以及为什么不能让不同请求共用同一组 loading 和 error，会在第 14B 章详细解释。放回全栈主线时，只需要记住：HTTP 请求本身不会自动改变界面，页面必须把返回数据或错误写入 React 状态，React 才会重新渲染。

---

## 7. 错误也沿调用链返回，但在不同位置展示

Express 返回 4xx 或 5xx 时，`apiRequest()` 检查 `response.ok`，读取后端错误文案并抛出 `Error`。错误再沿 Promise 调用链向页面返回：

```text
Express 失败响应
-> apiRequest() 抛出 Error
-> 文章 API 函数和页面操作函数继续传递错误
-> 最接近当前操作的 catch 接住错误
-> React 显示 Alert 或 message
```

列表和详情错误由 `ArticlesPage` 显示，新建和编辑错误由 `ArticleForm` 显示，删除错误使用临时消息。具体为什么这样分，以及失败 Promise 怎样穿过 `handleCreate()` 回到表单，留到第 14B 章展开；本章只保留错误在全栈往返中的位置。

---

## 8. 第 14 章真正学到的核心

你前面总结的三个重点是对的，再补上一条“职责边界”，就形成了完整主线：

```text
封装 fetch
-> 统一“请求怎样发送、响应怎样解析”

补全类型
-> 说明“每一步的数据应该长什么样”

管理 UI 状态
-> 表达“请求和页面现在进行到哪一步”

划分职责
-> 决定“哪一层处理哪一段，成功和失败交给谁”
```

把它们放回完整流程就是：

```text
Ant Design 产生事件和 values
-> ArticlesPage 组织业务操作与页面状态
-> features/articles/api.ts 表达具体接口
-> apiRequest() 处理通用 fetch 规则
-> Express 校验并调用 repository
-> Prisma 和 PostgreSQL 读写数据
-> 成功数据或错误沿调用链返回
-> React 状态变化让页面显示结果
```

以后面对其他管理功能，例如标签、用户或分类，字段和接口会变，但这套骨架仍然成立。

---

## 下一步与回看导航

- 想重新动手完成页面：回到[第 14 章](./14-Ant-Design管理后台跟练.md)。
- 接下来阅读[第 14B 章](./14B-数据和错误怎样在页面与表单之间传递.md)，深入 `onSubmit`、`values`、Promise、状态和错误。
- 完成第 14B 章后，阅读[第 14C 章](./14C-管理后台里的TypeScript-Promise和React状态.md)，复习泛型、异步返回、类型兼容和 React 状态快照。
- 不清楚 `fetch`、HTTP 响应和前后端边界：回看[第 13 章](./13-前后端怎样通过HTTP协作.md)。
- 不清楚 Express 怎样统一校验和处理错误：回看[第 11 章](./11-请求校验和统一错误处理.md)和[第 11A 章](./11A-错误处理中间件怎样接住不同错误.md)。
- 完成第 14C 章后，再进入[第 15 章](./15-数据关系JOIN和事务.md)。
