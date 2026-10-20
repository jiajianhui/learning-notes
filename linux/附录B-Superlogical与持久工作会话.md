# 附录 B：Herdr、Superlogical 与持久工作现场

> 状态核对：2026 年 10 月 20 日。[Herdr 已提供 Linux、macOS 与 Windows 的稳定渠道版本](https://herdr.dev/docs/install/)；[Rex 于 10 月 5 日开始邀请制公测](https://www.superlogical.com/updates/public-testing-beginning)，首批仅开放 macOS 应用，其他平台尚未纳入这轮测试。
>
> 名称先对齐：Superlogical 是公司，Rex 是它的终端产品；Herdr 是独立的终端工作区管理器。

这篇附录围绕一个问题展开：**终端里的工作怎样持续保留，人怎样回来管理这些工作？** 先沿着同一个场景比较 tmux、Herdr 与 Rex，再补 Superlogical 的长期方向与团队背景。

## 同一个工作现场，三种侧重点

沿用[第 07 章的排错场景](./07-SSH断了工作还在-tmux与Zellij.md)：你一边看日志，一边检查接口，一边运行 Coding Agent。中途离开，之后还要回到同一个现场。

| 工具 | 一句话定位 | 放到这个场景里，重点看什么 |
|---|---|---|
| tmux | 通用的终端会话管理器 | 用 Session、Window、Pane 保留日志、检查和 Agent；Detach 后，再 Attach 回来 |
| Herdr | 面向多个 Coding Agent 的终端工作区 | 保留现场，再按项目组织终端，并汇总受支持 Agent 的状态，找到需要介入的那个 |
| Rex | 集成持久会话与远程连接的终端应用 | 从终端 App 进入本机或远端 Rex 服务端管理的现场，在当前公测范围内体验跨 Mac 重连 |

三者的能力有交集，表中列的是各自的介绍重点。它们各自实现会话管理，可以根据实际任务选择主要工作台。

共同的基础是：**后台服务保管终端进程，客户端可以离开再连接。** 工作持续运行依赖任务所在机器和后台服务继续运行；重启后重新创建布局、恢复 Agent 对话，是需要另外确认的能力。tmux 的基础机制与实操见[第 07 章](./07-SSH断了工作还在-tmux与Zellij.md)。

## Herdr：管理多个 Agent 的终端工作区

Herdr 官方把自己称为 terminal workspace manager。它自己的后台 Server 保管真实终端进程，Client 在终端 App 中显示工作区，离开客户端后，Pane 与 Agent 仍由后台服务管理。

相比 tmux 的 Session → Window → Pane，Herdr 使用自己的项目工作区结构：

```text
Session：一套独立运行的 Herdr 后台服务
└── Workspace：一个仓库、任务或调查
    └── Tab：agents、logs、server、review 等布局
        └── Pane：一个真实终端
            └── Agent：Herdr 在 Pane 中识别出的进程
```

Pane 里仍然运行着 Shell 或程序；当 Codex、Claude Code 等受支持程序运行在里面时，Herdr 会把它识别成 Agent，并显示：

```text
working：正在工作
blocked：需要输入、批准或决定
done：已完成，但你还没看
idle：已经看过，或者正在等待
unknown：暂时无法可靠判断
```

状态会从 Pane 汇总到 Tab 与 Workspace。现场扩展到多个项目、多个 Agent 时，你可以从工作区找到需要输入或已经完成的 Agent，减少逐个查看终端的次数。识别方式与支持范围见[Herdr Agent 文档](https://herdr.dev/docs/agents/)。

它还提供：

- 鼠标点击 Pane、拖动边界、右键分屏，不必先背快捷键。
- CLI、本地 Socket API 与插件，让脚本或 Agent 读取终端、等待状态并执行动作。
- 通过普通 SSH 在远程机器运行，也可以让本地客户端复用 `~/.ssh/config` 中的主机别名。
- 对受支持 Agent 使用集成上报的会话引用，在 Herdr Server 重启后尝试恢复 Agent 自己的原生会话。

最后一项恢复的是 Agent 自己的会话，任意进程能否恢复需要分别判断。日常选择一个主要工作台也更容易观察：Herdr 官方说明，它不会检查启动在 Herdr Pane 里面的 tmux Session；外层可能只看见 `tmux`，看不见里面的 Agent 状态。

## Rex：把终端、持久会话与远程连接一起设计

Rex 可以直接作为日常终端 App 使用。[2026 年 10 月 5 日的公测公告](https://www.superlogical.com/updates/public-testing-beginning)明确了这些能力与范围：

- 提供持久会话、远程连接和程序活动状态。
- macOS 应用自带 Rex 服务端，也能连接其他 Rex 服务端；多台 Mac 可以运行 Rex 并互相连接。
- 首批只测试 macOS 应用，通过邮件候补名单分批邀请。Linux、Windows 服务端已有内部运行版本，但与其他平台客户端一样，尚未纳入这轮公测。

跨机器连接的另一端需要 Rex 服务端。[当前安装总览](https://www.superlogical.com/rex/docs/installation)仍只开放 macOS，[Linux 安装说明](https://www.superlogical.com/rex/docs/linux/installation)页首也明确注明服务端尚未发布供测试，文档正在先行编写。因此，本轮 Linux 学习服务器仍使用 SSH + tmux；拿到邀请后，可以先在 Mac 上体验 Rex。

公告还承诺：Rex 客户端和服务端免费、无需账号，支持完全自托管；具体商业化计划仍待公布。测试邀请需要加入邮件名单，稳定公开版计划提供直接下载。

详细文档还说明了两种与 Agent 工作流有关的能力：

- **程序上报状态**：[Program Status Protocol](https://www.superlogical.com/rex/docs/build/program-status) 让程序主动告诉终端自己正在工作、等待用户、完成或失败，Rex 可以在会话选择器和标签页中显示状态提示。
- **Agent 操作终端**：[CLI 与内置 Agent skill](https://www.superlogical.com/rex/docs/automate/agent-skill) 让受支持的 Agent 创建标签页、分屏、读取终端画面和输入命令，帮助组织与检查工作现场。

因此，两者的比较也要看状态从哪里来：Herdr 可以识别受支持 Agent 的画面，或接收集成上报；Rex 的状态协议让程序主动上报。具体 Agent 是否已经接入、能否可靠提示需要人工介入的任务，要结合对应集成与实际体验确认。这里先认识这些能力，安装与配置暂不加入主线。

## 这和 Ghostty 是什么关系

Ghostty 提供终端窗口、输入与渲染，tmux、Zellij、Herdr 的客户端可以运行在它里面。Rex 则自己提供终端界面，可以作为另一种日常终端入口：

```text
Ghostty / Terminal.app
└── 里面可以运行 tmux / Zellij / Herdr 的终端客户端
    └── 连接各自的后台服务，保留终端进程

Rex macOS App
└── 自带终端界面，连接本机或其他机器上的 Rex 服务端

libghostty：可供终端应用使用的公开终端组件
```

从项目关系看，Ghostty 仍由非营利组织持有。Mitchell 在[创立说明](https://mitchellh.com/writing/superlogical)中表示，Superlogical 会使用公开的 MIT License `libghostty` 组件，并把通用改进贡献回上游；Ghostty 的使命、治理和开源路线继续保持独立。

## Superlogical 为什么从终端开始

它的长期方向叫 “multiplexer for all work”：让交互式工作、自动任务和生产工作共享一个可组合、可观察、可由人和软件共同控制的底层系统。

Agent 让这种需求更容易被看见：

```text
人提出目标
-> Agent 在本地或远程环境持续执行
-> 测试、日志和子任务并行发生
-> 人中途离开，又从另一台设备回来
-> 人需要看见历史、验收结果、接管操作或停止任务
```

这些工作可能跨越本地机器、远程服务器、CI 和生产系统。Superlogical 想让工作本身拥有长期存在的 Session，让人和程序都能读取状态、保留历史并执行动作。

[官网](https://www.superlogical.com/)也描述了 Web、原生 macOS / iOS 访问和实时共享 Session 的方向。当前公测开放哪些平台与功能，以具体测试公告为准；这些长期目标需要与 Rex 已公开的能力分开阅读。

## 补充背景：Superlogical 的团队

Mitchell 创建了 Ghostty，联合创办 HashiCorp，并创建 Vagrant、Terraform、Vault 等开发者基础设施工具。Superlogical 的[创立团队](https://www.superlogical.com/)有 4 人：

| 成员 | 带来的经验 |
|---|---|
| Mitchell Hashimoto | Ghostty 作者；HashiCorp 联合创始人；Vagrant、Terraform、Vault 等工具的创建者 |
| Jack Pearkes | HashiCorp 第一位员工，后来担任工程与研发副总裁；参与早期产品并组建原始工程团队 |
| Alasdair Monk | 曾在 Poolside、Vercel、HashiCorp、Heroku 负责开发者产品体验与设计 |
| Hector Simpson | 曾为 Poolside 设计应用、服务与 Agent 体验，也在 Heroku、HashiCorp、Clearbit、Vercel 做过开发者产品 |

机构投资者是 Notable Capital 与 Amplify Partners；官网列出的个人支持者包括：

```text
Aaron Levie       Armon Dadgar       Dax Raad
Greg Foster       Guillermo Rauch    Jacob Thornton
Mario Zechner     Merrill Lutsky      Patrick Collison
Paul Copplestone  Stephen Haney       Steve Ruiz
Tobias Lütke      Tomas Reimers
```

这些背景解释了团队在开发者工具上的积累。工具是否适合自己，仍要放回实际任务中比较。

## 现在最好的学习动作

先用通用概念完成主线，再按实际需求体验工具：

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

5. 对 Rex 感兴趣时加入官网邮件候补名单，获得邀请后，在 Mac 或多台 Mac 上体验同一个任务。Linux 服务端公开参与测试后，再验证它能否接入现有学习服务器。

比较时记录这些实际结果：

```text
客户端离开或连接断开后，任务是否可靠保留？
跨设备回来时保留了哪些上下文？
哪些 Agent 状态可以自动识别，人怎样回来接管？
如果提供共享 Session，权限怎样控制？
日志、历史和敏感信息怎样保存？
它替代了哪些现有步骤，需要额外维护什么？
```

## 继续观察

- [tmux 官方入门](https://github.com/tmux/tmux/wiki/Getting-Started)
- [Herdr 官方文档](https://herdr.dev/docs/)
- [Herdr 核心概念](https://herdr.dev/docs/concepts/)
- [Herdr：Agent 状态与集成](https://herdr.dev/docs/agents/)
- [Herdr：持久会话与远程 SSH](https://herdr.dev/docs/persistence-remote/)
- [Superlogical 官方说明](https://www.superlogical.com/)
- [Rex：公测范围、费用与参与方式](https://www.superlogical.com/updates/public-testing-beginning)
- [Rex：当前安装范围](https://www.superlogical.com/rex/docs/installation)
- [Rex：程序状态上报协议](https://www.superlogical.com/rex/docs/build/program-status)
- [Rex：Agent 操作终端](https://www.superlogical.com/rex/docs/automate/agent-skill)
- [Mitchell Hashimoto 的创立公告](https://x.com/mitchellh/status/2093451043661316217)
- [Amplify Partners：为什么投资 Superlogical](https://www.amplifypartners.com/blog-posts/announcing-our-investment-in-superlogical)
- [Mitchell Hashimoto：Superlogical](https://mitchellh.com/writing/superlogical)
- [Ghostty 官方文档](https://ghostty.org/docs)
