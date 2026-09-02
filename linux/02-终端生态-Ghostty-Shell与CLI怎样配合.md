# 02. 打开终端这只透明盒子：Ghostty、Shell 与 CLI 怎样配合

打开 Ghostty，输入：

```bash
git --version
```

屏幕上只有一行字，背后却有好几个角色同时工作。

最容易记的版本是：

```text
Ghostty / Terminal.app / iTerm2
-> 提供终端窗口

zsh / bash / fish
-> 读取并解释命令

ssh / git / npm / docker
-> 完成具体任务

macOS / Linux
-> 管理进程、文件、内存、设备和网络
```

这是一张使用地图，不是一摞从上到下安装的软件。操作系统始终在最底下支撑所有进程；终端会话管理器也是按需加入，不是每条命令必须经过的固定层。

---

## Ghostty 负责“看见”和“输入”

Ghostty、iTerm2 和 Terminal.app 都是终端模拟器。

它们主要负责：

- 创建窗口、标签页和分屏。
- 接收键盘与鼠标输入。
- 显示字符、颜色、光标和全屏终端界面。
- 理解程序发来的终端控制序列。

它们不负责理解：

```bash
cd ~/projects
npm run dev
git status
```

真正解释这些输入的是 Shell。

Ghostty 的优势是启动快、使用原生界面、终端能力现代，而且官方强调开箱即用。第一轮先用默认配置。换字体、主题和几十个快捷键不会让 Shell 或 Linux 基础变得更扎实。

## Shell 是一直等你说话的命令解释器

macOS 默认常见 `zsh`，Ubuntu 服务器常见 `bash`。

Shell 会处理：

- `cd` 这类 Shell 内建命令。
- `$PATH`、`$HOME` 等变量。
- `*` 通配符、引号和变量展开。
- `|`、`>`、`&&` 等组合规则。
- 找到并启动 `git`、`node`、`ssh` 等程序。

所以：

```bash
printf "node\npostgres\nnode\n" | sort | uniq -c
```

不是某一个万能工具完成的。Shell 建立管道，让 `printf`、`sort` 和 `uniq` 三个程序依次合作。

Shell 既可以交互使用，也是一门小型编程语言。现在先学会交互和组合；复杂 Shell 脚本等真实重复任务出现后再学。

## CLI 是被叫来干活的程序

CLI 表示命令行界面。它描述的是使用方式，不是实现语言。

```text
git     -> 版本控制工具
ssh     -> 远程连接客户端
npm     -> Node.js 包管理 CLI
docker  -> Docker 客户端 CLI
codex   -> AI Coding Agent CLI
```

某个 CLI 可以用 Rust、Go、C、Python 或 Node.js 实现。Shell 只需要能在 `PATH` 中找到并启动它。

输入：

```bash
type cd
type git
which node
```

你会看到 `cd` 通常属于 Shell 自己，而 `git`、`node` 是磁盘上的外部程序。

## 为什么 Linux 总和终端一起出现

技术上，它们完全不是一回事：

- Linux 是操作系统内核和围绕它形成的系统生态。
- 终端模拟器是运行在操作系统上的应用。
- Shell 和 CLI 也只是操作系统中的进程。
- Linux 桌面完全可以运行 GNOME、KDE、Hyprland 等图形界面。
- Ghostty、zsh、tmux 和大量 CLI 同样可以运行在 macOS。

但到了开发和服务器工作流，它们又贴得很紧：

```text
服务器通常不安装桌面
-> 人通过 SSH 远程进入
-> Shell 成为主要交互入口
-> 配置、日志和自动化大多能用文本处理
-> 小型 CLI 可以通过管道组合
-> 同一套动作容易复现到另一台服务器
```

Unix 传统很重视“小工具通过文本流组合”。例如：

```bash
ps aux | grep '[n]ode'
```

`ps` 产生进程列表，Shell 建立管道，`grep` 只筛选含有 `node` 的行。每个程序只完成一小段工作，组合关系则留在命令中。

所以可以说“终端是 Linux 服务器最常用的语言”，但不要进一步误解成：Linux 就是终端，或者会用终端就已经学完 Linux。

Linux 仍然有两张脸：

```text
Linux
├── GUI 工作流
│   ├── GNOME / KDE
│   └── Hyprland / Omarchy
│
└── Terminal-first 工作流
    ├── Shell 与 CLI
    ├── SSH
    ├── tmux / Zellij
    ├── Git / Docker
    └── Vim / Neovim / AI Coding Agent
```

