# 附录 B：Herdr、Superlogical 与持久工作现场

> 状态记录：2026 年 8 月 30 日。Superlogical 尚未公开发布首个 beta，当前不能把它当成已经可安装的 tmux 替代品。
>
> Herdr 更新：2026 年 9 月 2 日。Herdr 已公开发布 Linux、macOS 与 Windows 的稳定渠道版本，可以实际安装；它不是 Superlogical 的 beta，也与 Superlogical 没有从属关系。

Superlogical 一亮相就同时带来了两个钩子：一支夸张的开发者工具团队，以及一个听上去并不新鲜的起点——terminal multiplexer。先看是谁组了队，再看他们为什么从这里出发；然后用已经发布的 Herdr，看看“tmux 之上再多认一层 Agent”现在究竟长什么样。

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

## Herdr：未来方向已经有一个可以玩的现实版本

Herdr 官方把自己称为 terminal workspace manager。它的底座并不神秘：后台 Server 保管真实终端进程，Client 可以离开再回来，Pane 与 Agent 仍然继续运行。

它在 tmux 的 Session → Window → Pane 关系上，多加了适合多项目与 Agent 的结构：

```text
Session：一套独立运行的 Herdr 后台服务
└── Workspace：一个仓库、任务或调查
    └── Tab：agents、logs、server、review 等布局
        └── Pane：一个真实终端
            └── Agent：Herdr 在 Pane 中识别出的进程
```

这里的 Agent 不是 Pane 旁边的另一种容器。Pane 无论如何都存在；当 Codex、Claude Code 等受支持程序运行在里面时，Herdr 才把它识别成 Agent，并显示：

```text
working：正在工作
blocked：需要输入、批准或决定
done：已完成，但你还没看
idle：已经看过，或者正在等待
unknown：暂时无法可靠判断
```

状态会从 Pane 汇总到 Tab 与 Workspace。Herdr 真正解决的新痛点不是“能不能再切一块屏幕”，而是“同时跑了五个 Agent，我怎样一眼找到需要我的那个”。

它还提供：

- 鼠标点击 Pane、拖动边界、右键分屏，不必先背快捷键。
- CLI、本地 Socket API 与插件，让脚本或 Agent 读取终端、等待状态并执行动作。
- 通过普通 SSH 在远程机器运行，也可以让本地客户端复用 `~/.ssh/config` 中的主机别名。
- 对受支持 Agent 使用集成上报的会话引用，在 Herdr Server 重启后尝试恢复 Agent 自己的原生会话。

最后一项比普通 Detach / Attach 更进一步，但不等于任何进程都能穿越关机。判断“还活着”“重新启动”“恢复 Agent 对话”时，仍要分清具体发生了哪一种恢复。

## Ghostty、tmux、Zellij、Herdr 与 Superlogical 不在同一层、也不在同一起跑线

| 工具 | 主要负责什么 | 当前状态 | 现在该怎么做 |
|---|---|---|---|
| Ghostty | 本地终端窗口、输入与渲染 | 已发布的终端模拟器 | 按手感使用，不负责保住远端进程 |
| tmux | 通用的持久 Session、Window 与 Pane | 成熟、服务器上广泛可用 | 作为第 07 章第一轮实操 |
| Zellij | 更现代、可发现的终端工作区与布局 | 已发布 | 有布局、交互或恢复需求后选试 |
| Herdr | 持久终端工作区 + Agent 识别、状态汇总与自动化 | 已发布，仍是较新的工具 | 多 Agent 监督成为真实痛点时试玩 |
| Superlogical | 从终端多路复用器出发，走向 “multiplexer for all work” | 尚未公开首个 beta | 关注，不纳入学习前置 |

“下一代 tmux”可以帮助第一眼理解 Superlogical，但不够准确。它的起点是 terminal multiplexer，长期目标则明显大于终端分屏。

Herdr 与 tmux 则已经可以比较：二者从同一层的持久终端能力起步，Herdr 再向上增加 Agent 语义、项目工作区和自动化接口。它不是更底层，而是向上多走了一层。

也不要为了“都用上”而机械套娃。Herdr 官方明确说明，它不会检查启动在 Herdr Pane 里面的 tmux Session；外层看到的可能只是 `tmux`，从而看不见内层 Agent 的状态。日常选一个作为主要工作台更清楚。

## 这和 Ghostty 是什么关系

Ghostty 是终端模拟器，负责本地窗口、输入与渲染。Mitchell 已将 Ghostty 捐给非营利组织，并明确表示它不会因 Superlogical 而改变使命、治理或开源路线。

Superlogical 会使用公开的 MIT License `libghostty` 组件构建自己的终端能力，就像其他使用者一样，并计划把通用改进继续贡献回上游。

所以目前不要画成：

```text
Ghostty -> 被 Superlogical 取代
```

更合适的是把层级拆开：

```text
Ghostty：负责本地终端窗口与渲染
└── 里面可以运行 tmux、Zellij 或 Herdr

tmux / Zellij：通用持久终端工作区
Herdr：持久终端工作区 + Agent 状态
Superlogical：尚未发布、从 multiplexer 走向更大工作基础设施的产品

libghostty：Ghostty 与未来 Superlogical 都能使用的公开终端组件
```

## 现在最好的学习动作

不需要为了新工具重建整套工作流，也不用因为学了 tmux 就排斥 Herdr。

按由浅入深的顺序做：

1. 用[第 02 章](./02-终端生态-Ghostty-Shell与CLI怎样配合.md)分清终端模拟器、Shell、CLI 与操作系统。
2. 用[第 07 章](./07-SSH断了工作还在-tmux与Zellij.md)亲手体验一次 Detach 与 Attach。
3. 只有当多个 Agent 已经让你频繁巡查终端时，再在 Mac 可选试玩 Herdr：

   ```bash
   brew install herdr
   herdr
   ```

4. 你现有的 `ssh aliyun` 已经可用时，Herdr 的远程模式也能复用同一个 SSH 别名：

   ```bash
   herdr --remote aliyun
   ```

   先保证普通 `ssh aliyun` 能登录；Herdr 若需要在远端安装匹配版本，会交互式提示，不把它当作这一套 Linux 主线的必做步骤。

5. 继续关注 Superlogical 的公开进展，等 beta 出现后再用同一个实际任务与 tmux、Zellij、Herdr 比较。

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

- [Herdr 官方文档](https://herdr.dev/docs/)
- [Herdr 核心概念](https://herdr.dev/docs/concepts/)
- [Herdr：Agent 状态与集成](https://herdr.dev/docs/agents/)
- [Herdr：持久会话与远程 SSH](https://herdr.dev/docs/persistence-remote/)
- [Superlogical 官方说明](https://www.superlogical.com/)
- [Mitchell Hashimoto 的创立公告](https://x.com/mitchellh/status/2093451043661316217)
- [Amplify Partners：为什么投资 Superlogical](https://www.amplifypartners.com/blog-posts/announcing-our-investment-in-superlogical)
- [Mitchell Hashimoto：Superlogical](https://mitchellh.com/writing/superlogical)
- [Ghostty 官方文档](https://ghostty.org/docs)
