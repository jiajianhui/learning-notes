# 10. Next.js 和 Nuxt.js：应用框架层

## 问题背景

学 React 会遇到 Next.js，学 Vue 会遇到 Nuxt.js。

初学者常问：

```text
Next.js 是不是 React 的替代品？
Nuxt.js 是不是 Vue 的替代品？
学了 Nuxt 还要不要学 Vue？
```

答案是：它们不是替代关系。

本文属于第六层：应用框架层。

| 问题 | 答案 |
|---|---|
| 解决什么 | 应用结构、文件路由、渲染模式、页面组织 |
| 依赖什么 | React 或 Vue 的组件能力 |
| 上一层关系 | 普通 Router/Store 需要你自己组织，Next/Nuxt 把路由和应用结构框架化 |
| 下一层关系 | 学习方法层帮助你判断什么时候该用它们 |

主线先记这一条：

```text
React / Vue 负责组件
-> Next / Nuxt 负责应用结构
-> 文件路由和渲染模式变成框架约定
```

---

## 核心解释

### 1. Next.js 是什么：React 之上的应用框架

```text
Next.js = React + 应用框架能力
```

它仍然用 React 写组件，但额外关心：

```text
路由约定
页面结构
渲染模式
项目组织
```

常见线索：

```text
package.json 里有 next
scripts 里有 next dev
app/ 或 pages/ 目录
next.config.*
```

---

### 2. Nuxt.js 是什么：Vue 之上的应用框架

```text
Nuxt.js = Vue + 应用框架能力
```

它仍然用 Vue 写组件，但额外提供：

```text
文件路由
页面布局
渲染模式
应用结构约定
```

常见线索：

```text
package.json 里有 nuxt
scripts 里有 nuxt dev 或 nuxi dev
nuxt.config.*
pages/ 目录
app.vue
```

---

### 3. 为什么叫应用框架：不只写组件，还约定应用结构

React / Vue 主要解决 UI。

Next / Nuxt 解决更完整的应用问题。

| 能力 | 普通 React/Vue | Next / Nuxt |
|---|---|---|
| 写组件 | 支持 | 支持 |
| 路由 | 通常自己配 | 目录和文件共同决定路由 |
| 渲染模式 | 多数是 CSR | 支持 CSR / SSR / SSG |
| 项目结构 | 自己组织 | 框架约定更多 |
| 启动命令 | 常见 `vite` | `next dev` / `nuxt dev` |

一句话：

```text
React/Vue 负责组件怎么写。
Next/Nuxt 负责应用怎么组织。
```

注意：Next/Nuxt 会把路由和页面结构框架化，但不等于自动替你解决所有共享状态。复杂共享状态仍然要按项目需要选择 Pinia、Zustand、Context 或其他方案。

---

### 4. 文件路由到底是谁决定 URL

文件路由不是只看文件名，也不是只看文件夹名。

更准确地说：

```text
目录位置 + 特定页面文件
共同决定 URL。
```

Next 的 `app/` 路由常见这样：

```text
app/page.tsx              -> /
app/about/page.tsx        -> /about
app/blog/[slug]/page.tsx  -> /blog/:slug
```

这里要注意：

```text
about 这个文件夹决定路径段。
page.tsx 表示这个路径下真正有一个页面。
layout.tsx 可以包页面，但它自己不是一个 URL 页面。
```

Next 旧一些或仍在使用的 `pages/` 路由常见这样：

```text
pages/index.tsx     -> /
pages/about.tsx     -> /about
```

Nuxt 的 `pages/` 路由常见这样：

```text
pages/index.vue       -> /
pages/about.vue       -> /about
pages/blog/[slug].vue -> /blog/:slug
```

所以先记住一句：

```text
普通 React/Vue：你通常手动写路由表。
Next/Nuxt：框架根据目录和页面文件生成路由。
```

---

### 5. CSR、SSR、SSG 是什么：页面在哪里生成

| 模式 | 通俗理解 |
|---|---|
| CSR | 浏览器加载 JS 后生成主要页面内容 |
| SSR | 每次请求时由服务器生成 HTML |
| SSG | 构建时提前生成静态 HTML |

可以这样记：

```text
CSR：页面主要在浏览器生成
SSR：页面请求时在服务器生成
SSG：页面构建时提前生成
```

本文不展开后端和部署。现在只要知道：Next/Nuxt 比普通 React/Vue 更关心“页面如何生成”。

---

## 技术关系

### 1. Next 和 React

普通 React 项目常见：

```text
src/
  main.tsx
  App.tsx
vite.config.ts
```

Next 项目常见：

```text
app/
  layout.tsx
  page.tsx
next.config.*
```

Next 不是替代 React，而是把 React 放进应用框架里。

---

### 2. Nuxt 和 Vue

普通 Vue 项目常见：

```text
src/
  main.ts
  App.vue
vite.config.ts
```

Nuxt 项目常见：

```text
app.vue
pages/
  index.vue
nuxt.config.*
```

Nuxt 不是替代 Vue，而是把 Vue 放进应用框架里。

---

### 3. 不要和 Vite 混成一类

| 名词 | 层级 | 负责什么 |
|---|---|---|
| Vite | 工程化层 | 普通项目开发和打包 |
| React / Vue | UI 框架层 | 写组件 |
| Next / Nuxt | 应用框架层 | 应用结构和渲染模式 |

现代 Nuxt 通常把 Vite 作为底层构建能力的一部分，但使用者一般以 Nuxt 为入口。

---

## 学习建议

建议先能写普通 React/Vue 项目，再学对应应用框架。

因为 Next/Nuxt 里面仍然要写：

```text
组件
props
状态
事件
列表
表单
```

如果你先学 Nuxt，也要补 Vue。

如果你先学 Next，也要补 React。

你的后端方向是 Node.js + Express，所以不要因为 Next/Nuxt 也能写一些服务端逻辑，就默认用它们替代独立后端。以后看网站需求再定。

### 学过 Nuxt 再学 Next，哪些能迁移

能迁移：

```text
应用框架比 UI 框架更上层
文件路由
页面和布局
CSR / SSR / SSG 的基本概念
按约定组织项目
```

需要重新理解：

```text
React 组件写法
JSX / TSX
Hooks
Next.js 的 app/ 目录约定
```

所以学过 Nuxt 会帮你理解“应用框架”这件事，但不会替你学会 React。

---

## 小结

```text
Next.js 基于 React
Nuxt.js 基于 Vue
React/Vue 管 UI
Next/Nuxt 管应用结构和渲染模式
```

它们不是和 React/Vue、Vite 平级的同类选项。
