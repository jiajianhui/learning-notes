# 14C. 管理后台技术难点复习：TypeScript、Promise 和 React 状态

第 14 章写完了管理后台，14A 梳理完整 CRUD，14B 解释数据和错误怎样传递。本章只处理代码中几处比较绕的语言和 React 机制，不增加新功能。

Prisma 已经由 09A 总结，这里不再重复。

## 1. 泛型就是给类型留一个空位

`apiRequest()` 既要请求文章列表，也要请求文章详情，但两次返回的数据不同：

```ts
export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  // ...
}
```

`T` 是类型占位符，调用时再决定它是什么：

```ts
apiRequest<ArticleListItem[]>("/api/articles");
apiRequest<Article>(`/api/articles/${id}`);
```

| 调用 | 本次 `T` | 返回类型 |
|---|---|---|
| `apiRequest<ArticleListItem[]>(...)` | `ArticleListItem[]` | `Promise<ArticleListItem[]>` |
| `apiRequest<Article>(...)` | `Article` | `Promise<Article>` |

函数内部也可以继续使用这个 `T`：

```ts
type ApiSuccess<T> = {
  data: T;
};

const successBody: ApiSuccess<T> = await response.json();
return successBody.data;
```

这样只写一套请求流程，不同 API 仍然保留自己的返回类型。

项目中的其他泛型：

| 代码 | 具体类型表示什么 |
|---|---|
| `useState<ArticleListItem[]>([])` | 状态保存文章列表 |
| `Form<ArticleFormValues>` | Form 收集哪些字段 |
| `TableColumnsType<ArticleListItem>` | Table 每一行是什么结构 |
| `Pick<Article, ...>` | 从完整文章中选出列表字段 |

例如：

```ts
type ArticleListItem = Pick<
  Article,
  "id" | "title" | "slug" | "status" | "createdAt"
>;
```

`Pick` 的第一个类型参数是原类型，第二个类型参数是要保留的字段名。

有些类型可以推断：

```ts
const [drawerOpen, setDrawerOpen] = useState(false);
// TypeScript 可以从 false 推断出 boolean
```

空数组看不出以后要放什么，所以 `useState([])` 需要补上 `ArticleListItem[]`。请求路径也看不出响应结构，所以调用 `apiRequest()` 时要写 `Article` 或 `ArticleListItem[]`。

`apiRequest<Article>()` 只提供 TypeScript 检查，不会在运行时验证服务器返回的 JSON。

## 2. Promise 是以后才拿到的结果

网络请求不能立刻返回文章，所以 `apiRequest<Article>()` 返回的是：

```ts
Promise<Article>
```

它以后有两种结果：

```text
成功 -> 得到 Article
失败 -> 得到错误
```

`await` 等待 Promise。成功时拿到数据；失败时进入 `catch`。它只暂停当前异步函数，不会卡住整个页面或服务器。

### 2.1 `Promise<void>` 也要等待

```ts
async function handleCreate(values: ArticleFormValues) {
  const newArticle = await createArticle(values);
  setArticles((current) => [newArticle, ...current]);
}
```

`async` 函数一定返回 Promise。`handleCreate()` 没有返回文章等业务数据，所以返回类型是：

```ts
Promise<void>
```

`void` 只表示成功后没有业务数据返回，不表示函数可以不用等待。`ArticleForm` 仍然要等待提交函数，才能控制 loading 和捕获错误：

```ts
onSubmit: (values: ArticleFormValues) => Promise<void>;

await onSubmit(values);
```

`handleUpdate()` 发现内容没变化时直接 `return`，它的 Promise 会正常结束，只是不会发送 PATCH。

### 2.2 没有 `async` 也能返回 Promise

```ts
export function getArticles() {
  return apiRequest<ArticleListItem[]>("/api/articles");
}
```

`getArticles()` 直接返回了 `apiRequest()` 产生的 Promise，所以调用方仍然要写：

```ts
const result = await getArticles();
```

这个函数内部没有使用 `await`，不用再加一层 `async`。

### 2.3 箭头函数要把 Promise 返回出去

