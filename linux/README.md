# 从 Mac 出发，去 Linux 里跑一个网站

先说结论：你的 M1 Max MacBook Pro 不用让位。

DHH 对 Linux、Omakub 和 Omarchy 的热情很有感染力。但这趟旅程不从“换掉 macOS”开始，而从一个更有用也更好玩的目标开始：

```text
从 Mac 打开终端
-> 连进一台远程 Linux
-> 看懂文件、进程、日志和端口
-> 让 Next.js、Express 和 PostgreSQL 跑起来
-> 最后从浏览器打开自己的 HTTPS 网站
```

Linux 与终端在技术上不是一回事，但在服务器开发中几乎总是并肩出现。Linux 提供操作系统环境，终端模拟器、Shell、SSH 和 Session 管理器组成进入并操作它的工作流。这套路线会讲终端生态，但会一直标清每个工具的职责，不把它们都叫作 Linux。

你不需要先背一百条命令。每走一站，都应该能看到一点真实反馈：一个文件出现、一段文本穿过管道、一个端口开始监听、一条 SSH 隧道打通，或者一个容器真的返回网页。

---

## 00～10 是一条连续主线

数字章节全部属于必读主线。它们按照“先认清环境，再操作系统，再进入服务器，最后部署应用”的依赖关系排列。

### 第一幕：先在 Mac 上拆开黑盒

**00 · 先别换电脑**

[序章：你的 Mac 不用让位，Linux 先来当服务器](./00-序章-你的Mac不用让位.md)

先分清服务器 Linux、Linux 容器和 Linux 桌面。五分钟比较 macOS 与 Ubuntu，确认自己其实已经站在 Linux 门口。

**01 · 拆开“云服务器”这只盒子**

[Linux、Ubuntu、ECS、Docker 到底谁是谁](./01-Linux大图景-云服务器发行版与Mac.md)

把几个总在同一句话里出现的名词放回正确层级。买到 ECS 以后，你会知道自己究竟买了什么。

**02 · 打开终端这只透明盒子**

[Ghostty、Shell、CLI 与操作系统怎样配合](./02-终端生态-Ghostty-Shell与CLI怎样配合.md)

不把 Ghostty、zsh、tmux 和 Linux 画成一摞固定软件。亲手查看当前 Shell、TTY 和 `TERM`，先认清每天使用的终端环境。

**03 · 命令行游乐场**

[让文件、管道、PATH 和 Node.js 动起来](./03-命令行基础-从macOS终端到Linux.md)

在安全目录里造文件、接管道，再用 Node.js 临时开一家 8000 号小店。关掉进程后，亲眼看到端口也随之消失。

### 第二幕：进入没有桌面的 Linux

**04 · Linux 旅馆的门禁系统**

[文件住哪里，谁有钥匙，软件从哪来](./04-文件系统用户权限与软件安装.md)

沿着 `/home`、`/etc`、`/var` 逛一圈。下一次遇到 `Permission denied`，先查清谁在敲哪扇门，不再条件反射地加 `sudo`。

**05 · 网页失踪案**

[沿着进程、日志和端口找到它](./05-进程服务日志与端口.md)

把“网页打不开”当成一次侦探游戏：进程活着吗，监听谁，服务器自己能访问吗，又是哪道门把请求拦住了？

### 第三幕：从 Mac 穿过互联网

**06 · 给服务器配一把只认你的钥匙**

[SSH、密钥与 `~/.ssh/config`](./06-SSH-从Mac安全连接Linux.md)

把一长串 IP、用户名和私钥收进 `ssh linux-learning`。最后再开一条 SSH 隧道，访问没有暴露在公网的服务。

**07 · SSH 断了，工作还在**

[第一次使用 tmux，并认识 Zellij](./07-SSH断了工作还在-tmux与Zellij.md)

启动一只不断走动的秒针，Detach，关掉 SSH，再从新连接回到同一个现场。tmux 只练四个核心动作，Zellij 留作有真实需要时的替代方案。

**08 · 穿过三道门**

[公网 IP、安全组、防火墙与 HTTPS](./08-云服务器网络安全组与防火墙.md)

一个请求要依次穿过云安全组、Linux 防火墙和应用监听。你会亲手决定哪些门对全世界开，哪些只对自己开。

### 第四幕：把你的技术栈搬进去

**09 · 打开 Docker 套娃**

[容器不是一台迷你云服务器](./09-Docker与Linux-容器不是云服务器.md)

拆开 Mac、Linux 虚拟机、容器、网络和卷。启动一个 Nginx 容器，追踪 `127.0.0.1:8080:80` 的请求到底去了哪里。

**10 · 网站真的上线了**

