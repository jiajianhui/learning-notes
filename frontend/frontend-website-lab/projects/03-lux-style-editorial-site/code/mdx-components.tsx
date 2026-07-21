// `mdx-components.tsx` 是 App Router 的 MDX 组件入口
// 用来统一配置 MDX 中标题、段落、链接等元素的渲染方式和样式。

import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {}

export function useMDXComponents(): MDXComponents {
    return components
}