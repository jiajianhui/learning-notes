# 04. 给服务器配一把只认你的钥匙：SSH 与 `~/.ssh/config`

这一站结束时，你连接服务器只需要输入：

```bash
ssh linux-learning
```

IP、用户名、端口和私钥都藏到哪里去了？它们没有消失，只是被整齐地收进了 `~/.ssh/config`。

SSH 也不是某个云厂商 App，而是一套安全远程连接协议：

```text
Mac 上的 ssh 客户端
-> 连接服务器 IP 的 TCP 22
-> Linux 上的 sshd 接住连接
-> 验证用户名和密钥
-> 进入远程用户的 Shell
```

这一章会在三个位置来回切换：

```text
[Mac]：生成和保管私钥，发起 SSH 连接
[云控制台]：创建实例、绑定公钥、限制安全组
[服务器]：登录成功后真正操作 Ubuntu
```

每段命令执行前先确认自己站在哪一边。看到提示符并不能判断位置，`hostname`、`whoami` 和 `pwd` 才能。

## 先选一扇门，不忙着装修门厅

| 需求 | 推荐 |
|---|---|
| 第一轮连接 | Terminal 或 Ghostty 中的系统 `ssh` |
| 保存连接信息 | `~/.ssh/config` |
| 图形化 SFTP | Cyberduck，作为可选辅助 |
| 远程打开代码 | 熟悉 SSH 后使用 VS Code Remote - SSH |
| 多设备和大量主机 | 以后再考虑 Termius |
| 本地 SSH 失败后的救援 | 云服务商网页终端 |

配置主线始终保留在可读的 `~/.ssh/config` 中，不把基础关系只存在 App 界面里。

---

## 钥匙串里的五样东西

| 位置 | 文件 | 作用 |
|---|---|---|
| Mac | `~/.ssh/config` | 主机别名、地址、用户、端口和私钥选择 |
| Mac | 私钥 | 证明身份，不能分享或提交 Git |
| Mac | `.pub` 公钥 | 可以登记到服务器 |
| Mac | `~/.ssh/known_hosts` | 记录服务器身份，帮助发现服务器被替换 |
| Linux | `~/.ssh/authorized_keys` | 允许登录当前远程用户的公钥 |

`~` 表示当前用户主目录。在 Mac 和远程服务器中不是同一个路径。

---

## 在 Mac 铸一把只给学习服务器用的钥匙

先检查，避免覆盖已有文件：

```bash
ls -la ~/.ssh
```

在 Mac 创建一把兼容阿里云 ECS 公钥导入的 RSA 密钥：

```bash
ssh-keygen -t rsa -b 4096 -C "linux learning server" -f ~/.ssh/id_rsa_linux_learning
```

如果以后使用明确支持 Ed25519 公钥导入的平台，可以改用 `ssh-keygen -t ed25519`。这里选择 RSA，不是因为它属于 Linux，而是为了与当前 ECS 控制台支持的导入格式保持一致。

为私钥设置口令。生成：

```text
id_rsa_linux_learning       私钥
id_rsa_linux_learning.pub   公钥
```

私钥只留在可信设备。公钥可以绑定到云服务器。

---

## 在云上给钥匙配一扇真门

第一次练习使用短期服务器，不追求永久规格：

- Ubuntu LTS 公共镜像，不选预装面板的市场镜像。
- x86_64 架构。
- 2 个 CPU 核心、4 GB 左右内存作为容易起步的基线。
- 分配公网 IPv4。
- 登录名优先选择普通用户 `ecs-user`；如果当前镜像不支持，以购买页实际显示为准。
- 登录凭证选择 SSH 密钥，把 `id_rsa_linux_learning.pub` 导入云平台并绑定到实例。
- 安全组暂时只允许自己当前的可信公网 IP 访问 TCP 22。

在阿里云 ECS 中，密钥对与实例需要位于同一地域。创建完成后记下：

```text
实例 ID
地域
公网 IP
实际登录用户名
停止实例后是否仍有磁盘、公网 IP 或快照计费
```

不要为了省一步把 22 对 `0.0.0.0/0` 长期开启。80、443、面板端口和应用端口也先别开，第 08 章会逐扇处理。

## 第一次先走一遍长路

在 Mac 执行，替换示例 IP；如果购买页显示的不是 `ecs-user`，也要替换用户名：

```bash
ssh -i ~/.ssh/id_rsa_linux_learning ecs-user@203.0.113.10
```

第一次连接时，服务器会出示主机指纹。使用云控制台、Workbench 或其他可信入口核对后再接受；不要因为急着登录而关闭主机身份检查。

登录成功后，这几条命令已经在服务器执行：

```bash
hostname
whoami
pwd
cat /etc/os-release
uname -m
```

确认看到 Ubuntu、服务器主机名和预期用户，再输入 `exit` 回到 Mac。

