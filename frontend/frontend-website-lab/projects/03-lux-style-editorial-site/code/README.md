# 项目复盘

## 01、参考网站
- URL：https://www.lux.camera/

- 给人感觉：


## 02、设计观察

- 
## 03、最终做出来的页面
- 


## 04、开发过程中的收获

### 鼠标滚动动画

`bottom-2` 等于 `bottom: 8px`。它会固定绝对定位元素的底边，所以动画把 `height` 从 `8px` 变成 `0` 时，底边不动，顶部向下收缩。

```text
设置 top    → 顶部不动，底部向上收缩
设置 bottom → 底部不动，顶部向下收缩
```

```css
@keyframes scroll-wheel {
  0%   { height: 8px; transform: translateY(-100%); }
  25%  { height: 8px; transform: translateY(0); }
  50%  { height: 0; transform: translateY(0); }
  100% { height: 0; transform: translateY(0); }
}
```

动画节奏：线条进入 → 顶部向下收缩 → 保持消失，等待下一轮。

### `relative` 和 `absolute`

- `relative`：元素仍占据原来的空间，可以相对原位置偏移，也能作为子元素的定位参照。
- `absolute`：元素不占原来的位置；父元素有 `relative` 时，`top`、`right`、`bottom`、`left` 都以父元素为准。

当前组件中，鼠标外框使用 `relative`，内部滚轮使用 `absolute`，所以滚轮的位置以鼠标外框为参照。

### PostGrid 设计思路

1. **布局设计**：外层使用 Flex 换行，每张卡片通过 `flex-basis` 设置初始宽度比例，再用 `:nth-of-type(17n + N)` 让这组不规则布局每 17 张重复一次。`flex-grow: 1` 表示一行没有排满时，这一行的卡片会继续变宽，把剩下的空白占满。
2. **Link 充满格子**：Link 默认是 `inline`，需要转为 `block`，才能通过宽高撑满整个格子，同时让整张卡片都可以点击。
3. **图片充满但不变形**：可以把 Image 理解为“图片元素的盒子”和“盒子里的实际图片内容”。`fill` 底层类似 `position: absolute; inset: 0`，控制图片元素的盒子铺满 Link；`object-cover` 控制实际图片内容保持原始比例铺满盒子。当图片与盒子的宽高比不同时，超出盒子的部分不会显示。
4. **Hover 放大动画**：`hover:scale-110` 设置悬停后的放大效果，`transition-transform` 让变化产生动画，`duration-500` 和 `ease-out` 分别控制时长和节奏。给 Link 添加 `group`、图片使用 `group-hover:scale-110` 后，鼠标移到 Link 内的文字上也能触发图片动画，不需要禁用文字的鼠标事件。
5. **底部渐变遮罩**：`bg-linear-to-t from-black/80 from-0% to-transparent to-50%` 表示从底部的半透明黑色向上渐变，到容器中间变为完全透明，顶部区域保持透明。
6. **圆角边缘出现杂色**：`rounded` 配合 `overflow-hidden` 裁切时会产生半透明的抗锯齿像素，并混入 Link 的背景色。

## 05、这次学到的 Tailwind 写法

- 当 `loop={false}` 并到达第一张或最后一张时，Swiper 会自动给无法继续切换的按钮添加 `swiper-button-disabled` 类。
- `[&.swiper-button-disabled]:opacity-[0.35]` 是 Tailwind 任意变体：`&` 代表当前元素，表示按钮有这个类时将透明度设为 `0.35`。

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

## 10、MDX 编辑要点：内容写 Markdown，样式交给组件

- **内容与布局**：标题、段落、链接优先写 Markdown；Hero、Grid、图库等 Markdown 无法表达的布局再写 JSX。
- **段落识别**：普通换行仍属于同一个 `p`；中间空一整行才会生成两个 `p`。段落内部的换行交给浏览器处理。
- **组件映射**：Markdown 标题、段落、链接和图片会分别映射到 `h1`、`p`、`a`、`img`，公共样式统一写在 `mdx-components.tsx`，并会影响所有 MDX 文件。
- **映射边界**：Markdown 转换出的元素会使用 `mdx-components.tsx` 映射；直接写 `<p>`、`<span>` 等小写 JSX 时使用原生 HTML 元素，不经过映射；写 `<Caption>` 等大写 JSX 时才会查找同名自定义组件。
- **自定义组件注册**：`Caption` 本质上是普通 React 组件；将它注册到 `components` 后，MDX 中可以直接写 `<Caption>...</Caption>`，不需要再次 `import`，组件名和大小写必须一致。
- **注册名简写**：`components` 中的 `Caption,` 是 `Caption: Caption` 的对象属性简写；左边代表 MDX 使用的名称，右边代表实际的 React 组件，也可以写成 `ImageCaption: Caption` 并在 MDX 中使用 `<ImageCaption>`。
- **链接传参**：自定义 `a` 时必须保留 `{...props}`，否则会丢失 `href`，链接无法跳转。
- **链接语法**：使用 `[文字](https://example.com/)`，地址只包一层括号，也不要把链接地址留空。
- **MDX 分区**：文件顶部的 `import/export` 与下面的 Markdown 正文之间空一行，避免解析错误。
- **编辑器限制**：Emmet 只能提供标签快速展开，MDX 的组件自动导入、Props 和 TypeScript 提示仍不如 TSX；复杂组件更适合在 `.tsx` 中开发。
