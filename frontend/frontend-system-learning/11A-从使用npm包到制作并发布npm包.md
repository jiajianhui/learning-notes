# 11A. npm 包怎样制作和发布

## 问题背景

前面的章节已经从使用者角度接触过 npm：

```text
npm install 安装包
package.json 记录依赖和命令
npm run dev 启动项目
```

这一章换到作者角度，只回答一条主线：

```text
一段可以复用的代码
-> 怎样变成一个 npm 包
-> 怎样先在本地检查
-> 怎样发布给其他项目安装
```

它属于前端工程化扩展，但 npm 包本身不一定是前端代码。包里也可以放 Node.js 工具、Express 中间件或前后端共享类型。

这一章是选修内容，不增加配套代码项目。下面的代码只是一个最小完整示例，需要真正发布时再单独创建项目。

---

## 1. npm 包解决什么问题

假设多个项目都需要同一个摘要函数。

不做 npm 包时，常见做法是把函数复制到每个项目：

```text
项目 A 有一份
项目 B 有一份
项目 C 又复制一份
```

以后修改函数，就要同时修改多处。

做成 npm 包后：

```text
一个包负责维护代码
-> 发布一个版本
-> 其他项目按包名安装
-> 通过 import 使用公开函数
```

npm 包主要解决的是代码分发和版本管理，不是让普通函数获得新的运行能力。

---

## 2. package、module 和 registry 分别是什么

| 名称 | 当前可以怎样理解 |
|---|---|
| module | 一个可以通过 `import` 或 `export` 使用的代码模块 |
| package | 带有 `package.json`、可以被安装和分发的一组文件 |
| npm registry | 保存已发布包及其不同版本的远程仓库 |
| npm CLI | 执行安装、打包、登录和发布等操作的命令行工具 |

一个包里可以有多个模块。`package.json` 决定包名、版本、公开入口和发布内容。

---

## 3. 一个最小 npm 包需要什么

最小目录可以只有：

```text
text-tools/
├── index.js
├── package.json
└── README.md
```

`index.js` 提供公开函数：

```js
export function createExcerpt(text, maxLength = 20) {
  const normalizedText = text.trim().replace(/\s+/g, " ");

  if (normalizedText.length <= maxLength) {
    return normalizedText;
  }

  return `${normalizedText.slice(0, maxLength)}…`;
}
```

使用者以后只需要：

```js
import { createExcerpt } from "@your-npm-name/text-tools";

createExcerpt("一段很长的文章正文", 8);
```

`README.md` 至少要说明这个包解决什么问题、怎样安装、怎样导入和调用。包能运行不代表别人就知道怎样使用。

---

## 4. package.json 怎样描述这个包

```json
{
  "name": "@your-npm-name/text-tools",
  "version": "1.0.0",
  "description": "一组最小文本处理工具",
  "type": "module",
  "exports": "./index.js",
  "files": ["index.js", "README.md"],
  "private": true
}
```

| 字段 | 当前作用 |
|---|---|
| `name` | 安装和导入时使用的包名 |
| `version` | 当前版本 |
| `description` | 简短说明包的用途 |
| `type` | 声明 `.js` 文件使用 ESM |
| `exports` | 声明使用者可以进入的公开入口 |
| `files` | 限制哪些文件进入发布包 |
| `private` | 设为 `true` 时阻止误发布 |

`@your-npm-name` 是 scope，正式发布时要换成自己的 npm 用户名或组织名。scope 可以避免所有人都在争抢同一个全局包名。

现在保留：

```json
"private": true
```

这样仍然可以本地检查和打包，但不能误上传到公共 npm。只有真正准备发布时才删除它。

---

## 5. 先验证函数，再检查发布内容

在包目录中，可以先直接验证公开函数：

```bash
node --input-type=module -e "import { createExcerpt } from './index.js'; console.log(createExcerpt('  npm 包怎样发布  ', 6))"
```

应该看到：

```text
npm 包怎…
```

这只能证明函数可以运行，还不能证明发布内容正确。

继续执行：

```bash
npm pack --dry-run
```

它会预览准备放进压缩包的文件。当前例子应该包含：

```text
package.json
README.md
index.js
```

不应该包含：

```text
node_modules
.env
访问令牌
密码或私钥
与使用者无关的临时文件
```

`files` 是发布白名单，但正式发布前仍然要亲自阅读 `npm pack --dry-run` 的输出。

---

## 6. npm pack 和 npm publish 有什么区别

确认文件清单后执行：

```bash
npm pack
```

npm 会在当前目录生成一个 `.tgz` 压缩包，例如：

```text
your-npm-name-text-tools-1.0.0.tgz
```

此时文件仍然只在本地：

```text
npm pack
-> 生成本地压缩包
-> 没有上传到 npm registry
```

另一个项目可以直接安装这个文件：

```bash
npm install /压缩包的完整路径/your-npm-name-text-tools-1.0.0.tgz
```

然后通过正式包名导入。这个检查能发现入口写错、文件漏发等问题。

`npm publish` 才会把包上传到 registry：

