# 07. SSH 断了，工作还在：第一次使用 tmux

你 SSH 进服务器，启动一个需要十分钟的任务。三分钟后 Mac 合盖、Wi-Fi 切换，SSH 断了。

直接运行在远程 Shell 里的交互式任务可能跟着连接一起结束。tmux 做的事情，是把“任务活多久”与“这次 SSH 连接活多久”拆开：

```text
SSH 连接：可以断开再重连
tmux 会话：继续留在服务器上
会话里的进程：继续由 tmux 管理
```

这就是终端多路复用器最值得先学的能力。分屏只是顺带得到的好处。

---

## 先在学习服务器装 tmux

SSH 登录 Ubuntu 学习服务器：

```bash
ssh linux-learning
```

确认当前位置确实是服务器：

```bash
hostname
whoami
cat /etc/os-release
```

然后安装：

```bash
sudo apt update
sudo apt install tmux
tmux -V
```

第一轮不下载别人的 `.tmux.conf`，也不安装插件。默认快捷键已经足够证明会话为什么有用。

## 给这次实验取个名字

```bash
tmux new -s playground
```

tmux 会创建一个名为 `playground` 的 Session，并立刻连接进去。

先认五个词，后面就不会像在背暗号。tmux 的内部关系是：

```text
Session：一次工作现场
└── Window：现场中的一个工作区
    └── Pane：真正运行 Shell 或程序的格子
```

- **Session**：整个可长期保留的工作现场，里面可以有多个 Window。
- **Window**：Session 里的一个工作区，很像标签页；一个 Window 又可以切成多个 Pane。
- **Pane**：屏幕上真正运行一个 Shell 或前台程序的格子。
- **Detach**：人暂时离开这个现场，但不结束 Session 和里面的程序。
- **Attach**：以后重新连回同一个现场。

这些不是 Linux 内核概念，而是 tmux、Zellij、Herdr 等工作区工具会反复使用的词，所以只在真正开始用 tmux 时加入。常说的“建立心智模型”，在这里也不是什么额外理论，只是脑中能画出“谁包含谁、离开和结束有什么区别”的这张地图。

现在只有一个 Window、一个 Pane，里面运行着新的 Shell。

## 启动一只不停走动的秒针

在 tmux 中运行：

```bash
watch -n 1 'date; echo; hostname; echo; whoami'
```

时间会每秒刷新。它不是什么有用的生产任务，只是一个很容易辨认“仍在运行”的实验对象。

现在按：

```text
Control-b
松开
d
```

这叫 Detach。你离开了 tmux 的显示界面，但没有结束 Session，也没有停止里面的 `watch`。

## 故意把 SSH 连接关掉

回到远程 Shell 后执行：

```bash
tmux ls
exit
```

现在 Mac 已经回到本地 Shell。重新连接：

```bash
ssh linux-learning
tmux ls
tmux attach -t playground
```

如果秒针仍在更新，实验成功：

```text
旧 SSH 连接已经结束
-> tmux server 仍在 Linux 服务器运行
-> playground Session 仍然存在
-> watch 进程也仍在其中运行
-> 新 SSH 连接重新 Attach 到同一现场
```

## 收好实验现场

回到 `watch` 后按 `Control-C` 停止它，再输入：

```bash
exit
```

最后一个 Pane 关闭后，这个 Session 也会结束。确认：

```bash
tmux ls
```

看到 `no server running` 或没有 Session 都是正常结果。

不要用 `tmux kill-server` 当普通退出命令。它会结束当前用户的所有 tmux Session。

## 只记四个动作就够了

| 动作 | 命令或按键 |
|---|---|
| 新建并进入命名 Session | `tmux new -s playground` |
| 暂时离开，任务继续 | `Control-b`，再按 `d` |
| 查看仍在运行的 Session | `tmux ls` |
| 回到指定 Session | `tmux attach -t playground` |

需要第二个工作区时，再加一条：`Control-b`，再按 `c` 创建 Window。

先别急着背分屏、复制模式和一整张快捷键表。能离开并回来，已经抓住了 tmux 的核心。

## SSH、tmux 和服务管理各管多久

```text
SSH
-> 管一次远程连接

tmux / Zellij / Herdr
-> 管一个可离开、可回来的交互式工作现场

Docker Compose / systemd
-> 管应该自动启动、崩溃重启、长期运行的线上服务
```

适合放进 tmux：

