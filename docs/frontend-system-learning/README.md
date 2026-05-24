# 现代前端体系与学习方法

## 这套文档要解决什么问题？

很多初学者会把这些名词混在一起：`Vite`、`React`、`Vue`、`Next.js`、`Nuxt.js`、`TypeScript`。

常见困惑是：
- Vite 和 React 到底谁“更底层”？
- Next.js 是不是 React 的替代品？
- Nuxt.js 是 Vue 的插件还是框架？
- 为什么有些项目只有 `main.ts` 和 DOM API，也能跑起来？

这套文档的目标不是背 API，而是建立**“现代前端技术地图”**：
- 每种技术处在哪一层
- 每层解决什么问题
- 各层如何依赖和组合
- 如何通过真实项目文件判断技术栈

---

## 适合谁阅读？

- 有一点 HTML / CSS / JavaScript 基础
- 接触过 React 或 Vue，但理解不成体系
- 经常看到前端名词，但不清楚层级关系
- 希望通过项目结构判断技术栈

---

## 现代前端七层技术地图（核心主线）

```text
第七层：学习方法层
  └─ 如何看项目 / 如何判断技术栈 / 如何规划学习路线

第六层：应用框架层
  └─ Next.js / Nuxt.js

第五层：应用组织层
  └─ 路由 / 状态管理 / 组件通信

第四层：工程化层
  └─ Vite / 构建工具 / 开发服务器 / 打包

第三层：UI 框架层
  └─ React / Vue

第二层：语言增强层
  └─ TypeScript

第一层：基础层
  └─ HTML / CSS / JavaScript / DOM
```

> 学习时建议**从下往上理解**；做项目时通常是**从上往下组合**。

---

## 为什么这些技术不是同一类东西？

| 技术 | 所在层 | 本质角色 | 主要解决问题 |
|---|---|---|---|
| HTML/CSS/JS/DOM | 第一层 | Web 基础能力 | 页面结构、样式、交互 |
| TypeScript | 第二层 | JavaScript 的类型增强 | 降低复杂项目维护成本 |
| React/Vue | 第三层 | UI 框架 | 组件化、声明式开发 |
| Vite | 第四层 | 工程化工具 | 本地开发服务、构建打包 |
| 路由/状态管理 | 第五层 | 应用组织机制 | 页面切换、跨组件状态协同 |
| Next.js/Nuxt.js | 第六层 | 应用框架 | 在 UI 框架上提供完整应用约定（含 SSR/SSG 等） |
| 学习方法 | 第七层 | 元能力 | 把技术串成可执行学习路径 |

---

## 推荐阅读顺序

1. `01-frontend-big-picture.md`
2. `02-html-css-javascript-foundation.md`
3. `03-javascript-to-typescript.md`
4. `04-frameworks-react-and-vue.md`
5. `05-vite-and-build-tools.md`
6. `06-spa-routing-and-state.md`
7. `07-nextjs-and-nuxtjs.md`
8. `08-how-to-read-a-frontend-project.md`
9. `09-learning-path.md`
10. `10-common-confusions.md`
11. `glossary.md`
12. `exercises.md`

---

## 学完后你应建立的认知

- 能把常见前端技术放到正确层级
- 能解释技术之间的依赖关系（不是替代关系）
- 能快速阅读项目并判断大致技术栈
- 能根据目标（官网、后台、复杂 Web App）制定学习路线

---

## 小结

这套文档是“排疑型学习文档”：
- 先回答你真实会问的问题
- 再给出层级化解释
- 最后落到项目判断与学习实践

目标不是让你记更多名词，而是让你拥有一张能指导实践的现代前端地图。
