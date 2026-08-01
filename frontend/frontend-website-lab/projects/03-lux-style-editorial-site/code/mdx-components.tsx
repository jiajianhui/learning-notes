// `mdx-components.tsx` 是 App Router 的 MDX 组件入口
// 用来统一配置 MDX 中标题、段落、链接等元素的渲染方式和样式。

import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  h2: ({ children }) => (
    <div className="w-full lg:w-1/2 mx-auto px-6 lg:px-0">
      <h2 className="font-sans font-bold text-3xl lg:text-4xl leading-relaxed mb-1 lg:mb-4">
        {children}
      </h2>
    </div>
  ),

  p: ({ children }) => (
    <div className="w-full lg:w-1/2 mx-auto px-6 lg:px-0">
      <p className="font-serif text-xl lg:text-2xl leading-relaxed mb-8 lg:mb-12">
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
  ArticleGallery,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
    return components
}

type ArticleFigureProps = {
  images: [string] | [string, string] | [string, string, string];
  caption?: string;
};

// 自定义组件

// 单图、两图、三图展示组件（带描述）
function ArticleFigure({ images, caption }: ArticleFigureProps) {

    const imageCount = images.length
    
    const widthClass = imageCount === 1 ? "w-full lg:w-1/2" : "w-full lg:w-4xl";
    const gridClass = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
    }[imageCount];

    return (
      <div className={`${widthClass} px-6 lg:px-0 mx-auto mb-6 lg:mb-10`}>
        {/* 图片 */}
        <div className={`grid ${gridClass} gap-1.5 lg:gap-2.5 mb-2 lg:mb-4`}>
          {images.map((src, index) => (
            <img key={index} className="w-full" src={src} alt="" />
          ))}
        </div>

        {/* 文字 */}
        {caption && (
          <p className="px-5 lg:px-10 text-center text-sm text-gray-500">{caption}</p>
        )}
      </div>
    );
}


type ArticleGalleryProps = {
    images: string[];
    cols: 2 | 3;
    caption?: string;
};
// 多图，2列或3列
function ArticleGallery({ images, cols, caption }: ArticleGalleryProps) {

    const colsClass = cols === 2 ? "grid-cols-2" : "grid-cols-3";
    
    return (
      <div className="w-full lg:w-4xl px-6 lg:px-0 mx-auto mb-10">
        {/* 图片 */}
        <div className={`grid ${colsClass} gap-1.5 lg:gap-2.5 mb-4`}>
          {images.map((src, index) => (
            <img key={index} className="w-full" src={src} alt="" />
          ))}
        </div>

        {/* 文字 */}
        {caption && (
          <p className="px-10 text-center text-sm text-gray-500">{caption}</p>
        )}
      </div>
    );
}
