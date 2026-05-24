# 08 如何读项目并判断技术栈

> 层级：第七层学习方法层

## 问题背景
看到仓库时如何 5 分钟内判断技术栈？

## 核心解释
先看 `package.json`：
- React线索：react/react-dom/main.tsx/App.tsx/@vitejs/plugin-react
- Vue线索：vue/main.ts/App.vue/@vitejs/plugin-vue/createApp
- Next线索：next/next dev/app 或 pages/next.config.*
- Nuxt线索：nuxt/nuxi/nuxt.config.ts/pages/app.vue
- Vanilla TS线索：无 react/vue/next/nuxt，main.ts + DOM API

## 技术关系
`vite.config.ts` 只能说明工具层，不足以断定 React/Vue。

## 学习建议
按“依赖->脚本->入口->配置->目录”顺序排查。

## 小结
判断技术栈要看证据链，不看单一文件。
