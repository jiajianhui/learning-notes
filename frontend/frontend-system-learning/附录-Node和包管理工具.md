# 附录. Node.js 和包管理工具在前端中的位置

## 问题背景

你学前端时，经常会看到这些东西：

```text
node
npm
pnpm
yarn
package.json
node_modules
package-lock.json
pnpm-lock.yaml
npm run dev
```

它们看起来不像 HTML/CSS/JavaScript，也不像 React/Vue，但现代前端项目又几乎离不开它们。

本文是七层体系的工程化补充。它不讲后端，不讲部署，只解释：Node.js 和包管理工具为什么会出现在前端项目里。

```text
核心位置：
Node.js / npm / pnpm 不是 UI 框架
它们是现代前端工具链运行和管理依赖的基础
```

## 核心解释

### Node.js 在前端里做什么

浏览器负责运行页面里的 JavaScript。Node.js 则常用于在你电脑本地运行前端开发工具。

比如：

```text
Vite
TypeScript 编译检查
脚手架工具
代码格式化工具
测试工具
打包工具
```

这些工具大多不是直接在浏览器里运行，而是在本地命令行里运行。Node.js 就是它们的运行环境。

你可以先这样理解：

```text
浏览器：运行用户看到的页面
Node.js：运行开发者使用的前端工具
```

### npm / pnpm / yarn 是什么

它们都是包管理工具，主要负责：

- 安装依赖。
- 记录依赖版本。
- 执行 `package.json` 里的 scripts。
- 管理 `node_modules`。

常见命令：

```text
npm install
npm run dev
pnpm install
pnpm dev
yarn install
yarn dev
```

它们不是框架，也不是构建工具。它们更像“项目依赖和命令的管理器”。

## 技术关系

### package.json 为什么重要

`package.json` 是现代前端项目的说明书。

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "vue": "^3.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

你可以从里面判断：

| 字段 | 说明 |
|---|---|
| `scripts` | 项目有哪些可执行命令 |
| `dependencies` | 应用运行时依赖 |
| `devDependencies` | 开发和构建时依赖 |

所以读项目时，通常先看 `package.json`。

### node_modules 是什么

`node_modules` 是安装依赖后生成的目录。

```text
node_modules/
  react/
  vite/
  typescript/
```

它通常很大，不需要手动阅读，也一般不提交到 Git。

你要知道的是：

```text
package.json 记录项目需要什么
包管理工具负责安装
node_modules 存放安装结果
```

### lock 文件是什么

常见 lock 文件：

```text
package-lock.json
pnpm-lock.yaml
yarn.lock
```

它们记录更精确的依赖版本，帮助团队成员安装出一致的依赖结果。

可以这样理解：

```text
package.json：大概需要哪些包
lock 文件：这次实际装了哪些精确版本
```

lock 文件通常应该提交到 Git。

### npm run dev 到底发生了什么

假设 `package.json` 里写着：

```json
{
  "scripts": {
    "dev": "vite"
  }
}
```

当你执行：

```text
npm run dev
```

大致发生的是：

```text
npm 读取 package.json
  ↓
找到 scripts.dev
  ↓
执行 vite
  ↓
Vite 启动开发服务器
  ↓
浏览器访问 localhost
```

所以：

```text
npm 负责执行命令
Vite 负责启动项目
React/Vue 负责写界面
```

它们不是同一层。

### 放回七层体系

Node.js 和包管理工具不是七层中的独立业务层，更像是工程化层背后的基础设施。

```text
第一层：HTML / CSS / JS / DOM
第二层：TypeScript
第三层：React / Vue
第四层：Vite / 构建工具
        ↑
        Node.js 运行这些工具
        npm / pnpm 管理这些工具和依赖
第五层：路由 / 状态管理
第六层：Next.js / Nuxt.js
第七层：学习方法
```

如果你把 Node.js 理解成“前端工具运行环境”，而不是马上联想到后端，就不会那么乱。

## 学习建议

初级阶段建议掌握这些就够：

| 内容 | 学到什么程度 |
|---|---|
| Node.js | 知道它让前端工具能在本地运行 |
| npm / pnpm | 会安装依赖、运行 scripts |
| package.json | 会看 scripts、dependencies、devDependencies |
| node_modules | 知道它是依赖安装目录，不手动改 |
| lock 文件 | 知道它锁定依赖版本，通常要提交 |

可以暂时不深入：

- 自己写 npm 包。
- Node.js 后端服务。
- 复杂 monorepo 工具链。
- 私有包发布。

先把常见项目跑起来、看懂依赖和 scripts，比深入包管理器实现更重要。

## 小结

Node.js、npm、pnpm、yarn 在现代前端中主要解决“工具怎么运行、依赖怎么管理”的问题。

最重要的分层是：

```text
Node.js：让前端工具在本地运行
npm / pnpm / yarn：管理依赖和执行命令
Vite：开发服务器和构建工具
React / Vue：UI 框架
Next / Nuxt：应用框架
```

它们经常一起出现，但不是同一类东西。

