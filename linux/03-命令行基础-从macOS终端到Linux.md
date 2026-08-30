# 03. 命令行游乐场：让文件、管道、PATH 和 Node.js 动起来

这一站不背命令表。我们先圈出一块安全场地，然后让文字从一个程序流进另一个程序，最后在 8000 号端口开一家一分钟小店。

藏在这些动作背后的主线只有一条：

```text
Terminal 提供窗口
-> Shell 读取命令
-> CLI 程序处理输入
-> 标准输出显示在终端、进入文件或交给下一条命令
```

如果这几个概念仍然混淆，先读[Terminal、Shell、CLI、Node.js 关系速查](../tools/终端、Shell、CLI、Node.js关系速查.md)。

---

## 先圈一块不会弄坏东西的沙盒

```bash
mkdir -p ~/linux-playground/notes
cd ~/linux-playground
pwd
ls -la
touch notes/first-note.txt
cp notes/first-note.txt notes/first-note-copy.txt
mv notes/first-note-copy.txt notes/renamed-note.txt
```

核心关系：

- `/` 是文件系统根目录。
- `~` 是当前用户的主目录。
- `.` 是当前目录，`..` 是上一级目录。
- 绝对路径从 `/` 开始，相对路径从当前位置开始。
- `cp` 保留原文件，`mv` 移动或改名。

第一轮先不把 `rm` 当整理工具。能准确判断路径以后，再学习删除。

---

## 让命令像积木一样接起来

```bash
printf "linux\nssh\nnode\nlinux\n" > topics.txt
cat topics.txt
sort topics.txt | uniq -c
wc -l topics.txt
printf "postgresql\n" >> topics.txt
```

分别表示：

| 符号 | 作用 |
|---|---|
| `>` | 把输出覆盖写入文件 |
| `>>` | 把输出追加到文件末尾 |
| `|` | 把左边程序的输出交给右边程序 |

`sort topics.txt | uniq -c` 的数据流是：

```text
topics.txt
-> sort 输出排序结果
-> uniq -c 统计连续重复行
-> 终端显示结果
```

---

## 忘了命令？当场问它

```bash
man wc
wc --help
which node
type cd
```

- `man` 查看系统手册，按 `q` 退出。
- `--help` 通常显示程序自己的选项。
- `which` 查看外部命令来自哪个路径。
- `type` 还能说明 `cd` 这类 Shell 内建命令。

macOS 和 Linux 的同名命令可能来自不同实现，某些选项不一样。遇到差异先看当前机器的手册，不照抄另一台系统的参数。

---

## 为什么输入 `node` 就能找到 Node.js

```bash
echo $SHELL
echo $PATH
which node
which git
env | sort | less
```

`PATH` 是 Shell 查找命令的一组目录。输入 `node` 时，Shell 会按 PATH 顺序寻找可执行文件。

常见配置文件：

| 环境 | 常见文件 |
|---|---|
| macOS zsh | `~/.zshrc` |
| Ubuntu bash | `~/.bashrc`、`~/.profile` |

不要把不理解的安装脚本不断追加到 Shell 配置。变量为什么需要、由谁读取、对哪些终端生效，都要能回答。

---

## 在 8000 号窗口开一家一分钟小店

在第一个终端启动：

```bash
node -e 'require("http").createServer((request, response) => response.end("hello from 8000\n")).listen(8000)'
```

在第二个终端请求：

```bash
curl http://localhost:8000
lsof -nP -iTCP:8000 -sTCP:LISTEN
```

回到第一个终端按 `Control-C`，再执行 `curl`。

这次练习形成了完整结果：

```text
Node.js 进程监听 8000
-> curl 发出 HTTP 请求
-> Node.js 返回文本
-> Control-C 结束进程
-> 端口没有程序接住，请求失败
```

第 05 章会把这家突然消失的小店变成一宗“网页失踪案”。

---

## 收摊前玩三个小变化

不要再复制新命令。只改已经运行过的内容：

1. 给 `topics.txt` 再追加一个自己常用的工具，然后重新统计。
2. 把 Node.js 服务从 8000 改到 8123，猜猜原来的 URL 会怎样。
3. 停止进程后，再用 `lsof` 找一次 8123。

如果结果和你的预测一致，下面这些能力就已经到手：

- 关闭终端后，能重新找到 `~/linux-playground`。
- 能解释绝对路径和相对路径。
- 能用管道统计文本，而不是只复制最终命令。
- 能用 `man`、`--help`、`which` 和 `type` 自己找答案。
- 能说清 Node.js、8000 端口和 curl 的关系。

下一站进入[第 04 章](./04-文件系统用户权限与软件安装.md)，从 Mac 的安全练习目录走进 Linux 的 `/home`、`/etc` 和 `/var`。
