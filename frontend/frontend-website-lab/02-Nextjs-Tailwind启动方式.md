# 02. Next.js + Tailwind：先把项目跑起来

## 问题背景

这轮项目默认使用：

```text
Next.js + React + TypeScript + TailwindCSS
```

原因很简单：

- Next.js 适合做真实网站
- React 生态成熟
- TailwindCSS 适合快速还原视觉细节
- 本地数据就能先完成静态网站和交互

主线先记这一条：

```text
Next.js 负责应用结构
-> React 负责组件
-> TypeScript 负责数据和 props 更清楚
-> TailwindCSS 负责快速写样式
-> 本地数据先负责内容
```

---

## 核心解释

### 1. 创建项目：先用官方脚手架

在某个项目目录里执行：

```bash
npx create-next-app@latest .
```

推荐选择：

```text
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Yes
src/ directory: No（默认）
App Router: Yes
Turbopack: No
Import alias: 默认即可
```

Turbopack 可能更快，但如果电脑明显发热或风扇很响，当前练习先用 Webpack 更稳。

如果想在当前目录一次性传参数，可以使用：

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --webpack
```

---

### 2. 推荐目录结构：先简单，不要过度设计

单个练习项目推荐这样组织：

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  site-header.tsx
  site-footer.tsx
  hero.tsx
  card.tsx
data/
  posts.ts
  items.ts
lib/
  utils.ts
public/
  images/
```

初期不要拆太复杂。一个页面先写在 `page.tsx` 里，重复明显后再提组件。

---

## 技术关系

### 1. Tailwind 怎么用：先用 utility class

优先这样：

```tsx
<section className="mx-auto max-w-6xl px-6 py-16">
  <h1 className="text-5xl font-semibold tracking-normal text-neutral-950">
    Website Lab
  </h1>
</section>
```

---

### 2. 什么时候提组件：重复多了再提

比如卡片重复三次以上，再提成：

```text
components/article-card.tsx
```

---

### 3. 什么时候写全局 CSS：少量可以接受

适合放在 `globals.css`：

- 字体变量
- `body` 背景
- 选择文本颜色
- 少量自定义动画
- Markdown 内容排版

不要把所有 Tailwind 都搬进 CSS 类名里，否则会失去练习 Tailwind 的意义。

---

### 4. 本地数据怎么放：先用数组，不做 CMS

先用本地数据，不做 CMS：

```ts
export const posts = [
  {
    title: "A quiet interface",
    category: "Design",
    excerpt: "Small decisions that make a page feel deliberate.",
    image: "/images/post-01.jpg",
  },
];
```

这样你可以先练：

- `map()` 渲染列表
- 根据分类筛选
- 卡片组件
- 空状态
- 响应式布局

前几个练习项目先这样就够。

到个人网站项目时，可以再把文章详情和项目复盘升级成 MDX：

```text
列表和卡片
-> 继续用 TypeScript 数组保存标题、摘要、标签、封面

文章正文和项目复盘
-> 用 content/articles/*.mdx 或 content/projects/*.mdx 保存
```

这样分工更清楚：

```text
数组负责列表结构
MDX 负责长正文
mdx-components.tsx 负责统一正文元素的渲染和样式
```

MDX 方案放在：

- [05A-MDX轻CMS方案.md](./05A-MDX轻CMS方案.md)

---

## 学习建议

### 1. 开发、检查和构建分别什么时候跑

| 命令 | 什么时候用 |
|---|---|
| `npm install` | 第一次进入项目时安装依赖 |
| `npm run dev` | 平时开发时启动本地服务 |
| `npm run build` | 做完一版或部署前运行；它比 `dev` 更严格，有些问题开发时看不出来，构建时才会报错 |
| `npm run lint` | 如果 `package.json` 里有这个命令，用来做代码检查；常见工具是 ESLint 或 Biome |

### 2. 做项目时先别追求目录完美

初期优先级：

```text
页面完成度
-> 响应式
-> 交互细节
-> 组件抽象
-> 目录整理
```

---

## 小结

这轮练习不要一开始就追求架构漂亮。先记住：

```text
页面完成度 > 抽象程度
设计观察 > 技术炫技
能做出来 > 目录很复杂
```
