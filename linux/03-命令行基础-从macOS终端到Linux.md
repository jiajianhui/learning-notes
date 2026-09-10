# 03. 命令行游乐场：让文件、管道、PATH 和 Node.js 动起来

这一站不背命令表。我们先圈出一块安全场地，让文字从一个程序流进另一个程序，再在 8000 号端口开一家一分钟小店。最后把检查网页的动作做成自己的第一个 CLI。

藏在这些动作背后的主线只有一条：

```text
Terminal 提供窗口
-> Shell 读取命令
-> CLI 接收参数和选项
-> 程序处理输入
-> 用输出和退出码报告结果
```

如果这几个概念仍然混淆，先回到[第 02 章](./02-终端生态-Ghostty-Shell与CLI怎样配合.md)。工具目录里的速查只用于以后快速复习，不是这条主线的额外前置课程。

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
node --help | sed -n '1,12p'
which node
type cd
```

- `man` 查看系统手册，按 `q` 退出。
- `--help` 通常显示程序自己的选项；这里选择 Node.js，是因为 macOS 自带的部分 BSD 命令并不支持 GNU 风格的 `--help`。
- `which` 查看外部命令来自哪个路径。
- `type` 还能说明 `cd` 这类 Shell 内建命令。

macOS 和 Linux 的同名命令可能来自不同实现，某些选项不一样。遇到差异先看当前机器的手册，不照抄另一台系统的参数。

---

## 拆开一条 CLI 命令

回头看刚才已经运行过的命令：

```bash
wc -l topics.txt
```

它可以拆成三部分：

| 部分 | 当前内容 | 作用 |
|---|---|---|
| 命令 | `wc` | 决定运行哪个 CLI |
| 选项 | `-l` | 要求 `wc` 只统计行数 |
| 参数 | `topics.txt` | 告诉 `wc` 要处理哪个文件 |

CLI 不一定同时拥有子命令、选项和参数。例如 `git status` 中的 `status` 是子命令；`node --help` 只有选项。不要只靠位置猜含义，先看当前 CLI 的 `--help` 或手册。

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

先不要关闭第一个终端里的服务。此时已经跑通：

```text
Node.js 进程监听 8000
-> curl 发出 HTTP 请求
-> Node.js 返回文本
```

---

## 把检查网页的动作做成一个 CLI

`curl` 已经能检查网页。这里不是为了重新发明它，而是借一个足够小的工具，看清 CLI 怎样接收输入、返回输出，并告诉 Shell 这次是否成功。

保持第一个终端里的 8000 端口服务继续运行。在第二个终端回到练习目录，再用自己熟悉的文本编辑器创建 `sitecheck.js`：

```bash
cd ~/linux-playground
```

写入完整代码：

```js
#!/usr/bin/env node

async function main() {
  const [url] = process.argv.slice(2);

  if (url === "--help") {
    console.log("用法：./sitecheck.js <URL>");
    return;
  }

  if (!url) {
    console.error("错误：缺少 URL");
    console.error("用法：./sitecheck.js <URL>");
    process.exitCode = 1;
    return;
  }

  try {
    const response = await fetch(url);
    const result = `${response.status} ${response.statusText} ${url}`;

    if (!response.ok) {
      console.error(result);
      process.exitCode = 1;
      return;
    }

    console.log(result);
  } catch {
    console.error(`请求失败：${url}`);
    process.exitCode = 1;
  }
}

main();
```

先继续让 Node.js 直接运行文件：

```bash
node sitecheck.js --help
node sitecheck.js http://localhost:8000
echo $?
node sitecheck.js http://localhost:9999
echo $?
```

这段代码只有一条完整链路：

```text
URL 参数
-> process.argv 交给程序
-> fetch 发出请求
-> console.log / console.error 报告结果
-> exitCode 告诉 Shell 成功还是失败
```

- `process.argv.slice(2)` 跳过 Node.js 路径和脚本路径，取出用户传入的 URL。
- `--help` 是选项，URL 是位置参数；`fetch()` 使用这个 URL 发出请求。
- `console.log()` 写入标准输出，适合正常结果。
- `console.error()` 写入标准错误，适合失败信息。
- 退出码 `0` 表示成功，非 `0` 表示失败。`echo $?` 必须紧跟在要检查的命令后面。

再让这个文件可以像普通 CLI 一样直接执行：

```bash
chmod +x sitecheck.js
./sitecheck.js http://localhost:8000
```

第一行 `#!/usr/bin/env node` 告诉系统用 PATH 中的 Node.js 运行文件；`chmod +x` 增加执行权限。这里仍然要写 `./`，因为当前目录通常不在 PATH 中。第一轮不急着把自制命令安装到全局。

最后把两种输出分开保存：

```bash
./sitecheck.js http://localhost:8000 > check-result.txt
cat check-result.txt

./sitecheck.js http://localhost:9999 2> check-error.txt
cat check-error.txt
```

`>` 接住标准输出，`2>` 接住标准错误。Shell 和自动化工具不必猜屏幕上的句子，也能通过退出码判断下一步是否应该继续。Agent 调用 CLI 时，依赖的也是这份契约。

现在回到第一个终端按 `Control-C` 停止服务，再在第二个终端执行：

```bash
./sitecheck.js http://localhost:8000
echo $?
```

端口已经没有程序接住请求，因此 CLI 输出失败信息，并用退出码 `1` 报告失败。第 06 章会把这家突然消失的小店变成一宗真正发生在服务器里的“网页失踪案”。

---

## 收摊前玩三个小变化

不要再复制新命令。只改已经运行过的内容：

1. 给 `topics.txt` 再追加一个自己常用的工具，然后重新统计。
2. 把 Node.js 服务从 8000 改到 8123，再让 `sitecheck.js` 检查两个端口。
3. 停止进程后，同时观察 `lsof`、CLI 输出和退出码怎样变化。

如果结果和你的预测一致，下面这些能力就已经到手：

- 关闭终端后，能重新找到 `~/linux-playground`。
- 能解释绝对路径和相对路径。
- 能用管道统计文本，而不是只复制最终命令。
- 能用 `man`、`--help`、`which` 和 `type` 自己找答案。
- 能区分 CLI 的命令、选项和参数。
- 能用标准输出、标准错误和退出码判断一次执行的结果。
- 能解释 `sitecheck.js` 怎样从 URL 参数走到 HTTP 结果。
- 能说清 Node.js、8000 端口和 curl 的关系。

下一站进入[第 04 章](./04-SSH-从Mac安全连接Linux.md)。在那里创建短期 Ubuntu 学习服务器，再把 Mac 终端里的 `ssh` 真正接到远程 Shell。
