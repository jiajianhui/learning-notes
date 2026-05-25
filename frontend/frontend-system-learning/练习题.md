# 练习题：用项目线索建立前端技术地图

## 问题背景

看懂概念还不够，真正有用的是能拿到一个项目后判断它用了什么技术。下面的练习都围绕真实项目线索设计，重点训练你把文件、依赖、入口代码放回七层体系。

本文属于七层体系中的第七层：学习方法层。

## 核心解释

做题时建议固定使用这套判断顺序：

```text
1. 看 package.json 的 scripts
2. 看 dependencies / devDependencies
3. 看入口文件 main.ts / main.tsx
4. 看 App.vue / App.tsx 等根组件
5. 看 vite.config.ts / next.config.ts / nuxt.config.ts
6. 看 app/ 或 pages/ 目录
7. 最后放回七层体系
```

## 练习一：给一个 package.json，判断项目类型

### 题目

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

问题：

1. 这是 Vite 项目、Next 项目还是 Nuxt 项目？
2. 它用了 React 还是 Vue？
3. TypeScript 处在哪一层？

### 参考答案

1. 这是 Vite 项目，因为 scripts 里是 `vite` 和 `vite build`。
2. 它用了 React，因为依赖里有 `react`、`react-dom`，并且有 `@vitejs/plugin-react`。
3. TypeScript 属于第二层：语言增强层。它增强 JS，不是 UI 框架。

对应分层：

```text
第二层：TypeScript
第三层：React
第四层：Vite
```

## 练习二：给一个目录结构，判断项目类型

### 题目 A

```text
src/
  main.ts
  App.vue
vite.config.ts
package.json
```

`main.ts`：

```ts
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
```

判断项目类型。

### 参考答案 A

这是 Vite + Vue 项目。

理由：

- `App.vue` 是 Vue 单文件组件。
- `createApp` 来自 Vue。
- `vite.config.ts` 说明有 Vite 工程化配置。
- `main.ts` 是 Vue 项目的常见入口。

### 题目 B

```text
app/
  layout.tsx
  page.tsx
next.config.ts
package.json
```

`package.json`：

```json
{
  "scripts": {
    "dev": "next dev"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

判断项目类型。

### 参考答案 B

这是 Next.js 项目。

理由：

- scripts 是 `next dev`。
- 依赖有 `next`。
- 有 `app/` 和 `next.config.ts`。
- 虽然也有 React，但这是基于 React 的应用框架项目，不是普通 Vite React 项目。

### 题目 C

```text
src/
  main.ts
  style.css
index.html
vite.config.ts
package.json
```

`main.ts`：

```ts
const button = document.querySelector<HTMLButtonElement>("#save");

button?.addEventListener("click", () => {
  console.log("save");
});
```

判断项目类型。

### 参考答案 C

这是 Vite + Vanilla TS 项目。

理由：

- 有 `main.ts` 和原生 DOM API。
- 没有 `react`、`vue`、`next`、`nuxt` 线索。
- 有 `vite.config.ts`，说明可能使用 Vite 作为工程工具。

## 练习三：解释 Vite、React、Vue、Next、Nuxt 的关系

### 题目

请用七层体系解释这五个技术为什么不是同一类东西：

```text
Vite
React
Vue
Next.js
Nuxt.js
```

### 参考答案

```text
React / Vue：第三层 UI 框架层，用组件写界面。
Vite：第四层工程化层，负责开发服务器、热更新、打包。
Next.js：第六层应用框架层，基于 React。
Nuxt.js：第六层应用框架层，基于 Vue。
```

关系图：

```text
React / Vue 写 UI
Vite 帮普通项目开发和打包
Next.js 在 React 上提供完整应用框架
Nuxt.js 在 Vue 上提供完整应用框架
```

所以 `Vite + React` 和 `Next.js` 不是同一类项目入口；前者是普通 React 工程，后者是 React 应用框架。

## 练习四：画出现代前端七层技术分层图

### 题目

请补全七层图：

```text
第七层：
第六层：
第五层：
第四层：
第三层：
第二层：
第一层：
```

### 参考答案

```text
第七层：学习方法层
如何看项目 / 如何判断技术栈 / 如何规划学习路线

