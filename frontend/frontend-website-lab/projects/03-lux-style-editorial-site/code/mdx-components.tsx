// `mdx-components.tsx` 是 App Router 的 MDX 组件入口
// 用来统一配置 MDX 中标题、段落、链接等元素的渲染方式和样式。

import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  h2: ({ children }) => (
    <div className="flex justify-center">
      <h2 className="font-sans font-bold text-4xl leading-relaxed mb-4 w-1/2">
        {children}
      </h2>
    </div>
  ),

  p: ({ children }) => (
    <div className="flex justify-center">
      <p className="font-serif text-2xl leading-relaxed mb-12 w-1/2">
        {children}
      </p>
    </div>
  ),

  a: ({ children, ...props }) => (
    <a
      {...props}
      className="italic underline underline-offset-2 decoration-2 cursor-pointer hover:opacity-50"
      target="_blank"
    >
      {children}
    </a>
  ),
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
    return components
}