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

  // 注册自定义组件
  ArticleFigure,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
    return components
}

type ArticleFigureProps = {
  images: string[];
  caption?: string
};

// 自定义组件
function ArticleFigure({ images, caption }: ArticleFigureProps) {

    const isSingle = images.length === 1

    return (
      <div className={`${isSingle ? "w-1/2" : "w-4xl"} mx-auto mb-10`}>
        
        {/* 图片 */}
        <div className={`${isSingle ? "" : " grid grid-cols-2 gap-4"}`}>
          {images.map((src, index) => (
            <img key={index} className="mb-4 w-full" src={src} alt="" />
          ))}
        </div>

        {/* 文字 */}
        {caption && (
          <p className="px-10 text-center text-sm text-gray-500">{caption}</p>
        )}
      </div>
    );
}
