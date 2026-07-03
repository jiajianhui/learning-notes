# 项目复盘

## 01、参考网站
- URL：https://aeroprecipe.com/

- 给人感觉：干净、温暖、可爱、有趣、秩序


## 02、设计观察

- 整体暖色系、手绘风格的插画、个性的字体营造温暖、可爱的视觉风格
- 全局暖白色，采用淡淡的牙黄色突出层级，整体页面干净
- 卡片样式统一、交互状态统一（顶部灰色描边，hover时变为黑色）
- 滚动到卡片页面时有吸顶效果，强化了筛选功能

## 03、最终做出来的页面
- 首页完成度：ok
- 移动端完成度：ok
- 桌面端完成度：ok


## 04、开发过程中的收获

* 制作横向滚动卡片时，卡片需要设置固定宽度、最小宽度或 `shrink-0`（禁止压缩）。否则，卡片可能被压缩到父容器内，无法产生横向溢出，也就无法形成滚动效果。

* `<a>` 的 `aria-label`：当链接没有可见文字，或可见文字不足以说明用途时，为屏幕阅读器提供更明确的链接名称。若链接文字本身已经清晰，通常不需要额外添加。

* `<a>` 的 `title`：鼠标悬停时显示补充提示，但不能代替清晰的链接文字或 `aria-label`，而且在触屏设备上不一定能够显示。

* `<img>` 的 `alt`：为图片提供替代文本，既可供屏幕阅读器读取，也可能在图片加载失败时显示。若图片只是装饰，应使用 `alt=""`，让屏幕阅读器忽略它。
  
* 短路渲染：`item.icon && (...)` 表示只有 `item.icon` 有值时，才渲染后面的元素。
  
* 数据控制布局和样式：将 `layout`、`optionWidth` 等 Tailwind 类名存入数据，遍历时通过 `group.layout`、`group.optionWidth` 动态读取，使不同分组可以复用同一套 JSX 结构。
  
* 动态 `className` 拼接：使用模板字符串，将固定的 Tailwind 类名和动态类名组合起来，例如`flex ${group.optionWidth}`。
  
* Next.js `Image` 尺寸处理：`width` 和 `height` 提供图片比例，`1 × 1` 表示正方形；`size-4` 控制图片实际显示尺寸。
  
* Next.js 动态路由：使用 `[参数名]` 作为目录名，例如 `[id]`、`[slug]`。中括号里的名称可以自定义，但目录名使用 `[slug]` 时，详情页中就必须通过 `params.slug` 读取动态参数。

  * 动态详情页：多个不同内容的详情页可以共用同一个页面文件，通过 URL 中的动态参数查找并展示对应的数据。

  * `slug`：行业中常用的命名，表示适合放进 URL 的可读字符串。通常由标题转换而来，规则包括：转为小写、空格替换为 `-`、去掉引号和括号等特殊符号。`title` 用于页面展示，`slug` 用于路由跳转，`id` 用于唯一标识数据。

    ```text
    James Hoffmann's Ultimate AeroPress Recipe
    ↓
    james-hoffmanns-ultimate-aeropress-recipe
    ```

* 普通函数的参数可以是任何类型；React 函数组件则按照 React 的设计，只接收一个统一的 `props` 对象，传入组件的所有属性都会被收集到这个对象中。
  
* 自定义类型通常用 `export type` 导出、再用 `import type` 引入，不要默认做成全局类型。

* `props` 是组件收到的整个数据对象，`params` 是其中保存路由参数的属性，`Promise` 表示“稍后才会拿到结果”，`resolve` 表示这个结果已经成功产生。


* 默认导出与具名导出：默认导出使用 `export default`，一个文件只能有一个，导入时不加 `{}`，名称可以自定义；具名导出使用 `export`，一个文件可以有多个，导入时需要加 `{}`，名称默认与导出名称一致。

  ```tsx
  // 默认导出
  export default RecipeCard;
  import RecipeCard from "./RecipeCard";

  // 具名导出
  export { RecipeCard };
  import { RecipeCard } from "./RecipeCard";

  // 具名导入重命名
  import { RecipeCard as Card } from "./RecipeCard";
  ```
