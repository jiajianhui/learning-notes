# 06. Vite 和构建工具：工程化层

## 问题背景

很多人看到创建项目时有这些选项：

```text
Vanilla
Vue
React
```

又看到项目里有 `vite.config.ts`，于是容易误以为：

```text
Vite = React？
Vite = Vue？
用了 Vite 就一定用了框架？
```

这些都不准确。本文属于七层体系中的第四层：工程化层。

```text
上一层：React / Vue 负责写 UI
当前层：Vite / 构建工具负责开发服务器、热更新、打包
下一层：路由、状态管理等应用组织能力会运行在项目之上
```

## 核心解释

### Vite 是什么

Vite 是现代前端构建工具。你可以先把它理解成：

```text
Vite = 本地开发服务器 + 构建打包工具 + 资源处理工具
```

它负责让你在开发时运行项目：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

也负责把生产代码打包成浏览器可部署的静态资源：

```text
dist/
  index.html
  assets/
    index-xxxx.js
    index-xxxx.css
```

### Vite 为什么不是 React / Vue

React 和 Vue 是写界面的框架。Vite 是让项目开发和构建更顺畅的工具。

| 技术 | 所在层 | 负责什么 |
|---|---|---|
| React | UI 框架层 | 写组件和界面 |
| Vue | UI 框架层 | 写组件和界面 |
| Vite | 工程化层 | 启动、热更新、打包、资源处理 |

所以你会看到这些组合：

```text
Vite + React
Vite + Vue
Vite + Vanilla TS
```

Vite 可以配框架，也可以不配框架。

### 为什么很多人误以为 Vite = React 或 Vue

因为创建项目时，Vite 经常作为入口工具：

```text
npm create vite@latest
```

它会让你选择模板：

```text
React
Vue
Vanilla
```

初学者会把“创建项目的工具”和“项目使用的框架”混在一起。

更准确的理解是：

```text
Vite 帮你创建和运行项目
React/Vue 决定你用什么方式写 UI
```

## 技术关系

### 构建工具负责什么

现代项目里你可能写：

- TypeScript。
- JSX / TSX。
- Vue 单文件组件。
- CSS 模块。
- 图片、字体等资源引用。
- 多文件模块导入。

浏览器最终需要的是普通 HTML、CSS、JavaScript 和静态资源。构建工具负责把开发写法处理成浏览器能运行的结果。

| 职责 | 说明 |
|---|---|
| 开发服务器 | 本地启动项目，通常是 `localhost` |
| 热更新 | 修改文件后页面快速更新 |
| 模块处理 | 处理 `import` / `export` |
| TypeScript 转换 | 把 TS 转为 JS |
| 框架插件 | 处理 React JSX 或 Vue SFC |
| 打包 | 生成生产环境文件 |
| 资源处理 | 处理 CSS、图片、字体等 |

### 开发服务器是什么

开发服务器是本地开发时运行项目的服务。

```text
npm run dev
  ↓
vite 启动开发服务器
  ↓
浏览器打开 http://localhost:5173
```

它不是正式部署，也不是后端业务服务。它主要服务于本地开发体验。

### 打包是什么

打包是把开发目录转换成生产目录。

开发时：

```text
src/
  main.tsx
  App.tsx
  components/
```

打包后：

```text
dist/
  index.html
  assets/
    index-a1b2c3.js
    index-d4e5f6.css
```

真实用户访问的通常是打包后的文件，而不是你的 `src/` 源码。

### 什么是 Vanilla TS 项目

Vanilla 的意思是“不使用 React/Vue 这类 UI 框架”。Vanilla TS 就是：

```text
TypeScript + 原生 DOM API + 构建工具
```

典型文件：

```text
src/
  main.ts
index.html
package.json
vite.config.ts
```

代码可能是：

```ts
const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.innerHTML = "<button>保存</button>";
}
```

它用了 Vite，但没有 React 或 Vue。

### Vite 和 React / Vue / Next / Nuxt 的关系

| 对象 | 和 Vite 的关系 |
|---|---|
| React | Vite 可以通过 `@vitejs/plugin-react` 支持 React |
| Vue | Vite 可以通过 `@vitejs/plugin-vue` 支持 Vue |
| Vanilla TS | Vite 可以直接运行原生 TS 项目 |
| Next.js | Next.js 自带自己的应用框架和构建体系，一般不需要你单独配 Vite |
| Nuxt.js | Nuxt 是 Vue 应用框架，内部可能使用 Vite 作为构建能力的一部分，但你通常以 Nuxt 为入口 |

判断层级时要看“谁是项目入口”：

```text
scripts 里是 vite dev -> 多半是 Vite 项目
scripts 里是 next dev -> Next.js 项目
scripts 里是 nuxt dev 或 nuxi dev -> Nuxt.js 项目
```

## 学习建议

学 Vite 不需要一开始深入插件开发。先掌握这些就够用：

- 会看 `package.json` 的 `scripts`。
- 知道 `npm run dev` 是启动开发服务器。
- 知道 `npm run build` 是打包生产代码。
- 能看懂 `vite.config.ts` 里用了 React 插件还是 Vue 插件。
- 知道 Vite 可以和 React、Vue、Vanilla TS 搭配。

重点不是背 Vite 配置项，而是理解它处在工程化层。

## 小结

Vite 属于第四层：工程化层。

它不是 React，也不是 Vue。它负责让现代前端项目更容易开发、热更新、转换和打包。

最实用的判断方式是：

```text
Vite 看 scripts 和 vite.config.ts
React/Vue 看 dependencies、入口文件和组件文件
Next/Nuxt 看 scripts、配置文件和目录约定
```
