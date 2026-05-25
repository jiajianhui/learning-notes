# 05. React 和 Vue：UI 框架层

## 问题背景

很多人第一次接触现代前端，就是从 React 或 Vue 开始的。于是很容易以为“前端 = React/Vue”。但从七层体系看，React 和 Vue 只是第三层：UI 框架层。

它们确实很重要，因为真实项目中的页面和交互通常都通过它们组织。但它们不是语言、不是构建工具，也不是完整应用框架。

本文属于七层体系中的第三层：UI 框架层。

```text
上一层：TypeScript 可以增强 React/Vue 开发体验
当前层：React / Vue 负责构建 UI 和组件
下一层：Vite 等工具让 React/Vue 项目能开发和打包
再上一层：路由、状态管理、Next/Nuxt 会继续组织应用
```

## 核心解释

### 为什么会出现 React / Vue

如果只用原生 DOM 写复杂页面，常见问题是：

- 页面结构越来越碎。
- 数据变化后要手动找 DOM、改 DOM。
- 同一段 UI 逻辑难复用。
- 状态分散在很多变量和 DOM 上。
- 项目变大后很难维护。

React 和 Vue 的核心目标都是：让你用组件和数据来描述界面，而不是到处手动操作 DOM。

### 组件化是什么

组件就是把页面拆成可复用的小模块。

```text
App
├── Header
├── Sidebar
├── UserList
│   └── UserCard
└── Footer
```

每个组件通常包含：

- 自己的结构。
- 自己的样式。
- 自己的状态和交互。
- 对外暴露的 props。

React 示例：

```tsx
type UserCardProps = {
  name: string;
};

function UserCard({ name }: UserCardProps) {
  return <div className="user-card">{name}</div>;
}
```

Vue 示例：

```vue
<script setup lang="ts">
defineProps<{
  name: string;
}>();
</script>

<template>
  <div class="user-card">{{ name }}</div>
</template>
```

### 声明式 UI 是什么

声明式 UI 的意思是：你描述“在某个数据状态下，界面应该是什么样”，而不是一步步命令浏览器怎么改 DOM。

命令式思路：

```js
if (isLoggedIn) {
  document.querySelector("#login").style.display = "none";
  document.querySelector("#profile").style.display = "block";
}
```

声明式思路：

```tsx
function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
  return isLoggedIn ? <Profile /> : <LoginButton />;
}
```

Vue 里也是类似：

```vue
<template>
  <Profile v-if="isLoggedIn" />
  <LoginButton v-else />
</template>
```

### 数据驱动视图是什么

数据变化，界面自动重新表达这个数据。

```text
state 改变 -> 框架重新计算 UI -> 更新 DOM
```

你不需要手动说“把第几个 DOM 节点文字改成什么”，而是更新数据，让框架处理界面更新。

## 技术关系

### React 和 Vue 的共同点

| 共同点 | 说明 |
|---|---|
| 都是 UI 框架 | 都用来构建界面 |
| 都支持组件化 | 页面拆成组件 |
| 都强调数据驱动视图 | 数据变化后更新界面 |
| 都能配 TypeScript | 提升大型项目可维护性 |
| 都常和 Vite 搭配 | Vite 负责开发服务器和构建 |
| 都需要路由和状态管理生态 | 复杂应用会引入相关工具 |

### React 和 Vue 的差异

| 维度 | React | Vue |
|---|---|---|
| 主要写法 | JSX / TSX | 单文件组件 `.vue` |
| 模板风格 | 更接近 JavaScript 表达式 | 更接近 HTML 模板 |
| 状态思路 | `useState`、hooks | `ref`、`reactive`、组合式 API |
| 官方完整度 | 更偏核心库 + 生态选择 | 官方生态更集中，如 Vue Router、Pinia |
| 上手感受 | JS 思维更强 | 模板语义更直观 |

React 文件常见：

```text
src/
  main.tsx
  App.tsx
```

Vue 文件常见：

```text
src/
  main.ts
  App.vue
```

### React / Vue 和其他层的关系

```text
基础层：HTML / CSS / JS / DOM
  ↓
语言增强层：TypeScript
  ↓
UI 框架层：React / Vue
  ↓
工程化层：Vite 帮它们运行、热更新、打包
  ↓
应用组织层：Router / Store 组织页面和状态
  ↓
应用框架层：Next.js / Nuxt.js 提供更完整应用方案
```

React 和 Vue 位于 UI 框架层，不负责所有事情。

## 学习建议

### 初学者如何选择 React 或 Vue

可以按目标选择：

| 目标 | 倾向选择 |
|---|---|
| 想进入 React 生态、Next.js、很多海外项目 | React |
| 想上手快、模板直观、学习 Nuxt.js | Vue |
| 做后台管理系统，团队已有技术栈 | 跟团队 |
| 主要目标是理解现代前端 | 任选一个学深，再迁移另一个 |

不要把选择框架当成信仰问题。它们解决的是同一类问题，只是表达方式不同。

### 会 Vue 再学 React，哪些可以迁移

可以迁移：

- 组件化思想。
- props 传参。
- 状态驱动视图。
- 事件处理。
- 路由、状态管理这类应用组织意识。
- TypeScript 的基本使用。

需要重新理解：

- JSX / TSX 写法。
- React hooks。
- React 的状态更新和渲染机制。
- 受控组件。
- React 生态里更分散的工具选择。

### 学框架时最该抓住什么

不要一开始沉迷 API 列表。先抓住这几个核心问题：

- 一个页面如何拆组件？
- 父组件如何传数据给子组件？
- 子组件如何通知父组件？
- 数据变化时界面如何更新？
- 什么时候需要全局状态？
- 路由如何让不同页面切换？

## 小结

React 和 Vue 属于第三层：UI 框架层。

它们解决的是“如何用组件和数据构建界面”的问题。它们依赖 HTML/CSS/JS，也常和 TypeScript、Vite、路由、状态管理一起出现。

最重要的认知是：

```text
React/Vue 不是前端全部，它们是现代前端体系中负责 UI 的核心层。
```
