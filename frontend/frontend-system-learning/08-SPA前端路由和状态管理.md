# 08. SPA、前端路由和状态管理：应用组织层

## 问题背景

学完 React 或 Vue，很快会遇到：

```text
SPA
Router
props
state
store
Redux
Zustand
Pinia
```

这些不是新的 UI 框架，也不是 Vite 那样的构建工具。

它们属于第五层：应用组织层。

```text
React/Vue 解决“组件怎么写”。
Router/Store 解决“多个页面和多个组件怎么组织”。
```

| 问题 | 答案 |
|---|---|
| 解决什么 | 页面切换、组件通信、跨组件共享数据 |
| 依赖什么 | React/Vue 这类 UI 框架和运行中的前端项目 |
| 上一层关系 | Vite 让项目运行，Router/Store 组织应用内部结构 |
| 下一层关系 | Next/Nuxt 会把路由和应用结构进一步约定化 |

主线先记这一条：

```text
组件写多了
-> 页面需要切换
-> 数据需要传递
-> 远距离共享时才考虑 store
```

---

## 核心解释

### 1. SPA 是什么：页面切换不一定整页刷新

SPA = Single Page Application，单页应用。

“单页”不是说只有一个功能，而是说：

```text
浏览器先加载一个入口 HTML
后续页面切换主要由 JavaScript 控制
不一定整页刷新
```

传统多页面像这样：

```text
/about.html -> 请求新的 HTML
/users.html -> 再请求新的 HTML
```

SPA 更像这样：

```text
/about -> 显示 About 组件
/users -> 显示 Users 组件
```

---

### 2. 前端路由管什么：URL 对应页面组件

路由管 URL 和页面组件的对应关系。

```text
/counter -> CounterPage
/todos   -> TodoPage
/login   -> LoginPage
```

它不负责“按钮怎么画”，也不负责“登录用户数据放哪”。

一句话：

```text
Router 管页面位置。
```

---

### 3. 状态管理管什么：共享数据放哪里

状态就是影响页面的数据：

```text
输入框内容
弹窗开关
当前用户
购物车数量
列表筛选条件
```

状态管理要回答：

```text
数据放在哪里？
谁能读？
谁能改？
改了之后哪些组件要更新？
```

---

### 4. props、state、store 的区别：范围不同

| 名词 | 适合什么 | 范围 |
|---|---|---|
| props | 父组件传给子组件的数据 | 父子之间 |
| state | 当前组件自己的变化 | 局部 |
| store | 多个页面或远距离组件共享的数据 | 全局或模块 |

别一上来把所有东西都放 store。

| 数据 | 更常见的位置 |
|---|---|
| 输入框内容 | state |
| 弹窗开关 | state / 父组件 |
| 父组件传子组件 | props |
| 登录用户 | store |
| 多页面共享 count | store |
| 当前 URL | router |

---

## 技术关系

### 1. 常见工具在哪一层

| 工具 | 生态 | 解决什么 |
|---|---|---|
| React Router | React | 前端路由 |
| Vue Router | Vue | 前端路由 |
| Redux | React 常见 | 全局状态 |
| Zustand | React 常见 | 轻量状态 |
| Pinia | Vue 常见 | 全局状态 |

它们依赖 React/Vue 项目，但不是 React/Vue 本身。

---

### 2. 和其他层怎么配合

```text
React/Vue：组件怎么写
Vite：项目怎么跑
Router：URL 对应哪个页面
Store：共享数据怎么放
Next/Nuxt：把路由和结构进一步约定化
```

在普通 Vite + React/Vue 项目里，路由和状态管理通常要自己选。

在 Next/Nuxt 里，路由往往被框架约定了一部分。

---

## 学习建议

按这个顺序学，不容易乱：

```text
先学组件内部 state
再学 props
页面多了再学 Router
数据真的跨组件共享，再学 Store
```

判断是否需要 store，可以问：

```text
这个数据是否被很多远距离组件使用？
是不是多个页面都需要？
只是一个局部输入框吗？
只是父子组件传值吗？
```

如果只是局部状态，别急着上全局状态管理。

### 读完 08 做什么：加两个页面和共享状态

读完 08 后，继续沿用同一个功能，在 Vue 或 React 版上加两个页面：

```text
/counter  -> 计数器页
/todos    -> 列表页
```

再让两个页面共享一个 `count`：

```text
Router 管当前在哪个页面。
Store 管 count 这种跨页面共享数据。
```

---

## 小结

第五层解决的是“应用怎么组织”。

```text
SPA：应用形态
Router：页面位置
props：父子传值
state：局部状态
store：共享状态
```

React/Vue 让你写组件；Router/Store 让组件组成更像应用的东西。
