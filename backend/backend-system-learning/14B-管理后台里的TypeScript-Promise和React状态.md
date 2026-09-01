# 14B. 管理后台技术难点复习：TypeScript、Promise 和 React 状态

第 14 章写完了管理后台，14A 梳理完整 CRUD、数据返回和错误传播。本章只处理代码中几处比较绕的语言和 React 机制，不增加新功能。

Prisma 已经由 09A 总结，这里不再重复。

## 1. 类型与泛型

### 1.1 同一篇文章为什么会有多种类型

表单、请求和响应都在处理文章，但每个环节真正拥有的字段不同，所以分别定义 TypeScript 对象类型。

| 类型 | 描述哪一段数据 | 字段特点 |
|---|---|---|
| `ArticleFormValues` | Form 校验后的表单值 | 只有用户填写或表单默认的字段 |
| `CreateArticleInput` | POST 请求体 | 创建前还没有 `id` 和时间 |
| `UpdateArticleInput` | PATCH 请求体 | 只修改传入的字段，所以属性都可以省略 |
| `Article` | 详情、新建、更新和删除响应 | 包含正文、`id` 和时间等完整字段 |
| `ArticleListItem` | 列表响应和 Table 的一行 | 只保留列表展示需要的字段 |

这些类型只描述“当前数据应该是什么结构”，不会创建新对象，也不会自动转换数据。

`ArticleFormValues` 描述的是 Form 校验通过后传给 `handleFinish()` 的最终表单值。`status` 写成 `ArticleStatus` 而不是 `status?: ArticleStatus`，因为表单保证提交时一定有状态：

- 新建时，`initialValues={{ status: "draft", ...initialValues }}` 提供默认状态 `draft`。
- 编辑时，文章列表页把 `editingArticle.status` 放进 `initialValues`，覆盖前面的默认状态 `draft`。
- `status` 对应的 `Form.Item` 有 `required` 校验；没有状态时，Form 不会调用 `handleFinish()`。

因此，`handleFinish(values)` 收到的 `values.status` 一定存在。`CreateArticleInput.status` 仍然是可选字段，因为它描述的是整个 API 允许的请求体：其他客户端可以不传，此时数据库使用默认值 `draft`。

当前项目中：

- `ArticleFormValues` 的字段满足 `CreateArticleInput` 和 `UpdateArticleInput`，所以同一个 `values` 对象可以直接传给创建或更新函数。
- 完整的 `Article` 包含 `ArticleListItem` 需要的所有字段，所以 `newArticle` 可以直接放进 `ArticleListItem[]`。

它们保留不同名字，是为了标明数据当前位于表单、请求还是响应中。

### 1.2 泛型就是给类型留一个空位

`apiRequest()` 既要请求文章列表，也要请求文章详情，但两次返回的数据不同：

```ts
export async function apiRequest<T>( // T：类型参数（也常叫泛型参数）
  path: string,                      // path：函数参数；string：参数类型
  options?: RequestInit,             // options：可选函数参数；RequestInit：参数类型
): Promise<T> {                       // Promise<T>：返回类型
  // ...
}
```

这里的“泛型参数”和“类型参数”说的是同一个 `T`。更准确地说，`apiRequest()` 是泛型函数，`T` 是它在 `<T>` 中声明的类型参数。

`T` 和 `path`、`options` 的区别是：

- `T` 接收类型，只用于 TypeScript 检查，转换成 JavaScript 后会消失。
- `path` 和 `options` 接收真实的值，程序运行时会传给 `fetch()`。
- `string` 和 `RequestInit` 只是函数参数的类型；`Promise<T>` 是函数的返回类型。

调用函数时，尖括号和圆括号传入的内容也不同：

```ts
apiRequest<Article>(`/api/articles/${id}`);
```

- `<Article>` 是类型实参，用来填入类型参数 `T`。
- `` `/api/articles/${id}` `` 是函数实参，传给 `path`；`options` 有 `?`，所以本次可以不传。

同一个函数传入不同的类型实参，返回类型也会跟着变化：

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

空数组看不出以后要放什么，所以 `useState([])` 需要补上 `ArticleListItem[]`。

