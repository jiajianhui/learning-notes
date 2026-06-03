# 02. Next.js + Tailwind：先把项目跑起来

## 问题背景

这轮项目默认使用：

```text
Next.js + React + TailwindCSS
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
src/ directory: Yes 或 No 都可以，当前练习推荐 Yes
App Router: Yes
Turbopack: Yes
Import alias: 默认即可
```

如果想一次性传参数，可以使用：

```bash
npx create-next-app@latest my-site --typescript --tailwind --eslint --app --src-dir
```

说明：Next.js 官方 `create-next-app` 支持 Tailwind 初始化；新版本也会提示是否使用推荐默认项。

---

### 2. 推荐目录结构：先简单，不要过度设计

单个练习项目推荐这样组织：

```text
src/
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

---

## 学习建议

### 1. 每次启动前检查

```bash
npm install
npm run dev
```

常用脚本：

```bash
npm run lint
npm run build
```

项目完成时至少跑一次：

```bash
npm run build
```

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
