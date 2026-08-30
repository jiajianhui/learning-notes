# 01. 拆开云服务器这只盒子：Linux、Ubuntu、ECS、Docker 谁是谁

想象你刚在阿里云点下“创建 ECS”。屏幕上同时出现实例、镜像、Ubuntu、CPU 架构、公网 IP 和安全组。

你买到的到底哪一个叫 Linux？

答案是：这些东西像电脑、操作系统、安装盘和网络设置，挤在同一个购买页面里，但不在同一层。

先记住：

```text
云服务器是一台租来的虚拟计算机
Linux 是可以安装在上面的操作系统内核和生态
Ubuntu 是 Linux 发行版
Docker 容器是运行在 Linux 主机上的隔离进程环境
```

## 先把 ECS 拆箱

把 ECS 与 Mac 对照：

| 自己的电脑 | 云上的对应物 |
|---|---|
| MacBook Pro 硬件 | ECS 实例的虚拟 CPU、内存、磁盘和网卡 |
| macOS | Ubuntu、Alibaba Cloud Linux 或 Windows Server |
| 开机、关机和磁盘设置 | 云控制台中的启动、停止、重装、快照 |
| 家庭和公司网络 | VPC、公网 IP、私网 IP、安全组 |
| 打开 Terminal 管理电脑 | 用 SSH 进入远程操作系统 |

阿里云网站负责创建和管理云资源。SSH 登录以后，才是在管理实例内部的 Linux。

---

## Linux 是内核，Ubuntu 是整套可用系统

```text
Linux 内核
-> 系统工具、软件仓库、默认配置
-> Ubuntu、Debian、Arch Linux 等发行版
```

云平台中的“镜像”是创建实例时使用的系统模板，通常包含操作系统和初始配置。第一台学习服务器优先选择纯净的 Ubuntu LTS 公共镜像，不选预装大量面板和网站环境的市场镜像。

几个词的层级：

| 词 | 所在层 | 当前怎样理解 |
|---|---|---|
| Linux | 内核和整体生态 | 所有发行版共享的核心 |
| Ubuntu | 发行版 | 第一轮服务器默认选择 |
| Arch Linux | 发行版 | Omarchy 的基础，先不作为服务器入门 |
| Omakub | Ubuntu 开发环境配置 | 帮桌面开发者获得完整默认工具 |
| Omarchy | Arch + Hyprland 等完整桌面体验 | 兴趣支线，不是云服务器系统课 |
| ECS / VPS | 虚拟计算资源 | 可以运行 Ubuntu，也可以运行其他系统 |

---

## M1 Max 是 arm64，服务器一定也要选 ARM 吗

M1 Max 是 arm64。云服务器可能是：

- `x86_64` / `amd64`。
- `arm64` / `aarch64`。

它们都是 CPU 架构，不是不同 Linux。

第一台承载 Next.js、Express、Prisma 和 PostgreSQL 的服务器建议优先选择常见 x86_64 规格，减少第三方镜像和原生依赖的架构差异。以后确认所有镜像都支持 arm64，再比较 ARM 实例价格和性能。

在 Mac 和 Linux 检查架构：

```bash
uname -m
```

Docker 镜像也有架构。Apple Silicon 上偶尔看到 `linux/amd64` 警告，说明当前镜像和主机架构不同，Docker 可能正在模拟运行。

---

## 再拆一层：虚拟机和容器

| 对象 | 隔离了什么 | 有没有独立内核 | 适合做什么 |
|---|---|---|---|
| 云服务器 / 虚拟机 | 一整台虚拟计算机 | 有自己的操作系统内核 | 学完整 Linux、运行长期服务 |
| Docker 容器 | 应用进程和它需要的文件 | 通常共享 Linux 主机内核 | 固定依赖、隔离应用、快速部署 |

在 macOS 上运行 Linux 容器时，Docker Desktop 会先维护一台隐藏的 Linux 虚拟机，容器再运行在其中。

```text
Mac 硬件
-> macOS
-> Docker Desktop 管理的 Linux 虚拟机
-> PostgreSQL 容器
```

---

## `localhost` 最爱玩的瞬移魔术

- 公网 IP：互联网上可以路由到服务器的地址。
- 私网 IP：云平台内部网络中的地址，通常不能直接从互联网访问。
- 域名：给人使用的名字，通过 DNS 解析到 IP。
- `localhost`：当前这台机器自己。

`localhost` 会随执行位置变化：

```text
Mac 浏览器里的 localhost -> Mac
SSH 登录服务器后执行 curl localhost -> 云服务器
容器里的 localhost -> 当前容器
```

---

## 让 Mac 和 Ubuntu 各报一次家门

分别在 Mac 和 Ubuntu 临时容器执行：

```bash
uname -a
uname -m
cat /etc/os-release
hostname
```

Mac 没有 `/etc/os-release` 是正常差异，不要为了让两边命令完全一致而修改系统。

## 把五个词塞回一张图

不看前文，试着补全：

```text
ECS 实例提供 ______
Ubuntu 安装在 ______
Docker 容器运行在 ______
公网 IP 指向 ______
localhost 永远指向 ______
```

只要最后一个空格写的是“当前这台机器或当前容器自己”，你已经避开了后面最常见的一类坑。

下一站进入[第 02 章](./02-终端生态-Ghostty-Shell与CLI怎样配合.md)。电脑、系统和容器已经分层，接下来再拆开每天真正操作它们的终端、Shell 与 CLI。

## 路边资料

- [阿里云 ECS](https://help.aliyun.com/zh/ecs/)
- [阿里云镜像概述](https://help.aliyun.com/zh/ecs/user-guide/image-overview)
- [Docker Desktop](https://docs.docker.com/desktop/)
