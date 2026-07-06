# Next.js + Tailwind：用项目练出好网站的感觉

这个目录不是前端基础课，而是一组网站练习。

目标很明确：

```text
用 Next.js + TailwindCSS
-> 拆解优秀网站为什么这样设计
-> 做出自己的个人网站雏形
```

参考对象：

- https://funes.matsu.io/
- https://aeroprecipe.com/
- https://www.lux.camera/
- https://www.makingsoftware.com/

详细路线放在：

- [00-学习目标和阶段路线.md](./00-学习目标和阶段路线.md)

README 只做入口和导航，不重复展开完整路线。

---

## 先记住这一句

这套练习最重要的规则是：

```text
不要只写感受，要写能指导实现的观察。
```

比如：

```text
不写：这个网站很高级。
要写：它几乎没有阴影，主要靠边框、留白和字号层级建立秩序。
```

这句话单独展开在：

- [01A-把高级感写成可实现的观察.md](./01A-把高级感写成可实现的观察.md)

---

## 文档怎么读

| 文档 | 作用 |
|---|---|
| [00-学习目标和阶段路线.md](./00-学习目标和阶段路线.md) | 看完整学习路线：为什么做这组项目、每阶段练什么 |
| [01-优秀网站拆解清单.md](./01-优秀网站拆解清单.md) | 看参考网站分别练什么，以及从原站观察到的技术线索 |
| [01A-把高级感写成可实现的观察.md](./01A-把高级感写成可实现的观察.md) | 学会把“高级感”翻译成可实现的设计观察 |
| [02-Nextjs-Tailwind启动方式.md](./02-Nextjs-Tailwind启动方式.md) | 跑起 Next.js + Tailwind 项目 |
| [03-设计拆解方法.md](./03-设计拆解方法.md) | 把感觉、页面结构、视觉变量翻译成代码 |
| [04-项目复盘模板.md](./04-项目复盘模板.md) | 每做完一个练习，留下可迁移到个人网站的东西 |
| [05-未来内容管理和后端路线.md](./05-未来内容管理和后端路线.md) | 先静态内容，未来再接 Node.js / Express / PostgreSQL |
| [05A-MDX和Typography轻CMS方案.md](./05A-MDX和Typography轻CMS方案.md) | 在后端数据库之前，用 MDX 和 Typography 做个人网站的文件型轻 CMS |
| [06-好用工具和CMS提效路线.md](./06-好用工具和CMS提效路线.md) | 区分 VitePress、CMS、Payload、Directus、Ghost 这些工具 |

---

## 实操顺序

不要把所有文档读完才开始做。

更推荐这样推进：

```text
先读 00 / 01 / 01A / 02 / 03
-> 做 01-funes-style-minimal-site
-> 按 04 写复盘，记录能迁移到个人网站的点
-> 做 02-aeroprecipe-style-data-site
-> 做 03-lux-style-editorial-site
-> 回看 05 / 05A / 06，理解内容管理路线
-> 做 04-makingsoftware-style-visual-site
-> 最后做 05-personal-lux-style-site，并正式接入 MDX 文章详情
```

每个项目目录里保持这几类东西：

```text
README.md
-> 设计观察、能迁移到个人网站的 1 到 2 个点

app/、components/、data/、lib/
-> 页面、组件、本地数据和工具函数

public/images/
-> 页面真正使用的图片素材

docs/screenshots/
-> 参考站截图、自己实现后的截图、对比截图
```

每个项目内部具体怎么做，看 [00-学习目标和阶段路线.md](./00-学习目标和阶段路线.md) 里的“每个练习按同一套流程做”。

做到 Lux 项目后，再回看：

- [05-未来内容管理和后端路线.md](./05-未来内容管理和后端路线.md)
- [05A-MDX和Typography轻CMS方案.md](./05A-MDX和Typography轻CMS方案.md)
- [06-好用工具和CMS提效路线.md](./06-好用工具和CMS提效路线.md)

这时再理解 MDX、Typography、Ghost、Payload、Directus，会比一开始就看工具更清楚。

做到个人网站项目时，再真正把 MDX 用起来。前面的练习项目仍然以本地数组和页面完成度为主。

---

## 项目顺序

| 顺序 | 项目 | 主要练什么 |
|---|---|---|
| 1 | [01-funes-style-minimal-site](./projects/01-funes-style-minimal-site/) | 极简信息站：字体、列表、密度、hover、信息架构 |
| 2 | [02-aeroprecipe-style-data-site](./projects/02-aeroprecipe-style-data-site/) | 数据内容站：卡片、筛选、侧栏、响应式布局 |
| 3 | [03-lux-style-editorial-site](./projects/03-lux-style-editorial-site/) | 编辑类图片内容站：大图、文章卡片、首页视觉节奏 |
| 4 | [04-makingsoftware-style-visual-site](./projects/04-makingsoftware-style-visual-site/) | 视觉叙事站：章节、图形、滚动节奏、个性表达 |
| 5 | [05-personal-lux-style-site](./projects/05-personal-lux-style-site/) | 个人网站：放自己的产品、文章、项目和介绍 |

---

## 内容和工具路线

当前阶段：

```text
本地数组 / JSON / Markdown
-> 先把页面结构、视觉和交互做出来
```

个人网站内容过渡阶段：

```text
MDX
+ Tailwind Typography 插件
-> 先做文章详情、项目复盘和统一阅读排版
-> 形成文件型轻 CMS
```

工具阶段：

```text
VitePress
-> 适合文档站、学习笔记、教程，不是 CMS 主线

Ghost
-> 适合理解成熟内容发布系统

Payload CMS
-> 更贴近 Next.js 个人网站，是后面接 CMS 的主候选

Directus
-> 适合配合 PostgreSQL 理解数据库后台和 API
```

未来后端阶段：

```text
Node.js + Express + PostgreSQL
-> 自己实现一个小而清楚的个人网站内容系统
```

工具细节看：

- [05A-MDX和Typography轻CMS方案.md](./05A-MDX和Typography轻CMS方案.md)
- [06-好用工具和CMS提效路线.md](./06-好用工具和CMS提效路线.md)

---

## 小结

这套目录的核心不是“学完 Next.js”，而是：

```text
做出接近优秀网站完成度的页面
-> 把观察、组件和内容结构沉淀到自己的个人网站
```
