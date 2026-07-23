# 05A. MDX：把文章内容从 TSX 中拆出来

## 1. 最小接入流程

### 1.1 安装依赖

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
```

### 1.2 配置 `next.config.ts`

```ts
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
```

```text
pageExtensions
-> 允许 .mdx 成为页面

withMDX
-> 让 Next.js 编译 MDX
```

修改配置后要重新启动开发服务器。

### 1.3 创建 `mdx-components.tsx`

App Router 使用 `@next/mdx` 时需要这个文件。

它放在项目根目录；使用 `src/` 时放在 `src/` 根目录。

```tsx
import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
```

文件名和 `useMDXComponents` 导出名称不能随意修改。

### 1.4 创建测试页面

```text
app/mdx-demo/page.mdx
```

```mdx
export const metadata = {
  title: "MDX Demo",
};

# 第一篇 MDX 文章

这是普通的 **Markdown** 内容。

<div className="rounded-xl bg-black p-6 text-white">
  这是 MDX 中的 JSX。
</div>
```

访问 `/mdx-demo` 能正常显示，就说明 MDX 已接通。

---

## 2. MDX 中应该写什么

MDX 可以同时使用 Markdown 和 JSX。

| 内容 | 推荐写法 |
|---|---|
| 标题、段落、列表、链接 | Markdown |
| 简单的特殊布局 | 少量 JSX |
| 图片组、对比区、提示框 | React 组件 |

基本原则：

```text
普通内容写 Markdown
复杂展示交给 React 组件
```

---

## 3. Markdown 与 HTML 的映射关系

Markdown 最后会转换成 HTML：

| Markdown | HTML |
|---|---|
| `# 标题` | `<h1>标题</h1>` |
| `## 标题` | `<h2>标题</h2>` |
| 普通文字 | `<p>普通文字</p>` |
| `**加粗**` | `<strong>加粗</strong>` |
| `*斜体*` | `<em>斜体</em>` |
| `- 列表项` | `<ul><li>列表项</li></ul>` |
| `1. 列表项` | `<ol><li>列表项</li></ol>` |
| `[链接](https://example.com)` | `<a href="https://example.com">链接</a>` |
| `![说明](/image.jpg)` | `<img src="/image.jpg" alt="说明">` |
| `> 引用` | `<blockquote>引用</blockquote>` |
| `` `代码` `` | `<code>代码</code>` |
| 代码块 | `<pre><code>...</code></pre>` |

`mdx-components.tsx` 可以替换这些默认 HTML 元素的渲染方式和样式。
