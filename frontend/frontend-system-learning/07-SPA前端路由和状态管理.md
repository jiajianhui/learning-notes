# 07. SPA、前端路由和状态管理：应用组织层

## 问题背景

学完 React 或 Vue 后，你很快会遇到这些词：

```text
SPA
前端路由
React Router
Vue Router
Redux
Zustand
Pinia
props
state
store
```

这些不是和 React/Vue 平级的 UI 框架，也不是 Vite 那样的构建工具。它们主要解决“应用如何组织”的问题。

本文属于七层体系中的第五层：应用组织层。

```text
上一层：Vite 等工程化工具让项目能运行和构建
当前层：路由 / 状态管理 / 组件通信组织复杂应用
下一层：Next.js / Nuxt.js 会把很多应用组织能力内置或约定化
```

## 核心解释

### SPA 是什么

SPA 是 Single Page Application，单页应用。

这里的“单页”不是说只有一个页面内容，而是说浏览器通常只加载一个入口 HTML，之后页面内容主要由 JavaScript 在前端切换。

```text
用户打开 index.html
  ↓
加载 JS 应用
  ↓
点击导航
  ↓
前端根据 URL 显示不同组件
  ↓
不一定整页刷新
```

### 传统多页面和 SPA 的区别

| 维度 | 传统多页面 | SPA |
|---|---|---|
| 页面跳转 | 通常请求新的 HTML | 前端切换组件 |
| 首次加载 | 每页独立加载 | 先加载应用入口 |
| 交互体验 | 更接近文档站 | 更接近应用 |
| 路由控制 | 主要由服务器决定 | 前端路由负责 |
| 常见技术 | 多个 HTML 页面 | React/Vue + Router |

传统多页面：

```text
/about.html  -> 服务器返回 about.html
/contact.html -> 服务器返回 contact.html
```

SPA：

```text
/about -> 前端路由显示 About 组件
/contact -> 前端路由显示 Contact 组件
```

### 前端路由是什么

前端路由负责根据 URL 决定显示哪个页面组件。

React Router 大概像这样：

```tsx
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/users", element: <Users /> },
]);
```

Vue Router 大概像这样：

```ts
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/users", component: Users },
  ],
});
```

路由不是负责“画按钮”的，它负责“这个地址对应哪个页面”。

### 为什么 React / Vue 项目通常需要路由

如果项目只有一个页面，比如一个计数器，不需要路由。

但如果有这些页面：

```text
/login
/dashboard
/users
/settings
```

就需要路由来组织页面切换。否则你只能用大量条件判断手动控制显示哪个组件，项目会很乱。

### 状态管理是什么

状态就是影响界面的数据。

例如：

- 当前登录用户。
- 购物车数量。
- 当前主题。
- 列表筛选条件。
- 弹窗是否打开。
- 表单输入值。

状态管理就是决定这些数据放在哪里、怎么改、谁能读。

## 技术关系

### props、state、store 的区别

| 名词 | 适合放什么 | 作用范围 |
|---|---|---|
| props | 父组件传给子组件的数据 | 父子组件之间 |
| state | 当前组件自己的内部状态 | 单个组件或局部组件树 |
| store | 多个页面或组件共享的状态 | 全局或模块级 |

关系图：

```text
父组件
  └── props 传给子组件

组件内部
  └── state 管自己的变化

多个远距离组件
  └── store 共享状态
```

不要一上来就把所有数据放进 store。很多状态只属于一个组件，放在组件内部更清楚。

### 常见工具处在哪一层

| 工具 | 常见生态 | 所在层级 | 解决什么 |
|---|---|---|---|
| React Router | React | 第五层 | 前端路由 |
| Vue Router | Vue | 第五层 | 前端路由 |
| Redux | React 常见 | 第五层 | 全局状态管理 |
| Zustand | React 常见 | 第五层 | 轻量状态管理 |
| Pinia | Vue 常见 | 第五层 | 全局状态管理 |

它们依赖 UI 框架项目，但不是 UI 框架本身。

### 和上一层、下一层的关系

```text
React / Vue：负责组件怎么写
Vite：负责项目怎么跑
路由：负责 URL 对应哪个页面组件
状态管理：负责跨组件数据如何共享
Next / Nuxt：把路由和应用结构进一步框架化
```

在普通 Vite + React/Vue 项目里，你通常要自己选路由和状态管理工具。

在 Next.js / Nuxt.js 里，路由往往有框架约定，比如基于文件目录生成路由。

## 学习建议

初学者最容易混淆的地方是：以为每个概念都必须马上用。

更好的顺序是：

1. 先学组件自己的 `state`。
2. 再学父子组件用 `props` 通信。
3. 页面多了再学前端路由。
4. 数据真的跨很多组件共享时，再学 store。
5. 不要为了“现代”而提前引入复杂状态管理。

判断是否需要 store，可以问：

| 问题 | 如果答案是“是” |
|---|---|
| 这个数据是否被很多远距离组件使用？ | 可以考虑 store |
| 刷新页面后是否需要重新获取？ | 先区分本地状态和服务端数据 |
| 只是一个弹窗开关吗？ | 通常放组件 state 就够 |
| 只是父组件传子组件吗？ | 用 props 就够 |

## 小结

第五层解决的是“应用如何组织”。

```text
SPA：一种前端应用形态
前端路由：负责地址和页面组件的对应关系
状态管理：负责复杂数据在组件之间的共享和更新
props/state/store：不同范围的数据组织方式
```

React/Vue 让你能写组件，路由和状态管理让多个组件组成一个真正的应用。