最后回到文章列表请求：这次调用为什么必须显式写 `<ArticleListItem[]>`？因为在 `apiRequest()` 的函数签名中，`T` 只出现在返回类型 `Promise<T>` 里，`path: string` 和 `options?: RequestInit` 的类型都不包含 `T`。TypeScript 推断类型参数，靠的是拿函数实参的类型去匹配某个包含 `T` 的参数位置；但这里没有一个参数的类型含 `T`，没有位置可供匹配。TypeScript 也不会根据 `"/api/articles"` 去查后端接口，或者分析以后返回的 JSON 长什么样。因此，这次调用必须显式传入类型实参 `<ArticleListItem[]>`。

显式传入类型实参，只是在类型检查时给占位符 `T` 填值：

```text
T = ArticleListItem[]
Promise<T> = Promise<ArticleListItem[]>
```

类型实参确定的是 TypeScript 看到的返回类型，不是服务器真实返回的数据，也不会在运行时验证 JSON。

### 1.3 函数类型中的参数、返回值和泛型

`apiRequest()` 的函数声明是：

```ts
export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  // ...
}
```

对应的函数类型是：

```ts
type ApiRequest = <T>(
  path: string,
  options?: RequestInit,
) => Promise<T>;
```

- `<T>` 是类型参数。
- `path: string` 是必传的函数参数。
- `options?: RequestInit` 是可选的函数参数。
- `Promise<T>` 是返回值类型。

两段代码描述的调用规则相同：传入 `path` 和可选的 `options`，返回 `Promise<T>`。区别是第一段真正定义了 `apiRequest()`，第二段只把这种函数的规则命名为 `ApiRequest`，不会创建或执行函数。

在本节比较的两种类型别名写法中，`<T>` 放的位置决定了**什么时候确定类型**：

- `<T>` 在 `=` 右侧：调用函数时确定，适合“一个函数、多种类型”。
- `<T>` 在类型名后面：使用这个类型时确定，适合“多个成员、共用一种类型”。

`apiRequest()` 适合第一种写法。同一个请求函数可以在不同调用中返回不同类型：

```ts
const request: ApiRequest = apiRequest;

request<ArticleListItem[]>("/api/articles");
request<Article>(`/api/articles/${id}`);
```

第二种写法解决的是另一件事：**让多个成员必须共用同一个类型**。例如，假设以后封装一个资源客户端：

```ts
type ResourceClient<T> = {
  get: (id: number) => Promise<T>;
  list: () => Promise<T[]>;
};

type ArticleClient = ResourceClient<Article>;
```

`ResourceClient<Article>` 在使用这个类型时把 `T` 确定为 `Article`。因此，`get` 必须返回 `Promise<Article>`，`list` 必须返回 `Promise<Article[]>`，两个成员不能各自改用不同类型。这就是把 `<T>` 放在类型名后面的用途：不是让每次调用更灵活，而是保证一组相关成员的类型一致。

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

项目中的 `handleCreate()` 不需要显式写出返回类型：

```ts
async function handleCreate(values: ArticleFormValues) {
  const newArticle = await createArticle(values);
  setArticles((current) => [newArticle, ...current]);
}
```

TypeScript 会推断出它的完整函数类型：

```ts
(values: ArticleFormValues) => Promise<void>
```

参数是 `ArticleFormValues`。返回值是 `Promise<void>`，因为 `handleCreate()` 是 `async` 函数，并且没有返回文章等业务数据。

这个类型不需要重复写在 `handleCreate()` 上。真正需要明确声明的是 `ArticleForm` 的 `onSubmit` 属性：

```ts
onSubmit: (values: ArticleFormValues) => Promise<void>;
```

`handleCreate()` 的参数和返回值正好符合这个类型，因此可以作为 `onSubmit` 传给 `ArticleForm`。

`ArticleForm` 仍然要等待这个函数：

```ts
await onSubmit(values);
```

成功时，Promise 正常结束，但没有业务数据返回；失败时，Promise 仍会把错误交给 `catch`。`void` 不表示不会失败，也不表示可以不等待。

`handleUpdate()` 发现内容没变化时直接 `return`，它的 Promise 会正常结束，只是不会发送 PATCH。

### 2.2 没有 `async` 也能返回 Promise

```ts
export function getArticles() {
  return apiRequest<ArticleListItem[]>("/api/articles");
}
```

`apiRequest<ArticleListItem[]>()` 返回 `Promise<ArticleListItem[]>`，`getArticles()` 又把这个 Promise 直接返回给调用方。因此，`getArticles()` 自己虽然没有写 `async`，返回值仍然是 Promise：

