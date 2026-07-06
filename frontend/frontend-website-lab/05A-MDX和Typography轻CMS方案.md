# 05A. MDX 和 Typography：先做一个文件型轻 CMS

## 问题背景

个人网站最后一定会遇到内容管理问题：

```text
文章要写在哪里？
项目复盘要怎么保存？
内容详情页要怎么排版？
以后接数据库前，能不能先有一个像 CMS 的写作体验？
```

如果一上来就进入后端、数据库和管理后台，学习重心会被拉走。

但如果一直把文章内容写死在 JSX 里，个人网站又很难长期更新。

所以在正式学习后端和数据库之前，可以加一个过渡阶段：

```text
MDX
+ Tailwind Typography 插件
+ 本地 content 目录
-> 文件型轻 CMS
```

它不是完整 CMS，但非常适合个人网站第一版。

主线先记这一条：

```text
本地数组适合做列表
MDX 适合写文章详情
Typography 插件适合统一文章排版
后端和数据库以后再负责真正的动态管理
```

官方参考：

- [Next.js MDX 文档](https://nextjs.org/docs/app/guides/mdx)
- [Tailwind Typography 插件](https://tailwindcss.com/docs/typography-plugin)

---

## 核心解释

### 1. MDX 是什么：Markdown 里可以写组件

Markdown 适合写文章。

比如：

```md
# 我的第一篇文章

这是正文。

- 一个观点
- 另一个观点
```

MDX 可以先理解成：

```text
Markdown
+ JSX / React 组件
```

也就是说，你可以在文章里写普通文本，也可以插入自己写的组件。

比如：

```mdx
# 我的项目复盘

这次项目主要练习了文章卡片和筛选。

<Callout>
  这个设计可以迁移到个人网站的文章列表。
</Callout>
```

这对个人网站很有用。

因为你的内容不只是纯文章，还可能包括：

- 项目截图
- 设计观察卡片
- 产品更新记录
- 代码片段
- 复盘提示块
- 作品展示组件

这些内容如果都写在后台富文本里，反而不一定灵活。

MDX 的优势是：

```text
文章仍然像 Markdown 一样好写
需要特殊展示时，又可以插入 React 组件
```

---

### 2. Typography 插件是什么：给文章 HTML 一套默认排版

Markdown 或 MDX 最后会变成 HTML。

比如：

```text
# 标题       -> h1
## 小标题    -> h2
正文         -> p
- 列表       -> ul / li
> 引用       -> blockquote
```

问题是，这些 HTML 标签默认样式很普通。

如果每篇文章都手动给 `h1`、`p`、`ul`、`blockquote` 加 Tailwind 类，会很累，也很乱。

Tailwind Typography 插件解决的是这件事：

```text
给一整块文章内容加一个 prose 类
-> 里面的标题、段落、列表、引用、代码块自动有一套阅读排版
```

大概像这样：

```tsx
export function ArticleBody({ children }: { children: React.ReactNode }) {
  return (
    <article className="prose prose-neutral max-w-none">
      {children}
    </article>
  );
}
```

以后 MDX 内容只要包在这个容器里，文章页就有统一的阅读样式。

如果有深色背景，可以用：

```tsx
<article className="prose prose-neutral dark:prose-invert max-w-none">
  {children}
</article>
```

如果图片、链接、代码需要更贴近个人网站气质，可以逐步加：

```tsx
<article className="prose prose-neutral max-w-none prose-a:text-black prose-img:rounded-lg">
  {children}
</article>
```

先不用急着自定义太多。

第一版只要让文章可读、统一、不破版。

---

### 3. 为什么它像轻 CMS：内容从页面代码里分离出来了

普通写法可能是这样：

```tsx
export default function Page() {
  return (
    <main>
      <h1>项目复盘</h1>
      <p>这里写正文。</p>
    </main>
  );
}
```

这种写法的问题是：

```text
页面结构
文章内容
样式细节
全部混在一个 TSX 文件里
```

内容一多，就很难维护。

用 MDX 之后，可以变成：

```text
content/articles/my-first-post.mdx
-> 只负责文章内容

app/articles/[slug]/page.tsx
-> 负责读取文章、渲染页面

components/article-body.tsx
-> 负责文章排版
```

这已经有一点 CMS 的味道：

| CMS 能力 | MDX 轻方案怎么模拟 |
|---|---|
| 写文章 | 在 `content/articles/*.mdx` 写 |
| 标题和描述 | 用 metadata 或 frontmatter 记录 |
| 文章详情页 | 用动态路由渲染 |
| 文章列表 | 读取本地文章索引 |
| 统一排版 | 用 Typography 的 `prose` |
| 特殊内容块 | 用 MDX 组件 |

它还没有后台、登录、数据库和在线编辑。

但对个人网站第一版来说，这已经足够接近真实内容流。

---

## 技术关系

### 1. 它应该放在学习路线的哪里

建议放在 `frontend-website-lab`，不要放进 `frontend-system-learning` 主线。

原因是：

```text
frontend-system-learning
-> 讲前端技术地图：HTML、CSS、JS、React、Vue、Vite、Next 这些层级关系

frontend-website-lab
-> 讲个人网站项目怎么做：视觉、内容、文章、项目、CMS 路线
```

MDX 和 Typography 不是前端基础层，也不是必须人人先学的通用概念。

它更像个人网站项目里的一个内容组织方案。

所以更适合放在这里：

```text
05. 内容怎么管理：现在先静态，未来再接后端
05A. MDX 和 Typography：先做一个文件型轻 CMS
06. 好用工具和 CMS：先借工具看清楚，再决定自己写什么
后面再单开：后端 / 数据库 / 自建 CMS
```

这条顺序比较顺：

```text
先用本地数组做列表
-> 用 MDX 写文章详情
-> 用 Typography 统一阅读排版
-> 看 Ghost / Payload / Directus 这些成熟 CMS
-> 后端阶段再自己做 API、数据库和后台
```

---

### 2. 推荐目录结构

在个人网站项目里可以先这样组织：

```text
app/
  articles/
    page.tsx
    [slug]/
      page.tsx
  projects/
    page.tsx
    [slug]/
      page.tsx

components/
  article-body.tsx
  callout.tsx
  project-screenshot.tsx

content/
  articles/
    first-post.mdx
    design-notes.mdx
  projects/
    personal-site.mdx

lib/
  content.ts

mdx-components.tsx
```

每个目录的职责：

| 目录 | 负责什么 |
|---|---|
| `content/` | 真正的文章和项目正文 |
| `app/` | 页面路由、列表页、详情页 |
| `components/` | 文章排版组件和 MDX 可插入组件 |
| `lib/content.ts` | 读取文章列表、slug、metadata |
| `mdx-components.tsx` | Next App Router 识别 MDX 全局组件的约定文件，放在项目根目录或 `src/` 下 |

不要把所有内容都塞在 `app/` 里。

更好的习惯是：

```text
内容放 content
页面放 app
样式和复用块放 components
读取逻辑放 lib
MDX 全局映射放根目录的 mdx-components.tsx
```

这样以后换成数据库时，页面结构不会大改。

你主要是把：

```text
读取本地 MDX
```

替换成：

```text
请求 API / 查询数据库
```

---

### 3. 最小实现思路

当前项目是 Next.js + Tailwind 4，可以先按这个方向理解。

安装 MDX 相关包：

```bash
pnpm add @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
```

安装 Typography 插件：

```bash
pnpm add -D @tailwindcss/typography
```

Next 配置大概是：

```js
import createMDX from "@next/mdx";

const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
```

App Router 下还需要一个 `mdx-components.tsx` 文件，用来告诉 Next 全局 MDX 组件怎么映射：

```tsx
import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
```

Tailwind 4 里可以在全局 CSS 里接入插件：

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

如果以后遇到 Tailwind 3，Typography 通常会在 `tailwind.config.*` 的 `plugins` 里注册。

这里不用急着背配置。

现在先知道：

```text
@next/mdx
-> 让 Next 能处理 .mdx 文件

mdx-components.tsx
-> 定义 MDX 里的全局组件映射

@tailwindcss/typography
-> 提供 prose 文章排版类
```

---

### 4. 内容 metadata 怎么处理

文章列表通常需要这些信息：

```text
title
description
date
tags
cover
featured
```

有两种常见做法。

第一种：在 MDX 里导出 metadata。

```mdx
export const metadata = {
  title: "我的第一篇文章",
  description: "记录个人网站第一版的内容结构。",
  date: "2026-07-06",
  tags: ["personal-site", "mdx"],
};

# 我的第一篇文章

这里是正文。
```

第二种：使用 frontmatter。

```md
---
title: 我的第一篇文章
description: 记录个人网站第一版的内容结构。
date: 2026-07-06
tags:
  - personal-site
  - mdx
---

# 我的第一篇文章
```

要注意：`@next/mdx` 默认不直接处理 frontmatter。

如果想用 frontmatter，需要额外接 `gray-matter`、`remark-frontmatter` 或类似方案。

对你现在的学习阶段，我建议先用最简单的方式：

```text
文章正文用 MDX
列表数据先用一个本地 articles.ts 管
等个人网站文章数量多了，再抽读取逻辑
```

比如：

```ts
export const articles = [
  {
    slug: "first-post",
    title: "我的第一篇文章",
    description: "记录个人网站第一版的内容结构。",
    date: "2026-07-06",
    tags: ["personal-site", "mdx"],
  },
];
```

这比一开始就折腾文件扫描、frontmatter 解析更稳。

---

### 5. MDX 里适合放哪些组件

不要一开始把 MDX 玩得太复杂。

个人网站第一版只需要准备少量组件：

| 组件 | 用途 |
|---|---|
| `Callout` | 放重点提示、复盘结论 |
| `ProjectImage` | 展示项目截图和说明 |
| `CompareBlock` | 对比参考站和自己的实现 |
| `LinkCard` | 链接到产品、文章或项目 |
| `CodeNote` | 解释一段代码为什么这样写 |

文章里可以这样用：

```mdx
import { Callout } from "@/components/callout";

# 个人网站内容结构复盘

这次我先把文章内容从页面代码里拆出来。

<Callout>
  MDX 适合做个人网站第一版，因为它让内容独立出来，但还不需要后台。
</Callout>
```

学习重点不是组件数量，而是边界清楚：

```text
文章表达
-> 写在 MDX

统一排版
-> 交给 ArticleBody 和 prose

特殊视觉块
-> 做成少量可复用组件
```

---

## 学习建议

### 1. 先做一条完整内容链路

不要第一天就追求完整 CMS。

先做这一条链路：

```text
content/articles/first-post.mdx
-> app/articles/[slug]/page.tsx
-> ArticleBody
-> prose 排版
-> 页面能正常阅读
```

然后再做文章列表：

```text
articles.ts
-> app/articles/page.tsx
-> ArticleCard
-> 点击进入详情页
```

只要这条链路跑通，你就已经拥有个人网站第一版的内容系统。

---

### 2. 不要把 MDX 当后台

MDX 很适合个人写作和项目复盘，但它不是后台。

它做不到这些事：

- 登录后在线编辑
- 多用户协作
- 权限管理
- 数据库存储
- 图片上传管理
- 发布审核流程

这些留给后端、数据库和真正的 CMS。

现在 MDX 的价值是：

```text
让你在不学后端的情况下，
提前体验“内容和页面分离”的网站结构。
```

---

### 3. 练习项目里怎么安排

建议在 `projects/05-personal-lux-style-site/` 里正式使用 MDX。

前四个临摹项目仍然可以保持简单：

```text
Funes
-> 本地数组、列表密度

AeroPrecipe
-> 本地数据、筛选、卡片

Lux
-> 文章卡片、图片节奏、内容站气质

Making Software
-> 叙事段落、视觉表达
```

到个人网站项目时，再把内容系统接进来：

```text
个人网站
-> articles 列表
-> projects 列表
-> MDX 详情页
-> Typography 阅读排版
```

这样不会让前面的练习过重，也能让最后的个人网站更接近长期可维护版本。

---

## 小结

MDX 和 Typography 插件应该作为个人网站前端阶段的一章单独讲。

它的位置在：

```text
本地数据之后
成熟 CMS 之前
后端和数据库之前
```

它解决的是：

```text
我还没有后端，
但我已经想认真管理文章和项目内容。
```

这一章学完后，你应该能看懂这条路线：

```text
本地数组
-> MDX 文件
-> Typography 统一排版
-> 成熟 CMS 观察
-> Node.js + Express + PostgreSQL
-> 自建小型内容系统
```

这就是个人网站从静态页面走向长期内容系统的中间桥梁。
