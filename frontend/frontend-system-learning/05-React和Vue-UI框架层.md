# 05. React 和 Vue：UI 框架层

## 问题背景

很多人第一次接触现代前端，就是 React 或 Vue。

于是很容易误会：

```text
前端 = React/Vue
React/Vue = 整个项目
```

都不对。

React 和 Vue 属于第三层：UI 框架层。

```text
上一层：TypeScript 可以增强写法
当前层：React / Vue 负责 UI 和组件
下一层：Vite、Router、Store、Next/Nuxt 会继续加入
```

---

## 核心解释

### 1. 它们为什么出现

原生 DOM 写复杂页面时，你会一直做这件事：

```text
数据变了
找到 DOM
手动修改 DOM
再处理事件
再维护列表
```

React / Vue 想解决的就是这个麻烦：

```text
用组件组织页面。
用数据描述界面。
数据变了，框架更新页面。
```

---

### 2. 组件化是什么

组件就是把页面拆成小块。

```text
App
├── Header
├── TodoList
│   └── TodoItem
└── Footer
```

每个组件通常关心：

```text
结构
样式
状态
事件
props
```

组件化的价值不是“文件变多”，而是让页面变成可理解、可复用、可维护的小单元。

---

### 3. 声明式 UI 是什么

原生 DOM 更像命令式：

```js
button.style.display = isVisible ? "block" : "none";
```

React / Vue 更像声明式：

```text
当数据是这个状态时，界面应该长这样。
```

React：

```tsx
function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
  return isLoggedIn ? <Profile /> : <LoginButton />;
}
```

Vue：

```vue
<template>
  <Profile v-if="isLoggedIn" />
  <LoginButton v-else />
</template>
```

---

### 4. React 和 Vue 的共同点

| 共同点 | 说明 |
|---|---|
| 都是 UI 框架 | 负责构建界面 |
| 都支持组件化 | 页面拆成组件 |
| 都是数据驱动视图 | 数据变化后更新页面 |
| 都能配 TypeScript | 提升维护性 |
| 都常和 Vite 搭配 | Vite 管工程化 |

最重要的一句：

```text
React/Vue 负责 UI，不负责启动项目，也不等于路由或状态管理。
```

---

### 5. React 和 Vue 的差异

| 维度 | React | Vue |
|---|---|---|
| UI 表达 | JSX / TSX | `.vue` template |
| 感觉 | 用 JavaScript 写 UI | 写增强版 HTML |
| 状态 | `useState`、Hooks | `ref`、`reactive` |
| 生态 | 选择更多、更分散 | 官方生态更集中 |

同一个列表：

React：

```tsx
<ul>
  {todos.map((todo) => (
    <li key={todo.id}>{todo.text}</li>
  ))}
</ul>
```

Vue：

```vue
<ul>
  <li v-for="todo in todos" :key="todo.id">
    {{ todo.text }}
  </li>
</ul>
```

---

## 技术关系

React / Vue 在七层里是第三层：

```text
基础层：HTML / CSS / JS / DOM
语言增强层：TypeScript
UI 框架层：React / Vue
工程化层：Vite
应用组织层：Router / Store
应用框架层：Next / Nuxt
```

看到 React/Vue，只能说明项目用了 UI 框架，不能自动推出：

```text
一定用了 Vite
一定用了路由
一定用了状态管理
一定是 Next/Nuxt
```

这些都要继续看 `package.json`、入口文件和目录结构。

---

## 学习建议

初学者先选一个学深，不要同时纠结两个。

| 目标 | 倾向 |
|---|---|
| 想进 React / Next 生态 | React |
| 想上手更模板化、以后看 Nuxt | Vue |
| 团队已有技术栈 | 跟团队 |
| 只是建立现代前端理解 | 任选一个，再迁移另一个 |

学框架时先抓这些：

```text
组件怎么拆
props 怎么传
状态怎么变
事件怎么处理
列表和表单怎么写
数据变了页面为什么会更新
```

不要一开始沉迷 API 数量。

---

### 会 Vue 再学 React，哪些能迁移

能迁移：

```text
组件化
props
状态驱动视图
事件处理
列表渲染
路由和状态管理意识
```

需要重新理解：

```text
JSX / TSX
Hooks
React 状态更新方式
受控组件
React 生态里更分散的工具选择
```

所以不是从零开始，但也不是换个语法就结束。

---

## 小结

React 和 Vue 解决的是 UI 组织问题。

```text
原生 DOM：你手动同步数据和页面。
React/Vue：你用数据描述页面，框架负责更新。
```

它们很重要，但不是现代前端的全部。