```tsx
onSubmit={(values) => handleCreate(values)}
```

这段箭头函数会自动返回 `handleCreate(values)` 的 Promise，所以 `ArticleForm` 可以等待它。

下面的写法只调用函数，没有把 Promise 返回给外层：

```tsx
onSubmit={(values) => {
  handleCreate(values);
}}
```

当前 `onSubmit` 要求返回 `Promise<void>`，TypeScript 会提示类型不匹配。

### 2.4 `void loadArticles()` 不会处理错误

```ts
void loadArticles();
```

这里的 `void` 只表示当前代码不使用这个 Promise 的返回值。它不会取消请求，也不会捕获错误。

当前代码没有问题，是因为 `loadArticles()` 内部已经用 `try...catch` 处理错误。

## 3. Swift 和 TypeScript 判断类型的方式不同

### 3.1 Swift 看类型身份，TypeScript 看对象结构

Swift 中，两个分别声明的 `struct` 即使字段相同，仍然是不同类型，通常需要手动转换。

TypeScript 更关心一个值有没有目标类型要求的字段。

`ArticleListItem` 只需要完整文章中的一部分字段：

```ts
type ArticleListItem = Pick<
  Article,
  "id" | "title" | "slug" | "status" | "createdAt"
>;
```

更新接口返回的 `updatedArticle` 是完整 `Article`。它包含列表类型需要的所有字段，所以可以放进 `ArticleListItem[]`：

```ts
current.map((article) =>
  article.id === updatedArticle.id ? updatedArticle : article,
);
```

`updatedArticle` 中的 `content` 等额外字段不会被删掉，只是当前数组按 `ArticleListItem[]` 使用。

| Swift | TypeScript |
|---|---|
| 更关注值声明成哪种类型 | 更关注值有没有所需字段 |
| 两个独立 `struct` 不会自动兼容 | 对象结构满足要求时通常可以兼容 |
| 类型会进入编译后的程序 | 类型转成 JavaScript 后会被移除 |

### 3.2 `Optional`、可选属性和 `null`

Swift 的 `String?` 表示 `String` 或 `nil`。TypeScript 还区分“属性没传”和“属性值为空”：

```ts
summary?: string;
// 可以不传 summary；读取时可能得到 undefined

summary: string | null;
// 必须有 summary 字段，但值可以是 null
```

Mini CMS 中的摘要有几种表示：

| 位置 | 类型或值 | 意思 |
|---|---|---|
| 完整文章 | `summary: string | null` | 数据库中的摘要可能为空 |
| 创建输入 | `summary?: string` | 请求可以不发送摘要 |
| 表单值 | `summary?: string` | 类型允许缺少；当前表单规则要求填写 |
| 文本框初始值 | `summary ?? ""` | 把 `null` 或 `undefined` 变成空字符串 |

`??` 只处理 `null` 和 `undefined`，不会替换已经存在的空字符串。

### 3.3 字符串联合类型不是 Swift `enum`

```ts
type ArticleStatus = "draft" | "published";
```

它能在写代码时限制状态只能是这两个字符串，但运行时不会留下一个真正的枚举类型。

所以后端仍然要用 Zod 检查客户端实际传来的值：

```ts
const statusSchema = z.enum(["draft", "published"]);
```

TypeScript 检查开发者写的代码，Zod 检查程序运行时收到的数据。

## 4. `onSubmit` 传的是函数，不是运行结果

`ArticleForm` 要求父组件传入一个提交函数：

```ts
onSubmit: (values: ArticleFormValues) => Promise<void>;
```

父组件把箭头函数交给表单：

```tsx
onSubmit={(values) => handleCreate(values)}
```

这时不会执行 `handleCreate()`。用户提交并通过校验后，Ant Design Form 根据各个 `Form.Item` 的 `name` 组成 `values`，再调用：

```text
handleFinish(values)
-> onSubmit(values)
-> handleCreate(values)
```

编辑时还需要文章 id：

```tsx
onSubmit={(values) =>
  handleUpdate(editingArticle.id, values)
}
```

