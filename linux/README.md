# 从 Mac 出发，去 Linux 里跑一个网站

## 导读：一边押注 Linux 桌面，一边押注未来工作现场

2026 年 8 月，Linux 与终端这条看起来有点古早的赛道，忽然坐满了你会认识的人。

DHH 为自己基于 Arch 与 Hyprland 打造的 Linux 桌面 Omarchy 成立了非营利的 [Omacom Foundation](https://omarchy.org/news/2026/08/omacom-foundation-launches-with-8-million/)。Tobi Lütke、Patrick Collison、Michael Dell、Jack Dorsey、DHH 等首批 8 位 Founding Patrons 每人出资 100 万美元；三天后 Drew Houston 与 Peter Steinberger 加入，数字变成了[十人、1000 万美元](https://omarchy.org/news/2026/08/omacom-foundation-funding-hits-10m/)。完整阵容留在附录，这里先记住：钱会流向基础设施，以及 Omarchy 所依赖的开源项目与开发者。

另一边，Ghostty 作者、HashiCorp 联合创始人 Mitchell Hashimoto 组建了 [Superlogical](https://www.superlogical.com/)。团队里有 HashiCorp 第一位员工和前工程负责人 Jack Pearkes，也有来自 Poolside、Vercel、HashiCorp、Heroku 的开发者工具设计者 Alasdair Monk 与 Hector Simpson；背后则站着 Notable Capital、Amplify Partners，以及 Aaron Levie、Armon Dadgar、Guillermo Rauch、Patrick Collison、Tobias Lütke 等一群做过开发者产品的人。

他们做的不是同一个产品，却在押注同一件更大的事：**电脑和软件工作流应该再次变得可以理解、可以组合，也可以由使用者掌控。**

```text
Omacom / Omarchy
-> 重新设计“开发者每天坐在什么样的电脑前”

Superlogical
-> 重新设计“人、Agent 和远程机器在哪里持续工作”

这套 Linux 路线
-> 先学会支撑这两种未来的文件、进程、网络、Shell、SSH 与 Session
```

明星阵容和真金白银不能证明产品一定成功，但它们至少说明：Linux 桌面、终端基础设施和 Agent 时代的工作现场，已经不只是少数人自娱自乐的支线。

8 月 31 日，这个方向又多了一个具体的小故事。DHH 周六把以产品设计见长的 Jason Fried 带进 Agent 工作流；到了周日，Jason 已经只用英语与 AI 来回沟通，独立做出自己的第一个 Omarchy 插件——一只准备随 Omarchy 4.1 发布的世界时钟。DHH 把它称为 Omarchy 的下一阶段：让顶级设计师也能亲手把想法变成软件。[看 DHH 的转发](https://x.com/dhh/status/2094286817910501779)与 [Jason 的演示](https://x.com/jasonfried/status/2094225265069379678)。

这个故事有趣，不是因为“只会说自然语言，以后就不用懂技术了”。一个世界时钟插件和需要长期维护的商业系统不是同一难度。它真正说明的是：Agent 正在降低实现门槛，而基础知识的作用会从“亲手敲下每一条命令”，逐渐转向“指导、检查、验收，并在出错时接管 Agent”。

这是一套写给独立开发者的 Linux 路线。你不需要转职成全职运维，但要能独立把作品送上网，在凌晨页面打不开时找到第一条线索，也能把重复工作安全地交给 Agent。所谓“面向 Agent”，不是多列几款 AI 工具，而是先掌握机器、用户、权限、进程、网络、日志和 Session：Agent 可以替你执行命令，你仍然要看得懂它动了什么、证据是否可信，以及什么时候应该叫停。

这套路线不要求你追随其中任何一个产品。你的 M1 Max MacBook Pro 依然不用让位；旅程从一个更有用也更好玩的目标开始：

```text
从 Mac 打开终端
-> 连进一台远程 Linux
-> 看懂文件、进程、日志和端口
-> 看懂 Next.js、Express 和 PostgreSQL 在线上怎样碰头
-> Mini CMS 准备好后，用 1Panel 完成部署
-> 最后从浏览器打开自己的 HTTPS 网站
```

Linux 与终端在技术上不是一回事，但在服务器开发中几乎总是并肩出现。Linux 提供操作系统环境，终端模拟器、Shell、SSH 和 Session 管理器组成进入并操作它的工作流。这套路线会讲终端生态，但会一直标清每个工具的职责，不把它们都叫作 Linux。

你不需要先背一百条命令。每走一站，都应该能看到一点真实反馈：一个文件出现、一段文本穿过管道、一个端口开始监听、一条 SSH 隧道打通，或者一个容器真的返回网页。

---

## 00～10 是一条连续主线

数字章节全部属于必读主线。它们按照“先认清环境，再获得服务器，然后操作系统与网络，最后拼出部署地图”的依赖关系排列。

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

### 第二幕：从 Mac 穿过互联网

**04 · 给服务器配一把只认你的钥匙**

[创建短期 ECS，再用 SSH 与 `~/.ssh/config` 登录](./04-SSH-从Mac安全连接Linux.md)

在 Mac 生成密钥，到云控制台创建短期 Ubuntu 服务器，第一次走完“公网 IP → 22 → sshd → 远程 Shell”，最后把连接收进 `ssh linux-learning`。

### 第三幕：进入没有桌面的 Linux

**05 · Linux 旅馆的门禁系统**

[文件住哪里，谁有钥匙，软件从哪来](./05-文件系统用户权限与软件安装.md)

沿着 `/home`、`/etc`、`/var` 逛一圈。下一次遇到 `Permission denied`，先查清谁在敲哪扇门，不再条件反射地加 `sudo`。

**06 · 网页失踪案**

[沿着进程、日志和端口找到它](./06-进程服务日志与端口.md)

在服务器启动一张真实网页，再亲手停掉它：进程活着吗，监听谁，服务器自己能访问吗，`Connection refused` 到底是谁留下的？

**07 · SSH 断了，工作还在**

[第一次使用 tmux，并认识 Zellij](./07-SSH断了工作还在-tmux与Zellij.md)

启动一只不断走动的秒针，Detach，关掉 SSH，再从新连接回到同一个现场。tmux 只练四个核心动作，Zellij 留作有真实需要时的替代方案。

**08 · 穿过三道门**

[公网 IP、安全组、防火墙与 HTTPS](./08-云服务器网络安全组与防火墙.md)

一个请求要依次穿过云安全组、Linux 防火墙和应用监听。你会亲手决定哪些门对全世界开，哪些只对自己开。

### 第四幕：拆开技术栈，再装上发射架

**09 · 打开 Docker 套娃**

[容器不是一台迷你云服务器](./09-Docker与Linux-容器不是云服务器.md)

拆开 Mac、Linux 虚拟机、容器、网络和卷。启动一个 Nginx 容器，追踪 `127.0.0.1:8080:80` 的请求到底去了哪里。

**10 · 把网站装上发射架**

[Next.js、Express、Prisma 与 PostgreSQL 在线上怎样碰头](./10-Nodejs-Nextjs-PostgreSQL怎样运行在线上.md)

把前面捡到的碎片拼成完整系统：443 入口、反向代理、应用端口、数据库、迁移、日志和备份；然后从明确出口进入 Mini CMS 的 1Panel 实操。

---

## 附录是真正可以跳过的内容

附录不会为后续主线提供必需知识。感兴趣时打开，不读也不影响 00～10。

**附录 A · DHH 的 Linux 桌面世界**

[Omakub、Omarchy，以及要不要离开 macOS](./附录A-DHH-Omarchy与Linux桌面选读.md)

去看 Omacom 的 1000 万美元要推动什么，再碰 Arch、Hyprland、键盘工作流和 dotfiles。它讨论的是个人桌面选择，不是管理服务器的前置课程。

**附录 B · Superlogical 与未来的工作 Session**

[为什么它从终端多路复用器开始](./附录B-Superlogical与持久工作会话.md)

先认识这支明星团队为什么从 terminal multiplexer 开始，再理解远程工作、Web、AI Agent 和长期 Session 为什么开始汇合。它目前尚未公开发布，只观察方向，不安排安装。

---

## 三种走法

**只想先尝鲜**

读 00～03。全程使用 Mac 和一个临时 Ubuntu 容器，不买服务器，也不会动到主力环境。

**想管好第一台云服务器**

进入第 04 章时创建一台短期 Ubuntu 学习服务器，再继续走到 08。04～08 的命令会在同一台服务器上连续完成，不再中途更换练习环境。

**想把自己的 Web 应用送上网**

走完 09～10。等 Mini CMS 主体完成后，依次进入[后端第 18 章](../backend/backend-system-learning/18-从开发环境到线上运行.md)和[第 18A 章 1Panel 实操](../backend/backend-system-learning/18A-用1Panel和Docker-Compose部署MiniCMS.md)，把概念落到真实项目。

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

## 旅途中反复问自己的七句话

```text
我现在在哪台机器？
我以哪个用户操作？
目标文件或进程在哪里？
谁监听哪个地址和端口？
请求走到了哪一层？
我怎样证明刚才的改动真的生效？
如果交给 Agent，它被允许改什么，我又怎样验收？
```

能回答这七句，比背下一整张命令表更接近“会用 Linux”。

## 路边资料

- [Ubuntu Server 文档](https://ubuntu.com/server/docs/)
- [OpenSSH 手册](https://man.openbsd.org/ssh)
- [Docker 文档](https://docs.docker.com/)
- [阿里云 ECS 文档](https://help.aliyun.com/zh/ecs/)
- [DHH：Introducing Omakub](https://world.hey.com/dhh/introducing-omakub-354db366)
- [DHH：Omarchy is out](https://world.hey.com/dhh/omarchy-is-out-4666dd31)
