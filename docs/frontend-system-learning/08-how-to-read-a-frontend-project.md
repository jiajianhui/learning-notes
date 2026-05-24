# 08 如何读前端项目并判断技术栈

> 所属层级：**第七层：学习方法层**。

## 问题背景

看到新仓库时，你需要在 5~10 分钟内回答：
- 这是什么类型项目？
- 用了哪些核心技术？
- 是 Vite 体系还是 Next/Nuxt 体系？

## 核心解释

### 第一步：看 `package.json`

重点看：
- `dependencies`
- `devDependencies`
- `scripts`

### 常见线索速查

| 类型 | 典型线索 |
|---|---|
| React | `react` `react-dom` `main.tsx` `App.tsx` `@vitejs/plugin-react` |
| Vue | `vue` `App.vue` `main.ts` `@vitejs/plugin-vue` `createApp` |
| Next.js | `next` `next dev` `app/` 或 `pages/` `next.config.ts` |
| Nuxt.js | `nuxt` `nuxi` `nuxt.config.ts` `pages/` `app.vue` |
| Vanilla TS | 无 react/vue/next/nuxt；`src/main.ts`；DOM API |

### 第二步：看入口文件

- `main.tsx` 常见于 React
- `main.ts` + `createApp` 常见于 Vue
- `app/page.tsx`、`pages` 常见于 Next
- `app.vue`、`nuxt.config.ts` 常见于 Nuxt
- `document.querySelector`、`addEventListener` 密集出现常见于 Vanilla

### 第三步：看 `vite.config.ts`

- 有 `@vitejs/plugin-react` => Vite + React
- 有 `@vitejs/plugin-vue` => Vite + Vue
- 只有基础配置可能是 Vanilla TS

> 注意：有 `vite.config.ts` 不代表一定是 React/Vue。

## 示例判断

1. 依赖有 `react`，入口 `main.tsx`，有 `@vitejs/plugin-react` => **Vite + React**。
2. 有 `next`、脚本 `next dev`、目录 `app/` => **Next.js**。
3. 有 `vite.config.ts`，但无 React/Vue，`main.ts` 里全是 DOM API => **Vanilla TS + Vite**。

## 小结

判断项目类型不是猜，而是看证据链：`package.json` + 入口文件 + 配置文件 + 目录约定。