`values` 由表单提交时传入，`editingArticle.id` 来自父组件已经保存的文章详情。`ArticleForm` 的接口没有改变，仍然只接收一个 `values`。

## 5. React 状态不是普通变量

```ts
async function handleDelete(id: number) {
  setDeletingId(id);
  await deleteArticle(id);

  setArticles((current) =>
    current.filter((item) => item.id !== id),
  );
}
```

调用 `setDeletingId(id)` 后，当前函数中的 `deletingId` 不会马上变成新值。React 会在下一次渲染时提供新的状态。

下一次渲染通常很快，所以页面看起来是立即变化的；它不是指下一次手动刷新页面。

### 5.1 `id`、`deletingId` 和 `current` 分别做什么

| 名字 | 谁提供 | 用途 |
|---|---|---|
| `id` | 点击当前行时传入 | 确定这次删除哪篇文章 |
| `deletingId` | React 状态 | 让对应删除按钮显示 loading |
| `current` | React 处理更新时传入 | 当时最新的文章数组 |

所以请求和过滤使用函数参数 `id`：

```ts
await deleteArticle(id);

setArticles((current) =>
  current.filter((item) => item.id !== id),
);
```

按钮才读取 `deletingId`：

```tsx
loading={deletingId === article.id}
```

请求很快时，loading 可能短到看不清，但状态仍然生效了。

### 5.2 为什么用函数式更新

```ts
setArticles((current) => [newArticle, ...current]);
```

React 会把处理更新时最新的文章数组传给 `current`。新建、编辑和删除都要根据旧列表生成新列表：

```text
[newArticle, ...current] -> 新建文章
current.map(...)         -> 替换更新后的文章
current.filter(...)      -> 删除文章
```

这些写法会生成新数组，不会直接修改旧数组。React 收到新数组后重新渲染，Table 就能显示新数据。

## 6. 为什么同一篇文章要定义多种类型

| 类型 | 用在哪里 | 和其他类型的区别 |
|---|---|---|
| `Article` | 详情、新建和更新响应 | 包含完整字段、`id` 和时间 |
| `ArticleListItem` | 列表响应和 Table | 不包含正文 |
| `ArticleFormValues` | Ant Design Form | 只包含用户输入 |
| `CreateArticleInput` | POST 请求体 | 创建时还没有 `id` 和时间 |
| `UpdateArticleInput` | PATCH 请求体 | 每个可修改字段都可以省略 |

当前 `ArticleFormValues` 拥有创建和更新接口需要的字段，所以可以直接传给 API 函数。它们保留不同名字，是为了说清数据现在位于表单还是 HTTP 请求中。

服务端的日期对象经过 JSON 传到浏览器后会变成字符串，所以前端的 `createdAt` 和 `updatedAt` 使用 `string`。

后端还使用 `z.infer` 从 Zod Schema 得到 TypeScript 类型：

```ts
type CreateArticleInput = z.infer<typeof createArticleSchema>;
```

Schema 负责运行时校验，推导出的类型负责后端代码提示。

## 7. 把这些内容连起来

```text
Form<ArticleFormValues> 收集 values
-> 回调函数把 values 交给页面函数
-> API 函数调用 apiRequest<T>()
-> Promise<T> 返回数据或错误
-> TypeScript 检查代码中的类型
-> Zod 检查后端收到的真实数据
-> setArticles() 生成新的文章数组
-> React 重新渲染 Table
```

最后检查自己能否回答：

- `apiRequest<T>()` 中的 `T` 是什么？
- `Promise<void>` 为什么仍然需要 `await`？
- `getArticles()` 没写 `async`，为什么仍然返回 Promise？
- `void loadArticles()` 会不会捕获错误？
- 完整 `Article` 为什么能放进 `ArticleListItem[]`？
- `summary?: string`、`summary: string | null` 和 `summary ?? ""` 有什么区别？
- `values` 和编辑文章的 `id` 分别从哪里来？
- 调用 `setDeletingId(id)` 后，为什么删除请求仍然使用函数参数 `id`？
- TypeScript 已经定义 `ArticleStatus`，后端为什么还要使用 Zod？

