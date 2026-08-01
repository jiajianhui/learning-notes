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

### Hover 时缩短消失的下划线

核心原理：使用 `::after` 伪元素模拟下划线，而不是直接在文字上添加下划线；`transform: scaleX()` 改变它的长度，`transform-origin` 控制变化方向。

Tailwind 也能实现，但写法不够清晰明了，所以这里直接使用 CSS。

### `@keyframes` 的两种写法

`from` 等于 `0%`，`to` 等于 `100%`，下面两种写法效果相同：

```css
@keyframes enter {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes enter {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

`animation` 简写顺序：动画名称、持续时间、速度曲线、延迟时间、结束状态。

```css
animation: postsAnimation 0.3s ease-out 0.5s forwards;
```

`forwards`：动画播放完成后，保持最后一帧的样式。

### HeroScrollIndicator 的对齐方式

`HeroScrollIndicator` 的父元素使用 `flex flex-col`，主轴是上下方向，由 `justify-center` 控制；交叉轴是左右方向，由 `items-center` 控制。组件设置 `absolute bottom-10` 后，上下位置由 `bottom-10` 决定，不再受 `justify-center` 影响；由于没有设置 `left`、`right`，左右位置仍受 `items-center` 影响，因此能与箭头保持横向居中。

- `relative`：元素仍占据原来的空间，相对自己的原位置偏移，也能作为绝对定位子元素的参照。
- `absolute`：元素脱离布局；父元素设置了定位时，相对父元素确定位置。它不参与 Flex 排版，在没有设置 `top`、`right`、`bottom`、`left` 时，默认位置仍会受父级 Flex 对齐方式影响。

### HeroScrollIndicator 点击滚动

点击按钮后，通过 `document.querySelector(".postGrid")` 找到目标元素，再调用 `scrollIntoView({ behavior: "smooth" })` 平滑滚动到该位置。`?.` 表示只有找到元素时才执行。

### Header：向下滚动隐藏，向上滚动出现

这个交互同时判断滚动位置和滚动方向：

```text
页面顶部 100px 以内       → Header 始终显示
超过 100px 并向下滚动     → Header 隐藏
超过 100px 并向上滚动     → Header 立即出现
```

`window.scrollY` 是当前滚动位置，`preScroll.current` 保存上一次滚动位置。比较两个数字就能判断滚动方向：

```tsx
const isHidden = () => {
  if (window.scrollY <= 100) {
    setHidden(false);
  } else if (window.scrollY > preScroll.current) {
    setHidden(true);
  } else if (window.scrollY < preScroll.current) {
    setHidden(false);
  }

  preScroll.current = window.scrollY;
};
```

页面顶部时，`window.scrollY` 和 `preScroll.current` 都是 `0`。滚动后，作为实时数据的 `window.scrollY` 会先变化，而作为储存数据的 `preScroll.current` 仍是滚动前的位置，所以比较两者就能判断方向；判断后再用当前的 `window.scrollY` 更新 `preScroll.current`。

### Header 透明度动画与背景模糊

父元素的 `opacity` 动画会创建独立的合成层，导致子元素的 `backdrop-blur` 无法正确获取页面背景。把透明度动画和 `backdrop-blur` 放在同一个元素上即可。

### 定位布局的三个基本信息

- **定位方式**：`relative`、`absolute`、`fixed` 等，决定元素采用什么定位规则、相对谁定位。
- **尺寸**：`width`、`height`、`w-screen`、`h-screen` 等，决定元素本身有多大。
- **位置**：`top`、`right`、`bottom`、`left`、`inset` 等，决定元素放在哪里。

三者在布局中缺一不可：定位方式决定参照，尺寸决定大小，位置决定落点。比如 `fixed w-screen h-screen` 只有定位方式和尺寸，没有指定位置；全屏遮罩使用 `fixed inset-0`，才能明确从视窗四边的 `0` 位置铺满。

### `useRef` 和 `useState`：一个保存值，一个更新页面

`useRef(0)` 返回的是 `{ current: 0 }` 这样的 Ref 对象，因此读取和修改里面的值都要使用 `.current`。

`useRef` 适合保存不需要显示在页面上的数据，修改时不会触发重新渲染；`useState` 适合保存会影响页面显示的数据，修改后会触发重新渲染。

### PostGrid 设计思路

1. **布局设计**：外层使用 Flex 换行，每张卡片通过 `flex-basis` 设置初始宽度比例，再用 `:nth-of-type(17n + N)` 让这组不规则布局每 17 张重复一次。`flex-grow: 1` 表示一行没有排满时，这一行的卡片会继续变宽，把剩下的空白占满。
2. **Link 充满格子**：Link 默认是 `inline`，需要转为 `block`，才能通过宽高撑满整个格子，同时让整张卡片都可以点击。
3. **图片充满但不变形**：PostGrid 使用普通 `<img>`，通过 `size-full` 让图片盒子铺满 Link，再用 `object-cover` 让实际图片保持原始比例并裁切多余部分。当图片与盒子的宽高比不同时，超出盒子的部分不会显示。
4. **Hover 放大动画**：`hover:scale-110` 设置悬停后的放大效果，`transition-transform` 让变化产生动画，`duration-500` 和 `ease-out` 分别控制时长和节奏。给 Link 添加 `group`、图片使用 `group-hover:scale-110` 后，鼠标移到 Link 内的文字上也能触发图片动画，不需要禁用文字的鼠标事件。
5. **底部渐变遮罩**：`bg-linear-to-t from-black/80 from-0% to-transparent to-50%` 表示从底部的半透明黑色向上渐变，到容器中间变为完全透明，顶部区域保持透明。
6. **圆角边缘出现杂色**：`rounded` 配合 `overflow-hidden` 裁切时会产生半透明的抗锯齿像素，并混入 Link 的背景色。

### PostGrid 用 `<img>`，HeroSlide 用 `<Image>`

`Image` 使用 `fill` 时，如果没有设置 `sizes`，Next.js 会默认按 `100vw` 选择图片。如果图片实际宽度小于视口宽度的 60%，开发环境会提示缺少 `sizes` 的性能警告；这是警告，不是运行错误。

`Image` 使用 `width` 和 `height` 时，这两个属性会提供图片宽高比，也会影响 Next.js 生成的图片分辨率。CSS 决定图片实际显示多大；如果设置的宽高过小，Next.js 生成的候选图片分辨率可能不足，最终显示就会发虚。

- **PostGrid 使用 `<img>`**：卡片宽度不规则，使用 `<Image>` 还要维护复杂的 `sizes`。普通 `<img>` 配合 `size-full object-cover` 更简单；`loading="lazy"` 让图片接近可视区域时才加载，减少首屏请求和流量；`decoding="async"` 让浏览器异步解码图片，尽量避免阻塞其他内容显示。
- **HeroSlide 使用 `<Image>`**：它是全屏首图。没有写 `sizes` 时，Next.js 默认按 `100vw` 处理，刚好符合实际宽度，所以不会警告。

## 05、这次学到的 Tailwind 写法

- 当 `loop={false}` 并到达第一张或最后一张时，Swiper 会自动给无法继续切换的按钮添加 `swiper-button-disabled` 类。
- `[&.swiper-button-disabled]:opacity-[0.35]` 是 Tailwind 任意变体：`&` 代表当前元素，表示按钮有这个类时将透明度设为 `0.35`。

### `flex-1` 和 `grow`

`flex-1` 会同时设置放大、缩小和基础宽度，适合让元素重新分配父容器的剩余空间。`grow` 只设置 `flex-grow: 1`，会保留元素原本的宽度，有多余空间时再变宽。

### `flex-col-reverse`

`flex-col-reverse` 会让 Flex 子元素纵向排列，并反转它们的显示顺序：DOM 中先写的元素显示在下方，后写的元素显示在上方。

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

## 11、MDX 文章排版复用原则

第一篇文章详情页不只是完成一篇文章，而是建立后续文章共同使用的排版规范。

- 新文章优先复用现有排版和组件，不从头调整。
- 无法直接复用时，先在现有规范上做少量调整。
- 通用样式和组件统一写在 `mdx-components.tsx`。
- 只有单篇文章特有的布局才写在对应的 MDX 中；再次出现时就提取成通用组件。