* type 里面：类型规则，用分号，const 对象里面：真实数据，用逗号
* 对象取值：知道属性名就用点 `.`，属性名来自变量就用中括号 `[]`。methodMap.standard（固定取 standard）methodMap[recipe.overview.brew.method].name（根据 method 的值动态取）
  
* 关于滚动吸顶：
  * 普通 sticky：`sticky top-0 self-start`。元素先正常参与布局，滚到 `top-0` 后吸住；吸顶范围受父容器边界限制。当父容器底边滚到 sticky 元素底部附近时，sticky 元素会被父容器带着离开视口。
  * 侧栏 sticky：`sticky top-0 h-screen overflow-y-auto`。元素从一开始就是一屏高，滚到 `top-0` 后顶部贴住视口；因为高度刚好等于屏幕，所以视觉上像固定侧栏。内容超出一屏时，会在侧栏内部滚动。本质还是 sticky，不是 fixed。

* `iframe` 嵌入视频：外层用 `aspect-video w-full` 决定视频区域比例和宽度，里面的 `iframe` 用 `w-full h-full` 填满外层盒子。`title` 用来给 iframe 提供可访问名称，`loading="lazy"` 可以延迟加载视频。


## 05、这次学到的 Tailwind 写法

* Tailwind 采用移动端优先的响应式规则。没有断点前缀的样式默认作用于所有尺寸，带有 `md:` 的样式会从 `md` 断点开始覆盖相同的 CSS 属性。例如，`pt-40 md:p-10` 中，`md:p-10` 会在 `md` 及以上尺寸同时设置四个方向的 `padding`，因此会覆盖原来的 `padding-top`。

* `fixed`：元素从一开始就相对浏览器视口固定，不随页面滚动。

* `sticky`：元素先参与正常布局，滚动到指定位置后再吸附固定，通常需要配合 `top-0` 等定位属性。

* Flex 子元素未设置固定宽度时，默认 `flex-basis: auto`（会参考 `width`；未设置 `width` 时，其默认值为 `auto`，因此根据内容计算初始宽度）。同时默认 `flex-shrink: 1`（空间不足时允许压缩），所以元素仍可能被挤窄；设置 `shrink-0`（禁止压缩）可以保持其初始宽度。

* 在 `style` 中定义的 CSS 变量会声明在当前元素上，并且默认可以被它的后代元素继承和使用。

* 动态设置背景图片、尺寸和位置：通过 `style` 根据当前 `card` 数据写入背景图片和 CSS 变量，再由 Tailwind 在不同响应式断点读取对应变量并应用样式。

* `w-px`：设置元素宽度为 `1px`。

* `pointer-events-none` 不接收鼠标点击，点击事件会穿透到下面的 `select`。

* `top-1/2` 元素顶部位于父元素高度的 50%，也就是先把图标顶部放到父元素垂直中线。
* `-translate-y-1/2` 向上移动自身高度的 50%，让图标真正垂直居中。

* `ring` 就是在元素外面加一圈不占布局空间的高亮描边，它的变化不会导致位置抖动。


* 不同尺寸图片的统一显示：外层使用固定尺寸盒子包裹 `Image`，盒子设置 `relative size-10`，`Image` 使用 `fill`、`sizes="40px"` 和 `object-contain`。
  * 外层盒子：决定图片在页面上的展示区域大小
  * `relative`：给里面的 `Image fill` 提供定位参照
  * `fill`：让图片铺满外层盒子的范围，底层类似 `position: absolute; inset: 0;`
  * `inset: 0`：等价于 `top: 0; right: 0; bottom: 0; left: 0;`，表示上下左右都贴住父级
  * `sizes="40px"`：告诉 Next/浏览器这张 `fill` 图片大约按 `40px` 宽来加载资源，避免下载过大的图片
  * `object-contain`：保持图片原比例，完整显示，不裁剪、不变形

  ```tsx
  <div className="relative size-10">
    <Image
      src={item.image}
      fill
      sizes="40px"
      alt=""
      className="object-contain"
    />
  </div>
  ```

* `self-start`：用于 flex 子元素，避免被父级默认拉伸，保持自身高度，并从顶部开始对齐。
  

## 06、能迁移到个人网站的点
- 网格布局
- 响应式设计
- 手绘元素的视觉风格、配色处理
- 动态路由
- 动态标签页标题
- 背景模糊处理
- 滚动卡片的效果

## 07、开发问题记录
无
