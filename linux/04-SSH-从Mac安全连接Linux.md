# 04. 给服务器配一把只认你的钥匙：SSH 与 `~/.ssh/config`

这一站结束时，你连接服务器只需要输入：

```bash
ssh linux-learning
```

IP、用户名、端口可以保存在 `~/.ssh/config` 中；使用哪把私钥，也可以由配置或客户端的默认规则决定。命令变短了，连接和身份认证的步骤仍然存在。

如果你现在已经可以输入 `ssh aliyun` 进入服务器，这一站的最终结果其实已经有了。后文出现 `linux-learning` 时，直接换成你现有的 `aliyun` 即可，不需要为了跟文档同名而重配一次。

`~/.ssh` 是 Mac 当前用户保存 SSH 配置、密钥和主机记录的目录；`~/.ssh/config` 才是其中通常用来保存 `aliyun` 这类主机别名的配置文件。先读懂现有内容，不覆盖它。

SSH 也不是某个云厂商 App，而是一套安全远程连接协议：

```text
Mac 上的 ssh 客户端
-> 连接服务器 IP 的 TCP 22
-> Linux 上的 sshd 接住连接
-> Mac 确认服务器身份，服务器验证登录用户的身份
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

## 一次 SSH 密钥登录怎样完成

先用你已经能执行的 `ssh aliyun` 理解。假设现有配置的 `Host` 是 `aliyun`，`User` 是 `root`，客户端就会连接 `HostName` 指定的服务器，并申请登录它的 `root` 账号。

下面以普通的公钥认证为例。数字签名可以先理解为：客户端用私钥为本次连接生成一份证明，服务器用配对的公钥检查这份证明是否有效。

```text
在 Mac 执行 ssh aliyun
-> 客户端读取配置，确定服务器地址、端口和登录用户
-> 连接服务器的 sshd，核对服务器主机密钥与 known_hosts 记录
-> 客户端提供准备使用的公钥，服务器检查它是否获准登录这个用户
-> 客户端用对应私钥为本次认证数据生成数字签名
-> 服务器用公钥验证签名，确认客户端确实持有对应私钥
-> 认证及其他登录策略通过，进入该用户的远程 Shell
```

**公钥获得授权，只说明这把钥匙可以登录；签名验证通过，才证明连接方持有对应私钥。** 服务器不会打开你 Mac 上的私钥文件，私钥也不会随连接发送给服务器。服务器通常在目标用户的 `~/.ssh/authorized_keys` 中查找授权公钥：登录 `root` 时，一般对应 `/root/.ssh/authorized_keys`。

这里有两个方向的身份检查：`known_hosts` 帮 Mac 确认连到的服务器，`authorized_keys` 帮服务器判断允许谁登录。第一次连接还没有主机记录时，客户端会要求你核对并接受主机指纹。

### 不写 -i，客户端怎样找到私钥

`ssh root@服务器IP` 已经指定了地址和用户，密钥可以来自 SSH 配置中的 `IdentityFile`、默认路径（如 `~/.ssh/id_ed25519`、`~/.ssh/id_rsa`），或 SSH Agent 中可用的身份。实际尝试哪些密钥，取决于客户端配置。

`-i` 用来明确指定密钥文件，例如 `ssh -i ~/.ssh/id_rsa_linux_learning root@服务器IP`。省略它，客户端仍然会按配置寻找身份；如果没有可用密钥且服务器允许密码登录，也可能转而询问账户密码。

### 让你输入的密码是哪一种

| 提示 | 填写什么 | 用在哪里 |
|---|---|---|
| `Enter passphrase for key ...` | 创建私钥时设置的口令 | 在本机解锁私钥，供客户端签名 |
| `root@... password:` | 服务器上 `root` 账户的登录密码 | 由服务器验证账户密码 |

SSH Agent 可以在本机管理已解锁的密钥并代为签名，减少重复输入私钥口令。后面的 `AddKeysToAgent`、`UseKeychain` 配置与此有关。能免输入密码登录，不代表没有做身份认证。

---

## 在 Mac 铸一把只给学习服务器用的钥匙

先检查，避免覆盖已有文件：

```bash
ls -la ~/.ssh
```

如果 `ssh aliyun` 已经能用，再做一次只读检查：

```bash
ssh -G aliyun | grep -E '^(hostname|user|port|identityfile) '
```

`ssh -G` 只展开这条别名最终会采用的配置，不会连接服务器，也不能单独证明某把密钥已通过认证。已有密钥登录可用时，继续使用原配置，跳过下面的 `ssh-keygen`；想确认本次用了哪种认证方式，可以看后面的 `ssh -v` 输出。

只有在没有可用密钥，或者明确想给这台学习服务器单独换一把钥匙时，才创建：

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

导入公钥是把公钥交给云平台；绑定实例后，还要让它获得目标 Linux 账号的登录授权，通常体现在该账号的 `authorized_keys` 中。只有“上传了公钥”，还不能证明已经可以登录。下一步用实际连接确认。

不要为了省一步把 22 对 `0.0.0.0/0` 长期开启。80、443、面板端口和应用端口也先别开，第 08 章会逐扇处理。

## 第一次先走一遍长路

如果 `ssh aliyun` 已经可用，不必倒退重走长命令。直接登录并运行 `hostname`、`whoami`，确认别名确实指向预期服务器即可。

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

这时你已经实际完成前面的连接与认证流程。退出远程 Shell 后，同一个终端里后续执行的命令又回到了 Mac。

---

## 给一长串连接信息取个短名字

已经有 `aliyun` 别名时，下面这条可以帮助你看配置文件本身：

```bash
sed -n '1,160p' ~/.ssh/config
```

如果文件里使用了 `Include`，别名也可能来自被引入的其他配置文件；这时以前面的 `ssh -G aliyun` 结果为准。不要复制一个同名 `Host aliyun` 去覆盖它。

只有还没有 SSH 配置的读者，才需要执行：

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
- `IdentitiesOnly`：只使用配置指定或默认身份文件中的密钥，不额外尝试 SSH Agent 提供的其他身份。
- `AddKeysToAgent`：连接后把密钥交给本机 SSH Agent 管理。
- `UseKeychain`：让 macOS 钥匙串安全保存私钥口令；把配置复制到非 macOS 系统时要删除这一行。

以后连接：

```bash
ssh linux-learning
```

服务器重装后主机指纹可能变化，但不要一看到警告就直接删除 `known_hosts` 记录。先确认实例是否确实被重建。

---

## 登录服务器与服务器拉取 GitHub 代码，是两次连接

部署 Mini CMS 时，你先从 Mac 登录服务器，再让服务器去 GitHub 获取代码。第二次连接中，服务器变成了 SSH 客户端。按第 20A 章使用专用部署密钥的方式，各自的密钥放在这里：

| 连接 | 私钥放在哪里 | 公钥授权给谁 |
|---|---|---|
| Mac → Linux 服务器 | Mac 上 | 服务器目标用户的 `authorized_keys` |
| Linux 服务器 → GitHub 仓库 | Linux 服务器上，使用单独生成的部署私钥 | GitHub 仓库的 **Settings → Deploy keys** |

能执行 `ssh aliyun`，只证明第一条连接可用。第二条需要单独配置仓库读取权限。`git@github.com:...` 中的 `git` 是 GitHub 的 SSH 连接用户，与服务器上的 `root` 或 `ecs-user` 不是一回事。

公开仓库使用 HTTPS 地址克隆时无需 SSH 密钥。具体拉取命令和部署密钥入口见[后端 20A 第 6 步](../backend/backend-system-learning/20A-用1Panel和Docker-Compose部署MiniCMS.md#第-6-步把项目代码放到服务器)。

---

## 钥匙插进去却打不开门

```bash
ssh -v linux-learning
```

已经使用 `aliyun` 别名时，执行 `ssh -v aliyun`。日志会显示客户端尝试了哪些密钥，以及最终采用的认证方式；看到成功认证使用 `publickey`，才能确认这次是密钥登录。`ssh -G` 查看将采用的配置，`ssh -v` 观察实际连接，两者用途不同。

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
- 新建学习服务器时优先使用普通管理用户。已有连接使用 `root` 时，先理解它的权限；登录用户与应用进程用户的区别见[第 05 章](./05-文件系统用户权限与软件安装.md#登录用户与应用进程用户)。

## 今晚你拿到了远程钥匙

离开前确认四件事：

- 输入 `ssh linux-learning`，或者你现有的 `ssh aliyun`，就能登录。
- 你能解释客户端怎样找到私钥，以及服务器为什么既要检查公钥授权，又要验证签名。
- 你知道 `authorized_keys` 是“谁能进来”，`known_hosts` 是“我来的是不是原来那台服务器”。
- 连接失败时，你会打开 `ssh -v` 找线索。

SSH 登录已经稳定后，下一站进入[第 05 章](./05-文件系统用户权限与软件安装.md)：第一次在真正的 Ubuntu 服务器里逛 `/home`、`/etc` 与 `/var`，也看看 `ecs-user` 手里的钥匙究竟能开哪些门。

## 路边资料

- [OpenSSH ssh：连接与身份认证](https://man.openbsd.org/ssh)
- [OpenSSH ssh_config](https://man.openbsd.org/ssh_config)
- [OpenSSH ssh-agent：保管密钥并参与认证](https://man.openbsd.org/ssh-agent)
- [SSH 公钥认证协议：公钥授权与签名验证](https://www.rfc-editor.org/rfc/rfc4252#section-7)
- [GitHub：部署密钥](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys#deploy-keys)
- [阿里云 ECS：创建并连接 Linux 实例](https://help.aliyun.com/zh/ecs/getting-started/create-and-manage-an-ecs-instance-by-using-the-ecs-console/)
- [阿里云 ECS：登录名与密钥对管理](https://help.aliyun.com/zh/ecs/user-guide/instance-logon-credential-management)
- [Apple：在 Mac 终端连接服务器](https://support.apple.com/guide/terminal/connect-to-servers-trml1018/mac)
- [VS Code Remote - SSH](https://code.visualstudio.com/docs/remote/ssh)
- [Cyberduck SFTP](https://docs.cyberduck.io/protocols/sftp/)