当前路线先学第二张脸，因为它与云服务器和你的 Web 技术栈直接相连；GUI 那张脸留在附录 A 的 DHH 支线体验。

## 现在亲手看看自己站在哪一层

在 Mac 终端运行：

```bash
printf "当前 Shell 进程："
ps -p $$ -o comm=

printf "登录默认 Shell："
echo "$SHELL"

printf "当前终端设备："
tty

printf "终端能力标识："
echo "$TERM"

printf "操作系统内核："
uname -s
```

这里有两个容易混淆的点：

- `$SHELL` 通常记录当前用户的登录默认 Shell，不保证等于此刻正在运行的 Shell。
- `$TERM` 描述终端能力，不是可靠的 App 名称。Ghostty 常使用 `xterm-ghostty`，让远程程序知道它支持哪些显示能力。

如果 SSH 到旧服务器后出现 `unknown terminal type` 或全屏程序显示异常，才去检查远端 `terminfo`。第一轮不用提前修改配置。

## SSH 会把本地世界接到远端世界

真正连接服务器时，关系更像这样：

```text
Mac
└── Ghostty：显示窗口
    └── zsh：读取本地命令
        └── ssh：建立加密连接
                ↓
Linux Server
└── sshd：接住连接并验证身份
    └── bash：提供远程 Shell
        ├── journalctl
        ├── docker
        └── tmux / Herdr，可选，通常二选一
```

SSH 以后输入的 `pwd`、`ls` 和 `docker` 在远程 Linux 执行，但输出仍沿着 SSH 回到 Mac，由 Ghostty 显示。

这也解释了为什么 `localhost` 会变化：命令在哪台机器或哪个容器执行，`localhost` 就指向谁自己。

## Ghostty 分屏和 tmux 分屏看起来像，命却不一样

Ghostty 的标签页和分屏属于 Mac 上的 GUI App。tmux / Zellij 的窗口和分屏属于它们所在机器上的长期会话。

```text
Ghostty 分屏
-> 方便同时看多个本地终端
-> 关闭 App 后，不负责让远端任务继续运行

服务器里的 tmux 分屏
-> 由远端 tmux 进程管理
-> SSH 断开后，会话与内部进程仍可继续
```

所以二者不是非此即彼。常见组合正是：

```text
Mac Ghostty
-> zsh
-> ssh
-> Ubuntu bash
-> tmux
-> 日志、测试或交互式 Agent
```

等第 04 章建立 SSH 连接后，[第 07 章](./07-SSH断了工作还在-tmux与Zellij.md) 会把最后两层真正跑起来。

## 选工具时只回答一个问题

| 现在想改善什么 | 对应工具 |
|---|---|
| 想要更舒服的 Mac 终端窗口 | Ghostty、iTerm2 或 Terminal.app |
| 想改变命令补全、语法和交互 | zsh、bash 或 fish |
| 想让 SSH 断开后远端任务继续 | tmux、Zellij，或兼顾 Agent 的 Herdr |
| 想在持久终端里照看多个 Coding Agent 的状态 | Herdr |
| 想编辑终端里的文件 | Vim、Neovim 或其他编辑器 |
| 想管理长期线上服务 | Docker Compose 或 systemd |

不同层的工具不要放进同一场比赛。Ghostty 不能替代 Shell，tmux 也不能替代生产服务管理。

Herdr 也不是另一款 Ghostty。它运行在 Terminal、Ghostty 等终端 App 里面，先承担一部分 tmux 式的持久工作区职责，再向上识别 Agent 状态。这里先知道它站在哪一层即可，第 07 章才会解释什么时候值得使用。

## 关掉窗口前，讲清这段故事

```text
我在 Ghostty 里输入 git status
-> ______ 读取这行命令
-> ______ 被找到并启动
-> ______ 管理这些进程和文件
-> 输出最终由 ______ 显示
```

答案依次是 Shell、Git CLI、操作系统、Ghostty。

下一站进入[第 03 章](./03-命令行基础-从macOS终端到Linux.md)，让这些角色通过文件、管道、PATH 和一个 Node.js 进程真正配合起来。

## 路边资料

- [Ghostty 官方文档](https://ghostty.org/docs)
- [Ghostty：Terminfo 与 SSH](https://ghostty.org/docs/help/terminfo)
- [GNU Bash：Shell 是什么](https://www.gnu.org/software/bash/manual/html_node/What-is-a-shell_003f.html)
- [POSIX：Pipeline](https://pubs.opengroup.org/onlinepubs/9699919799.2013edition/utilities/V3_chap02.html#tag_18_09_02)