- 临时观察日志。
- 运行测试或构建。
- 使用 Vim / Neovim。
- 运行需要人工交互的 AI Coding Agent。
- 在学习环境中同时观察几个命令。

不应该只靠 tmux：

- 生产环境的 Express API。
- 正式 Next.js 服务。
- PostgreSQL 数据库。
- 必须在服务器重启后自动恢复的任务。

tmux 能熬过 SSH 断线，但熬不过服务器关机、tmux 进程退出或主机故障。它也不会替你做健康检查、重启策略和日志轮转。

## `nohup &`、tmux 与 Docker 不要混用答案

| 工具 | 更适合的场景 | 能否回来继续交互 |
|---|---|---|
| `nohup command &` | 简单、非交互的临时后台命令 | 不方便 |
| tmux / Zellij / Herdr | 人还会回来查看和输入的终端工作 | 可以 |
| Docker Compose / systemd | 需要被系统长期监督的服务 | 通过日志和管理命令操作 |

如果你想“回来看到原来的终端画面”，选 Session 管理器。如果你想“服务器重启后网站自动回来”，选服务管理。

## Zellij 是另一种现代答案

Zellij 与 tmux 解决相近问题，但更强调开箱可见的界面、布局、插件和现代交互。

当前值得知道的差异：

| 角度 | tmux | Zellij |
|---|---|---|
| 第一印象 | 朴素，很多能力藏在快捷键和命令里 | 状态栏会提示常用操作 |
| 服务器普及度 | 很高，资料和系统包丰富 | 较新，需要额外确认安装方式和版本 |
| 配置与布局 | `.tmux.conf` 和命令 | KDL 配置、Layout 和插件 |
| Session 恢复 | 运行中的 tmux server 保存现场 | 还可序列化已退出 Session 的布局和命令 |
| Web 访问 | 本身不提供 | 当前版本提供可选 Web Client |

Zellij 的 Session Resurrection 不等于让进程穿越服务器重启。它保存布局与命令，之后重新创建现场；默认会先等待你确认，再重新执行发现的命令。

Zellij 的 Web Client 也不是第一轮服务器练习的公网入口。它默认关闭，并涉及认证、HTTPS 和新的攻击面。现在继续通过 SSH 使用 tmux 即可。

## Herdr：管理多个 Agent 的终端工作区

