# Next.js + Tailwind：用项目练出好网站的感觉

## 问题背景

前面的 `frontend-system-learning` 解决的是：

```text
现代前端有哪些层？
每一层解决什么问题？
React、Vue、Vite、Next、Nuxt 之间是什么关系？
```

这套文档从这里开始换一个目标。

现在不再继续补基础课，而是进入真实网站练习：

用 Next.js + TailwindCSS 做出接近这些优秀网站的视觉、版式、交互和品味：

- https://www.lux.camera/
- https://funes.matsu.io/
- https://aeroprecipe.com/
- https://www.makingsoftware.com/

主线先记这一条：

```text
不是复刻原站技术栈
-> 而是学习优秀网站的设计判断
-> 再用 Next.js + TailwindCSS 做出来
```

---

## 核心解释

### 1. 这套目录解决什么问题：把审美拆成能写的代码

这轮练习不急着做 CMS、后端、数据库。

先把重点放在这些问题上：

- 页面结构为什么舒服
- 字体、间距、颜色为什么高级
- 卡片、列表、导航、图片如何组织
- hover、滚动、切换、筛选这些交互如何克制地增强体验
- 如何用 Next.js + TailwindCSS 把这些设计判断落到代码里

一句话：

```text
先做出好看的前端页面，再考虑复杂功能。
```

---

### 2. 它和基础学习目录是什么关系：一个是地图，一个是实战

已有目录继续保留：

| 目录 | 作用 |
|---|---|
| `frontend-system-learning/` | 建立现代前端技术地图 |
| `frontend-website-lab/` | 用项目练网站视觉和交互 |

不要把这两个目录混在一起。

可以这样理解：

```text
frontend-system-learning
-> 回答“我在学什么技术”

frontend-website-lab
-> 回答“我能做出什么网站”
```

---

### 3. 这一阶段默认用什么技术：先固定 Next.js + TailwindCSS

默认技术栈：

```text
Next.js + React + TailwindCSS
```

当前阶段先这样取舍。

- 用本地数组、JSON 或 Markdown 作为内容数据
- 用 Tailwind 写主要样式
- 必要时补少量 CSS 变量或全局样式
- 暂不做登录、发布系统、评论系统、后台管理
- 暂不追求像素级复制，追求结构、气质和交互接近

---

## 技术关系

### 1. 四个项目怎么推进

建议顺序：

```text
01-funes-style-minimal-site
-> 极简信息站：练字体、列表、密度、hover、信息架构

02-aeroprecipe-style-data-site
-> 数据型内容站：练卡片、筛选、侧栏、响应式布局

03-lux-style-editorial-site
-> 图片编辑类内容站：练大图、文章卡片、首页视觉节奏

04-makingsoftware-style-visual-site
-> 视觉叙事站：练章节、插画/图形、滚动节奏、个性化表达
```

先做极简，再做数据，再做图片内容，最后做视觉叙事。

这样难度是逐步上升的。

---

### 2. 每个项目至少做到什么程度

每个项目至少做到：

| 要求 | 说明 |
|---|---|
| 完整首页 | 不是零散组件 |
| 响应式 | 移动端和桌面端都能看 |
| 核心结构 | 有导航、内容区、页尾 |
| 核心组件 | 至少实现 2 个可复用组件 |
| 交互细节 | 至少实现 2 个 hover、sticky、drawer、filter 等细节 |
| 项目复盘 | 写清楚参考站、练习重点和问题 |

不用一开始就完美。

先做出来，再迭代品味。

---

## 学习建议

推荐阅读顺序：

- [00-学习目标和阶段路线.md](./00-学习目标和阶段路线.md)
- [01-优秀网站拆解清单.md](./01-优秀网站拆解清单.md)
- [02-Nextjs-Tailwind启动方式.md](./02-Nextjs-Tailwind启动方式.md)
- [03-设计拆解方法.md](./03-设计拆解方法.md)
- [04-项目复盘模板.md](./04-项目复盘模板.md)
- [projects/](./projects/)

真正动手时按项目顺序来：

```text
先读 00 / 01 / 02 / 03
-> 做 01-funes-style-minimal-site
-> 写复盘
-> 再进入下一个项目
```

---

## 小结

这套目录的核心不是“学完 Next.js”，而是：

```text
用 Next.js + TailwindCSS 做出接近优秀网站的完成度。
```

等页面的结构、视觉和交互稳定之后，再把 CMS、后端、数据库接进来。