现在完整链路已经跑通：

```text
Mac 私钥
-> 公网 IP:22
-> 安全组放行
-> sshd 验证服务器中的公钥
-> Ubuntu 为远程用户打开 Shell
```

---

## 给一长串连接信息取个短名字

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/config
chmod 600 ~/.ssh/config
```

添加示例，实际使用时替换 IP 和用户名：

```sshconfig
Host linux-learning
  HostName 203.0.113.10
  User ecs-user
  Port 22
  IdentityFile ~/.ssh/id_rsa_linux_learning
  IdentitiesOnly yes
  AddKeysToAgent yes
  UseKeychain yes
```

如果实例使用其他登录名，只替换 `User`，不要照抄一个服务器上并不存在的用户。

字段作用：

- `Host`：Mac 本机使用的别名。
- `HostName`：真正的公网 IP 或域名。
- `User`：远程 Linux 用户。
- `Port`：sshd 监听端口，默认 22。
- `IdentityFile`：本次连接使用的私钥。
- `IdentitiesOnly`：只尝试明确指定的身份。
- `AddKeysToAgent`：连接后把密钥交给本机 SSH Agent 管理。
- `UseKeychain`：让 macOS 钥匙串安全保存私钥口令；把配置复制到非 macOS 系统时要删除这一行。

以后连接：

```bash
ssh linux-learning
```

服务器重装后主机指纹可能变化，但不要一看到警告就直接删除 `known_hosts` 记录。先确认实例是否确实被重建。

---

## 钥匙插进去却打不开门

```bash
ssh -v linux-learning
```

顺序：

```text
实例是否开机，HostName 是否正确
-> 安全组是否允许自己的公网 IP 访问 22
-> sshd 是否监听
-> User 是否正确
-> 私钥是否匹配
-> ~/.ssh 和私钥权限是否过宽
```

---

## 顺手递一份文件过去

先在 Mac 创建一份确定存在的文件，再复制到远程用户主目录：

```bash
printf "hello from Mac\n" > ~/linux-playground/ssh-note.txt
scp ~/linux-playground/ssh-note.txt linux-learning:~/
ssh linux-learning 'cat ~/ssh-note.txt'
sftp linux-learning
```

`scp` 适合明确的单次复制，`sftp` 提供交互式文件操作。进入 SFTP 后可以先运行 `ls`，再输入 `bye` 回到 Mac Shell。项目发布仍优先使用 Git 和可重复部署，不用拖放文件代替版本控制。

---

## 彩蛋：挖一条只有你能走的隧道

第 06 章会让服务器上的小网页只监听 `127.0.0.1:8000`。到时在 Mac 新开一个终端执行：

```bash
ssh -N -L 8080:127.0.0.1:8000 linux-learning
```

`-N` 表示不打开远程 Shell，只维持这条端口转发。命令会一直占住当前终端，按 `Control-C` 才结束隧道。

Mac 访问：

```bash
curl http://localhost:8080
```

数据流：

```text
Mac localhost:8080
-> SSH 加密连接
-> 服务器 127.0.0.1:8000
```

服务器不用向公网开放 8000。

## 钥匙不能乱放

- 不提交或分享私钥。
- 不在密钥不匹配时关闭主机身份检查。
- 修改 SSH 和防火墙前保留一个已连接终端。
- 第二个终端验证新连接成功后，再退出旧连接。
- 日常使用普通管理用户，不直接使用 root 部署应用。

## 今晚你拿到了远程钥匙

离开前确认四件事：

- 输入 `ssh linux-learning` 就能登录。
- 你能解释客户端、`sshd`、用户、端口和密钥怎样接上。
- 你知道 `authorized_keys` 是“谁能进来”，`known_hosts` 是“我来的是不是原来那台服务器”。
- 连接失败时，你会打开 `ssh -v` 找线索。

SSH 登录已经稳定后，下一站进入[第 05 章](./05-文件系统用户权限与软件安装.md)：第一次在真正的 Ubuntu 服务器里逛 `/home`、`/etc` 与 `/var`，也看看 `ecs-user` 手里的钥匙究竟能开哪些门。

## 路边资料

- [OpenSSH ssh_config](https://man.openbsd.org/ssh_config)
- [阿里云 ECS：创建并连接 Linux 实例](https://help.aliyun.com/zh/ecs/getting-started/create-and-manage-an-ecs-instance-by-using-the-ecs-console/)
- [阿里云 ECS：登录名与密钥对管理](https://help.aliyun.com/zh/ecs/user-guide/instance-logon-credential-management)
- [Apple：在 Mac 终端连接服务器](https://support.apple.com/guide/terminal/connect-to-servers-trml1018/mac)
- [VS Code Remote - SSH](https://code.visualstudio.com/docs/remote/ssh)
- [Cyberduck SFTP](https://docs.cyberduck.io/protocols/sftp/)
