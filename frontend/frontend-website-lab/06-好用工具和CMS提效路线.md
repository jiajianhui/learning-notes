# 06. 好用工具和 CMS：先借工具看清楚，再决定自己写什么

## 问题背景

你倾向于以后自己搭建 CMS，这个方向是对的。

自建一次内容系统，能真正练到：

```text
接口
数据库
文章模型
标签模型
图片上传
发布状态
后台管理
部署维护
```

但当前阶段不用硬写 CMS。

更合理的路线是：

```text
先用本地数据把页面做好
-> 用 MDX + Typography 做个人网站轻内容系统
-> 再试成熟 CMS，看别人怎么组织内容
-> 后端阶段再自己实现一个小版本
```

这就像前端里会用 Next.js、TailwindCSS、组件库和 npm 包。

用工具不是偷懒，而是先站在成熟方案上看清楚问题。

---

## 核心解释

### 1. 参考站用的工具，不等于最适合你的工具

`01-优秀网站拆解清单` 里提到的工具，很多来自参考网站：

| 参考站 | 观察到的工具线索 |
|---|---|
| Lux | Ghost、Ghost 主题、图片 CDN、搜索 |
| AeroPrecipe | Next.js、TailwindCSS、Swiper、Headless UI |
| Funes | 静态 HTML + CSS、Netlify |
| Making Software | Next.js + Tailwind 视觉叙事站 |

这些线索值得记录。

但选择工具时，不能只看参考站用了什么。

要回到你的路线：

```text
Next.js + Tailwind 前台
-> 以后学习 Node.js / Express / PostgreSQL
-> 最终做一个能长期更新的个人网站
```

下一步再回到 CMS 候选本身。

---

### 2. VitePress 是另一类工具：Markdown 文档站

VitePress 也能把内容做成网站，但它不是 CMS。

它更像：

```text
Markdown
-> 静态文档网站
```

适合做：

- 技术文档
- 学习笔记
- 教程站
- 项目说明
- 知识库

它和 CMS 的区别可以先这样理解：

| 对比 | VitePress | Payload / Ghost / Directus |
|---|---|---|
| 核心定位 | 静态文档网站生成器 | 内容管理系统 |
| 内容来源 | 本地 Markdown 文件 | 后台、数据库、API |
| 后台管理 | 默认没有 | 有 |
| 适合内容 | 文档、笔记、教程 | 精美文章、内容站、长期发布 |
| 更新方式 | 改 Markdown 后重新部署 | 登录后台编辑和发布 |

所以它不是你当前要找的“精美文章 CMS”主线。

如果以后想做学习笔记站，VitePress 很合适。

但如果目标是类似 Lux 的文章、图片、标签、发布流程和内容后台，还是优先看 CMS。

---

### 3. MDX + Typography 是过渡方案：像 CMS，但不是 CMS

MDX + Typography 值得单独放一章，但它和 Ghost、Payload、Directus 不是同一类东西。

可以这样分：

| 方案 | 本质 | 适合当前做什么 |
|---|---|---|
| MDX + Typography | 本地文件内容 + 文章排版 | 做个人网站文章、项目复盘、内容详情页 |
| Ghost / Payload / Directus | 成熟 CMS 或 Headless CMS | 学后台、内容模型、API、发布流程 |
| 自建 Node.js + Express + PostgreSQL | 自己实现内容系统 | 后端阶段练接口、数据库和管理后台 |

所以 MDX 不是要替代后面的 CMS 学习。

它负责的是这一步：

```text
我还没有后台和数据库，
但我想先把个人网站的文章内容认真组织起来。
```

详细看：

- [05A-MDX和Typography轻CMS方案.md](./05A-MDX和Typography轻CMS方案.md)

---

### 4. 先看这三个 CMS

