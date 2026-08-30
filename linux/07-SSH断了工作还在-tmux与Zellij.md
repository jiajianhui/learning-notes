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

内部关系是：

```text
Session：一次工作现场
└── Window：现场中的一个工作区
    └── Pane：真正运行 Shell 或程序的格子
```

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

tmux / Zellij
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
| tmux / Zellij | 人还会回来查看和输入的终端工作 | 可以 |
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

## 针对你的默认选择

第一轮先学 tmux，理由很实际：

- Ubuntu 上容易安装。
- 与 SSH 服务器场景直接相关。
- 四个动作就能建立 Session 心智模型。
- 以后换 Zellij 或 Superlogical，仍然会继续使用 Attach、Detach、Session、Pane 这些概念。

当你开始嫌 tmux 的默认交互难发现，或者真的需要可复用布局和 Session Resurrection，再单独试 Zellij。不要同时配置两套快捷键。

## 给未来的 Agent 留一张工作台

以后可以把一个临时开发 Session 组织成：

```text
mini-cms-dev
├── agent：Codex / Claude Code 等交互式 Agent
├── tests：类型检查和测试
└── logs：观察开发环境日志
```

这仍然只是开发或排错工作台。不要让 Agent 在无人观察时持有不必要的生产权限，也不要因为 Session 能长期存在，就把密钥直接打印在 Pane 中。

## 路边资料

- [tmux 官方入门](https://github.com/tmux/tmux/wiki/Getting-Started)
- [tmux 官方安装说明](https://github.com/tmux/tmux/wiki/Installing)
- [Zellij：Session Resurrection](https://zellij.dev/documentation/session-resurrection.html)
- [Zellij：Web Client](https://zellij.dev/documentation/web-client.html)
