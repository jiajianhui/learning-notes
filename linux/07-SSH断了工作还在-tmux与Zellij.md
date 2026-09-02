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

## Herdr：从 tmux 同一层起步，再向上多认一层

[Herdr](https://herdr.dev/docs/) 是已经发布的终端工作区管理器。它同样把终端进程放在后台 Session 中，让客户端 Detach 后进程继续，再回来 Attach；但组织方式多了一层项目工作区：

```text
Herdr Session
└── Workspace：一个项目或任务
    └── Tab：项目中的一种布局
        └── Pane：一个真实终端
            └── Shell、命令或 Coding Agent
```

Herdr 还会识别 Pane 中常见的 Coding Agent，把 `working`、`blocked`、`done`、`idle` 等状态汇总到 Tab 和 Workspace。你同时跑几个 Agent 时，不必挨个终端查看谁正在做、谁需要决定、谁已经完成。

| 角度 | tmux | Herdr |
|---|---|---|
| 基础能力 | 持久 Session、Window、Pane、Detach / Attach | 同样保留终端现场，并增加 Workspace 与 Tab |
| 交互 | 以命令和前缀快捷键为主 | 鼠标优先，也保留前缀快捷键 |
| 是否理解 Agent | 只知道 Pane 里有一个进程 | 能识别常见 Agent 并汇总状态 |
| 自动化 | 命令与脚本生态成熟 | 还提供面向 Pane、Agent 的 CLI、本地 API 与插件 |
| 现在怎样学 | 第一轮必做，概念简单且服务器普及 | 多 Agent 已经带来监督负担时再试 |

所以 Herdr 不是“比 tmux 更底层一层”。更准确的说法是：**它从同一层的持久终端能力起步，再向上增加一层 Agent 语义和工作区管理。**

日常选一个作为主要工作台即可，不要机械地在 Herdr Pane 里再启动 tmux。Herdr 官方说明它不会检查内层 tmux Session，届时外层可能只看见 `tmux`，看不见里面的 Agent 状态。

## 针对你的默认选择

第一轮先学 tmux，理由很实际：

- Ubuntu 上容易安装。
- 与 SSH 服务器场景直接相关。
- 四个动作就能看懂 Session、Window、Pane、Detach 与 Attach 的关系。
- 以后换 Zellij、Herdr 或将来的 Superlogical，这组基础概念仍然能复用。

“先学 tmux”不等于以后必须永远使用 tmux。开始同时监督多个 Agent，并且经常检查谁卡住、谁完成时，Herdr 就有实际价值；主要只是嫌快捷键难发现、需要可复用布局时，再试 Zellij。Superlogical 目前继续观察，不进入安装步骤。

## Agent 工作流：给未来的 Agent 留一张可接管的工作台

这里的 Agent 工作流首先是一组可以被人看见、暂停和接管的运行关系：Agent 在哪台机器工作，用什么权限，修改了哪些文件，测试和日志在哪里，人怎样回来验收。tmux 可以承载它，Herdr 则进一步尝试自动看懂这些工作台的状态。

以后可以把一个临时开发 Session 组织成：

```text
mini-cms-dev
├── agent：Codex / Claude Code 等交互式 Agent
├── tests：类型检查和测试
└── logs：观察开发环境日志
```

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