[Next.js、Express、Prisma 与 PostgreSQL 在线上怎样碰头](./10-Nodejs-Nextjs-PostgreSQL怎样运行在线上.md)

把前面捡到的碎片拼成完整系统：443 入口、反向代理、应用端口、数据库、迁移、日志和备份。

---

## 附录是真正可以跳过的内容

附录不会为后续主线提供必需知识。感兴趣时打开，不读也不影响 00～10。

**附录 A · DHH 的 Linux 桌面世界**

[Omakub、Omarchy，以及要不要离开 macOS](./附录A-DHH-Omarchy与Linux桌面选读.md)

去碰 Arch、Hyprland、键盘工作流和 dotfiles。它讨论的是个人桌面选择，不是管理服务器的前置课程。

**附录 B · Superlogical 与未来的工作 Session**

[为什么它从终端多路复用器开始](./附录B-Superlogical与持久工作会话.md)

理解远程工作、Web、AI Agent 和长期 Session 为什么开始汇合。它目前尚未公开发布，只观察方向，不安排安装。

---

## 三种走法

**只想先尝鲜**

读 00～03。全程使用 Mac 和一个临时 Ubuntu 容器，不买服务器，也不会动到主力环境。

**想管好第一台云服务器**

继续走到 08。准备进入第 06 章时，再创建一台短期 Ubuntu 学习服务器；第 07 章会用它练习 tmux。

**想把自己的 Web 应用送上网**

走完 09～10。随后进入后端路线的 1Panel 部署实操，把概念落到 Mini CMS。

每次学习只做一站。命令跑出结果后，试着改变一个小地方：换个文件名、换个端口、停止一个进程，再猜结果会怎样。Linux 的乐趣大多藏在这种“我动了一下，它真的变了”里面。

---

## 默认装备

| 位置 | 第一轮选择 | 为什么这样选 |
|---|---|---|
| 主力电脑 | 继续使用 macOS | 性能充足，学服务器 Linux 不需要换系统 |
| Linux 发行版 | Ubuntu LTS | 新手资料多，云服务器和 Web 部署都顺手 |
| 本地试验场 | Mac 终端 + Docker 临时 Ubuntu 容器 | 随开随关，失败了重来即可 |
| 完整本地 Linux | UTM，可选 | 需要练 systemd 和完整启动流程时再加入 |
| 终端 App | Terminal 起步，想换手感时试 Ghostty | App 可以换，Shell、SSH 和命令仍然相通 |
| Shell | Mac 继续使用 zsh，Ubuntu 先使用 bash | 不为追新工具同时切换交互习惯 |
| 远程连接 | 系统 `ssh` + `~/.ssh/config` | 配置透明、可迁移，也不依赖某个 App |
| 远程 Session | tmux 起步，Zellij 按需选试 | 先掌握普及度更高的 Detach / Attach 模型 |
| 图形化传输 | Cyberduck，可选 | 用 GUI 辅助传文件，但不隐藏 SSH 基础 |
| 应用运行 | Docker Compose | 把 Node.js、PostgreSQL 和应用关系留在代码里 |
| 公网入口 | OpenResty / Caddy / Nginx 接住 80、443 | 应用和数据库端口不用直接暴露公网 |

## 暂时封印的支线

第一轮先不碰这些：

- 编译 Linux 内核。
- 手工安装 Arch Linux。
- 一整套 Hyprland、Neovim 和 Shell 美化。
- tmux / Zellij 插件、主题和大篇幅快捷键配置。
- Kubernetes、多机集群和高可用数据库。
- 复杂 Bash 脚本、Ansible 和 Terraform。
- 原始 `iptables` 规则大全。

不是因为它们没意思，而是因为现在加入会把一条清楚的冒险路线炸成十几条支线。等真实需求出现，再回来解锁。

## 旅途中反复问自己的六句话

```text
我现在在哪台机器？
我以哪个用户操作？
目标文件或进程在哪里？
谁监听哪个地址和端口？
请求走到了哪一层？
我怎样证明刚才的改动真的生效？
```

能回答这六句，比背下一整张命令表更接近“会用 Linux”。

## 路边资料

- [Ubuntu Server 文档](https://ubuntu.com/server/docs/)
- [OpenSSH 手册](https://man.openbsd.org/ssh)
- [Docker 文档](https://docs.docker.com/)
- [阿里云 ECS 文档](https://help.aliyun.com/zh/ecs/)
- [DHH：Introducing Omakub](https://world.hey.com/dhh/introducing-omakub-354db366)
- [DHH：Omarchy is out](https://world.hey.com/dhh/omarchy-is-out-4666dd31)