第六层：应用框架层
Next.js / Nuxt.js

第五层：应用组织层
路由 / 状态管理 / 组件通信

第四层：工程化层
Vite / 构建工具 / 开发服务器 / 打包

第三层：UI 框架层
React / Vue

第二层：语言增强层
TypeScript

第一层：基础层
HTML / CSS / JavaScript / DOM
```

## 练习五：为不同学习目标选择学习路线

### 题目

为下面三个目标选择学习路线：

1. 做普通网页。
2. 做后台管理系统。
3. 做官网 / 作品集。

### 参考答案

做普通网页：

```text
HTML -> CSS -> JavaScript DOM -> 少量 TypeScript -> 必要时 Vite
```

原因：普通网页不一定需要 React/Vue，重点是结构、样式和基础交互。

做后台管理系统：

```text
HTML/CSS/JS -> TypeScript -> React 或 Vue -> Vite -> 路由 -> 状态管理
```

原因：后台管理系统通常页面多、表单多、组件多，需要 UI 框架、路由和状态管理。

做官网 / 作品集：

```text
HTML/CSS/JS -> React 或 Vue -> 理解 CSR/SSR/SSG -> Next.js 或 Nuxt.js
```

原因：官网和作品集常关注页面组织、首屏体验和内容展示，应用框架可能更适合。

## 练习六：判断一个项目为什么不是 React/Vue，而是 Vanilla TS

### 题目

项目文件：

```text
src/
  main.ts
  theme.ts
index.html
package.json
vite.config.ts
```

`package.json`：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

`main.ts`：

```ts
const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.innerHTML = "<button id='toggle'>切换主题</button>";
}

document.querySelector("#toggle")?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
```

请说明它为什么不是 React/Vue 项目。

### 参考答案

它不是 React/Vue 项目，因为：

- `package.json` 没有 `react`、`react-dom`、`vue`。
- 没有 `App.tsx`、`main.tsx`、`App.vue` 这类框架组件线索。
- 入口文件使用 `document.querySelector` 和 `addEventListener`，这是原生 DOM API。
- 虽然有 `vite.config.ts`，但 Vite 是工程化工具，不代表一定用了 React/Vue。

它更准确的判断是：

```text
Vite + TypeScript + 原生 DOM
= Vite + Vanilla TS 项目
```

对应分层：

```text
第一层：HTML / CSS / DOM
第二层：TypeScript
第四层：Vite
没有第三层 React/Vue
```

## 技术关系

这些练习共同训练的是同一个能力：

```text
看到文件线索
  ↓
判断技术栈
  ↓
放回七层体系
  ↓
理解它解决的问题
```

不要只记“看到 `.tsx` 就是 React”。更稳妥的方式是结合：

- 依赖。
- scripts。
- 入口文件。
- 配置文件。
- 目录结构。
- 代码写法。

## 学习建议

你可以拿任何一个前端项目重复做这个练习：

```text
1. 它的启动命令是什么？
2. 它用了哪个 UI 框架？
3. 它用了哪个工程化工具？
4. 它有没有应用框架？
5. 它有没有路由和状态管理？
6. 它对应七层里的哪些层？
```

真正读懂一个项目，不是知道它有多少依赖，而是知道每个依赖站在哪一层。

## 小结

练习的目的不是考记忆，而是建立判断方法。

最重要的结论：

```text
React/Vue 看 UI 框架线索
Vite 看工程化线索
Next/Nuxt 看应用框架线索
Vanilla TS 看原生 DOM 和无框架依赖
```

把线索放回七层体系，你就能从“看见一堆文件”变成“看懂项目结构”。

