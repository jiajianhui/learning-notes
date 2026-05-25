# 07. Next.js 和 Nuxt.js：应用框架层

## 问题背景

学 React 时会遇到 Next.js，学 Vue 时会遇到 Nuxt.js。很多初学者会问：

```text
Next.js 是不是 React 的替代品？
Nuxt.js 是不是 Vue 的替代品？
学了 Nuxt 还要不要学 Vue？
学了 Next 还要不要学 React？
```

本文属于七层体系中的第六层：应用框架层。

```text
上一层：路由 / 状态管理 / 组件通信组织普通前端应用
当前层：Next.js / Nuxt.js 提供更完整的应用框架
下一层：学习方法层帮助你判断何时使用它们
```

## 核心解释

### Next.js 是什么

Next.js 是基于 React 的应用框架。

可以先这样理解：

```text
Next.js = React + 路由约定 + 渲染模式 + 应用结构 + 工程能力
```

它仍然用 React 写组件，但项目组织方式比普通 React 项目更完整。

常见线索：

```text
package.json 里有 next
scripts 里有 next dev
有 app/ 或 pages/
有 next.config.js 或 next.config.ts
```

### Nuxt.js 是什么

Nuxt.js 是基于 Vue 的应用框架。

可以先这样理解：

```text
Nuxt.js = Vue + 路由约定 + 渲染模式 + 应用结构 + 工程能力
```

它仍然用 Vue 写组件，但项目结构和路由由 Nuxt 提供更多约定。

常见线索：

```text
package.json 里有 nuxt
scripts 里有 nuxt dev 或 nuxi dev
有 nuxt.config.ts
有 pages/ 或 app.vue
```

## 技术关系

### Next.js 和 React 的关系

```text
React：负责 UI 组件怎么写
Next.js：基于 React，规定应用怎么组织、路由怎么生成、页面怎么渲染
```

普通 React 项目可能是：

```text
src/
  main.tsx
  App.tsx
  router.tsx
vite.config.ts
```

Next.js 项目可能是：

```text
app/
  layout.tsx
  page.tsx
  users/
    page.tsx
next.config.ts
package.json
```

Next.js 不是替代 React，而是把 React 放进一个应用级框架里。

### Nuxt.js 和 Vue 的关系

```text
Vue：负责 UI 组件怎么写
Nuxt.js：基于 Vue，规定应用怎么组织、路由怎么生成、页面怎么渲染
```

普通 Vue 项目可能是：

```text
src/
  main.ts
  App.vue
  router.ts
vite.config.ts
```

Nuxt 项目可能是：

```text
app.vue
pages/
  index.vue
  users.vue
nuxt.config.ts
package.json
```

Nuxt 不是替代 Vue，而是在 Vue 之上提供应用框架能力。

### 为什么它们叫应用框架

React 和 Vue 主要解决 UI。Next.js 和 Nuxt.js 解决的是更完整的应用问题：

| 能力 | 普通 React/Vue | Next.js / Nuxt.js |
|---|---|---|
| 写组件 | 支持 | 支持 |
| 路由 | 通常自己配 Router | 通常有文件约定式路由 |
| 渲染模式 | 多数是 CSR | 支持 CSR / SSR / SSG 等 |
| 项目结构 | 自己组织 | 框架约定更多 |
| 页面级能力 | 自己搭 | 框架内置更多 |
| 构建入口 | Vite 等工具 | 框架命令，如 `next dev`、`nuxt dev` |

### CSR、SSR、SSG 分别是什么

| 渲染模式 | 全称 | 通俗理解 |
|---|---|---|
| CSR | Client-Side Rendering | 浏览器加载 JS 后在客户端渲染页面 |
| SSR | Server-Side Rendering | 请求时在服务器生成 HTML，再发给浏览器 |
| SSG | Static Site Generation | 构建时提前生成静态 HTML |

CSR 简化流程：

```text
浏览器请求页面
  ↓
拿到一个空壳 HTML + JS
  ↓
JS 在浏览器运行
  ↓
生成页面内容
```

SSR 简化流程：

```text
浏览器请求页面
  ↓
服务器生成 HTML
  ↓
浏览器先看到内容
  ↓
JS 接管交互
```

SSG 简化流程：

```text
构建时生成 HTML
  ↓
用户请求时直接返回静态文件
```

本文不展开后端和部署，只需要先记住：Next/Nuxt 比普通 React/Vue 更关心“页面如何被生成”。

### Next/Nuxt 相比普通 React/Vue 多了什么

```text
普通 React/Vue：
  重点是组件和前端应用

Next/Nuxt：
  组件能力 + 路由约定 + 渲染模式 + 应用结构
```

这就是它们不在同一层的原因：

```text
React / Vue：第三层 UI 框架层
Next / Nuxt：第六层应用框架层
```

## 学习建议

### 什么时候学 Next.js 或 Nuxt.js

建议先能写普通 React/Vue 项目，再学对应应用框架。

如果你先学 Next.js，也要补 React；如果你先学 Nuxt.js，也要补 Vue。因为组件、props、状态、事件这些基础仍然来自底层 UI 框架。

### 学过 Nuxt 后学 Next，哪些概念可以迁移

可以迁移：

- 应用框架比 UI 框架更上层。
- 文件约定式路由。
- 页面和布局的组织方式。
- CSR / SSR / SSG 的基本概念。
- 组件化和数据驱动思想。

需要重新理解：

- React 组件写法。
- JSX / TSX。
- React hooks。
- Next.js 的目录约定和渲染细节。

### 不要把 Next/Nuxt 和 Vite 混成一类

Vite 是工程化层的构建工具，Next/Nuxt 是应用框架层。

```text
Vite：让普通前端项目开发和打包
Next/Nuxt：规定应用结构和渲染模式
```

Nuxt 内部可能使用 Vite 的能力，但对使用者来说，项目入口通常是 Nuxt。

## 小结

Next.js 和 Nuxt.js 位于第六层：应用框架层。

```text
Next.js 基于 React
Nuxt.js 基于 Vue
React/Vue 负责 UI
Next/Nuxt 负责更完整的应用组织和渲染模式
```

它们不是和 React/Vue、Vite 平级的同类选项，而是更上层的应用解决方案。

