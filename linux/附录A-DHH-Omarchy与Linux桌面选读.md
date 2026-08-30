# 附录 A：走进 DHH 的 Linux 桌面世界

主线已经走完，现在终于可以放心打开那扇最容易让人一头扎进去的门：Arch、Hyprland、Omakub、Omarchy，以及一套完全属于自己的开发环境。

DHH 带来的兴趣很重要。它让 Linux 不再只是服务器上的黑色窗口，而是一种可以自己塑造的日常空间。

但桌面 Linux 同时会引入：

- 硬件兼容。
- 图形驱动。
- 桌面环境和窗口管理器。
- 输入法、休眠、蓝牙和多屏。
- 软件分发和大量个人配置。

这些与服务器运行 Web 应用不是同一条主线，所以放在附录。走完 00～10 后再来，不会打断前面的主线。

## 两条入口：Omakub 与 Omarchy

| 项目 | 基础 | 适合怎样理解 |
|---|---|---|
| Omakub | Ubuntu | 为从 Mac 或 Windows 迁移的开发者提供一套强默认 |
| Omarchy | Arch Linux + Hyprland | DHH 的完整、键盘优先、可深度定制的桌面理想 |

它们最有价值的启发是：

```text
默认配置可以像产品一样被设计
工具之间的组合体验很重要
开源允许用户理解并改变自己的环境
```

---

## 先别拿唯一的主力机做开荒地图

当前 MacBook Pro：

- 性能足够。
- 已经承担 Swift、前端、后端和日常工作。
- 更换系统会同时改变硬件支持、应用生态和工作流。

学习 Linux 不需要先承担这些迁移成本。

推荐顺序：

```text
Docker Ubuntu 容器
-> UTM 中的 Ubuntu ARM64
-> 云服务器 Ubuntu
-> 有兴趣时使用备用兼容设备体验 Linux 桌面
-> 最后再判断是否值得迁移日常工作
```

---

## 每次只偷走一个喜欢的点子

完成核心路线后，每次只选一个问题：

1. 用 Ghostty 改善 Mac 终端体验，但保留 zsh 和现有命令。
2. 用 UTM 安装 Ubuntu 桌面，体验 APT、文件系统和 systemd。
3. 在备用设备体验平铺窗口管理器。
4. 阅读 Omakub / Omarchy 配置，找出自己真正喜欢的三个默认选择。
5. 比较终端、编辑器、包管理器和部署工具的职责，不一次全部替换。

---

## 这些坑很香，但可以晚点跳

- Arch 手工安装。
- Hyprland 从零配置。
- Neovim 插件体系。
- Shell prompt、主题和 dotfiles 仓库。
- 用 Kamal、Ansible 等替换已经跑通的部署方式。

先有一个真实痛点，再试一个新工具。否则容易把“配置开发环境”误认为“完成开发工作”。

---

## 折腾一圈后，问问自己

体验 Linux 桌面一段时间后，回答：

```text
它具体解决了 macOS 的什么问题？
哪些优势来自 Linux，哪些来自某个桌面或工具？
我的 Swift 和 macOS 应用工作是否仍然需要 Mac？
维护成本是否换来了持续收益？
即使不迁移，我能否把喜欢的工作流带回 Mac？
```

没有迁移也可以是成熟结论。Linux 学习的价值已经体现在服务器、容器、网络和运行环境判断力中。

## DHH 留下的传送门

- [Introducing Omakub](https://world.hey.com/dhh/introducing-omakub-354db366)
- [The Year on Linux](https://world.hey.com/dhh/the-year-on-linux-7f30279e)
- [Omarchy is out](https://world.hey.com/dhh/omarchy-is-out-4666dd31)
- [Get in losers, we're moving to Linux!](https://world.hey.com/dhh/get-in-losers-we-re-moving-to-linux-5e1b93cd)
- [DHH 的 X 主页](https://x.com/dhh)
