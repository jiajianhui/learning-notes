# 05 Vite 与构建工具

> 所属层级：**第四层：工程化层**。

## 问题背景

很多人把 Vite 当成 React/Vue 的一部分，这是最常见误区之一。

## 核心解释

### Vite 是什么
Vite 是现代前端开发工具，核心包括：
- 开发服务器（dev server）
- 构建打包（build）
- 插件机制（接 React/Vue 等）

### Vite 为什么不是 React/Vue
- React/Vue 解决“如何写 UI”（第三层）
- Vite 解决“如何开发/构建项目”（第四层）

### 为什么会误解
因为很多脚手架默认“Vite + React”或“Vite + Vue”，导致名词总是一起出现。

## 构建工具职责

| 能力 | 说明 |
|---|---|
| 开发服务器 | 本地快速启动、热更新 |
| 模块处理 | 解析 TS、CSS、资源文件 |
| 打包优化 | 产出可部署静态资源 |

## Vanilla TS 项目是什么
不使用 React/Vue，仅用 TypeScript + DOM API。
它同样可以使用 Vite。

## 与其他技术关系

- Vite + React / Vue：常见组合
- Next / Nuxt：有自己的应用框架体系，不等于“Vite 项目”

## 小结

第四层是工程保障层。Vite 是工具，不是 UI 框架，也不是应用框架。
