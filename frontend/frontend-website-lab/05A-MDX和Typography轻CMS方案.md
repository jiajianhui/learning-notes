# 05A. MDX 和 Typography：先做一个文件型轻 CMS

## 这篇笔记解决什么问题

个人网站做完列表页以后，很快会遇到几个问题：

```text
文章正文写在哪里？
项目复盘怎么长期保存？
每篇文章的标题、段落和代码块都要自己写样式吗？
还没学习数据库，能不能先把内容和页面分开？
```

这篇笔记给出的过渡方案是：

```text
本地 MDX 文件
+ Tailwind Typography
+ Next.js 页面路由
-> 文件型轻 CMS
```

它不是真正的 CMS，没有后台、登录和数据库。

它解决的是更适合当前阶段的问题：

> 先把文章内容从页面 JSX 中拆出来，同时保留插入 React 组件的能力。

官方参考：

- [Next.js MDX 文档](https://nextjs.org/docs/app/guides/mdx)
- [Tailwind Typography 插件](https://tailwindcss.com/docs/typography-plugin)

---

## 先记住完整主线

```text
content/articles/first-post.mdx
-> @next/mdx 把内容编译成 React 组件
-> mdx-components.tsx 决定特殊元素怎么渲染
-> app/articles/first-post/page.tsx 组成文章页面
-> ArticleBody 的 prose 提供统一阅读排版
-> 浏览器显示最终文章
```

这条链路里，每个部分只负责一件事。

| 部分 | 负责什么 |
|---|---|
| `content/*.mdx` | 写文章正文 |
| `@next/mdx` | 把 MDX 编译成 React 组件 |
| `mdx-components.tsx` | 定义 MDX 元素和 React 组件的全局映射 |
| `components/mdx/` | 存放实际的文章排版组件和特殊内容组件 |
| `ArticleBody` | 用 `prose` 包住整篇文章，提供统一排版 |
| `app/` | 决定文章对应哪个 URL，并组成最终页面 |

后面如果看乱了，就回来对照这张表。

---

## 1. MDX：让 Markdown 里也能使用 React 组件

### 1.1 Markdown 适合写正文

普通 Markdown 可以写：

```md
# 我的第一篇文章

这是正文。

- 一个观点
- 另一个观点
```

它比把正文写成一大段 JSX 更适合长期维护。

### 1.2 MDX 比 Markdown 多了什么

MDX 可以先理解成：

```text
Markdown
+ JSX
+ JavaScript 表达式
+ React 组件
```

例如：

```mdx
# 我的项目复盘

这是普通的 **Markdown**。

<div className="rounded-xl bg-black p-6 text-white">
  这是直接写在 MDX 里的 JSX。
</div>

1 + 2 = {1 + 2}
```

还可以插入自己写的组件：

```mdx
import { Callout } from "@/components/mdx/callout";

# 我的项目复盘

<Callout>
  这个设计可以迁移到个人网站的文章列表。
</Callout>
```

因此 MDX 很适合这些内容：

- 文章和项目复盘
- 项目截图及说明
- 设计观察卡片
- 代码片段
- 重点提示块
- 产品更新记录

---

## 2. Typography：一次处理整篇文章的基础排版

### 2.1 MDX 最后仍然会变成 HTML

```text
# 标题       -> h1
## 小标题    -> h2
正文         -> p
- 列表       -> ul / li
> 引用       -> blockquote
```

Tailwind 的基础样式会重置浏览器默认排版。

所以 MDX 已经成功渲染时，标题也可能看起来和正文差不多，列表符号也可能消失。这不是 MDX 出错，而是还没有提供文章排版样式。

### 2.2 `prose` 做了什么

Tailwind Typography 提供 `prose` 类：

```tsx
<article className="prose prose-neutral max-w-none">
  {children}
</article>
```

只要文章内容在这个容器里，插件就会统一处理内部的：

- `h1`、`h2`、`h3`
- `p`
- `ul`、`ol`、`li`
- `blockquote`
- `a`
- `img`
- `code`、`pre`

第一版先使用 Typography 的默认排版，不需要马上为每个元素手写 Tailwind 类。

---

## 3. 最容易混淆的两个文件

### 3.1 `ArticleBody`：整篇文章的排版外壳

可以把它理解成“文章专用的 Layout”：

```tsx
import type { ReactNode } from "react";

type ArticleBodyProps = {
  children: ReactNode;
};

export function ArticleBody({ children }: ArticleBodyProps) {
  return (
    <article className="prose prose-neutral max-w-none">
      {children}
    </article>
  );
}
```

它的职责是：

- 用 `prose` 给整篇文章提供基础排版
- 集中调整链接、图片、代码块和暗色模式
- 让所有文章共用一套阅读样式
- 把文章样式限制在正文区域，不影响导航和普通页面

`ArticleBody` 不是 Next.js 的固定名称，也不是路由约定文件。

它只是普通 React 组件，可以叫：

```text
ArticleBody
ArticleContent
MdxContent
Prose
```

这篇笔记统一使用 `ArticleBody`，因为它能直接表达“文章正文容器”。

### 3.2 `mdx-components.tsx`：MDX 的全局组件字典

MDX 会把这些内容：

```mdx
# 标题

[查看文章](/articles)

<Callout>重要提示</Callout>
```

转换成类似这样的 React 元素：

```tsx
<h1>标题</h1>
<a href="/articles">查看文章</a>
<Callout>重要提示</Callout>
```

`mdx-components.tsx` 决定这些名称最终使用哪个 React 组件：

```tsx
import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/callout";

const components = {
  Callout,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
```

它常用来：

- 把普通链接换成自定义链接组件
- 把图片换成基于 `next/image` 的组件
- 给标题增加锚点
- 注册 `Callout` 等全局 MDX 组件

在 App Router 中：

- `mdx-components.tsx` 文件名是 Next.js 约定，不能随意改名
- `useMDXComponents` 导出名称也是固定的
- 文件放在项目根目录；如果项目使用 `src/`，则放在 `src/` 根部

刚接入 MDX 时，它可以是空映射：

```tsx
import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
```

空映射表示继续使用默认的 `h1`、`p`、`a` 等元素，不代表 MDX 没有配置成功。

### 3.3 两者怎么分工

```text
普通标题、段落、列表的基础样式
-> ArticleBody + Typography prose

链接、图片等元素需要改变渲染行为
-> mdx-components.tsx

Callout、ProjectImage 等特殊内容块
-> components/mdx/ 中的 React 组件
```

当然也可以在 `mdx-components.tsx` 里为每个 `h1`、`p`、`ul` 手写样式，但文章元素很多。第一版用 `prose` 更省事，等视觉方向稳定后再做精细映射。

---

## 4. 目录怎么组织，才不会把组件混在一起

推荐使用下面的结构：

```text
app/
  articles/
    page.tsx
    [slug]/
      page.tsx
  projects/
    [slug]/
      page.tsx

components/
  ui/
    button.tsx
    tag.tsx
  layout/
    header.tsx
    footer.tsx
  mdx/
    article-body.tsx
    callout.tsx
    mdx-image.tsx
    code-note.tsx
  articles/
    article-card.tsx
    article-list.tsx

content/
  articles/
    first-post.mdx
    design-notes.mdx
  projects/
    personal-site.mdx

lib/
  content/
    articles.ts
    projects.ts

mdx-components.tsx
```

### 4.1 `components/` 继续按职责拆分

| 目录 | 放什么 |
|---|---|
| `components/ui/` | Button、Tag、Badge 等通用基础组件 |
| `components/layout/` | Header、Footer 等网站结构组件 |
| `components/mdx/` | ArticleBody、Callout、MdxImage 等内容渲染组件 |
| `components/articles/` | ArticleCard、ArticleList 等文章业务组件 |

一个简单判断方法：

```text
负责整篇正文排版或只在 MDX 中使用
-> components/mdx/

负责文章列表、筛选、卡片
-> components/articles/

和文章业务无关，其他页面也能使用
-> components/ui/
```

### 4.2 `content/` 只存内容，不会自动产生路由

```text
content/articles/first-post.mdx
```

只是一个内容文件。Next.js 不会因为它存在就自动生成 `/articles/first-post`。

仍然需要 `app/` 下的页面导入它：

```tsx
import FirstPost from "@/content/articles/first-post.mdx";
import { ArticleBody } from "@/components/mdx/article-body";

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <ArticleBody>
        <FirstPost />
      </ArticleBody>
    </main>
  );
}
```

这里的职责非常清楚：

```text
FirstPost
-> 文章内容

ArticleBody
-> 文章排版

Page
-> 页面结构和 URL
```

### 4.3 哪些名称固定，哪些只是习惯

| 名称 | 是否固定 |
|---|---:|
| `app/` 和 `page.tsx` | 是，Next.js 路由约定 |
| `mdx-components.tsx` | 是，Next.js MDX 约定 |
| `useMDXComponents` | 是，必须使用这个导出名称 |
| `ArticleBody` | 否，普通组件名称 |
| `components/` | 否，但社区通常这样组织组件 |
| `content/` | 否，只是清晰的内容目录习惯 |

---

## 5. 按阶段接入，不要一次完成整个 CMS

### 阶段一：先证明 MDX 能运行

#### 5.1 安装依赖

当前项目使用 npm：

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
```

#### 5.2 配置 `next.config.ts`

```ts
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
```

这里分成两层：

```text
pageExtensions
-> 允许 .mdx 成为页面文件

withMDX
-> 让 Next.js 编译 MDX 内容
```

#### 5.3 创建根目录 `mdx-components.tsx`

先使用空映射即可：

```tsx
import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
```

#### 5.4 创建最小页面

```text
app/mdx-demo/page.mdx
```

```mdx
export const metadata = {
  title: "MDX Demo",
};

# 我的第一个 MDX 页面

这是普通的 **Markdown** 内容。

<div className="mt-6 rounded-xl bg-black p-6 text-white">
  这是写在 MDX 中的 JSX。
</div>

1 + 2 = {1 + 2}
```

重新启动开发服务器，访问 `/mdx-demo`。

看到标题、黑色卡片和数字 `3`，就说明这一阶段完成。标题暂时没有文章样式也没关系。

### 阶段二：让文章拥有统一排版

#### 5.5 安装 Typography

```bash
npm install -D @tailwindcss/typography
```

#### 5.6 在 Tailwind 4 中注册插件

在 `app/globals.css` 中：

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

#### 5.7 创建 `ArticleBody`

```text
components/mdx/article-body.tsx
```

```tsx
import type { ReactNode } from "react";

type ArticleBodyProps = {
  children: ReactNode;
};

export function ArticleBody({ children }: ArticleBodyProps) {
  return (
    <article className="prose prose-neutral max-w-none">
      {children}
    </article>
  );
}
```

#### 5.8 给当前 MDX 路由加排版外壳

当前示例直接使用 `app/mdx-demo/page.mdx` 作为页面，可以创建：

```text
app/mdx-demo/layout.tsx
```

```tsx
import type { ReactNode } from "react";
import { ArticleBody } from "@/components/mdx/article-body";

type MdxDemoLayoutProps = {
  children: ReactNode;
};

export default function MdxDemoLayout({ children }: MdxDemoLayoutProps) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <ArticleBody>{children}</ArticleBody>
    </main>
  );
}
```

再次访问 `/mdx-demo`。标题、段落和列表出现清晰层级，就说明 Typography 已接通。

### 阶段三：把内容从路由目录中分离出来

前两个阶段只是在验证技术。

要形成轻 CMS，再把内容移到：

```text
content/articles/first-post.mdx
```

然后由页面导入并渲染：

```text
content/articles/first-post.mdx
-> app/articles/first-post/page.tsx
-> ArticleBody
-> 浏览器
```

先写死一个 `first-post` 路由即可，不要马上做文件扫描和动态导入。

这一阶段的重点只有一个：

> 文章内容属于 `content/`，URL 和页面布局属于 `app/`。

### 阶段四：文章变多后，再做列表和动态路由

文章只有一两篇时，先用本地数组维护列表信息：

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

再逐步实现：

```text
articles.ts
-> app/articles/page.tsx
-> ArticleCard
-> 点击进入 app/articles/[slug]/page.tsx
```

不要在刚接触 MDX 时同时加入：

- 自动扫描文件
- frontmatter 解析
- 动态 import
- 搜索和分页
- 数据库

这些都可以在基本内容链路稳定后再学习。

---

## 6. metadata 先用哪一种方式

文章列表通常需要：

```text
title
description
date
tags
cover
featured
```

MDX 可以导出普通 JavaScript 对象：

```mdx
export const metadata = {
  title: "我的第一篇文章",
  description: "记录个人网站第一版的内容结构。",
  date: "2026-07-06",
  tags: ["personal-site", "mdx"],
};

