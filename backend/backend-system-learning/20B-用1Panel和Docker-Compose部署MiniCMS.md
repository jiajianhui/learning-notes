# 20B. 在新服务器用 1Panel 和 Docker Compose 部署 Mini CMS

> 当前已有宝塔和 Nginx 的服务器继续按 [20A](./20A-用宝塔和Docker-Compose部署MiniCMS.md)部署。本章留到使用一台新的 Linux 服务器时，练习 1Panel + OpenResty 的部署方式。

Mini CMS 的程序和镜像不会因为换面板而改变。本章复用 20A 的 Dockerfile、Compose、迁移、管理员初始化与备份命令，补齐新服务器上的 1Panel 操作。

## 两条部署路线有哪些差别

| 工作 | 20A：已有宝塔服务器 | 20B：新服务器使用 1Panel |
|---|---|---|
| 构建、验证、上传镜像 | Mac + Docker Desktop / Compose + 阿里云 ACR | 相同 |
| 运行应用与 PostgreSQL | Docker Compose | 相同 |
| 查看容器和日志 | 宝塔 Docker 页面 | 1Panel 容器页面 |
| 接收网站请求 | 已有的 Nginx | 1Panel 应用商店安装的 OpenResty |
| 代理、证书与计划任务 | 宝塔界面 | 1Panel 界面 |