```ts
const result = await getArticles();
```

`getArticles()` 内部没有使用 `await`，所以不用再给它加一层 `async`。

### 2.3 `void loadArticles()` 中的 `void` 是运算符

```ts
void loadArticles();
```

这里的 `void` 是 JavaScript 运算符，表示调用 `loadArticles()`，但不使用它返回的 Promise。它不会取消请求，也不会捕获错误。

这和类型中的 `Promise<void>` 不是同一种用法：

- `Promise<void>`：描述异步函数成功后没有业务数据返回。
- `void loadArticles()`：执行 `loadArticles()`，然后丢弃这次调用返回的 Promise。

当前写法不会产生未处理的请求错误，是因为 `loadArticles()` 内部已经用 `try...catch` 捕获 `getArticles()` 的错误，并把错误信息写入 `listError`。如果删除内部的 `try...catch`，外面的 `void` 也接不住错误。

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

下面两行是 TypeScript 的属性类型写法：

```ts
summary?: string;
// 可以不传 summary；读取时可能得到 undefined

summary: string | null;
// 必须有 summary 字段，但值可以是 null
```

Mini CMS 在不同位置使用不同的 `summary` 类型：

| 项目类型 | `summary` 的 TypeScript 类型 | 实际含义 |
|---|---|---|
| `Article` | `summary: string \| null` | API 返回的完整文章一定有 `summary` 字段，值可以是字符串或 `null` |
| `CreateArticleInput` | `summary?: string` | 新建请求可以不发送 `summary`，也可以发送字符串 |
| `UpdateArticleInput` | `summary?: string \| null` | 更新请求不发送表示不修改，发送字符串表示更新，发送 `null` 表示清空摘要 |
| `ArticleFormValues` | `summary?: string` | 类型和当前表单都允许不填写；填写时是字符串 |

编辑表单回填时，`editingArticle.summary` 可能是 `null`，所以使用：

```ts
summary: editingArticle.summary ?? ""
```

这会把 `null` 转成文本框使用的空字符串。

### 3.3 `ArticleStatus` 只在 TypeScript 检查时生效

```ts
type ArticleStatus = "draft" | "published";
```

它能在 TypeScript 检查代码时限制状态只能是这两个字符串。项目转换成 JavaScript 后，`ArticleStatus` 类型会被移除。

所以后端仍然要用 Zod 检查客户端实际传来的值：

```ts
const statusSchema = z.enum(["draft", "published"]);
```

TypeScript 检查开发者写的代码，Zod 检查程序运行时收到的数据。

## 4. `onSubmit` 的两种写法

`ArticleForm` 要求父组件传入一个提交函数：

```ts
onSubmit: (values: ArticleFormValues) => Promise<void>;
```

提交表单时，`ArticleForm` 只会传入一个 `values`：

```ts
await onSubmit(values);
```

`handleCreate()` 只需要这个 `values`，所以下面两种创建写法效果相同：

```tsx
onSubmit={(values) => handleCreate(values)}
onSubmit={handleCreate}
```

两种写法传入的都是函数，不会立即执行。当前项目使用第一种，只是为了明确写出 `values` 的传递过程，方便 review。

`handleUpdate()` 需要 `id` 和 `values` 两个参数，而 `ArticleForm` 只提供 `values`，所以编辑时要用箭头函数补上 `id`：

```tsx
onSubmit={(values) => handleUpdate(editingArticle.id, values)}
```

下面两种写法都不行：

```tsx
onSubmit={handleUpdate} // 表单只传 values，缺少 id
onSubmit={handleUpdate(editingArticle.id)} // 渲染时立即执行，传入的是 Promise，不是函数
```

## 5. 为什么 `deletingId` 更新了，`filter()` 仍读到旧值

如果删除时这样写：

```ts
setDeletingId(id);
await deleteArticle(id);

setArticles((current) =>
  current.filter((item) => item.id !== deletingId),
);
```

`setDeletingId(id)` 确实更新了 React 保存的状态，下一次渲染时按钮会显示 loading。但它不会回头修改已经开始执行的 `handleDelete()`；这个函数仍然读取启动时捕获的 `deletingId`，通常是 `null`。

传给 `setArticles()` 的函数中，`current` 是 React 提供的最新文章数组，`deletingId` 却是捕获的旧状态。因此 `filter()` 实际比较的是 `item.id !== null`，没有移除任何文章，页面数据也没有变化。