# 我的第一篇文章
```

还可以使用 frontmatter：

```md
---
title: 我的第一篇文章
date: 2026-07-06
---
```

但 `@next/mdx` 默认不会直接处理 frontmatter，需要额外加入 `gray-matter`、`remark-frontmatter` 等工具。

当前阶段建议：

```text
正文
-> MDX

文章列表需要的 title、date、slug
-> 先放 articles.ts

文章数量变多
-> 再统一读取 metadata 或 frontmatter
```

这样更容易看清每一层到底解决什么问题。

---

## 7. MDX 组件先做少量真正有用的

个人网站第一版不需要很多特殊组件。

| 组件 | 用途 |
|---|---|
| `Callout` | 重点提示、复盘结论 |
| `ProjectImage` | 项目截图和说明 |
| `CompareBlock` | 对比参考站与自己的实现 |
| `LinkCard` | 链接到产品、文章或项目 |
| `CodeNote` | 解释一段代码为什么这样写 |

学习重点不是组件数量，而是职责边界：

```text
文章表达
-> content/*.mdx

普通文章排版
-> ArticleBody + prose

特殊视觉块
-> components/mdx/

全局元素映射
-> mdx-components.tsx
```

如果某个特殊组件只在一篇文章中使用，可以直接在 MDX 中 `import`。

如果很多文章都要使用，再考虑放进 `mdx-components.tsx` 做全局映射。

---

## 8. 常见误区

### 8.1 `mdx-components.tsx` 是空的，是否等于没配置

不是。

空对象代表使用默认 HTML 元素。这个文件在 App Router 中仍然是必需入口。

### 8.2 安装 Typography 后，文章为什么还是没有样式

只安装插件还不够，还要：

```text
在 globals.css 注册插件
+ 给文章外层添加 prose
```

### 8.3 `ArticleBody` 和 `layout.tsx` 是一回事吗

不是。

```text
layout.tsx
-> Next.js 路由布局

ArticleBody
-> 普通 React 组件，只负责文章正文排版
```

可以在 `layout.tsx` 或 `page.tsx` 中使用 `ArticleBody`。

### 8.4 把 MDX 放进 `content/` 后，会自动生成页面吗

不会。

`content/` 只负责保存内容，仍然需要 `app/` 页面导入、选择并渲染它。

### 8.5 MDX 里能直接写点击事件吗

App Router 中的 MDX 默认按 Server Component 处理。

需要交互时，把交互逻辑写进带有 `"use client"` 的 React 组件，再将这个组件导入 MDX。

### 8.6 MDX 是不是后台 CMS

不是。它没有：

- 登录和权限
- 在线编辑
- 多人协作
- 数据库存储
- 图片上传管理
- 发布审核流程

它的价值是让你在学习后端之前，先体验“内容和页面分离”。

---

## 9. 学习顺序和完成标准

按下面四步学习：

```text
第一步：MDX 能显示
-> 理解 Markdown、JSX、表达式

第二步：Typography 能排版
-> 理解 prose 和 ArticleBody

第三步：内容移到 content/
-> 理解内容和路由分离

第四步：增加列表和 [slug]
-> 形成文件型轻 CMS
```

这一章学完后，应该能独立说清楚：

- 为什么正文更适合放在 MDX，而不是大段 JSX 中
- `@next/mdx` 负责什么
- `mdx-components.tsx` 和 `ArticleBody` 有什么区别
- `components/`、`content/`、`app/` 分别放什么
- 为什么安装 Typography 后还需要 `prose`
- 为什么 `content/` 中的文件不会自动成为路由
- 文件型轻 CMS 与真正 CMS 的边界

---

## 小结

先记住这组分工：

```text
MDX
-> 写内容

@next/mdx
-> 编译内容

mdx-components.tsx
-> 映射元素和特殊组件

ArticleBody + prose
-> 统一文章排版

components/mdx/
-> 保存实际的 MDX 相关 React 组件

content/
-> 保存文章正文

app/
-> 负责 URL 和页面结构
```

文件型轻 CMS 的核心不是安装了多少包，而是建立这条边界：

> 内容写在 MDX，页面负责组合，组件负责展示，排版集中管理。

它适合放在：

```text
本地数组之后
成熟 CMS 之前
后端和数据库之前
```

等内容数量和编辑需求真正增长，再从本地 MDX 迁移到 API、数据库或成熟 CMS。
