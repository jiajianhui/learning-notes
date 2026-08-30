# 00. 序章：你的 Mac 不用让位，Linux 先来当服务器

总入口已经解释了为什么 Linux 桌面、终端与 Agent 工作流重新变得热闹。现在先做一个不那么热血、却更重要的决定：在哪里学，才不会把兴趣变成主力电脑的事故？

```text
我是不是也应该立刻把主力电脑换成 Linux？
```

先别急着给 M1 Max 安排“退役仪式”。这次从风险最低、回报最快的地方出发：

```text
保留已经顺手的 MacBook Pro
-> 先学习服务器 Linux
-> 让 Linux 直接服务 Next.js、Express、PostgreSQL 和 Docker
-> 再决定是否体验 Linux 桌面
```

## Linux 有三张不同的面孔

| 场景 | 主要用途 | 当前优先级 |
|---|---|---|
| Linux 服务器 | 通过 SSH 管理并运行网站，通常没有桌面 | 最高 |
| Linux 容器 | 隔离 PostgreSQL、Node.js 等应用进程 | 高，现有 Docker 已经在用 |
| Linux 桌面 | 像 macOS 一样作为个人电脑操作系统 | 兴趣支线 |

DHH 的 Omarchy 主要讨论 Linux 桌面体验；你现在最需要的是服务器 Linux。两者共享文件、权限、进程、端口和 Shell 等基础，但最终使用场景不同。

---

## 第一站为什么是服务器

它能立即回答现有技术栈中的真实问题：

```text
Node.js 进程怎样长期运行？
Express 的 3001 端口怎样被公网域名访问？
PostgreSQL 为什么不应该公开 5432？
Docker 在 Mac 和 Linux 上有什么不同？
服务器重启后应用和数据怎样恢复？
日志、环境变量、证书和备份放在哪里？
```

如果先学 Arch 安装、桌面主题和窗口管理器，这些问题仍然没有答案。

---

## 你的 Mac 正好是一座练习基地

macOS 不是 Linux，但两者有大量相通的命令行基础。

可以先在 Mac 练习：

- 路径、目录和文件。
- Shell、管道和重定向。
- 环境变量和 PATH。
- Git、Node.js、curl 和 SSH。
- 进程与端口的核心关系。

进入 Ubuntu 后再学习差异：

| macOS | Ubuntu Linux |
|---|---|
| 常用 zsh | 常见 bash |
| Homebrew | APT |
| `launchd` 管理系统服务 | `systemd` 管理系统服务 |
| 命令常来自 BSD | 命令常来自 GNU，部分选项不同 |
| 日常依赖桌面应用 | 云服务器通常只有终端 |

---

## 一格一格拧高难度

按照成本从低到高：

### 第 1 格：Mac 原生终端

练命令行、SSH 客户端、Node.js、HTTP 和端口。

### 第 2 格：Docker 临时 Ubuntu 容器

```bash
docker run --rm -it ubuntu:24.04 bash
```

用来比较：

```bash
cat /etc/os-release
uname -a
uname -m
whoami
pwd
ls /
```

输入 `exit` 后临时容器被移除。容器不是完整服务器，里面没有必要运行完整 `systemd`。

### 第 3 格：UTM Ubuntu 虚拟机，可选

需要在买云服务器前练完整启动流程、systemd 和本地 SSH 时使用。M1 Max 和 64 GB 内存足够，练习机先分配 2 个 CPU 核心和约 4 GB 内存即可。

### 第 4 格：短期云服务器

从 SSH 章节开始再购买。练习结束后检查实例、磁盘、快照和公网 IP 是否继续计费。

---

## 从 DHH 那里带走什么

可以吸收：

- 用一套有主见的默认工具降低选择成本。
- 理解并掌控自己的开发环境。
- 让终端、文本配置和自动化互相组合。
- 保留探索新工具的乐趣。

不必照抄：

- 立刻离开 Apple 平台。
- 同时切换操作系统、编辑器、语言和部署方式。
- 把强烈个人偏好当成所有人的标准答案。

DHH 自己也明确表达过 Ubuntu 对 Linux 新手是更容易的落点，并没有断言所有开发者都更适合 Linux。这套路线因此先选择 Ubuntu 服务器，桌面体验放到最后选读。

---

## 五分钟启动仪式

在 Mac 执行：

```bash
sw_vers
uname -a
uname -m
echo $SHELL
pwd
```

分别回答：

```text
操作系统版本是什么？
内核和主机信息是什么？
CPU 架构是 arm64 还是 x86_64？
默认 Shell 是什么？
当前目录在哪里？
```

## 准备好了就出发

如果你已经能说清下面三句话，就直接进入[第 01 章](./01-Linux大图景-云服务器发行版与Mac.md)：

- macOS 能练很多命令行基础，但它不是 Linux。
- Docker 容器能练 Linux 环境，但它不是完整云服务器。
- 当前先学服务器 Linux，桌面 Linux 留给后面的兴趣支线。

## 路边资料

- [DHH：The Year on Linux](https://world.hey.com/dhh/the-year-on-linux-7f30279e)
- [DHH：Omarchy is out](https://world.hey.com/dhh/omarchy-is-out-4666dd31)
- [Ghostty](https://ghostty.org/docs)
- [UTM](https://mac.getutm.app/)
