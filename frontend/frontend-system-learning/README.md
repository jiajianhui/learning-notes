# 现代前端体系与学习方法

## 问题背景

这套文档不是 API 手册，也不是某个框架教程。

它要解决的是：

```text
看到 HTML、CSS、JS、TS、React、Vue、Vite、Next、Nuxt，
你能判断它们分别在哪一层、解决什么问题、怎么组合。
```

你的长期目标是独立完成一个网站开发。后端方向已经确定是：

```text
Node.js + Express
```

所以这套文档先帮你把前端地图建立起来。等网站需求更具体，再讨论真正的技术选型。

主线先记这一条：

```text
先建立技术地图
-> 再用同一个小功能反复练
-> 最后根据真实网站需求选型
```

---

## 核心解释

### 1. 适合谁读

适合你这种阶段：

```text
有一点 HTML / CSS / JavaScript 基础
接触过 React 或 Vue
知道一些名词，但分层不清楚
想通过真实项目文件判断技术栈
最终想做出完整网站
```

配套练习目录：

```text
frontend/minimal-frontend-demo/
```

它用同一个“计数器 + 列表”小功能，穿过不同技术阶段。

---

### 2. 现代前端七层技术地图

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

---

### 3. 它们不是同一类东西

| 技术 | 属于哪层 | 主要负责 |
|---|---|---|
| HTML / CSS / JS / DOM | 基础层 | 浏览器页面的底层材料 |
| TypeScript | 语言增强层 | 给 JS 增加类型约束 |
| React / Vue | UI 框架层 | 组件和页面更新 |
| Vite | 工程化层 | 开发服务器、转换、打包 |
| Router / Store | 应用组织层 | 页面切换和共享状态 |
| Next / Nuxt | 应用框架层 | 应用结构和渲染模式 |

几个关键判断：

```text
Vite 不是 React/Vue。
Next/Nuxt 不是 React/Vue 的替代品。
TypeScript 不是 UI 框架。
Router 和 Store 也不是一件事。
```

---

## 技术关系

学习时建议从下往上理解：

```text
基础 -> TypeScript -> React/Vue 思想 -> React/Vue 最小语法 -> Vite -> Router/Store -> Next/Nuxt
```

做项目时通常从目标往下组合：

```text
我要做什么网站
需要什么应用形态
选择框架和工具
补对应基础
```

读项目时则反过来：

```text
先看 package.json 和 scripts
再看入口文件
再看组件、配置和目录约定
最后放回七层体系
```

---

## 学习建议

推荐阅读顺序：

```text
00 阅读导引和最小实战主线
01 前端大图景
02 HTML / CSS / JavaScript
03 Node 和包管理工具
04 JavaScript 到 TypeScript
05 React 和 Vue
06 React 和 Vue 最小语法
07 Vite 和构建工具
06A 做完 Vue / React 后的 JS 语法补洞（做完 demo 后回看）
08 SPA、路由和状态管理
09 Next 和 Nuxt
10 如何阅读前端项目
11 学习路线
12 常见误区
13 未来网站开发展望
14 术语表
15 练习题
```

### 项目实践节点：同一个功能反复实现

练习原则只有一个：

```text
同一个计数器 + 列表项目，用不同技术实现。
```

文档可以连续读；真正动手时按下面顺序做：

| 顺序 | 前置条件 | 做哪个版本 | 技术重点 |
|---|---|---|---|
| 1 | 读完 02 | `minimal-frontend-demo/01-html-css-js` | 原生 HTML / CSS / JavaScript |
| 2 | 读完 07 | `minimal-frontend-demo/02-vite-vanilla-ts` | Vite + Vanilla TypeScript |
| 3 | 读完 07 | `minimal-frontend-demo/03-vue`、`04-react` | 用 Vue / React 重写同一功能 |
| 4 | 读完 08，并已有框架版 | `minimal-frontend-demo/05-router`、`06-state-management` | 在框架版上加路由和共享状态 |

这里容易绕的一点是：05 讲 React/Vue 为什么出现，06 讲写 demo 够用的最小语法，07 讲 Vite 怎么把这些项目跑起来。读完 07 后，就可以依次做 TS、Vue、React 三个版本。

做完 `03-vue` 和 `04-react` 后，如果卡在函数、箭头函数、返回对象、`splice` / `filter` 这些语法点，再回看 `06A`。它是复盘章节，不需要第一次读到 `06` 时就完全掌握。

---

## 小结

学完后，你最应该获得的不是 API 记忆，而是判断力：

```text
这个技术在哪一层？
它解决什么问题？
它依赖什么基础？
它和其他技术怎么配合？
我在真实项目里怎么识别它？
```

当你能这样看项目，现代前端就不再是一堆名词，而是一张能用的地图。
