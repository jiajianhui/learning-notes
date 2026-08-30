# 附录 B：Superlogical 为什么从终端 Session 开始

> 状态记录：2026 年 8 月 30 日。Superlogical 尚未公开发布首个 beta，当前不能把它当成已经可安装的 tmux 替代品。

Superlogical 一亮相就同时带来了两个钩子：一支夸张的开发者工具团队，以及一个听上去并不新鲜的起点——terminal multiplexer。先看是谁组了队，再看他们为什么从这里出发。

## 先看这张组队截图

Mitchell 一个人的履历已经很夸张：创建 Ghostty，联合创办 HashiCorp，并创建 Vagrant、Terraform、Vault 等开发者基础设施工具。这次不是他独自开新坑，而是一支同时懂工程底层与开发者体验的 4 人团队：

| 成员 | 带来的经验 |
|---|---|
| Mitchell Hashimoto | Ghostty 作者；HashiCorp 联合创始人；Vagrant、Terraform、Vault 等工具的创建者 |
| Jack Pearkes | HashiCorp 第一位员工，后来担任工程与研发副总裁；参与早期产品并组建原始工程团队 |
| Alasdair Monk | 曾在 Poolside、Vercel、HashiCorp、Heroku 负责开发者产品体验与设计 |
| Hector Simpson | 曾为 Poolside 设计应用、服务与 Agent 体验，也在 Heroku、HashiCorp、Clearbit、Vercel 做过开发者产品 |

出资阵容同样很“开发者工具圈”。机构投资者是 Notable Capital 与 Amplify Partners；官网列出的个人支持者包括：

```text
Aaron Levie       Armon Dadgar       Dax Raad
Greg Foster       Guillermo Rauch    Jacob Thornton
Mario Zechner     Merrill Lutsky      Patrick Collison
Paul Copplestone  Stephen Haney       Steve Ruiz
Tobias Lütke      Tomas Reimers
```

其中有 Box、HashiCorp、Vercel、Stripe、Shopify 等公司的创始人，也有这一代开发者工具和 AI 产品的创造者。阵容本身不是产品评测，但它解释了为什么这个项目一公布就值得停下来看看：这群人押注的不是一套终端主题，而是软件工作的下一层基础设施。

## 豪华阵容为什么从终端开始

tmux 已经能让任务在 SSH 断开后继续运行，Zellij 又增加了布局、Session Resurrection 和 Web Client。为什么 Mitchell 还要成立一家公司，从头做新的终端多路复用器？

因为今天的工作现场早已不只是一位开发者盯着一个 Shell：

```text
本地开发
远程服务器
云端沙盒
CI 与后台任务
生产环境排错
多个并行 AI Coding Agent
人与人共享终端
```

这些工作互相关联，却被分散在不同窗口、任务页面、日志系统和设备中。Superlogical 提出的核心不是“再做一个更漂亮的分屏”，而是给工作本身一个长期存在的 Session。

---

## 先把官方已经说清的部分留下

Superlogical 当前公开的第一步是终端多路复用器：

- 多个终端工作块放在长期 Session 中。
- 关闭客户端后，可以从其他设备重新连接。
- 计划提供 Web、原生 macOS 和 iOS 访问。
- 从一开始就考虑实时共享 Session。
- 建立在 `libghostty` 之上。

更长期的方向叫 “multiplexer for all work”：让交互式工作、自动任务和生产工作共享一个可组合、可观察、可由人和软件共同控制的底层系统。

官方还没有公布完整产品边界、价格、稳定平台和正式发布时间。以上是公开方向，不是已经交付的功能清单。

## 为什么 AI Agent 让 Session 重新变重要

传统终端通常假设：

```text
人坐在窗口前
-> 输入命令
-> 等待结果
```

Agent 工作更像：

```text
人提出目标
-> Agent 在本地或远程环境持续执行
-> 测试、日志和子任务并行发生
-> 人中途离开，又从另一台设备回来
-> 人需要看见历史、接管操作或停止任务
```

这需要的不只是一个聊天记录，而是包含环境、进程、输出、历史和控制权的工作现场。

Superlogical 值得观察的地方，正是它试图让 Session 同时满足：

```text
持久：客户端关闭，工作上下文还在
可见：自动任务不是消失在黑盒里
可控：人可以观察、接管和停止
可组合：程序也能读取状态并执行动作
跨环境：本地、远程和生产不再完全割裂
```

这些是产品方向，不代表第一版一定会全部实现。

## tmux、Zellij 与 Superlogical 现在不在同一起跑线

| 工具 | 现在怎样看 | 现在该怎么做 |
|---|---|---|
| tmux | 成熟、广泛可用的终端多路复用器 | 作为第一轮实操 |
| Zellij | 已发布的现代终端工作区与 Session 管理器 | 有明确需求后选试 |
| Superlogical | 从终端多路复用器出发的未发布产品与更大愿景 | 关注，不纳入学习前置 |

“下一代 tmux”可以帮助第一眼理解 Superlogical，但不够准确。它的起点是 terminal multiplexer，长期目标则明显大于终端分屏。

## 这和 Ghostty 是什么关系

Ghostty 是终端模拟器，负责本地窗口、输入与渲染。Mitchell 已将 Ghostty 捐给非营利组织，并明确表示它不会因 Superlogical 而改变使命、治理或开源路线。

Superlogical 会使用公开的 MIT License `libghostty` 组件构建自己的终端能力，就像其他使用者一样，并计划把通用改进继续贡献回上游。

所以目前不要画成：

```text
Ghostty -> 被 Superlogical 取代
```

更合适的是：

```text
libghostty：可复用的终端能力
├── Ghostty：终端模拟器
└── Superlogical：从持久多路复用 Session 起步的新产品
```

## 现在最好的学习动作

不需要为了一个未发布产品重建工作流。

现在完成三件事就够了：

1. 用[第 02 章](./02-终端生态-Ghostty-Shell与CLI怎样配合.md)分清终端模拟器、Shell、CLI 与操作系统。
2. 用[第 07 章](./07-SSH断了工作还在-tmux与Zellij.md)亲手体验一次 Detach 与 Attach。
3. 继续关注 Superlogical 的公开进展，等 beta 出现后再用同一个实际任务与 tmux / Zellij 比较。

到时候真正值得比较的不是截图，而是：

```text
SSH 断开后任务是否可靠保留？
跨设备回来时保留了哪些上下文？
人怎样观察和接管 Agent？
共享 Session 的权限边界是什么？
日志、历史和敏感信息怎样保存？
它能否替代现有步骤，还是只增加新的一层？
```

## 继续观察

- [Superlogical 官方说明](https://www.superlogical.com/)
- [Mitchell Hashimoto 的创立公告](https://x.com/mitchellh/status/2093451043661316217)
- [Amplify Partners：为什么投资 Superlogical](https://www.amplifypartners.com/blog-posts/announcing-our-investment-in-superlogical)
- [Mitchell Hashimoto：Superlogical](https://mitchellh.com/writing/superlogical)
- [Ghostty 官方文档](https://ghostty.org/docs)
