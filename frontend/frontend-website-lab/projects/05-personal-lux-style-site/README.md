# 05. 个人 Lux 风格网站：做一个能长期更新的个人站

## 问题背景

前四个项目分别练了：

```text
Funes：低装饰下的信息秩序
AeroPrecipe：内容很多时的数据组织和筛选
Lux：产品、文章、图片和品牌气质
Making Software：作者气质、章节感和视觉叙事
```

如果只停在这里，最多说明你临摹过几个好网站。

这个个人网站项目要解决的是另一个问题：

```text
我怎么把这些能力变成自己的个人网站？
```

目标不是复制 `lux.camera`，而是借鉴它最重要的结构：

```text
产品入口
+ 文章内容
+ 图片质感
+ 品牌统一性
+ 长期更新能力
```

最后做出一个能持续使用的个人网站，用来放个人产品、文章、项目记录和创作沉淀。

---

## 核心解释

### 1. 这个项目不是第五个临摹站，而是开始做自己的站

前四个项目是练能力。

这个项目要把前面练过的东西放到具体页面里：

| 前面练过什么 | 用在个人网站哪里 |
|---|---|
| Funes | 文章索引、项目清单、资源列表、归档页 |
| AeroPrecipe | 标签筛选、项目分类、内容卡片、移动端筛选入口 |
| Lux | 首页 hero、产品入口、精选文章、图片卡片、品牌气质 |
| Making Software | About 页、首页叙事段落、项目复盘页、作者表达 |

一句话：

```text
不要做“像某个网站”的网站，
要做一个有自己内容、同时保留这些优点的网站。
```

---

### 2. 个人网站应该包含哪些页面

第一版至少包含：

| 页面 | 作用 | 重点练什么 |
|---|---|---|
| `/` | 首页 | 品牌第一印象、产品入口、精选文章、项目入口 |
| `/articles` | 文章列表 | 内容密度、标签、筛选、阅读入口 |
| `/articles/[slug]` | 文章详情 | 正文排版、图片、引用、代码块、阅读体验 |
| `/projects` | 项目列表 | 产品/项目卡片、状态、分类、外链 |
| `/about` | 关于我 | 作者气质、叙事节奏、个人定位 |

如果时间有限，先做：

```text
首页
-> 文章列表
-> 文章详情
-> About
```

项目页可以第二轮再补。

---

### 3. 首页应该长什么样

首页建议包含：

- 顶部导航：`Home / Articles / Projects / About`
- 强首屏：一句清楚的个人定位 + 一个视觉重点
- 产品或项目入口：2 到 4 个代表作品
- 精选文章：3 到 6 篇，有图片和标签
- 最近更新：更高密度的文字列表
- About 摘要：一小段个人叙事
- 页尾：联系方式、社交链接、版权信息

首页要同时回答三个问题：

```text
你是谁？
你做过什么？
我为什么要继续看？
```

---

## 技术关系

### 1. 默认技术栈

```text
Next.js + React + TypeScript + TailwindCSS
```

第一版仍然先用本地内容，不急着接后端：

```text
data/articles.ts
data/projects.ts
data/profile.ts
```

文章详情和项目复盘可以用 MDX：

```text
content/articles/*.mdx
content/projects/*.mdx
```

更推荐的第一版分工是：

```text
data/articles.ts
-> 保存列表需要的 title、excerpt、date、tags、coverImage、featured

content/articles/*.mdx
-> 保存文章正文

data/projects.ts
-> 保存项目列表卡片信息

content/projects/*.mdx
-> 保存项目复盘正文
```

这样既不会一开始就进入后端，也不会把长文章全部写死在 `page.tsx` 里。

文章详情页的排版用 Typography 插件统一处理：

```text
MDX 正文
-> ArticleBody
-> prose / prose-neutral / max-w-none
```

内容管理后面再升级，不要一开始就选 CMS：

```text
本地 TypeScript metadata
-> MDX 正文
-> Typography 阅读排版
-> 页面结构和视觉气质稳定
-> 再选择 Payload CMS 或自建 Express API
-> 最后再接 PostgreSQL
```

如果目标是先用成熟后台提高效率，重点看 Payload。

如果目标是练后端能力，再自己写 Node.js + Express + PostgreSQL。

MDX 这一段可以回看：

- [../../05A-MDX和Typography轻CMS方案.md](../../05A-MDX和Typography轻CMS方案.md)

---

### 2. 建议的数据结构

文章：

```ts
type Article = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  tags: string[];
  coverImage?: string;
  featured?: boolean;
};
```

项目：

```ts
type Project = {
  slug: string;
  name: string;
  summary: string;
  status: "idea" | "building" | "shipped";
  tags: string[];
  image?: string;
  url?: string;
  repo?: string;
};
```

个人信息：

```ts
type Profile = {
  name: string;
  headline: string;
  bio: string;
  location?: string;
  links: Array<{
    label: string;
    href: string;
  }>;
};
```

先有数据意识，后面接 Express API 时会更顺。

---

### 3. 核心组件

建议先拆这些组件：

- `SiteHeader`
- `HeroSection`
- `FeaturedArticleCard`
- `ArticleList`
- `ArticleBody`
- `ProjectCard`
- `TagFilter`
- `AboutPreview`
- `SiteFooter`

第一版不要过度抽象。

如果某个组件只用一次，可以先放在页面里；等重复出现后再抽出来。

---

## 学习建议

### 1. 推荐实现顺序

```text
1. 写 profile / articles / projects 本地数据
2. 做全站 layout、header、footer
3. 做首页 hero 和个人定位
4. 做精选文章卡片
5. 做项目入口卡片
6. 做 articles 列表页
7. 接入 MDX 和 ArticleBody
8. 做 article detail 页
9. 做 about 页
10. 做移动端适配
11. 最后调字体、图片比例、hover 和整体气质
```

不要一开始就做后台、数据库或登录。

---

### 2. 每一轮只解决一个层次

第一轮：

```text
页面结构完整，移动端不乱。
```

第二轮：

```text
字体、间距、图片比例、卡片层级更接近 Lux 的编辑气质。
```

第三轮：

```text
换成自己的真实内容，减少模板感。
```

第四轮：

```text
部署上线，检查 SEO、性能、可访问性。
```

---

### 3. 成品验收标准

至少满足：

- 首页能让人快速理解你的身份、作品和内容方向
- 文章列表不是普通堆叠，有标签、精选和最近更新的层级
- 至少有 3 篇真实或半真实文章内容
- 至少有 2 个真实或半真实项目卡片
- 移动端、平板、桌面端都不乱
- 图片比例统一，裁切自然，不靠随便找的图凑数
- hover、active、focus 状态清楚但克制
- 每个页面有基本 `title` 和 `description`
- 可以部署到 Vercel 或 Netlify

---

## 小结

这个项目才是 `frontend-website-lab` 的终点。

前四个项目的价值，都要落到这里：

```text
我不只是会临摹，
我能把优秀网站的判断变成自己的长期作品。
```
