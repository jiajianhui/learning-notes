# 02. 同一份 JavaScript 在哪里运行

你在前端和后端都写 TypeScript。为什么前端点击事件里能访问 `window`，后端却能读取数据库连接地址、监听端口？

关键是执行位置。语言描述怎么算，运行环境决定程序能向外界做什么。

## 1. 语言像手艺，运行环境像工作场所

同一个厨师到家庭厨房和餐厅厨房，都可以切菜，但能够使用的设备不同。JavaScript 也一样：函数、对象、数组属于语言；DOM、文件和网络能力由运行环境提供。

| 能力 | 浏览器页面 | Node.js 进程 |
|---|---|---|
| 执行函数、操作对象、使用 Promise | 可以 | 可以 |
| 操作页面 DOM、使用 window | 可以 | 默认没有 DOM 和 window |
| 访问本机服务器文件系统 | 受浏览器权限和 API 限制 | 可通过文件 API，在进程权限范围内操作 |
| 监听 TCP/HTTP 端口 | 普通页面没有这类服务端 API | 可以 |
| 发出 HTTP 请求 | 可以，例如 fetch | 也可以，例如 fetch |

所以看见 `fetch` 不能直接判断代码在浏览器中。要追问是谁调用了它、代码运行在哪个进程或页面里。

Node.js 中，V8 负责 JavaScript 的执行与内存管理；Node.js 还提供模块、文件、网络等接口，借助 libuv 和操作系统协调相应工作。V8 不是整个 Node.js，浏览器也不是 Node.js 加上一个窗口。

## 2. MiniCMS 同时存在几个执行现场

先画本地开发的主要角色：

```text
浏览器页面：表单交互、点击事件、请求 API、更新 React 状态

Next.js 开发服务：准备并提供页面资源，执行相应的服务端渲染工作

Express 服务：接收 API 请求，校验输入，查询数据库，生成响应

PostgreSQL：执行 SQL，管理数据库中的数据
```

Next.js 和 Express 是分别启动的服务。浏览器按钮触发的文章请求，在当前 MiniCMS 中直接访问配置好的 Express API 地址，不必先经过 Next.js 服务转发。

实际入口可沿这几处追踪：

```text
页面中的事件或 Effect
→ admin-web-antd/features/articles/api.ts
→ admin-web-antd/lib/api-client.ts 中的 fetch
→ server/src/app.ts 挂载的文章路由
```

文件在 `lib` 目录，并不能证明它属于服务端。调用位置和模块依赖决定它最终被用在哪一侧。

## 3. use client 为什么也需要小心判断

Next.js App Router 默认把页面和布局作为 Server Components；需要状态、事件等能力时建立 Client Component 边界。

但 `"use client"` 不等于“文件里的每一行都只会在浏览器执行”。首次页面加载时，Next.js 也可能在服务端预渲染客户端组件的 HTML；浏览器随后加载相应 JavaScript，接上交互能力。

