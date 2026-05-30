# 07. Vite 和构建工具：工程化层

## 问题背景

你会经常看到：

```text
npm create vite@latest
vite.config.ts
npm run dev
localhost:5173
```

也会看到 Vite 创建项目时让你选：

```text
Vanilla
Vue
React
```

这很容易让人误会：

```text
Vite = React？
Vite = Vue？
用了 Vite 就一定用了框架？
```

都不是。

本文属于第四层：工程化层。

| 问题 | 答案 |
|---|---|
| 解决什么 | 开发服务器、代码转换、热更新、生产打包 |
| 依赖什么 | Node.js、npm、JavaScript 模块和项目文件 |
| 上一层关系 | React/Vue 写 UI，Vite 帮项目跑起来 |
| 下一层关系 | Router/Store 等应用组织能力运行在项目之上 |

主线先记这一条：

```text
npm 执行命令
-> Vite 启动开发服务器
-> Vite 转换现代代码
-> 打包时生成 dist
```

---

## 核心解释

### 1. Vite 是什么：让项目跑起来并能打包

先粗暴记：

```text
Vite = 开发服务器 + 代码转换 + 热更新 + 打包
```

开发时：

```bash
npm run dev
```

背后通常是：

```text
npm 读取 package.json
执行 scripts.dev
启动 vite
浏览器打开 localhost
```

生产时：

```bash
npm run build
```

Vite 会生成类似：

```text
dist/
  index.html
  assets/
    index-xxxx.js
    index-xxxx.css
```

---

### 2. Vite 为什么不是 React / Vue：一个管工程，一个管 UI

分工不同。

| 技术 | 层级 | 负责什么 |
|---|---|---|
| React | UI 框架层 | 写组件和界面 |
| Vue | UI 框架层 | 写组件和界面 |
| Vite | 工程化层 | 启动、转换、热更新、打包 |

所以可以有：

```text
Vite + Vanilla TS
Vite + React
Vite + Vue
```

Vite 是项目怎么跑，React/Vue 是 UI 怎么写。

---

### 3. 浏览器不认识哪些现代写法：需要工具转换

现代项目里你可能写：

```text
TypeScript
JSX / TSX
.vue 单文件组件
import / export
CSS、图片、字体资源
```

浏览器最终需要的是普通 HTML、CSS、JavaScript 和静态资源。

Vite 的价值就是帮你从“开发写法”走到“浏览器能运行”。

---

### 4. 开发服务器和打包不是一回事：一个给开发，一个给发布

| 概念 | 发生在什么时候 | 目的 |
|---|---|---|
| 开发服务器 | 本地开发时 | 让你在 `localhost` 预览、热更新 |
| 打包 | 准备发布前 | 生成生产环境文件，如 `dist/` |

```text
npm run dev    -> 开发服务器
npm run build  -> 生产打包
```

开发服务器不是正式后端服务，打包结果也不是你的源码目录。

---

### 5. Vanilla TS 是什么：没有 UI 框架的 TypeScript 项目

Vanilla 的意思是“不使用 React/Vue 这类 UI 框架”。

```text
Vanilla TS = TypeScript + 原生 DOM API + 构建工具
```

典型线索：

```text
index.html 引入 /src/main.ts
src/main.ts
document.querySelector
addEventListener
没有 react/vue/next/nuxt
```

所以有 Vite，不代表一定有 React/Vue。

---

## 技术关系

### 1. Vite 和常见技术的关系

| 项目 | Vite 的角色 |
|---|---|
| Vanilla TS | 运行和打包原生 TS 项目 |
| React | 配合 React 插件处理 JSX / TSX |
| Vue | 配合 Vue 插件处理 `.vue` 文件 |
| Next.js | 通常由 Next 自己做项目入口 |
| Nuxt.js | 可能内部用 Vite，但入口是 Nuxt |

判断项目入口时，看 `package.json`：

| scripts.dev | 优先判断 |
|---|---|
| `vite` | Vite 项目 |
| `next dev` | Next.js 项目 |
| `nuxt dev` / `nuxi dev` | Nuxt.js 项目 |

---

### 2. 从 vite.config.ts 看插件线索

`vite.config.ts` 是 Vite 的配置文件。它不能单独说明“这是 React 项目”或“这是 Vue 项目”，但可以看出 Vite 配了哪些插件。

判断顺序可以这样记：

```text
先看 package.json 的 scripts.dev，判断项目由谁启动。
再看 vite.config.ts 的 plugins，判断 Vite 配合了哪些技术。
```

