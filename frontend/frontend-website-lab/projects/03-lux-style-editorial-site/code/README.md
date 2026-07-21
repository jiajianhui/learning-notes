# 项目复盘

## 01、参考网站
- URL：https://www.lux.camera/

- 给人感觉：


## 02、设计观察

- 
## 03、最终做出来的页面
- 


## 04、开发过程中的收获

* 

## 05、这次学到的 Tailwind 写法

* 
## 06、能迁移到个人网站的点
- 

## 07、开发问题记录
无

## 08、MDX 使用流程

MDX 可以在 Markdown 中直接使用 JSX，接入步骤如下。

#### 1、安装依赖

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
```

#### 2、配置 `next.config.ts`

这一步让 Next.js 能够编译 `.mdx` 文件，并把它识别为页面。

```ts
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 保留默认页面类型，同时增加 .mdx
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
};

// 使用默认规则创建 MDX 配置
const withMDX = createMDX({});

// 把 MDX 能力合并到 Next.js 配置中
export default withMDX(nextConfig);
```

#### 3、创建 `mdx-components.tsx`

这是 App Router 使用 MDX 的必需入口，也可以在这里统一替换标题、段落等元素的样式。

```tsx
import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  // 可以在这里配置 h1、p、a 等全局 MDX 组件
};

export function useMDXComponents(): MDXComponents {
  // Next.js 会调用这个函数获取组件配置
  return components;
}
```

#### 4、创建 `app/mdx-demo/page.mdx`

```mdx
# 我的第一个 MDX 页面

这是 **Markdown** 内容。

<div className="rounded-xl bg-black p-6 text-white">
  这是写在 MDX 中的 JSX
</div>
```

#### 5、启动并访问页面

```bash
npm run dev
```

VS Code 推荐安装 `MDX` 和 `Tailwind CSS IntelliSense` 扩展。

## 09、让 MDX 像 TSX 一样好写：开启 JSX 标签补全

默认情况下，VS Code 不一定会把 `.mdx` 文件当成 JSX 处理。配置完成后，可以获得接近编写 `.tsx` 文件的标签补全体验：

```text
输入 h1
→ 出现 Emmet 补全建议 <h1></h1>
→ 按 Enter 接受补全
```

#### 1、安装 MDX 语言扩展

在 VS Code 扩展市场安装：

```text
MDX
扩展 ID：unifiedjs.vscode-mdx
```

安装后，打开 `.mdx` 文件时，VS Code 右下角的语言模式应该显示为 `MDX`。

#### 2、配置 `settings.json`

打开 VS Code 的 `settings.json`，把 `mdx` 合并到已有的 `emmet.includeLanguages` 中，不要重复声明同名配置。

```json
{
  "emmet.includeLanguages": {
    "wxml": "html",
    "mdx": "javascriptreact"
  },
  "emmet.showExpandedAbbreviation": "always",
  "emmet.showAbbreviationSuggestions": true,
  "emmet.showSuggestionsAsSnippets": true,

  "[mdx]": {
    "editor.defaultFormatter": "unifiedjs.vscode-mdx",
    "editor.quickSuggestions": {
      "other": true,
      "comments": false,
      "strings": true
    },
    "editor.snippetSuggestions": "top",
    "editor.acceptSuggestionOnEnter": "on"
  }
}
```
