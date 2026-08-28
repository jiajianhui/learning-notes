# 05. 给服务器配一把只认你的钥匙：SSH 与 `~/.ssh/config`

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

## 铸一把只给学习服务器用的钥匙

先检查，避免覆盖已有文件：

```bash
ls -la ~/.ssh
```

创建：

```bash
ssh-keygen -t ed25519 -C "linux learning server" -f ~/.ssh/id_ed25519_linux_learning
```

为私钥设置口令。生成：

```text
id_ed25519_linux_learning       私钥
id_ed25519_linux_learning.pub   公钥
```

私钥只留在可信设备。公钥可以绑定到云服务器。

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
  User deploy
  Port 22
  IdentityFile ~/.ssh/id_ed25519_linux_learning
  IdentitiesOnly yes
```

字段作用：

- `Host`：Mac 本机使用的别名。
- `HostName`：真正的公网 IP 或域名。
- `User`：远程 Linux 用户。
- `Port`：sshd 监听端口，默认 22。
- `IdentityFile`：本次连接使用的私钥。
- `IdentitiesOnly`：只尝试明确指定的身份。

以后连接：

```bash
ssh linux-learning
```

---

## 第一次见面，服务器也要出示证件

第一次会出现服务器指纹。与云控制台或可信渠道提供的指纹核对，再接受并写入 `known_hosts`。

服务器重装后指纹可能变化，但不要一看到警告就直接删除记录。先确认实例是否确实被重建。

登录后：

```bash
hostname
whoami
pwd
cat /etc/os-release
exit
```

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

```bash
scp ./local-file.txt linux-learning:/home/deploy/
sftp linux-learning
```

`scp` 适合明确的单次复制，`sftp` 提供交互式文件操作。项目发布仍优先使用 Git 和可重复部署，不用拖放文件代替版本控制。

---

## 彩蛋：挖一条只有你能走的隧道

假设服务器有服务只监听 `127.0.0.1:8000`：

```bash
ssh -L 8080:127.0.0.1:8000 linux-learning
```

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

## 路边资料

- [OpenSSH ssh_config](https://man.openbsd.org/ssh_config)
- [Apple：在 Mac 终端连接服务器](https://support.apple.com/guide/terminal/connect-to-servers-trml1018/mac)
- [VS Code Remote - SSH](https://code.visualstudio.com/docs/remote/ssh)
- [Cyberduck SFTP](https://docs.cyberduck.io/protocols/sftp/)
