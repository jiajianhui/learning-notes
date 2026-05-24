# 10 常见误区：用七层体系统一排疑

## 问题背景

你遇到的大多数困惑，本质是“把不同层技术当同一类”。

## 用七层体系回答常见问题

### Vite 是不是 React/Vue？
不是。Vite 在第四层工程化；React/Vue 在第三层 UI。

### React 和 Next.js 什么关系？
React 是 UI 框架；Next.js 是基于 React 的应用框架（第六层）。

### Vue 和 Nuxt.js 什么关系？
Vue 是 UI 框架；Nuxt.js 是基于 Vue 的应用框架。

### TypeScript 是不是新语言？
是 JavaScript 的类型增强（第二层），不是替代第一层基础。

### 会 React 还要学原生 JS 吗？
要。React 最终运行在 JS 与 DOM 基础之上。

### 会 Vue 学 React 难吗？
中等。组件化思想可迁移，语法与生态需重建。

### 为什么有些项目没有 React/Vue？
它可能是 Vanilla JS/TS，直接使用第一层 + 第二层能力。

### 为什么有 `vite.config.ts` 但不是 React/Vue？
因为 Vite 是工程化工具，可服务 Vanilla TS。

### 为什么有些项目只有 HTML/CSS/main.ts？
项目规模小，第一层 + 第二层 + 第四层已足够。

### 框架、库、工具、应用框架区别？
- UI 框架：组织界面（React/Vue）
- 工具：开发构建（Vite）
- 应用框架：整合应用能力（Next/Nuxt）

### Vite、React、Vue、Next、Nuxt 如何分层？
- 第三层：React/Vue
- 第四层：Vite
- 第六层：Next/Nuxt

### 初学者先学基础还是框架？
先基础后框架。先建因果理解，再追开发效率。

## 小结

排疑核心技巧：每个名词先“归层”，再谈关系。层级一清楚，概念自然不打架。