```text
npm publish
-> 上传当前版本
-> 其他人可以通过包名安装
```

因此正确顺序是：

```text
先运行代码
-> npm pack --dry-run 检查清单
-> npm pack 生成压缩包
-> 在另一个项目安装验证
-> 最后才 npm publish
```

---

## 7. 真正发布前要准备什么

发布到公共 npm 前，需要：

1. 注册 npm 账号。
2. 为发布配置双重验证。
3. 把 scope 换成自己的 npm 用户名或组织名。
4. 选择许可证，并写清 README。
5. 确认测试通过，检查发布文件中没有敏感信息。
6. 删除 `private: true`。

登录并确认当前账号：

```bash
npm login
npm whoami
```

再次检查包内容：

```bash
npm pack --dry-run
```

第一次发布公开 scoped package：

```bash
npm publish --access public
```

这是会改变外部状态的操作。执行后，包和当前版本会进入公共 registry，所以必须由发布者亲自确认账号、包名和内容。

---

## 8. 版本号怎样告诉使用者变化大小

npm 包通常使用语义化版本：

```text
主版本.次版本.修订版本
major.minor.patch
```

| 修改类型 | 版本变化 | 例子 |
|---|---|---|
| 向后兼容的问题修复 | patch | `1.0.0 -> 1.0.1` |
| 向后兼容的新功能 | minor | `1.0.0 -> 1.1.0` |
| 破坏现有用法的修改 | major | `1.0.0 -> 2.0.0` |

已经发布的版本不能用同一个版本号覆盖。修复代码后要先产生新版本，再重新发布。

学习阶段如果不想让 npm 自动创建 Git 提交和标签，可以使用：

```bash
npm version patch --no-git-tag-version
```

版本号表达的是升级对使用者的影响，不是这次修改了多少行代码。

---

## 9. TypeScript 包为什么多一个构建步骤

前面的最小例子直接发布 JavaScript，所以不需要构建。

如果源码使用 TypeScript，常见链路会变成：

```text
src/index.ts
-> TypeScript 编译
-> dist/index.js
-> dist/index.d.ts
-> npm pack
```

两类输出的职责不同：

| 文件 | 使用者拿它做什么 |
|---|---|
| `dist/index.js` | 程序真正运行 |
| `dist/index.d.ts` | TypeScript 和编辑器读取类型 |

此时 `package.json` 通常还会增加：

```json
{
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist", "README.md"]
}
```

这条路线比直接发布 JavaScript 多了编译和类型声明。第一次理解 npm 发布时先看清最小 JavaScript 包，真正制作 TypeScript 包时再补构建配置。

---

## 10. dependencies 应该怎样区分

| 字段 | 放什么 |
|---|---|
| `dependencies` | 这个包运行时自己必须加载的依赖 |
| `devDependencies` | 只用于构建、测试和本地开发的工具 |
| `peerDependencies` | 要求使用者项目提供的同层依赖 |

例如 React 组件库通常不会在包内再偷偷维护另一套 React，而是通过 `peerDependencies` 说明它需要使用者项目提供兼容版本的 React。

第一轮不要为了练习字段而随便安装依赖。没有依赖的工具包完全可以不写这些字段。

---

## 常见误区

### 1. npm run build 成功，就代表可以发布

构建成功只证明生成了文件。还要检查 `npm pack --dry-run` 的清单，并在另一个项目里安装 `.tgz` 验证公开入口。

### 2. npm pack 已经把包发到网上

没有。`npm pack` 只生成本地压缩包，`npm publish` 才会上传。

### 3. 包里的所有文件都应该让使用者导入

不是。`exports` 用来明确公开入口。内部文件可以调整，公开 API 才是作者对使用者维持的约定。

### 4. npm 包一定属于前端

不是。npm 负责 JavaScript 生态中的包管理和分发，包具体在哪个环境运行，要看它使用了浏览器 API、Node.js API 还是框架能力。

### 5. 第一个包就要支持所有模块格式

不需要。第一轮先走通 ESM 的制作、检查和发布。只有真实使用者需要 CommonJS 时，再增加双格式构建和条件导出。

---

## 小结

先记住这条主线：

```text
用 package.json 描述包
-> 用 exports 控制公开入口
-> 用 files 控制发布内容
-> npm pack --dry-run 检查清单
-> npm pack 生成本地压缩包
-> 在另一个项目安装验证
-> npm publish 上传到 registry
-> 用新版本继续更新
```

制作 npm 包的重点不是记住一条发布命令，而是站在使用者角度保证：包名可安装、入口可导入、文件不缺失、版本变化可判断。

## 官方参考

- [npm：创建并发布公开 scoped package](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)
- [npm：package 与 module](https://docs.npmjs.com/about-packages-and-modules/)
- [npm：package.json 字段](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)
- [npm：npm pack 命令](https://docs.npmjs.com/cli/v11/commands/npm-pack/)
- [npm：语义化版本](https://docs.npmjs.com/about-semantic-versioning/)
- [TypeScript：生成类型声明](https://www.typescriptlang.org/tsconfig/declaration.html)