因此，组件渲染期间直接读取 `window`，仍可能遇到服务端没有这个对象的问题。点击事件发生在浏览器；Effect 在客户端运行，这些才是理解浏览器专属操作位置的依据。[Next.js 服务端与客户端组件说明](https://nextjs.org/docs/app/getting-started/server-and-client-components)

先记住三件事：构建在哪里发生、首屏怎样生成、用户点击时代码在哪里执行。它们不必是同一个时刻或同一个环境。

## 4. import 怎样把多个文件连起来

后端 `src/server.ts` 导入 `app`，`app.ts` 又导入路由，路由导入 repository，repository 导入数据库客户端。

```text
server.ts
→ app.ts
→ article-router.ts
→ article-repository.ts
→ db/client.ts
```

这些箭头表示模块依赖，不表示发出了网络请求。它们通常在同一个后端进程里协作，调用函数时直接传递 JavaScript 值。直到数据库客户端真正进行查询，才会涉及后端与 PostgreSQL 的通信。

加载模块时，模块顶层代码也会执行。例如 `db/client.ts` 在顶层读取 `DATABASE_URL`、创建适配器并导出 Prisma Client。标准模块加载通常会在同一进程内复用已加载的同一个模块；前后端两个独立进程不会因此共享一份内存对象。

ES module 的静态依赖会先于导入它的模块主体完成求值。不要把 `import` 当作普通的“执行到这一行才加载”的函数调用。配置加载是这种顺序问题的常见入口：项目的 `db/client.ts` 使用 `import "dotenv/config"` 加载环境文件，再读取连接地址。

本轮实验统一使用 `.mjs`，明确采用 ES module，可以写 `import`，不需要额外的 `package.json`。项目自身继续使用已有的 TypeScript 与 tsx 配置。

## 5. TypeScript 被执行前发生了什么

类型声明帮助开发工具检查代码，但不会自动成为网络输入的运行时规则。

```ts
type Input = { title: string };
```

这个类型不能阻止客户端发送 `{ "title": 123 }`。执行时需要实际的检查逻辑，MiniCMS 使用 Zod 完成这一步。

你的后端用 tsx 加载 TypeScript；它处理执行所需的转换，但不等于完整执行 TypeScript 类型检查。Node.js 24 本身也支持一部分 TypeScript 类型擦除能力，这不意味着能直接替代任意项目中的 tsx、编译配置和类型检查。这里继续解释项目已经使用的工具。

把三个动作分开：

```text
转换：让源码能进入执行流程
类型检查：在执行前发现类型使用问题
运行时校验：检查真正收到的数据
```

“项目能启动”证明了其中一部分，不能单独证明另外两部分已经通过。

## 6. 环境变量是谁的环境

`process.env` 读取的是当前进程的环境变量。可以把它理解成进程开工时拿到的配置卡：端口是多少、数据库在哪里。通常值是字符串，未设置时是 `undefined`。

所以后端写：

```ts
const port = Number(process.env.PORT ?? 3001);
```

`??` 提供缺省值，`Number` 把环境中的文本转换为数字。

`.env` 则只是一个文件。必须有人读取它，值才会进入程序使用的配置：MiniCMS 后端使用 dotenv；Next.js 有自己的 `.env*` 加载约定；Compose 也有读取和传递变量的规则。三者不能合并成“放一个 .env，所有程序就自动拥有配置”。

在终端运行下面的最小观察，不读取项目密钥：

```bash
FOUNDATIONS_LABEL=from-shell node -p 'process.env.FOUNDATIONS_LABEL'
node -p 'process.env.FOUNDATIONS_LABEL'
```

第一条应输出 `from-shell`。如果你之前没有在 Shell 中设置同名变量，第二条输出 `undefined`。前一条只给那次启动的命令附加了变量，没有永久修改 Shell，也没有修改任何 `.env`。

## 7. 前端的公开配置为什么在构建后固定

项目的 `api-client.ts` 读取：

```ts
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
```

在浏览器端构建中，Next.js 会把这类直接引用替换为构建时取得的公开值。浏览器拿到的是包含地址的 JavaScript，不是在运行时访问服务器的 `process.env`。

可以把它想成印在传单上的电话号码：改了办公室通讯录，不会改掉已经印出的传单。生产构建时写入旧 API 地址，之后只改服务器环境变量或重启容器，旧页面代码不会自动换号；需要重新构建并交付相应前端产物。[Next.js 环境变量说明](https://nextjs.org/docs/app/guides/environment-variables#bundling-environment-variables-for-the-browser)

公开配置会送到浏览器，所以数据库密码等服务端秘密不能放到 `NEXT_PUBLIC_` 变量中。

## 8. 做一次执行位置检查

先在任意终端执行：

```bash
node -p 'typeof window'
node -p 'typeof process'
node -p 'process.cwd()'
```

前两个结果应为 `undefined`、`object`。第三个显示启动命令时的工作目录，它不一定等于某个源码文件所在目录。这能解释相对路径读取文件时的常见困惑：`./data.json` 通常相对于当前工作目录解析；模块自身的位置则可通过 `import.meta.url` 等信息确定。

再在浏览器开发者工具 Console 输入 `typeof window`，应得到 `object`。

最后打开 MiniCMS，任选一次文章列表请求，在 Network 中确认请求的目标主机和端口。回答：这次是浏览器请求 Express，还是 Next.js 服务端请求 Express？证据是浏览器实际发出了什么 URL。

## 9. 合上文档，讲给别人听

1. JavaScript 是同一种语言，为什么 Node.js 默认没有 window？
2. import repository 和通过 HTTP 请求另一台服务，差别在哪里？
3. 把数据库密码写到 NEXT_PUBLIC_ 变量中，会发生什么？
4. 页面仍请求旧地址时，怎样判断应该检查构建结果还是服务器运行配置？

<details>
<summary>讲完后再看提示</summary>

语言能力与宿主环境能力不同。模块调用通常在进程内，HTTP 需要跨连接交换数据。公开变量会进入客户端产物；先用 Network 确认实际 URL，再追踪它在源码和构建时从哪里取得。

</details>

继续阅读：[服务怎样监听端口并等待请求](./03-服务怎样监听端口并等待请求.md)。
