# 03. Node.js 和包管理工具

## 问题背景

一开始写 `01-html-css-js` 时，你不需要 Node，也不需要 npm。

浏览器直接打开：

```text
index.html
index.js
```

但一进入 Vite、React、Vue、TypeScript，项目里马上出现：

```text
node
npm
package.json
node_modules
package-lock.json
npm run dev
```

这篇只回答一个问题：

```text
为什么前端后来离不开 Node.js 和 npm 生态？
```

本文是工程化前置理解，不讲后端、不讲部署。

| 问题 | 答案 |
|---|---|
| 解决什么 | 运行开发工具、安装依赖、执行项目命令 |
| 依赖什么 | 本地 Node.js 环境 |
| 和七层关系 | 它不是 UI 层，更像第四层工程化背后的运行环境 |

---

## 核心解释

### 1. 浏览器和 Node.js 分工不同

| 运行环境 | 主要运行什么 |
|---|---|
| 浏览器 | 用户看到的页面 JS |
| Node.js | 开发者本地使用的工具 |

现代前端工具很多都跑在 Node.js 里：

```text
Vite
TypeScript
脚手架
格式化工具
测试工具
打包工具
```

所以 Node.js 在前端里常常不是“写后端”，而是“跑工具”。

---

### 2. npm / pnpm / yarn 是什么

它们是包管理工具。

| 负责什么 | 例子 |
|---|---|
| 安装依赖 | `npm install` |
| 记录版本 | `package.json`、lock 文件 |
| 执行命令 | `npm run dev` |
| 管理安装结果 | `node_modules` |

它们不是 React，不是 Vue，也不是 Vite。

---

### 3. 早期为什么不需要 Node

早期页面简单：

```text
index.html
index.js
```

要用库，就手动引入：

```html
<script src="./some-library.js"></script>
```

页面小的时候，这样完全可以。

---

### 4. 后来为什么需要工具链

项目一复杂，早期方式就开始撑不住：

| 变化 | 早期问题 | 现代做法 |
|---|---|---|
| JS 文件变多 | 加载顺序难管 | 模块化 + 构建工具 |
| 第三方包变多 | 下载升级麻烦 | npm / pnpm |
| 写 TypeScript | 浏览器不能直接跑 | 转成 JS |
| 写 React JSX | 浏览器不能直接懂 | 转成 JS |
| 写 `.vue` | 浏览器不能直接懂 | Vue 插件处理 |
| 想热更新 | 手动刷新慢 | 开发服务器 |
| 想生产打包 | 手动合并压缩不现实 | Vite / Webpack |

所以不是“前端天生需要 Node.js”，而是现代前端开发方式需要本地工具运行环境。

---

### 5. React / Vue 是否强绑定 Node

严格说，不是。

React / Vue 可以通过 `<script>` 做小 demo。

但真实现代项目几乎都会用 Node + npm，因为常见写法需要工具链：

```text
JSX / TSX
.vue 单文件组件
TypeScript
npm 包
开发服务器
生产打包
```

一句话：

```text
React/Vue 管 UI。
Node.js 跑工具。
npm/pnpm 管依赖和命令。
Vite 负责开发服务器和打包。
```

这里的“开发服务器”，可以先理解成本地预览服务。

你执行 `npm run dev` 后，Vite 会在你的电脑上启动一个临时的 HTTP 服务，并给你一个类似这样的地址：

```text
http://localhost:5173/
```

这个网址不是开发服务器本身，而是浏览器访问开发服务器的入口。浏览器打开这个地址后，Vite 负责把项目里的 HTML、CSS、JS、TS、Vue/React 相关文件处理好，再送给浏览器预览。

---

## 技术关系

### package.json 是项目说明书

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "vue": "^3.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

读项目时先看它：

| 字段 | 看什么 |
|---|---|
| `scripts` | 项目怎么启动、怎么打包 |
| `dependencies` | 运行时依赖，如 React/Vue/Next/Nuxt |
| `devDependencies` | 开发工具，如 Vite/TypeScript/插件 |

---

### npm run dev 到底发生什么

如果 `package.json` 写着：

```json
{
  "scripts": {
    "dev": "vite"
  }
}
```

执行：

```bash
npm run dev
```

大致是：

```text
npm 读取 package.json
找到 scripts.dev
执行 vite
Vite 启动开发服务器
浏览器访问 localhost
```

更具体一点：开发服务器就是你本机正在运行的 Vite 进程，`localhost:5173` 这类地址只是访问它的预览网址。开发时它还会处理热更新，所以你改代码后页面能快速刷新。

所以：

```text
npm run dev 背后不是 React/Vue 自动启动。
真正启动谁，要看 scripts.dev 写了什么。
```

---

### node_modules 和 lock 文件

| 文件 / 目录 | 作用 |
|---|---|
| `node_modules` | 依赖安装结果，不提交 Git |
| `package-lock.json` | npm 的精确版本记录 |
| `pnpm-lock.yaml` | pnpm 的精确版本记录 |
| `yarn.lock` | yarn 的精确版本记录 |

可以这样记：

```text
package.json：项目想要什么
lock 文件：这次实际装了什么
node_modules：真的装到哪里
```

---

## 学习建议

你现在只需要掌握这些：

```text
node -v       看 Node 版本
npm -v        看 npm 版本
npm install   安装依赖
npm run dev   启动开发命令
npm run build 打包生产文件
```

读项目时先问：

```text
scripts.dev 是什么？
dependencies 里有什么框架？
devDependencies 里有什么工具？
```

不要一开始研究 `node_modules`，那里面不是给人手动读的。

---

## 小结

Node.js 和 npm 不是前端 UI 技术。

```text
浏览器运行页面
Node.js 运行开发工具
npm/pnpm 管依赖和命令
Vite 等工具负责开发和打包
```

理解这点后，你看到 `npm run dev` 就不会误以为“React/Vue 在启动项目”。
