# 14A. 从页面操作到数据库：一条线看懂管理后台 CRUD

## 0. 管理端的两条关键调用关系

表单提交时，Ant Design Form 校验通过后会调用 `ArticleForm` 中的 `handleFinish(values)`。

`handleFinish()` 里的 `onSubmit` 不是另一套提交逻辑，而是 `ArticlesPage` 传入的函数：新建时最终执行 `handleCreate(values)`，编辑时最终执行 `handleUpdate(id, values)`。

因此，`ArticleForm` 负责在表单校验通过后调用外部传入的保存函数，`ArticlesPage` 负责提供具体的新建或编辑函数。

从请求底层往上看，通用的 `apiRequest()` 调用 `fetch()` 并检查 HTTP 响应：成功时返回 `data`，失败时抛出 `Error`。

`features/articles/api.ts` 在此基础上定义 `createArticle()` 等具体请求，补充路径、方法和请求体。`handleCreate()` 拿到新文章后更新列表。

如果请求失败，因为 `createArticle()` 和 `handleCreate()` 都没有 `catch`，错误会继续传播到 `ArticleForm`，最后由 `handleFinish()` 的 `catch` 捕获。

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

一次文章请求会跨过 `admin-web-antd` 和 `server` 两个项目。先分清文件属于哪一端，再看它在请求中负责哪一步。

### `admin-web-antd`：管理端

| 位置 | 主要职责 |
|---|---|
| Ant Design `Form`、`Table`、`Drawer` | 收集输入、触发事件、显示数据和反馈 |
| `app/admin/articles/_components/article-form.tsx` | 校验表单、产生 `values`、管理提交状态和保存错误 |
| `app/admin/articles/page.tsx` | 决定加载、新建、编辑或删除；管理页面状态；更新 `articles` |
| `features/articles/api.ts` | 用业务函数名对应接口路径、方法和请求体 |
| `lib/api-client.ts` | 拼接 API 地址、调用 `fetch()`、检查 `response.ok`，并解析成功或失败响应 |

### `server`：服务端

| 位置 | 主要职责 |
|---|---|
| `src/app.ts` | 让请求依次经过日志、CORS、JSON 解析、文章路由和错误处理 |
| `src/modules/articles/article-router.ts` | 匹配 HTTP 方法和路径，组织校验、数据库调用与响应 |
| `src/modules/articles/article-schema.ts` | 在运行时校验并转换请求参数 |
| `src/modules/articles/article-repository.ts` | 调用 Prisma Client 读写文章 |
| Prisma Client 和 PostgreSQL | 把数据操作转换成查询并真正读取或保存数据 |

`admin-web-antd` 负责收集用户操作、发出 HTTP 请求和更新界面。请求到达 `server` 后，服务端负责校验数据、读写数据库并返回 HTTP 响应。

---

## 3. 用新建文章走完一次完整流程

新建最适合当作主线，因为它同时包含表单、POST 请求、数据库写入和列表更新。

### 3.1 从表单到页面

这里先保留它在完整链路中的位置：

```text
Form.Item 的 name 组成 values
-> Form 校验通过后调用 handleFinish(values)
-> handleFinish() 调用外部传入的 onSubmit(values)
-> 新建模式实际执行 handleCreate(values)
```

这里的 `onSubmit` 只是保存父组件传入的函数，不是额外的业务步骤。`ArticleForm` 负责收集、校验和提交，`ArticlesPage` 再决定调用新建接口，以及成功后怎样更新列表、关闭 Drawer 和显示提示。

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
-> 成功时解析 JSON 并取出 data
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
-> apiRequest<Article>() 解析响应，handleCreate() 得到 newArticle
-> setArticles() 把新文章加入 articles
-> React 重新渲染，Table 显示新文章
```

数据库不会主动刷新浏览器。真正让 Table 立刻变化的是 `setArticles()`；数据库负责保存文章，因此刷新页面后重新 GET 时仍能查到这篇文章。

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

## 5. 状态说明“界面现在发生了什么”

当前代码中的 React 状态可以压缩成三类：

| 状态类别 | 当前例子 | 解决什么问题 |
|---|---|---|
| 页面数据 | `articles`、`editingArticle` | Table 和编辑表单现在使用什么数据 |
| 页面控制 | `drawerOpen`、`drawerMode` | Drawer 是否打开，以及用于新建还是编辑 |
| 请求反馈 | 列表、详情、提交和删除对应的 loading / error | 请求正在进行、成功还是失败 |

列表、详情、提交和删除影响的界面不同，因此不能共用同一组 loading 和 error。`listError` 显示在 Table 上方，`detailError` 显示在编辑 Drawer 内，`submitError` 显示在 `ArticleForm` 中。删除失败没有单独的错误状态，直接调用 `messageApi.error()` 显示临时提示。

React 状态怎样更新会在第 14B 章解释；放回全栈主线时，只需要记住：HTTP 请求本身不会自动改变界面，页面必须把返回数据或错误写入 React 状态，React 才会重新渲染。