[Herdr](https://herdr.dev/docs/) 是已经发布的终端工作区管理器。它由自己的后台服务保管终端进程，客户端可以离开再连接，并按项目工作区组织终端。

它还会识别终端里受支持的 Coding Agent，汇总谁正在工作、谁需要输入、谁已经完成。你同时跑几个 Agent 时，可以直接找到需要自己介入的那个。

它适合解决“多个 Agent 让我频繁巡查终端”的问题。工作区结构、状态含义与自动化接口集中放在[附录 B](./附录B-Superlogical与持久工作会话.md)，这里先掌握它与 tmux 共有的离开、重连与保留现场。

## Rex：把持久会话融入终端应用

[Rex](https://www.superlogical.com/updates/public-testing-beginning) 是 Superlogical 的终端产品。它可以作为日常终端入口，macOS 应用自带 Rex 服务端，也能连接其他机器上的 Rex 服务端，把终端界面、持久会话和远程连接一起设计。

按 2026 年 10 月 5 日的公测公告，首批只开放 macOS 应用，并通过邮件候补名单分批邀请。Linux 服务端尚未纳入这轮测试，因此本章继续用 SSH + tmux 完成服务器练习；获得邀请后，可以在 Mac 上体验 Rex。当前能力与后续方向见[附录 B](./附录B-Superlogical与持久工作会话.md)。

## 针对你的默认选择

第一轮先学 tmux，理由很实际：

- Ubuntu 上容易安装。
- 与 SSH 服务器场景直接相关。
- 四个动作就能看懂 Session、Window、Pane、Detach 与 Attach 的关系。
- 以后使用 Zellij、Herdr 或 Rex，这组基础概念仍然能复用。

之后按实际需求选择：需要更容易发现的操作与可复用布局时试 Zellij，需要监督多个 Agent 时试 Herdr，获得公测邀请后再体验 Rex 的终端与跨 Mac 连接。这些工具各自管理会话，可以直接选择适合任务的工具。

## Agent 工作流：给未来的 Agent 留一张可接管的工作台

这里的 Agent 工作流首先是一组可以被人看见、暂停和接管的运行关系：Agent 在哪台机器工作，用什么权限，修改了哪些文件，测试和日志在哪里，人怎样回来验收。tmux 可以承载它，Herdr 则进一步尝试自动看懂这些工作台的状态。

这里也正好可以分清 CLI 与 TUI：

- CLI 通常接收参数，输出结果，然后结束，例如 `git status` 和 `curl URL`。
- TUI 在终端里持续显示和接收操作，例如 `top`、tmux、Zellij 和交互式 Coding Agent。
- 一条 CLI 命令可以启动一个 TUI，它们描述的是两种交互方式，不是互相排斥的工具类别。

### “快”不是每一次切换都更快

如果只是切换 Codex 任务、浏览文件、审查 diff 或查看图片，GUI 往往更快，也更容易发现功能。TUI 的优势不在单次点击，而在持续保留同一个文本工作现场：

```text
GUI
-> 更快地寻找、浏览和切换对象

CLI
-> 更准确地重复和组合动作

TUI
-> 同时保留几个持续运行的文本现场
```

### 一个真正占优势的现场

以后 Mini CMS 已经用 Docker Compose 运行时，假设 API 偶尔请求失败。你已经进入 Compose 配置所在目录，可以把临时排错 Session 组织成：

```text
minicms-debug
├── logs：持续观察 API 日志
├── check：每两秒检查一次健康接口
└── agent：交互式 Coding Agent 或普通 Shell
```

`logs` Pane 持续显示新日志：

```bash
docker compose logs -f --tail=100 api
```

`check` Pane 持续检查 Express 健康接口：

```bash
watch -n 2 'curl -fsS http://127.0.0.1:3001/api/articles/health || echo FAIL'
```

这里的 `curl -f` 会把 HTTP 错误状态当作失败，`-sS` 隐藏普通进度但保留错误；只有 `curl` 返回非零退出码时，Shell 才执行 `||` 后面的 `echo FAIL`。

`agent` Pane 留给 Coding Agent 或人工排查。例如先收窄最近十分钟的错误：

```bash
docker compose logs --since=10m api | grep -E 'ERROR|ECONNREFUSED'
```

如果日志出现数据库连接失败，左边保留原始证据，右上仍在重复检查接口，右下则检查 Compose 状态和 `DATABASE_URL`。修复测试环境配置并重启服务后，不必重新打开三个页面：日志出现新的启动记录，健康检查也会从 `FAIL` 变回正常响应。

这里真正节省的是恢复现场和搬运信息的时间：

- SSH 断开后，日志、检查和 Agent 仍留在同一个 Session。
- 命令输出可以通过管道直接筛选，不需要在几个界面之间复制粘贴。
- 同一条检查命令可以由人、Agent 或脚本重复执行，退出码仍然表达相同结果。
- 日志、检查与修改同时可见，修复是否生效能立刻得到反馈。

线上 API 本身仍然应该交给 Docker Compose 或 systemd 管理；tmux 只保留人和 Agent 的临时观察、测试与排错现场。

```text
人给出目标和边界
-> Agent 在明确的仓库与 Session 中工作
-> 测试和日志留下可检查的证据
-> 人随时观察、停止或接管
-> 确认结果后再进入部署
```

这仍然只是开发或排错工作台。不要让 Agent 在无人观察时持有不必要的生产权限，也不要因为 Session 能长期存在，就把密钥直接打印在 Pane 中。

tmux 解决的是“连接断了，交互现场还在”，并没有决定谁能从互联网连接这台机器。下一站进入[第 08 章](./08-云服务器网络安全组与防火墙.md)，把 SSH 端口、网站入口和数据库端口分别放到正确的门后面。

## 路边资料

- [tmux 官方入门](https://github.com/tmux/tmux/wiki/Getting-Started)
- [tmux 官方安装说明](https://github.com/tmux/tmux/wiki/Installing)
- [Zellij：Session Resurrection](https://zellij.dev/documentation/session-resurrection.html)
- [Zellij：Web Client](https://zellij.dev/documentation/web-client.html)
- [Herdr：核心概念](https://herdr.dev/docs/concepts/)
- [Herdr：Agents](https://herdr.dev/docs/agents/)
- [Rex：公测范围与参与方式](https://www.superlogical.com/updates/public-testing-beginning)
- [OpenAI：创建可供 Codex 组合调用的 CLI](https://learn.chatgpt.com/use-cases/agent-friendly-clis)
