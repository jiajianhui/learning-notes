# 07 Next.js 与 Nuxt.js：应用框架层

> 所属层级：**第六层：应用框架层**。

## 问题背景

为什么有了 React/Vue 还要 Next/Nuxt？

## 核心解释

### Next.js 是什么
基于 React 的应用框架，提供路由约定、渲染策略（CSR/SSR/SSG）等应用级能力。

### Nuxt.js 是什么
基于 Vue 的应用框架，提供与 Next 类似的应用级组织能力。

### 为什么叫“应用框架”
因为它们不只是 UI 渲染，还规定了：
- 目录与路由约定
- 渲染模式选择
- 应用级开发体验

## 普通 React/Vue vs Next/Nuxt

| 维度 | React/Vue 项目 | Next/Nuxt 项目 |
|---|---|---|
| 定位 | UI 层为主 | 应用层整合 |
| 路由 | 通常手动引入 | 常有文件路由约定 |
| 渲染模式 | 多为 CSR | 支持 CSR/SSR/SSG |

### CSR / SSR / SSG
- CSR：浏览器端渲染
- SSR：服务器生成首屏 HTML
- SSG：构建时预生成静态页面

## 迁移视角：Nuxt -> Next

可迁移：路由、页面组织、SSR/SSG 思想。
需重建：React 组件与生态约定。

## 小结

Next/Nuxt 位于第六层，建立在 React/Vue 之上。它们与 Vite、React/Vue 不是同一层级概念。
