# 02. Node.js：让 JavaScript 运行在服务器

## 问题背景

JavaScript 最早主要运行在浏览器里。Node.js 提供了另一套运行环境，让 JavaScript 可以：

- 启动服务器。
- 读取环境变量和文件。
- 连接数据库。
- 使用 npm 包。
- 执行构建、测试和命令行脚本。

Node.js 不是新的编程语言，也不是 Express。

---

## Node.js 项目先认识哪些基础

### 1. 浏览器和 Node.js 都能运行 JavaScript，但能力不同

| 能力 | 浏览器 | Node.js |
|---|---|---|
| 操作 DOM | 可以 | 默认不可以 |
| 读取 `window` | 可以 | 不可以 |
| 启动 HTTP 服务器 | 不负责 | 可以 |
| 访问服务器文件 | 受严格限制 | 可以 |
| 读取环境变量 | 不直接读取服务器变量 | 可以 |
| 连接 PostgreSQL | 不应该 | 可以 |

同样是 JavaScript，运行环境决定它能访问什么能力。

### 2. `package.json` 是项目说明书

后端项目常见内容：

```json
{
  "scripts": {
    "dev": "运行开发服务器",
    "build": "把 TypeScript 编译成 JavaScript",
    "start": "运行编译后的服务器",
    "test": "执行测试"
  }
}
```

`npm run dev` 不是 Node.js 的特殊语法，而是 npm 读取 `scripts.dev` 后执行对应命令。

### 3. 模块让代码可以拆文件

```ts
export function createArticle() {}
```

```ts
import { createArticle } from "./article.js";
```

一个真实服务器不会把所有功能和配置都写在一个文件里。模块是后面拆项目结构的基础。

### 4. 环境变量保存环境相关配置

例如：

```text
PORT=3001
DATABASE_URL=数据库连接地址
```

代码通过 `process.env` 读取。

环境变量适合保存数据库地址和密钥，但 `.env` 文件不能提交真实密码。

---

## 最小服务器

Node.js 自带 `http` 模块，可以直接启动服务器：

```ts
import { createServer } from "node:http";

const server = createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify({ message: "ok" }));
});

server.listen(3001);
```

这里的 `request` 和 `response` 是 Node.js 提供的原生 HTTP 对象。Express 建立在这套能力之上，可以更方便地接收请求和返回响应；第 04 章会具体展开。

正式练习使用 Express，不需要继续手写这些底层处理。

---

## Node.js 在后端项目中做什么

```text
Node.js
-> 运行 server 工程
-> 加载环境变量
-> 启动 Express
-> 执行异步后端代码
-> 执行测试和构建命令
```

---

## 小结

```text
Node.js
-> 让 JavaScript 可以在服务器上运行

package.json
-> 记录项目使用的依赖和可执行脚本

npm
-> 安装依赖，并运行 package.json 中的脚本

模块
-> 把代码拆到不同文件，再通过 import 使用

环境变量
-> 保存端口、数据库地址等会随环境变化的配置
```

有了这些基础，才能启动项目并让服务器接收请求。