| 工具 | 简单定位 | 适合你学什么 | 链接 |
|---|---|---|---|
| Payload CMS | Next.js 友好、TypeScript、代码优先、自托管 CMS | 开源免费，是后面个人网站接 CMS 的主候选；适合学内容模型、后台、API、权限怎么和 Next.js 接起来 | [官网](https://payloadcms.com/) / [GitHub](https://github.com/payloadcms/payload) |
| Directus | 数据库优先，连接 SQL 数据库后生成后台和 API | 学 PostgreSQL、数据表、权限、REST / GraphQL API 的关系 | [官网](https://directus.com/) / [GitHub](https://github.com/directus/directus) |
| Ghost | 博客、Newsletter、会员订阅、内容发布系统 | 学成熟内容站怎么管理文章、作者、标签和发布流程 | [官网](https://ghost.org/) / [GitHub](https://github.com/TryGhost/Ghost) |
| Strapi | 老牌开源 Headless CMS，后台成熟 | 作为备选了解，不必第一时间深入 | [官网](https://strapi.io/) / [GitHub](https://github.com/strapi/strapi) |

一句话选择：

```text
想贴近 Next.js 个人网站：先看 Payload。
想理解数据库和后台关系：再看 Directus。
想理解内容发布系统：试一次 Ghost。
```

如果只能重点研究一个，优先看 Payload。

原因很简单：

```text
它离 Next.js 个人网站最近，
也比 Ghost 更适合练自定义内容模型和后台能力。
```

---

### 5. 这三个工具怎么选

不用把它们理解成互相替代。

它们更像三个观察角度：

```text
Ghost 用来学习成熟内容发布系统长什么样。
Payload 更适合进入你的 Next.js 主线。
Directus 更适合配合 PostgreSQL 学数据库后台。
```

更具体一点：

| 如果你想看 | 先看 |
|---|---|
| 文章、作者、标签、发布流程怎么组织 | Ghost |
| Next.js 项目怎么接后台、权限、API、文件管理 | Payload |
| 数据库表、关系、权限、API 怎么连起来 | Directus |

当前不要纠结“最终选哪一个”。

先知道它们分别解决什么问题就够。

---

## 技术关系

### 1. Headless CMS 是什么

`Headless` 可以先理解成：

```text
CMS 只管内容后台和 API
前台页面自己写
```

比如：

```text
Ghost / Payload / Directus
-> 管文章、标签、图片、作者、发布状态

Next.js
-> 自己写页面、样式、交互和路由
```

这很适合你的长期方向。

因为你可以继续用 Next.js + Tailwind 做前台，只把内容管理交给 CMS。

---

### 2. 有没有服务器，不影响现在怎么学

如果有自己的云服务器，比如阿里云、腾讯云、VPS，以后可以多练一条自托管路线。

如果没有服务器，也没关系。

当前阶段先这样：

```text
本地跑通工具
-> 理解内容模型和 API
-> 再决定要不要部署
```

不要一上来就把精力放到服务器、端口、反向代理和数据库连接上。

部署是后面的事。

但如果后面要把 CMS 真正部署到自己的服务器上，Payload 会很值得重点试。

它的优势很直接：

```text
工具本身开源免费
-> 放在自己的服务器上
-> 数据和成本都更可控
```

这里的免费指工具本身，不是说服务器、域名和存储都没有成本。

同时它也贴近 Next.js 项目，能让你练到数据库、文件上传、权限和后台这些真实问题。

---

### 3. 自建 CMS 时不要追完整成熟产品

Ghost、Payload、Directus 都是成熟产品。

你以后自己写 CMS，不需要第一版就复刻它们。

第一版只做这些就够：

```text
文章
标签
封面图
草稿 / 发布
文章列表 API
文章详情 API
简单后台表单
```

先跑通这条线：

```text
数据库
-> API
-> 后台编辑
-> 前台展示
```

这比一开始追会员、Newsletter、复杂权限、全文搜索更重要。

---

## 学习建议

### 1. 推荐顺序

```text
先继续做前端页面
-> 个人网站项目里先接 MDX + Typography
-> Lux 项目后试一次 Ghost
-> 个人网站第一版稳定后看 Payload
-> 学 PostgreSQL 后看 Directus
-> 后端阶段自己写一个轻量 CMS
```

原因很简单：

| 阶段 | 看什么 | 目的 |
|---|---|---|
| 个人网站项目 | MDX + Typography | 在没有后端前，先把文章和项目内容结构跑通 |
| Lux 项目后 | Ghost | 先理解内容发布系统 |
| 个人网站第一版后 | Payload | 看 Next.js 怎么接 CMS |
| 学 PostgreSQL 后 | Directus | 看数据库怎么变成后台和 API |
| 后端阶段 | 自建 CMS | 真正练接口、数据库和后台 |

### 2. 看到新工具时，只问三个问题

```text
它解决什么重复问题？
它是 CMS，还是文档站 / 部署平台 / UI 工具？
我现在真的需要吗？
如果以后自己写，最小版要实现哪 3 个能力？
```

这比收藏一堆 CMS 名字更有用。

---

## 小结

这篇的结论很简单：

```text
不是所有 CMS 都要学。
不是所有东西都要自己写。
先用工具看清楚成熟方案。
再把真正值得练的部分自己实现。
```

对这条路线来说：

```text
Ghost：看内容发布。
Payload：接 Next.js 主线。
Directus：理解数据库后台。
```

最后再回到自己的目标：

```text
Node.js + Express + PostgreSQL
-> 自建一个小而清楚的个人网站内容系统
```