React + Vite：

```ts
import react from "@vitejs/plugin-react";

export default {
  plugins: [react()],
};
```

Vue + Vite：

```ts
import vue from "@vitejs/plugin-vue";

export default {
  plugins: [vue()],
};
```

Vanilla TS 可能没有框架插件。

```text
有 vite.config.ts：说明有 Vite 相关配置。
有 React/Vue 插件：才进一步说明用了对应框架。
```

---

## 学习建议

初学 Vite 先会这些就够：

```text
看懂 package.json 的 scripts
知道 npm run dev 是启动开发服务器
知道 npm run build 是打包
知道 vite.config.ts 是工程配置
知道 Vite 可以搭 React、Vue、Vanilla TS
```

先别急着研究插件开发。

你下一步做 `02-vite-vanilla-ts` 时，重点感受：

```text
同样是计数器 + 列表，
业务功能没变，
项目运行方式变成了 npm + Vite。
```

### 读完 07 做什么：同一个功能写三版

读完 07，依次做三个版本：

```text
frontend/minimal-frontend-demo/02-vite-vanilla-ts/
frontend/minimal-frontend-demo/03-vue/
frontend/minimal-frontend-demo/04-react/
```

第二版推荐初始化方式：

```bash
cd frontend/minimal-frontend-demo
npm create vite@latest 02-vite-vanilla-ts -- --template vanilla-ts
cd 02-vite-vanilla-ts
npm install
npm run dev
```

功能仍然和 01 一样：

```text
计数器
Todo 输入
添加 Todo
删除 Todo
```

三个版本的主要差异：

| 版本 | 状态放哪里 | 页面怎么写 | DOM 谁来更新 |
|---|---|---|---|
| Vanilla TS | 普通变量和数组 | 用 `querySelector` 找元素，再创建 / 修改 DOM | 你手动更新 DOM |
| Vue | `ref` 等响应式数据 | 用 template 描述数据和页面的关系 | Vue 根据响应式数据更新 DOM |
| React | `useState` 状态 | 用 JSX 描述数据和页面的关系 | React 根据 state 重新渲染 UI |

所以这三个版本不是功能差异，而是页面更新方式差异：

```text
Vanilla TS：你改数据后，手动操作 DOM。
Vue：你改响应式数据，Vue 更新 DOM。
React：你调用 setState，React 更新 DOM。
```

第二版的重点：

| 观察点 | 你要能说清楚 |
|---|---|
| `npm run dev` | npm 读取 `package.json`，启动 Vite |
| `index.html` | 浏览器先加载的 HTML 入口，里面引入 `/src/main.ts` |
| `src/main.ts` | 应用脚本入口从普通 JS 变成 TypeScript |
| `querySelector<HTMLButtonElement>` | TS 在帮助你描述 DOM 元素类型 |
| `const todos: string[] = []` | TS 在帮助你描述数组内容 |
| 页面更新方式 | 数据变了以后，你仍然手动操作 DOM |

第三版和第四版继续用同一个功能，但换成 Vue / React：

```text
frontend/minimal-frontend-demo/03-vue/
frontend/minimal-frontend-demo/04-react/
```

Vue 版重点：

| 观察点 | 你要能说清楚 |
|---|---|
| `npm run dev` | 仍然是 Vite 启动项目 |
| `src/main.ts` | 创建 Vue 应用，并挂载到 `#app` |
| `App.vue` | 页面结构、状态和事件写在单文件组件里 |
| `ref` | 用响应式数据保存 count、输入内容和 todos |
| `v-model` / `@click` / `v-for` | 表单、事件和列表渲染由 Vue 模板表达 |
| 页面更新方式 | 改响应式数据，由 Vue 管理 DOM 更新 |

React 版重点：

| 观察点 | 你要能说清楚 |
|---|---|
| `npm run dev` | 仍然是 Vite 启动项目 |
| `src/main.tsx` | 创建 React 根节点，并渲染 `<App />` |
| `App.tsx` | 页面结构、状态和事件写在组件函数里 |
| `useState` | 用状态保存 count、输入内容和 todos |
| `value` / `onChange` / `onClick` / `map` | 表单、事件和列表渲染由 JSX 表达 |
| 页面更新方式 | 调用 setState，由 React 管理 DOM 更新 |

---

## 小结

Vite 属于第四层：工程化层。

```text
React/Vue 管 UI。
Vite 管开发、转换、热更新和打包。
npm run dev 背后是谁，要看 scripts.dev。
```

这个判断非常重要。
