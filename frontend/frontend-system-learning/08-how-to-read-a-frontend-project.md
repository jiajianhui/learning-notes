# 08. 如何阅读一个前端项目并判断技术栈

## 问题背景

你拿到一个前端项目，最常见的问题不是“这个 API 怎么用”，而是：

```text
这到底是什么项目？
用了 React 还是 Vue？
是不是 Vite？
是不是 Next.js 或 Nuxt.js？
为什么有 main.ts 但没有 App.vue？
为什么有 vite.config.ts 却不是 React/Vue？
```

本文属于七层体系中的第七层：学习方法层。

```text
前六层告诉你技术分别是什么
第七层教你如何在真实项目里识别它们
```

## 核心解释

判断技术栈时，不要只看一个文件。更可靠的方法是按顺序看：

1. `package.json`
2. `scripts`
3. `dependencies` / `devDependencies`
4. 入口文件，如 `main.ts`、`main.tsx`
5. 根组件，如 `App.vue`、`App.tsx`
6. 配置文件，如 `vite.config.ts`、`next.config.ts`、`nuxt.config.ts`
7. 目录约定，如 `app/`、`pages/`

## 技术关系

### 如何看 package.json

`package.json` 是判断项目技术栈的第一入口。

重点看三块：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

判断：

- `vite` 和 `vite build` 表示这是 Vite 项目。
- `react`、`react-dom` 表示用 React。
- `@vitejs/plugin-react` 表示 Vite 配了 React 插件。
- `typescript` 表示使用 TypeScript。

### dependencies 和 devDependencies 怎么看

| 字段 | 通俗理解 | 常见内容 |
|---|---|---|
| dependencies | 应用运行时需要的依赖 | `react`、`vue`、`next`、`nuxt` |
| devDependencies | 开发和构建时需要的依赖 | `vite`、`typescript`、插件、格式化工具 |

不要绝对化这个区别，不同项目会有不同放法。但用于判断技术栈时已经很有帮助。

### 如何看 scripts

`scripts` 往往直接暴露项目入口。

| scripts 线索 | 可能项目 |
|---|---|
| `"dev": "vite"` | Vite 项目 |
| `"dev": "next dev"` | Next.js 项目 |
| `"dev": "nuxt dev"` | Nuxt.js 项目 |
| `"dev": "nuxi dev"` | Nuxt.js 项目 |

如果 scripts 里是：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}
```

优先判断为 Next.js 项目，而不是普通 Vite React 项目。

### 如何从入口文件判断项目类型

React 项目常见：

```text
src/
  main.tsx
  App.tsx
```

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
```

Vue 项目常见：

```text
src/
  main.ts
  App.vue
```

```ts
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
```

Vanilla TS 项目常见：

```text
src/
  main.ts
```

```ts
const app = document.querySelector<HTMLDivElement>("#app");

app?.addEventListener("click", () => {
  console.log("原生 DOM 事件");
});
```

### 如何从 vite.config.ts 判断 React/Vue

React + Vite：

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

Vue + Vite：

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
});
```

Vanilla TS + Vite 可能没有框架插件：

```ts
import { defineConfig } from "vite";

export default defineConfig({});
```

所以：有 `vite.config.ts` 只能说明项目可能用了 Vite，不能说明一定用了 React 或 Vue。

## 常见项目判断方法

### React 项目线索

```text
react
react-dom
main.tsx
App.tsx
@vitejs/plugin-react
ReactDOM.createRoot
```

如果同时看到：

```json
{
  "dependencies": {
    "react": "...",
    "react-dom": "..."
  },
  "devDependencies": {
    "vite": "...",
    "@vitejs/plugin-react": "..."
  }
}
```

大概率是 Vite + React 项目。

### Vue 项目线索

```text
vue
App.vue
main.ts
@vitejs/plugin-vue
createApp
```

如果入口是：

```ts
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
```

大概率是 Vue 项目。

### Next.js 项目线索

```text
next
next dev
app/ 或 pages/
next.config.js / next.config.ts
```

示例：

```text
app/
  layout.tsx
  page.tsx
package.json
next.config.ts
```

如果 scripts 是 `next dev`，优先判断为 Next.js。

### Nuxt.js 项目线索

```text
nuxt
nuxi
nuxt.config.ts
pages/
app.vue
```

示例：

```text
pages/
  index.vue
app.vue
nuxt.config.ts
package.json
```

如果 scripts 是 `nuxt dev` 或 `nuxi dev`，优先判断为 Nuxt.js。

### Vanilla TS 项目线索

```text
没有 react / vue / next / nuxt
src/main.ts
document.querySelector
addEventListener
原生 DOM API
Vite 或类似构建工具
```

示例：

```json
{
  "scripts": {
    "dev": "vite"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

这不是 React，也不是 Vue。它可能是 Vite + Vanilla TS。

## 示例判断

### 示例一

```json
{
  "scripts": {
    "dev": "vite"
  },
  "dependencies": {
    "vue": "^3.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

判断：Vite + Vue。

原因：`dev` 是 `vite`，依赖有 `vue`，开发依赖有 `@vitejs/plugin-vue`。

### 示例二

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

判断：Next.js 项目。

原因：入口命令是 `next dev`，依赖有 `next`。它基于 React，但不是普通 Vite React 项目。

### 示例三

```text
src/
  main.ts
  counter.ts
index.html
vite.config.ts
```

```ts
document.querySelector("#app")!.innerHTML = "<button>点击</button>";
```

判断：Vite + Vanilla TS。

原因：有 Vite 配置和 TS 入口，但没有 React/Vue 依赖，也没有 `.tsx` 或 `.vue` 组件线索。

## 学习建议

读项目时建议按这个顺序做笔记：

```text
1. 项目入口命令是什么？
2. 依赖里有哪些核心框架？
3. 是否有构建工具配置？
4. 入口文件挂载方式是什么？
5. 页面和组件放在哪里？
6. 是否有路由和状态管理？
7. 它对应七层体系中的哪些层？
```

不要只凭一个文件下结论。比如：

- 有 `main.ts` 不一定是 Vue，也可能是 Vanilla TS。
- 有 `vite.config.ts` 不一定有 React/Vue。
- 有 `react` 不一定是普通 React，也可能是 Next.js。
- 有 `pages/` 不一定是 Nuxt，也可能是 Next.js 老项目或普通目录命名，要结合依赖和 scripts。

## 小结

判断前端技术栈的核心方法是“多线索交叉验证”。

最实用的入口：

```text
package.json 看依赖和 scripts
入口文件看挂载方式
配置文件看工程工具
目录结构看应用框架约定
源码写法看 React/Vue/原生 DOM
```

当你能把这些线索放回七层体系里，读陌生前端项目会轻松很多。

