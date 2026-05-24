# 练习与参考答案

## 练习一：根据 package.json 判断项目类型

**题目**：
给定依赖含 `react`, `react-dom`, `@vitejs/plugin-react`，scripts 有 `vite`。

**答案要点**：
这是 **Vite + React** 项目。

---

## 练习二：根据目录结构判断类型

**题目**：
看到 `nuxt.config.ts`、`pages/`、`app.vue`。

**答案要点**：
这是 **Nuxt.js** 项目。

---

## 练习三：解释 Vite、React、Vue、Next、Nuxt 关系

**参考答案**：
- React/Vue：第三层 UI 框架
- Vite：第四层工程化工具
- Next/Nuxt：第六层应用框架
- 它们是上下游关系，不是同类替代。

---

## 练习四：画七层分层图

**参考图**：
```text
7 学习方法
6 Next/Nuxt
5 路由/状态管理
4 Vite/构建
3 React/Vue
2 TypeScript
1 HTML/CSS/JS/DOM
```

---

## 练习五：按目标选择路线

**题目**：你要做后台管理系统。

**参考答案**：
基础层 -> TS -> React/Vue -> 路由/状态 -> Vite 工程化 ->（可选）Next/Nuxt。

---

## 练习六：判断为何是 Vanilla TS

**题目线索**：
- 无 react/vue/next/nuxt
- `src/main.ts` 有 `document.querySelector`、`addEventListener`
- 有 `vite.config.ts`

**参考答案**：
这是 **Vanilla TS + Vite**，不是 React/Vue。Vite 只说明用了工程化工具，不说明 UI 框架。

## 小结

做判断题时，务必用“证据链”而不是单个关键词：依赖 + 脚本 + 入口 + 配置 + 目录。