OpenResty 基于 Nginx，增加了 Lua 等扩展能力。这里选它，是为了使用 1Panel 配套的网站、反向代理和证书管理；Mini CMS 不需要编写 Lua。反向代理仍然只负责把请求交给 Next.js 或 Express。参见 [OpenResty 介绍](https://openresty.org/cn/)和 [1Panel 安装 OpenResty](https://1panel-dev.github.io/docs/v2/user_manual/appstore/openresty/)。

## 先看操作顺序

```text
确认新服务器架构、资源和域名
-> Mac 构建、验证并上传镜像（复用 20A 第 2～3 步）
-> 新服务器安装 1Panel、Docker 和 OpenResty
-> 上传运行配置，拉取镜像，创建编排
-> 验证迁移和接口，创建管理员
-> 在 1Panel 配置反向代理与 HTTPS
-> 验证备份、恢复和后续更新
```

**服务器先装 1Panel，不是本地构建镜像的前置条件。** 本地构建需要知道目标 CPU 架构和正式 API 域名；服务器真正运行时，才需要 Docker。你也可以提前安装面板，但不用等面板、证书或线上数据库准备好才开始打包。

本章按“先本地交付、后服务器部署”来操作。若是把已有正式站点迁到新机器，还需要迁移数据库内容并安排域名切换；镜像本身不包含旧服务器上的文章。本章先使用新子域名和新数据库验证部署，不直接切换旧站点的 DNS。

## 第 1 步：确认新服务器和访问地址

选择一台新的 Ubuntu LTS 服务器，先按 [Linux 04](../../linux/04-SSH-从Mac安全连接Linux.md)配置独立的 SSH 连接。本章把这个连接别名写作 `mini-cms-new`，指向新机器；旧服务器的 `aliyun` 继续保留。下文服务器命令按使用 `root` 管理编写，其他用户需要相应的 `sudo` 权限。

在 Mac 验证连接与服务器信息：

```bash
ssh mini-cms-new 'hostname; uname -m; free -h; df -h /'
```

确认连接的是新服务器。`x86_64` 对应镜像平台 `linux/amd64`，`aarch64` 对应 `linux/arm64`；看清可用内存和磁盘后，再安排应用。1Panel 安装文档建议可用内存在 1GB 以上，这只是安装条件，不能代替 Mini CMS 运行后的资源检查。[官方安装要求](https://1panel-dev.github.io/docs/v2/installation/online_installation/)

本章示例使用两个新子域名：

| 子域名 | 指向 | 用途 |
|---|---|---|
| `admin-new.example.com` | 新服务器公网 IPv4 | 新环境管理端 |
| `api-new.example.com` | 新服务器公网 IPv4 | 新环境 API |

先确定名称，DNS A 记录最迟在第 6 步前配置完成。公网放行 80、443；SSH 和安装时选定的面板端口只允许自己的公网 IP。3000、3001、5432 仍只绑定服务器 `127.0.0.1`，不添加公网放行规则。

## 第 2 步：在 Mac 准备并上传镜像

使用 [20A 第 2 步的文件](./20A-用宝塔和Docker-Compose部署MiniCMS.md#第-2-步为项目增加生产容器配置)，再按 [20A 第 3 步](./20A-用宝塔和Docker-Compose部署MiniCMS.md#第-3-步在本地制作验证并上传镜像)完成构建、本地试跑和上传。

为本次新环境填写：

- Compose 中两个应用的 `platform`：使用第 1 步确认的服务器架构。
- `ADMIN_DOMAIN`、`API_DOMAIN`：填写新环境的真实子域名。
- `ADMIN_WEB_ORIGIN`：填写新管理端的完整 HTTPS 来源，例如 `https://admin-new.example.com`。
- `IMAGE_TAG`：使用新的发布标签，例如 `v1-1panel`，保留旧环境的镜像标签。

**换成新的 API 域名后，必须重新构建管理端镜像。** `NEXT_PUBLIC_API_BASE_URL` 在 `next build` 时写入浏览器代码，不能只改服务器 `.env`。如果目标架构和所有构建参数都没变，可以直接复用已验证的镜像；换面板本身不要求重新构建。

本地试跑时完成迁移、公开 API 和管理端响应检查。沿用 20A 第 3.5 节的 ACR 配置和上传命令，首次切换时将其中示例 `v1` 换成本次标签。确认 ACR 的两个应用仓库都出现本次标签后，再进入服务器部署。

## 第 3 步：在新服务器安装 1Panel、Docker 和 OpenResty

登录新服务器：

```bash
ssh mini-cms-new
```

从 [1Panel 在线安装文档](https://1panel-dev.github.io/docs/v2/installation/online_installation/)复制当前安装命令并执行。需要 Docker 时按提示安装；已有 Docker 时复用它。保存安装结束时显示的面板地址、端口和登录信息，限制管理端口来源，再打开面板。忘记入口时可在服务器执行 `1pctl user-info`。

在服务器确认运行工具：

```bash
docker version
docker compose version
ss -lntp
```

前两条应能看到 Docker Server 和 Compose 版本。然后在 1Panel 的 **应用商店**搜索并安装 **OpenResty**，HTTP、HTTPS 端口分别使用 80、443；这台新机器不再额外安装另一套 Nginx。安装后确认 OpenResty 状态为运行中。

**本章沿用 1Panel 默认的 OpenResty `host` 网络模式。** 它共享宿主机网络，因此能用 `127.0.0.1:3000`、`127.0.0.1:3001` 访问应用映射到服务器的端口。可在容器详情检查网络模式；若改成普通桥接网络，容器里的 `127.0.0.1` 就不再指向宿主机，后面的代理地址也不能照抄。参见 [1Panel 维护者的网络说明](https://github.com/1Panel-dev/1Panel/issues/11676)。

Node.js 已在应用镜像中，PostgreSQL 由项目 Compose 创建。这里不需要再用 1Panel 的“运行环境”或“数据库”功能重复创建同一套服务。

## 第 4 步：上传配置并创建编排

**在 Mac 的 `mini-cms` 根目录执行：**

```bash
ssh mini-cms-new 'mkdir -p /opt/mini-cms/deploy'
scp deploy/docker-compose.yml deploy/.env.example mini-cms-new:/opt/mini-cms/deploy/
```

**然后在新服务器执行：**

```bash
cd /opt/mini-cms
cp -n deploy/.env.example deploy/.env
chmod 600 deploy/.env
```

通过 SSH 或 1Panel 文件管理器编辑 `deploy/.env`：`IMAGE_PREFIX` 填 20A 第 3.5 节的 `ACR域名/命名空间`，`IMAGE_TAG` 与刚才上传的一致；域名使用本次的新子域名，数据库账号、密码和库名使用正式值。`DATABASE_URL` 的主机仍是 `postgres`，`ADMIN_WEB_ORIGIN` 与管理端构建时计划使用的来源一致。

解析配置，检查镜像名、标签、环境变量和端口：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml config
```

不要分享包含密码的完整输出。先按 [20A 第 6 步](./20A-用宝塔和Docker-Compose部署MiniCMS.md#第-6-步拉取镜像并启动-compose在宝塔查看状态)在这台新服务器登录 ACR，输入访问凭证中设置的固定密码。看到 `Login Succeeded` 后拉取并启动：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml pull
```

拉取成功后，在 1Panel 创建编排：

```text
容器 → 编排 → 创建编排
名称：mini-cms-production
创建方式：路径选择
文件：/opt/mini-cms/deploy/docker-compose.yml
```

`deploy/.env` 与 Compose 文件保持在同一目录，编排名称与文件中的 `name` 一致。创建前核对面板解析后的配置没有空变量，并使用刚才拉取的镜像；若面板要求私有仓库认证，在其仓库设置中配置同一账号的读取凭据。

通过“路径选择”创建，是为了让面板管理的编排与终端使用同一份配置。1Panel 会区分面板创建的编排与本地命令创建的编排；本章由面板创建，便于以后从编排页面启停。参见 [1Panel 编排说明](https://1panel-dev.github.io/docs/v2/user_manual/containers/compose/)。

## 第 5 步：验证服务并创建管理员

在 1Panel 中检查三个容器、PostgreSQL 健康状态和 API 迁移日志。再在服务器 `/opt/mini-cms` 目录执行：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml ps
docker compose --env-file deploy/.env -f deploy/docker-compose.yml logs --tail=100 api
curl -i http://127.0.0.1:3001/api/public/articles
curl -I http://127.0.0.1:3000
```

应看到 PostgreSQL 为 `healthy`，API 迁移成功并开始运行；公开文章接口返回 `200` 和包含 `data`、`pagination` 的 JSON，管理端返回页面或跳转响应。新数据库的文章列表为空很正常。

随后按 [20A：创建首个管理员](./20A-用宝塔和Docker-Compose部署MiniCMS.md#在新数据库中创建首个管理员)，在新服务器执行一次 `admin:create`。这里仍连接新环境的数据库，不会复制旧服务器的账号和文章。

需要用 TablePro 查库时，按 [20A 的 TablePro 配置](./20A-用宝塔和Docker-Compose部署MiniCMS.md#用-tablepro-查看线上数据库)新建连接，SSH 配置填写新服务器的公网 IP、SSH 端口、用户和对应私钥；数据库地址仍为 `127.0.0.1:5432`，库名、账号和密码使用新服务器 `deploy/.env` 中的值。

## 第 6 步：在 1Panel 配置反向代理和 HTTPS

确认两个新子域名的 A 记录都指向新服务器。在 **网站 → 创建网站 → 反向代理** 中，分别创建：

| 主域名 | 代理地址 |
|---|---|
| `admin-new.example.com` | `http://127.0.0.1:3000` |
| `api-new.example.com` | `http://127.0.0.1:3001` |

替换为真实域名与第 4 步配置的宿主机端口。保持请求路径不变，关闭代理缓存；Express 继续负责 CORS、登录和 Cookie。创建方法见 [1Panel 反向代理网站](https://1panel-dev.github.io/docs/v2/user_manual/websites/website_create/#3)。

在 Mac 先检查 HTTP：

```bash
curl -I http://admin-new.example.com
curl -i http://api-new.example.com/api/public/articles
```

响应应与第 5 步的本机检查一致。接着在 1Panel 完成证书和网站设置：

```text
证书 → 创建 ACME 账户
→ 为两个域名申请证书
→ 选择 HTTP 或 DNS API 验证，并开启自动续签
→ 在对应网站的 HTTPS 设置中选择证书
→ 开启 HTTPS，验证成功后将 HTTP 跳转到 HTTPS
```

HTTP 验证需要域名解析正确、公网可访问 80、验证路径可达；DNS API 验证需要面板保存有效的域名服务商授权，供续签时自动添加记录。申请完成后还要把证书部署到对应网站，并检查自动续签状态。参见 [1Panel 证书管理](https://1panel-dev.github.io/docs/v2/user_manual/websites/certificate/)。

从 Mac 检查 HTTPS：

```bash
curl -I https://admin-new.example.com
curl -i https://api-new.example.com/api/public/articles
```

然后在浏览器完成登录、新建文章、保存、重新打开与退出登录。确认请求使用新环境 API，Cookie 带 `Secure`，公开 API 能读到已发布文章。需要验证个人网站时，使用它的预览环境或测试配置连接这个新 API，保留旧线上站点的地址。

## 第 7 步：备份、恢复与后续更新

数据库备份方式与面板无关。先在新服务器按 [20A 第 9.1～9.2 节](./20A-用宝塔和Docker-Compose部署MiniCMS.md#91-导出一份数据库备份)导出一份 `.dump`，恢复到 `mini_cms_restore_check`，查询本章刚创建的文章，确认恢复成功。

再在 1Panel 的 **计划任务**中创建 Shell 脚本任务：用 Bash 执行 20A 第 9.1 节的完整脚本，每天 03:00 导出数据库。先手动执行，检查日志和 `/opt/backups/mini-cms` 中的新文件。

在 **面板设置 → 备份账号**中配置服务器之外的存储，另建“备份目录”任务：源目录为 `/opt/backups/mini-cms`，目标为该备份账号，保留最近 7 份，排除 `*.tmp`。安排在导出完成后，例如 03:30；下载远端副本，再按 20A 第 9.2 节恢复一次。具体设置见 [1Panel 计划任务](https://1panel-dev.github.io/docs/v2/user_manual/cronjobs/)。

以后更新沿用 [20A 第 10 步](./20A-用宝塔和Docker-Compose部署MiniCMS.md#第-10-步以后怎样更新)：Mac 构建并上传新标签，服务器备份数据库、修改 `IMAGE_TAG`，然后 `pull` 和 `up -d`。操作目录仍为 `/opt/mini-cms`，Compose 项目仍为 `mini-cms-production`；在 1Panel 刷新编排和日志，确认看到的是同一组容器。

## 完成本章时确认的结果

- 新服务器运行本地制作并上传的镜像，目标平台正确。
- 1Panel 管理编排，OpenResty 通过本机端口代理应用。
- 新域名的 HTTPS、登录、写作与公开 API 正常，证书自动续签已配置。
- PostgreSQL 备份已保存到服务器之外，并完成一次恢复验证。
- 旧宝塔服务器与已有站点仍按原来的方式运行。

本章提供另一种部署入口，不增加 Mini CMS 的业务阶段。首次上线仍按[第 10 章阶段 8](./10-MiniCMS项目总览.md#阶段-8完成文章写作公开阅读与上线)验收；以后真正迁移正式数据时，再单独安排数据恢复与域名切换。