数据库已经通过 `deleteArticle(id)` 删除成功，所以手动刷新、重新 GET 后文章才会消失。

而下面的新建代码能立即更新，是因为 `current` 是最新数组，`newArticle` 也是已经拿到的局部变量：

```ts
setArticles((current) => [newArticle, ...current]);
```

删除时应使用本次调用中不会变化的函数参数 `id`：

```ts
setArticles((current) =>
  current.filter((item) => item.id !== id),
);
```

`id` 决定删哪篇文章，`deletingId` 只负责让对应按钮显示 loading。

## 6. 第 14 章综合问答

1. **`apiRequest<T>(path: string, options?: RequestInit): Promise<T>` 中的 `T` 是什么？**<br>`T` 是类型参数，用来告诉 TypeScript 怎样看待本次成功返回的 `data`。例如传入 `Article` 后，TypeScript 会把返回类型看作 `Promise<Article>`；这不会验证服务器实际返回的 JSON。<br><br>
2. **`Promise<void>` 为什么仍然需要 `await`？**<br>`void` 只表示成功后没有业务数据可拿，不代表这次调用一定成功。不 `await` 的话，函数会跳过等待直接往下走，这次调用是否真的执行完、有没有出错，都无法知道——出错了也没有 `catch` 能接住。<br><br>
3. **`getArticles()` 没写 `async`，为什么仍然返回 Promise？**<br>因为它直接返回了 `apiRequest()` 产生的 Promise。普通函数也可以返回 Promise。<br><br>
4. **`void loadArticles()` 会不会捕获错误？**<br>不会。这里的 `void` 只表示不使用返回的 Promise；当前错误由 `loadArticles()` 内部的 `try...catch` 捕获。<br><br>
5. **完整 `Article` 为什么能放进 `ArticleListItem[]`？**<br>TypeScript 按对象结构判断兼容性。`Article` 已经包含 `ArticleListItem` 要求的全部字段，多出的字段不影响使用。<br><br>
6. **`summary?: string`、`summary: string | null` 和 `summary ?? ""` 有什么区别？**<br>前者允许没有 `summary` 属性；中间写法要求属性存在，但值可以是 `null`；最后一个是运行时表达式，值为 `null` 或 `undefined` 时改用空字符串。<br><br>
7. **`values` 和编辑文章的 `id` 分别从哪里来？**<br>`values` 是 Ant Design Form 校验通过后产生的表单数据；`id` 最初来自点击的 Table 行，加载详情后通过 `editingArticle.id` 传给更新函数。<br><br>
8. **调用 `setDeletingId(id)` 后，为什么 `filter()` 使用 `id`，而不是 `deletingId`？**<br>`handleDelete()` 开始执行时捕获的是当前渲染中的旧 `deletingId`，通常是 `null`。`setDeletingId(id)` 只会让下一次渲染得到新状态，不会修改这个函数已经捕获的值；函数参数 `id` 已经确定本次要删除的文章，所以 `filter()` 必须使用 `id`。`deletingId` 只负责控制对应按钮的 loading。<br><br>
9. **TypeScript 已经定义 `ArticleStatus`，后端为什么还要使用 Zod？**<br>`ArticleStatus` 只在 TypeScript 编译检查时约束代码，转换成 JavaScript 后会被移除；浏览器、Apifox 或其他客户端仍然可以发送任意字符串。Zod 负责在后端运行时校验实际收到的请求数据。<br><br>
10. **为什么创建可以直接传入 `handleCreate`，编辑却要使用箭头函数？**<br>`ArticleForm` 只会传入 `values`。`handleCreate()` 只需要这一个参数，`handleUpdate()` 还需要 `id`，所以编辑时要用箭头函数补上 `editingArticle.id`。<br><br>
11. **新建或编辑失败后，错误为什么能回到 `ArticleForm`？**<br>`apiRequest()` 抛出的错误没有被 `createArticle()`、`handleCreate()` 等中间函数捕获，因此会沿 Promise 调用链向上传播，最后由 `handleFinish()` 中的 `catch` 处理。<br><br>
12. **为什么更新文章列表时使用 `setArticles((current) => ...)`？**<br>React 会把执行更新时最新的文章数组传给 `current`，避免使用旧渲染中的状态快照。
