# 20A. 用宝塔和 Docker Compose 部署 Mini CMS

> 第 20 章已在本地试过前后端的启动命令。本章在 Mac 制作并上传镜像，再部署到已有宝塔和 Nginx 的服务器，用域名和 HTTPS 访问。

当前使用已有的 2 核 2GB 服务器，继续保留宝塔、Nginx 和原有项目。以后在新服务器使用 1Panel 时，转到 [20B](./20B-用1Panel和Docker-Compose部署MiniCMS.md)；两章共用本章的 Dockerfile、Compose 和本地镜像流程。

遇到 SSH、用户权限或网络名词不清楚时，可以按 [Linux 学习目录中的问题导航](../../linux/README.md#正在部署-mini-cms遇到问题从这里查)回看对应章节，理解后继续本章操作。

## 建立一套可以长期复用的部署方式

以后再部署项目，希望每个项目都能明确自己的 Node.js 版本、依赖和启动方式，更新一个项目时尽量减少对其他项目的影响。因此，本章采用下面这套分工，作为个人项目和小型服务在单台服务器上部署时的默认方案：

| 部分 | 怎样安排 |
|---|---|
| 云服务器（宿主机） | 使用 Linux，安装 Docker；由 Nginx 统一接收网站请求、处理 HTTPS，再把请求交给对应项目 |
| Node.js 项目 | 在 Docker 容器中运行；把所需 Node.js 版本、依赖和启动命令写进 Dockerfile，用 Compose 保存端口、环境变量等配置 |
| 静态网站 | 构建后只需要提供 HTML、CSS、JavaScript 等文件时，优先让 Nginx 直接提供这些文件，省去常驻的 Node.js 进程 |
| 数据库 | 可以运行在 Docker 容器中，把数据保存在独立数据卷；也可以使用云厂商维护的托管数据库。两种方式都要配置备份并验证恢复 |

**这套分工可以长期复用。** 它把项目的运行环境保存在配置里，便于更新和换机器；Docker 官方也支持用 Compose 在单台服务器上部署生产应用。参见 [Compose 生产部署指南](https://docs.docker.com/compose/how-tos/production/)。

长期稳定还需要持续更新系统和依赖、留出足够资源，并把数据库备份保存到服务器之外、实际验证能够恢复。**数据卷解决重建容器后保留数据的问题，备份解决数据丢失后恢复的问题。** 当前方案依赖一台服务器，这台机器故障时，仍会影响上面的服务；以后对停机时间有更高要求，再考虑多台服务器和数据库故障自动切换。

本章用 **Docker Compose 启动项目，宝塔查看容器、管理网站与证书、安排备份，已有的 Nginx 处理网站请求**。当前 `admin-web-antd` 使用 `next build` 后再 `next start`，需要运行 Node.js，因此和 Express 一样放在容器中。只有采用[静态导出](https://nextjs.org/docs/app/guides/static-exports)的 Next.js 项目，才适合按静态网站部署。

## 项目部署到哪里

云服务器是一台运行 Linux 的电脑。本章在这台电脑上安装 Docker Engine，再由 Docker 启动 Mini CMS 的**两个 Node.js 项目和一个数据库**：

```text
云服务器（Linux）
├── 已有的 Node.js 22 项目、MySQL：继续按原来的方式运行
├── Nginx：接收网站请求，处理 HTTPS，转发到应用的本机端口
└── Docker
    ├── 管理端容器：admin-web-antd，Node.js 24 + Next.js
    ├── 后端容器：server，Node.js 24 + Express
    └── 数据库容器：PostgreSQL
```

**Docker 安装在云服务器上，Mini CMS 运行在这台服务器的容器里。** 三个容器共享服务器的 CPU、内存和磁盘；每个容器有自己的运行环境，两个 Node.js 容器使用镜像里的 Node.js 24，不需要替换服务器原有的 Node.js 22。

你本地目前只把 PostgreSQL 放在 Docker 中，前后端由本机 Node.js 运行。上线时，前后端也放进 Docker，三个容器都在云服务器上运行。

`admin-web-shadcn` 留到实现后再部署。个人网站继续在原来的环境运行，改为请求 Mini CMS 的线上公开 API。

## 先看部署顺序

先确认目标服务器的 CPU 架构、资源和将使用的域名，再在 Mac 上完成镜像制作、验证与上传。**镜像准备好以后，再集中处理服务器上的 Docker、运行配置、网站和 HTTPS。**

```mermaid
flowchart TD
    A["第 1 步 · 确认部署目标<br/>CPU 架构、剩余资源<br/>域名与端口安排"]
    B["第 2～3 步 · Mac 制作镜像<br/>编写 Dockerfile 和 Compose<br/>本地验证后上传 Docker Hub"]
    C["第 4 步 · 检查服务器环境<br/>复用宝塔与 Nginx<br/>确认 Docker 和 Compose 可用"]
    D["第 5～6 步 · 服务器运行<br/>上传配置、填写正式变量<br/>拉取镜像、迁移、启动并创建管理员"]
    E["第 7～8 步 · 宝塔配置入口<br/>两个子域名反向代理 + HTTPS<br/>验证登录、编辑与公开阅读"]
    F["第 9～10 步 · 备份与更新<br/>验证数据库恢复<br/>以后本地上传新版、服务器下载更新"]
    A --> B --> C --> D --> E --> F
```

**本地构建不依赖服务器已经安装面板、Nginx 或 Docker。** Node.js、依赖和 Prisma Client 都在 Mac 构建镜像时准备；服务器上的 Docker 负责运行下载后的镜像。提前确定 CPU 架构，是为了构建正确的平台；提前确定 API 域名，是因为它会写进 Next.js 的浏览器代码。DNS 解析与 HTTPS 可以在服务器部署阶段完成。

使用 1Panel 时也遵循同样的依赖关系。先装面板再构建镜像也能工作，只是并非构建的前置条件。本章先完成本地交付，再集中操作服务器，减少在两台机器之间来回切换。

第 1～8 步完成首次上线，第 9～10 步接着练习备份和更新；遇到问题时再查末尾的排错表。

## 先看请求怎样到达项目

**系统的主要分工确实就是这几步。** 图里画的是真实的请求主线，只是先省略 DNS 查询、HTTPS 建立连接和端口映射等细节。先看懂“谁把请求交给谁”，后面配置端口和域名时再补上这些细节。

可以先这样记：**Nginx 是网站入口，Next.js 提供后台页面，Express 处理业务，PostgreSQL 保存数据。** Docker 负责让这些应用在容器里运行、互相连接；宝塔提供容器与备份的管理界面。

以“已经登录后，打开文章列表”为例。这里有两件事：**先拿到管理页面，再请求文章数据。**

```mermaid
sequenceDiagram
    participant B as 你的浏览器
    box 同一台云服务器
        participant N as Nginx<br/>网站入口
        participant W as Next.js<br/>管理端容器
        participant A as Express<br/>API 容器
        participant D as PostgreSQL<br/>数据库容器
    end

    Note over B,W: ① 先拿到管理页面
    B->>N: 打开 admin.example.com/admin/articles
    N->>W: 按 admin 域名，把请求交给管理端
    W-->>N: 返回页面内容和前端代码
    N-->>B: 返回给浏览器，显示管理页面

    Note over B,D: ② 页面中的前端代码再请求文章数据
    B->>N: 请求 api.example.com/api/articles
    N->>A: 按 api 域名，把请求交给后端
    A->>A: 检查登录状态，处理文章查询
    A->>D: 通过 Prisma 查询文章
    D-->>A: 返回查询结果
    A-->>N: 返回文章 JSON
    N-->>B: 返回 JSON，前端把文章显示成列表
```

沿着图看一次实际操作：

1. **你打开后台地址。** 浏览器访问 `https://admin.example.com/admin/articles`，先找到 Nginx。它看到 `admin.example.com`，就把请求交给 Next.js。
2. **Next.js 把管理页面交给浏览器。** 图里把页面和 JavaScript、CSS 等资源的加载合并画在这一步。拿到页面，不等于已经拿到数据库里的文章。
3. **浏览器里的前端代码再发请求。** 文章列表页面请求 `https://api.example.com/api/articles`。这次 Nginx 看到的是 `api.example.com`，于是交给 Express；这次数据请求不经过 Next.js。
4. **Express 处理查询，PostgreSQL 提供数据。** 后端确认登录状态后，通过 Prisma 访问数据库，把查询结果整理成 JSON。JSON 经 Nginx 返回浏览器，前端再把它显示出来。

**Nginx 主要负责接住外部的网站请求，不是所有服务之间的中转站。** Express 和 PostgreSQL 在同一个 Docker 网络里，后端可以直接通过 `postgres:5432` 找数据库，不需要再经过 Nginx。

个人网站读取公开文章时，请求的是 `https://api.example.com/api/public/articles`，直接走上图的第二段数据链路；它不需要先访问 Mini CMS 管理端。个人网站自己的页面仍由它原来的部署环境提供。

### 看懂图里的网络名词

上图先讲清业务分工。下面这些配置负责让请求真正到达对应服务：

| 名词 | 放进这条请求链路里理解 |
|---|---|
| 域名、DNS、IP | `admin.example.com` 和 `api.example.com` 是两个名字，DNS 把它们都指向这台服务器的公网 IP。Nginx 再根据请求里的域名区分该找谁 |
| HTTP、HTTPS；80、443 | 浏览器访问网站的方式。HTTPS 会加密传输，默认连接 443；HTTP 默认连接 80，因此网址中通常不用写端口 |
| 安全组、主机防火墙 | 决定外部连接能不能进入。例如允许公网访问网站的 443，但不允许直接访问数据库端口 |
| 反向代理 | Nginx 接住浏览器的请求，转给 Next.js 或 Express，再把结果交还给浏览器 |
| 端口映射 | 把服务器（宿主机）上的某个端口映射到容器内的端口。例如，Nginx 将请求转发到宿主机的 `127.0.0.1:3001`，Docker 根据端口映射规则，再将请求转发到 API 容器内的 `3001` 端口 |

**本章在宝塔里配置网站、证书和转发规则，真正接收网站请求的是已有的 Nginx。** 第 1 步会画清公网与内部端口，第 7～8 步配置转发和 HTTPS。需要继续追踪 DNS、连接和证书时，再看 [Linux 08：一次 HTTPS 请求怎样到达 Express](../../linux/08-云服务器网络安全组与防火墙.md#一次-https-请求怎样到达-express)。

## Dockerfile、Compose 和宝塔分别做什么

上一节讲服务运行后怎样处理请求。现在看怎样把这些服务准备好、启动起来。

本章采用“在本地打包，再上传”：后端 `server` 和管理端 `admin-web-antd` 各有一份 Dockerfile，分别制作自己的镜像。

```text
你的 Mac：项目代码 + 各自的 Dockerfile → 制作镜像 → push 到 Docker Hub
服务器：拉取镜像 → 创建并启动容器 → 运行对应服务
```

这里的“服务”包括 **Next.js 管理端、Express 后端 API 和 PostgreSQL 数据库**。前两个镜像由你制作，PostgreSQL 用官方现成的镜像。服务器拿到的已经是打包好的程序，不需要再打包；以后改了代码，再上传新版本。

把这些名词放在一起看：

| 概念 | 大白话理解 | Mini CMS 中的例子 |
|---|---|---|
| Dockerfile | 打包说明书 | 告诉 Docker 用哪个 Node.js 版本、复制哪些代码、怎样安装依赖 |
| 镜像（image） | 打包好的程序，连运行它需要的东西也一起带上 | 后端镜像里已经准备好 Node.js、后端代码、依赖和 Prisma Client |
| 容器（container） | 先理解成在 Docker 里运行的一份程序 | 管理端容器提供页面，后端容器处理 API，数据库容器保存数据 |
| 镜像仓库 | 存镜像的地方，类似 GitHub 存代码 | 本地把镜像上传到 Docker Hub，服务器从这里下载 |
| Compose | 按配置把一组容器启动起来的工具 | 读取 `docker-compose.yml`，知道三个服务各用哪个镜像、端口和环境变量，然后一起管理 |
| 宝塔 | 在浏览器里管理服务器和服务的面板 | 查看容器和日志、配置 Nginx 反向代理与 HTTPS、设置备份任务 |

**GitHub 存源代码，Docker Hub 存打包好的镜像。** 本章选用 Docker Hub；GitHub 也有单独的镜像仓库服务 GHCR，但不是把镜像当普通文件提交到代码仓库。参见 [GitHub 镜像仓库说明](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)。

你的 M1 Max 负责打包，2 核 2GB 的服务器负责运行，避免构建时抢占线上网站和数据库的资源。两个 Node.js 项目分别这样准备：

| 项目 | 在 Mac 制作镜像时 | 在服务器启动容器时 |
|---|---|---|
| `server` 后端 | 用 `server/Dockerfile` 安装依赖、生成 Prisma Client、检查 TypeScript | 本章先执行数据库迁移，再用 `npm run start` 启动 Express；这个命令实际用 `tsx` 运行后端源码 |
| `admin-web-antd` 管理端 | 用自己的 Dockerfile 安装依赖，执行 `npm run build`，把构建结果放进镜像 | 用 `npm run start` 启动 Next.js，向浏览器提供管理页面 |

因此，后端也有 Dockerfile，只是当前后端直接用 `tsx` 运行，没有管理端的 `npm run build` 这一步。具体文件在第 2 步编写。

这三个容器还需要设置数据库地址、端口、数据保存位置和启动顺序，统一写在 `deploy/docker-compose.yml` 里。**Dockerfile 说明怎样打包，Compose 配置说明怎样把服务一起运行起来，宝塔提供日常管理界面。**

### 一定要自己写 Compose 吗

面板也可以通过表单创建容器，但本章把镜像、端口、环境变量和数据卷写在 Compose 文件中，再用明确指定文件的命令启动。这样配置保存在项目里，换到 1Panel 或另一台服务器时仍能复用。

宝塔支持管理 Docker 容器与 Compose 编排。本章用终端完成首次启动，再从宝塔查看容器状态和日志；代理、HTTPS 和定时任务在面板里配置。参见 [宝塔官方容器与编排教程](https://www.bt.cn/bbs/thread-140412-1-1.html)。

---

## 第 1 步：确认服务器、域名和端口

### 服务器

本章复用已有宝塔和 Nginx 的 Linux 服务器，当前配置为 **2 核 2GB**。先在宝塔首页查看 CPU、内存和磁盘占用，并用 SSH 在服务器执行 `uname -m`、`free -h` 和 `df -h /`，确认架构、可用内存与磁盘空间。已有 Node.js 项目和 MySQL 继续按原来的方式运行。

本章把 `next build` 等打包工作放在 Mac 上，服务器只下载镜像、运行服务。但运行中的 Next.js、Express、PostgreSQL 和已有服务仍会共用这 2GB 内存，上线后要在宝塔观察实际占用，不能把“省掉构建”理解成“运行一定够用”。

先在服务器执行 `uname -m`：本章按输出为 `x86_64` 编写，对应镜像平台 `linux/amd64`。你的 M1 是 ARM，所以后面的配置会明确指定 `linux/amd64`，让 Mac 制作适合服务器的镜像。若输出是 `aarch64`，则将后文两处 `platform` 改成 `linux/arm64`。Docker Desktop 支持这种跨架构制作，模拟另一种 CPU 时可能慢一些。参见 [Docker 跨平台构建说明](https://docs.docker.com/build/building/multi-platform/)。

### 一个域名，配置两个子域名

假设你已有 `example.com`，先确定下面两个子域名。可以现在添加 DNS A 记录，也可以留到第 7 步；记录值都填服务器的公网 IPv4 地址：

| 主机记录 | 得到的访问地址 | 用途 |
|---|---|---|
| `admin` | `admin.example.com` | 管理端 |
| `api` | `api.example.com` | 后端 API |

**只需一个已购买的域名，不需要再买两个。** `admin` 和 `api` 是这个域名下的两个子域名，指向同一台服务器。

也可以只用同一个访问地址，由路径区分管理页面和 `/api` 请求。本章沿用前文管理端、API 分开配置地址的方式，使用两个子域名。

### 放行本次需要的端口

先分清两段：**浏览器从公网访问网站，只需要找到服务器的 80／443；Nginx 接到请求后，再通过服务器本机端口把请求交给项目。**

下图只画网站请求的去向，响应会沿相反方向返回：

```mermaid
flowchart TD
    B["外部浏览器<br/>访问 admin.example.com 或 api.example.com"]
    subgraph S["同一台云服务器"]
        N["Nginx<br/>网站公网入口：80 / 443"]
        H0["127.0.0.1:3000<br/>服务器本机入口"]
        H1["127.0.0.1:3001<br/>服务器本机入口"]
        subgraph D["Mini CMS 的 Docker 内部网络"]
            W["Next.js 管理端容器<br/>容器内 3000"]
            A["Express API 容器<br/>容器内 3001"]
            P["PostgreSQL 容器<br/>容器内 5432"]
        end
        N -->|admin 域名| H0
        N -->|api 域名| H1
        H0 -->|Docker 端口映射| W
        H1 -->|Docker 端口映射| A
        A -->|内部直连 postgres:5432| P
    end
    B -->|安全组、防火墙放行 80 / 443| N
```

`127.0.0.1` 表示当前电脑自身，这里是**云服务器本机**。已有的宝塔 Nginx 运行在宿主机上，因此它能访问这些本机入口，再由 Docker 把请求交给容器。

各个入口的访问范围如下；部署时在云安全组及已启用的主机防火墙中，只新增本项目需要的公网入口。已有网站或服务的规则先保留：

| 访问范围 | 入口 | 谁来访问、用来做什么 |
|---|---|---|
| 公网网站入口 | 服务器的 80、443 | 浏览器访问网站；80 用于 HTTP 和部分证书验证，443 用于 HTTPS |
| 公网管理入口 | SSH 端口，通常为 22 | 你从 Mac 登录服务器、上传文件 |
| 公网管理入口 | 现有宝塔面板的端口 | 你打开宝塔管理页面 |
| 仅服务器本机，不向公网开放 | `127.0.0.1:3000`、`127.0.0.1:3001` | Nginx 通过这里把请求转给管理端、API 容器 |
| Docker 内部通信，不向公网开放 | `postgres:5432` | API 容器直接连接数据库，不经过 Nginx |
| 仅服务器本机，不向公网开放 | `127.0.0.1:5432` | 供服务器本机查库，也供 Mac 上的 TablePro 通过 SSH 隧道查库；API 仍走 `postgres:5432` |

**不开放 3000、3001，不等于外部用户不能访问你的项目。** 用户通过网站的 443 入口访问，Nginx 再向内部转发。例如打开 `https://admin.example.com`，浏览器连接的是 443，由 Nginx 找到内部的 3000。浏览器不会直接连接服务器的公网 3000。

数据库则由 Express 通过 Docker 内部网络访问。即使不把数据库端口映射到服务器本机，`postgres:5432` 这条内部链路也能工作。参见 [Docker 端口映射](https://docs.docker.com/engine/network/port-publishing/)和[Compose 内部网络](https://docs.docker.com/compose/how-tos/networking/)。

**表中的 `127.0.0.1:5432` 是服务器本机的数据库入口，本身不代表 SSH。** 从 Mac 上的 TablePro 查线上数据库时，可以通过 SSH 隧道到达这个入口：

```text
Mac 上的 TablePro
-> Mac 本机 127.0.0.1:15432
-> SSH 加密隧道（连接服务器的 SSH 端口）
-> 服务器本机 127.0.0.1:5432
-> Docker 端口映射
-> PostgreSQL 容器的 5432
```

等第 6 步数据库启动后，需要查库时，在 **Mac 新开一个终端**执行：

```bash
ssh -N -o ExitOnForwardFailure=yes -L 127.0.0.1:15432:127.0.0.1:5432 aliyun
```

`aliyun` 沿用已有 SSH 连接别名；`-N` 只建立隧道，不打开远程 Shell。前面的 `127.0.0.1:15432` 是 Mac 的入口，后面的 `127.0.0.1:5432` 是从服务器这一端访问的目标。Mac 使用 15432，避免与本地开发数据库的 5432 冲突。

保持这个终端运行，在 TablePro 新建普通 PostgreSQL 连接：主机填 `127.0.0.1`，端口填 `15432`，账号、密码和库名填服务器 `deploy/.env` 中的正式数据库配置。隧道已经由终端建立，TablePro 不用再开启自己的 SSH 隧道。连接成功后能看到线上表；用完在终端按 `Ctrl+C` 关闭隧道。

**这条查库链路只使用已允许访问的 SSH 端口，不需要向公网开放 5432 或 15432。** SSH 负责把连接送到服务器，PostgreSQL 仍会校验数据库账号和密码。也可以先 SSH 登录服务器，再在服务器上执行查库命令；第 9 步会用到容器里的 `psql`，这种方式连本机端口映射也不需要。SSH 隧道原理见 [Linux 04](../../linux/04-SSH-从Mac安全连接Linux.md#彩蛋挖一条只有你能走的隧道)。

如果服务器的 3001 已经被旧项目占用，可以把 API 的映射改成：

```text
127.0.0.1:13001:3001
          ↑     ↑
     服务器端口  容器内端口
```

这时第 7 步的 Nginx 代理地址也改成 `http://127.0.0.1:13001`，容器里的 Express 仍用 3001。**外部用户继续访问原来的 HTTPS 域名，网址和公网 443 都不用改。** 管理端端口冲突时按相同方式处理。

---

## 第 2 步：为项目增加生产容器配置

在本机的 `mini-cms` 中创建下面这些文件，路径都相对于项目根目录。Dockerfile 和本地打包配置留在 Mac 上使用；服务器只需要启动用的 Compose 和正式环境配置。源代码与这些配置仍通过 Git 保存版本。

### 2.1 `server/.dockerignore`

构建镜像时排除本机的依赖、构建产物和环境配置，让镜像重新安装依赖，并在运行时读取服务器配置：

```dockerignore
node_modules
dist
coverage
.env
.env.*
```

### 2.2 `server/Dockerfile`

这份 Dockerfile 使用与当前项目一致的 Node.js 24，安装依赖、生成 Prisma Client 并检查类型。容器启动时仍使用第 20 章已经试过的 `npm run start`。

```dockerfile
FROM node:24-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json ./
COPY src ./src
COPY scripts ./scripts

RUN DATABASE_URL=postgresql://build:build@postgres:5432/build npm run db:generate
RUN npx tsc --noEmit

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "run", "start"]
```

`FROM` 选择基础镜像，`WORKDIR` 设置容器内的工作目录，`COPY` 复制文件。`RUN` 在制作镜像时执行；`CMD` 指定容器启动时执行的命令。

OpenSSL 是 Prisma 7 迁移工具需要的[系统依赖](../../linux/05-文件系统用户权限与软件安装.md#系统依赖与-npm-依赖分别装在哪里)。这里用 `apt-get` 把它装进后端镜像，由底层工具使用，业务代码不用 `import`。参见 [Prisma 的 Docker 部署说明](https://www.prisma.io/docs/guides/v7/deployment/docker#31-option-2-use-linux-debian-nodeslim-as-a-base-image)。

`npm ci --include=dev` 按锁文件安装全部依赖。当前 `tsx`、Prisma CLI 和 TypeScript 放在 `devDependencies`，这里仍然需要它们来运行后端、执行迁移和检查类型，不能省略。

这里的 `db:generate` 是为镜像生成 Client，不是在修改数据库。命令前的示例 `DATABASE_URL` 只供 Prisma 加载配置，生成 Client 时不连接这个地址；容器真正运行时，由 Compose 传入数据库地址。后端不生成 `dist`，`start` 直接通过 `tsx` 运行已复制进镜像的源码。

### 2.3 `admin-web-antd/.dockerignore`

```dockerignore
node_modules
.next
.env
.env.*
```

### 2.4 `admin-web-antd/Dockerfile`

管理端先在镜像中执行 `build`，容器启动后再执行 `start`。API 地址要在构建前传入：

```dockerfile
FROM node:24-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start", "--", "-H", "0.0.0.0"]
```

`NEXT_PUBLIC_API_BASE_URL` 会进入浏览器端构建结果，所以它必须在 `npm run build` 前传入。只在容器启动时改变这个值，不会自动改写已经生成的前端代码。

### 2.5 `deploy/.gitignore`

```gitignore
.env
```

### 2.6 `deploy/.env.example`

```dotenv
DOCKERHUB_USERNAME=yourdockerhubname
IMAGE_TAG=v1

POSTGRES_USER=mini_cms
POSTGRES_PASSWORD=replace_with_a_long_random_password
POSTGRES_DB=mini_cms
DATABASE_URL=postgresql://mini_cms:replace_with_a_long_random_password@postgres:5432/mini_cms

ADMIN_DOMAIN=admin.example.com
API_DOMAIN=api.example.com
ADMIN_WEB_ORIGIN=https://admin.example.com
```

`DOCKERHUB_USERNAME` 填 Docker Hub 用户名，`IMAGE_TAG` 是你给这次发布起的版本号，例如 `v1`。本地打包、上传和服务器下载，都使用同一个用户名和版本号。

数据库密码进入 URL 时，`@`、`:`、`/`、`#` 等字符需要 URL 编码。第一次可以使用足够长的随机字母和数字组合，避免手写两处值时产生编码差异。

### 2.7 `deploy/docker-compose.yml`

这份文件负责启动服务，本地验证和服务器运行都用它：

```yaml
name: mini-cms-production

services:
  postgres:
    image: postgres:18
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    image: "${DOCKERHUB_USERNAME}/mini-cms-api:${IMAGE_TAG}"
    platform: linux/amd64
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: ${DATABASE_URL}
      ADMIN_WEB_ORIGIN: ${ADMIN_WEB_ORIGIN}
    depends_on:
      postgres:
        condition: service_healthy
    command: ["sh", "-c", "npm run db:migrate:deploy && npm run start"]
    ports:
      - "127.0.0.1:3001:3001"

  admin_web_antd:
    image: "${DOCKERHUB_USERNAME}/mini-cms-admin:${IMAGE_TAG}"
    platform: linux/amd64
    restart: unless-stopped
    depends_on:
      - api
    ports:
      - "127.0.0.1:3000:3000"

volumes:
  postgres_data:
```

`image` 指定使用哪个镜像。例如 `yourdockerhubname/mini-cms-api:v1` 就是“你的 Docker Hub 账号下，后端镜像的 v1 版本”。这里没有 `build`，服务器启动时不会重新打包。

`ports` 中的 `127.0.0.1:3000:3000` 表示：将服务器本机的 3000 端口连接到管理端容器的 3000 端口。Nginx 访问 `http://127.0.0.1:3000`，就能把请求交给容器里的 Next.js。3001 对应后端，5432 对应数据库。

其余配置对应四件事：

- **连接数据库**：后端的 `DATABASE_URL` 使用服务名 `postgres`，访问同一 Compose 中的数据库。
- **按顺序启动**：`healthcheck` 检查 PostgreSQL 是否就绪，后端等它就绪后执行迁移，迁移成功才执行 `start`。
- **保留数据**：`volumes` 把 PostgreSQL 数据保存在独立的数据卷中，重新构建应用镜像不会删除它。
- **自动重启**：`restart: unless-stopped` 让 Docker 在容器意外退出后重新启动它；手动停止的容器保持停止。

### 2.8 `deploy/docker-compose.build.yml`

这份文件只在 Mac 上打包时使用，补充“去哪里找代码、怎样打包”：

```yaml
services:
  api:
    build:
      context: ../server

  admin_web_antd:
    build:
      context: ../admin-web-antd
      args:
        NEXT_PUBLIC_API_BASE_URL: "https://${API_DOMAIN}"
```

打包时让 Compose 同时读取 2.7 和 2.8：前一份提供镜像名称与目标平台，后一份提供代码目录与构建参数。两个 `context` 都相对于 `deploy/`；服务器只使用 2.7。参见 [Compose 多文件用法](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/)和[构建目标平台说明](https://docs.docker.com/reference/compose-file/build/#platforms)。

---

## 第 3 步：在本地制作、验证并上传镜像

这一整步都在 Mac 上操作。先启动 Docker Desktop，下面的终端命令都在 `mini-cms` 根目录执行。

### 3.1 准备 Docker Hub 和本地配置

登录 [Docker Hub](https://hub.docker.com/)，在自己的账号下创建两个镜像仓库：`mini-cms-api` 和 `mini-cms-admin`。Public 允许任何人下载，Private 只允许有权限的账号下载；镜像里包含项目代码，按代码是否愿意公开选择。创建方式见 [Docker Hub 仓库说明](https://docs.docker.com/docker-hub/repos/create/)。

在 Docker 账号设置中创建有 **Read & Write** 权限的个人访问令牌，用来上传镜像。终端执行下面的命令，将用户名换成自己的，在密码提示处粘贴令牌：

```bash
docker login --username yourdockerhubname
```

令牌不用写进项目文件。具体入口见 [Docker 个人访问令牌说明](https://docs.docker.com/security/access-tokens/personal-access-tokens/)。看到 `Login Succeeded` 后，首次创建本地部署配置：

```bash
cp deploy/.env.example deploy/.env
```

编辑 `deploy/.env`：

- `DOCKERHUB_USERNAME` 填刚才登录的用户名，`IMAGE_TAG` 填 `v1`。
- 数据库使用本地练习密码，保持 `DATABASE_URL` 中的账号、密码、库名与 PostgreSQL 配置一致，主机仍填 `postgres`。
- `ADMIN_DOMAIN`、`API_DOMAIN` 和 `ADMIN_WEB_ORIGIN` 填计划上线的真实域名，例如 `admin.你的域名`、`api.你的域名` 和 `https://admin.你的域名`。

**API 域名必须在这次打包前填好。** 它会写进管理端镜像；本地验证通过后上传的就是这一份镜像，不能保留 `api.example.com` 等到服务器再改。数据库密码只在容器运行时传入，不会作为构建参数打进镜像。

### 3.2 按服务器架构制作镜像

```bash
docker compose --env-file deploy/.env \
  -f deploy/docker-compose.yml -f deploy/docker-compose.build.yml config

docker compose --env-file deploy/.env \
  -f deploy/docker-compose.yml -f deploy/docker-compose.build.yml build api admin_web_antd
```

两个 `-f` 表示同时读取两份配置。检查 `config` 输出：镜像名称带自己的用户名和 `v1`，两个应用的 `platform` 都是第 1 步确认的服务器平台，管理端构建参数使用正式 API 地址。

`build` 会在 Mac 上按 Dockerfile 安装依赖、生成 Prisma Client，并完成管理端的 `next build`。结束时应没有报错。这一步得到的就是准备上传的后端和管理端镜像。

### 3.3 用这两份镜像在本地试跑

先停止本地占用 3000、3001 的前后端进程，并在项目根目录执行 `docker compose stop postgres`，释放开发 PostgreSQL 使用的 5432 端口。停止容器会保留开发数据卷，不要删除数据卷。下面使用独立的 `mini-cms-production` Compose 项目和数据卷。

启动时只读取运行配置，使用刚才已经做好的镜像：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d
docker compose --env-file deploy/.env -f deploy/docker-compose.yml ps
docker compose --env-file deploy/.env -f deploy/docker-compose.yml logs -f api
```

`ps` 应显示三个容器运行，PostgreSQL 为 `healthy`，API 日志显示迁移成功或没有待执行迁移，随后启动服务。看完日志按 `Ctrl+C` 退出查看，容器会继续运行。

请求当前项目已有的公开文章接口和管理端：

```bash
curl -i http://127.0.0.1:3001/api/public/articles
curl -I http://127.0.0.1:3000
```

文章接口应返回 `200` 和包含 `data`、`pagination` 的 JSON；新数据库没有文章时，`data` 是空数组。管理端应返回页面响应或跳转响应（如 `200`、`307`）。这说明前后端已启动，后端也能读取数据库。

本轮检查镜像能否启动、迁移和读取数据，此时服务器可以还没有准备 Docker 和网站入口。管理端浏览器请求已经指向正式 API 域名，所以完整登录、保存文章留到第 8 步在真实 HTTPS 域名下验证。

结束本地试跑：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml down
```

不要添加 `-v`。`down -v` 会删除 Compose 数据卷，里面可能有 PostgreSQL 数据。需要继续本地开发时，在项目根目录执行 `docker compose up -d postgres`，再启动原来的前后端开发命令。

### 3.4 上传已经验证过的镜像

保持 `deploy/.env` 中的用户名和版本号不变，执行：

```bash
docker compose --env-file deploy/.env \
  -f deploy/docker-compose.yml -f deploy/docker-compose.build.yml push api admin_web_antd
```

**`push` 只上传刚才做好的镜像，不会再打包。** 这里指定两个应用，不上传 PostgreSQL 官方镜像。打开 Docker Hub 的两个仓库，确认都出现了 `v1` 标签，再继续服务器部署。参见 [Compose push](https://docs.docker.com/reference/cli/docker/compose/push/)。

同时用 Git 保存这次源代码和容器配置的版本，记录 `v1` 对应哪个 commit；真实 `deploy/.env` 不提交。

---

## 第 4 步：检查宝塔、Nginx 和 Docker

现在两个应用镜像已经在 Docker Hub 中。接下来登录现有服务器，准备运行它们。**本章复用宝塔管理的 Nginx，通过宝塔配置网站和证书。** 不再用 `apt install nginx` 安装另一套 Nginx，也不另用 Certbot 接管宝塔的网站配置。

先在宝塔确认已有网站与 Nginx 正常运行，记下正在使用的端口。在服务器终端执行：

```bash
docker version
docker compose version
ss -lntp
```

- `docker version` 应显示 Client 和 Server，`docker compose version` 应输出版本号。
- 若尚未安装 Docker，从宝塔的 **Docker** 页面按提示安装；已有 Docker 时复用已有服务，不重装。
- 检查 3000、3001、5432 是否被已有项目占用。有冲突时，按第 1 步调整 Compose 映射的宿主机端口，并同步代理或查库地址。

应用镜像已包含 Node.js 24；PostgreSQL 使用 Compose 中的官方镜像。这里不需要为 Mini CMS 另外在宿主机安装 Node.js 或 PostgreSQL，也不修改旧项目使用的 Node.js 22 和 MySQL。

在宝塔的安全设置中核对面板入口与访问限制，再按第 1 步的表检查云安全组和主机防火墙。能看到 Docker 服务正常、旧网站仍可访问后，再继续上传配置。

---

## 第 5 步：把运行配置放到服务器

服务器需要下载镜像，并知道用什么配置启动。代码已经在镜像里，所以这里只传两个文件：`deploy/docker-compose.yml` 和 `deploy/.env.example`。

沿用已有的 `ssh aliyun` 连接。本章按 `root` 登录编写；`aliyun` 是连接别名，实际用户由 SSH 配置中的 `User` 决定。认证过程见 [Linux 04](../../linux/04-SSH-从Mac安全连接Linux.md#一次-ssh-密钥登录怎样完成)。

**在 Mac 的 `mini-cms` 根目录执行：**

```bash
ssh aliyun 'mkdir -p /opt/mini-cms/deploy'
scp deploy/docker-compose.yml deploy/.env.example aliyun:/opt/mini-cms/deploy/
```

`scp` 通过 SSH 上传这两个文件，使用与 `ssh aliyun` 相同的连接配置。然后登录服务器：

```bash
ssh aliyun
```

**下面都在服务器终端执行。** 首次创建正式配置：

```bash
cd /opt/mini-cms
cp -n deploy/.env.example deploy/.env
chmod 600 deploy/.env
```

`cp -n` 保留已经存在的 `.env`。通过 SSH 或 宝塔文件管理器编辑它：

- `DOCKERHUB_USERNAME`、`IMAGE_TAG` 与本地上传的镜像一致，例如自己的用户名和 `v1`。
- 填写正式数据库账号和密码，保持 `DATABASE_URL` 中的账号、密码、库名一致。
- 填写真实的 `ADMIN_DOMAIN`、`API_DOMAIN` 和 `ADMIN_WEB_ORIGIN`，与本地打包时选定的域名一致。

服务器的 `.env` 使用正式密码，不从 Mac 复制练习用的 `.env`。此时服务器目录是：

```text
/opt/mini-cms/deploy/
├── docker-compose.yml
├── .env.example
└── .env
```

在启动前解析一次配置：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml config
```

检查镜像名称和版本、端口、域名、服务名是否正确。不要把包含真实密钥的完整输出粘贴到聊天或工单。

---

## 第 6 步：拉取镜像并启动 Compose，在宝塔查看状态

先在服务器的 `/opt/mini-cms` 目录拉取镜像。如果使用 Private 仓库，先以当前管理 Docker 的用户登录；本章是 `root`，密码提示处使用有 **Read** 权限的 Docker Hub 令牌：

```bash
docker login --username yourdockerhubname
```

Public 仓库可以不登录直接拉取。随后执行：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml pull
```

这会下载你上传的两个应用镜像和 PostgreSQL 官方镜像。**拉取成功后，服务器已经拿到打包好的程序，下一步直接启动。**

拉取成功后，仍在服务器 `/opt/mini-cms` 目录执行：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d
```

这个命令明确指定 Compose 和 `.env`，创建名为 `mini-cms-production` 的编排。打开宝塔 **Docker → 容器**，查看这三个容器；支持发现本地编排的版本，也会在“容器编排”中显示它。日常看日志、观察资源和单独启停容器可用面板；发布更新继续使用第 10 步的同一套文件和命令。

不要再把相同配置复制到面板创建第二套编排，否则可能出现端口冲突或连接到另一份数据卷。

启动后查看：

- 三个容器是否运行。
- PostgreSQL 健康检查是否通过。
- API 日志中迁移是否成功。
- 3000、3001、5432 是否只绑定 `127.0.0.1`。

在 SSH 中交叉验证：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml ps
ss -lntp
curl -i http://127.0.0.1:3001/api/public/articles
curl -I http://127.0.0.1:3000
```

响应应与第 3 步一致。到这里，项目已经在服务器内部运行，接下来创建管理员，再配置域名访问。

---

### 在新数据库中创建首个管理员

迁移只建立表，不会复制本地管理员。确认 API 日志中的 migration 已成功，再在服务器的 Bash 中、`/opt/mini-cms` 目录执行一次初始化。镜像已复制第 17A 章的 `scripts/`，并保留运行 `admin:create` 所需的 `tsx`：

```bash
read -r -p "管理员用户名: " ADMIN_USERNAME
read -r -s -p "管理员密码（至少 12 位）: " ADMIN_PASSWORD
printf '\n'
export ADMIN_USERNAME ADMIN_PASSWORD
docker compose --env-file deploy/.env -f deploy/docker-compose.yml run --rm --no-deps -e ADMIN_USERNAME -e ADMIN_PASSWORD api npm run admin:create
unset ADMIN_USERNAME ADMIN_PASSWORD
```

`run` 复用 API 服务的生产数据库配置，用 `admin:create` 替换默认启动命令，结束后删除这次运行的容器。密码通过隐藏输入传入环境，不写进命令历史或仓库。看到创建成功后再配置域名；HTTPS 就绪后，用这个账号登录验证。该脚本对同名账号会更新密码，不要作为每次部署的自动启动步骤。

---

## 第 7 步：把两个子域名分别转发到管理端和 API

确认 `admin`、`api` 两条 DNS A 记录已指向服务器公网 IPv4，第 6 步的本机接口检查也已通过。在宝塔里为两个子域名各建一个网站，再配置反向代理。

1. 进入 **网站 → 添加站点**，分别填写两个真实域名。使用普通站点入口时，PHP 版本选择“纯静态”，FTP 和数据库选择“不创建”。这里只为 Nginx 建立域名入口，不需要安装 PHP，也不用把 Next.js 源码上传到站点目录。
2. 打开每个站点的 **设置 → 反向代理 → 添加反向代理**，按下表填写。不同版本的按钮名称可能略有差别，目标都是给这两个网站各增加一条 `/` 的转发规则。

| 网站域名 | 代理目录 | 目标 URL | 发送域名 |
|---|---|---|---|
| `admin.example.com` | `/` | `http://127.0.0.1:3000` | `admin.example.com` |
| `api.example.com` | `/` | `http://127.0.0.1:3001` | `api.example.com` |

域名全部替换为实际值；若第 1 步调整了宿主机端口，也同步修改目标 URL。代理目录入口需要时展开“高级功能”；保持请求路径不变，关闭代理缓存，内容替换留空。发送域名用于传给应用的 `Host` 请求头。

保存后，请求关系就是：

```text
admin.example.com → 宝塔 Nginx → 服务器 127.0.0.1:3000 → Next.js
api.example.com/api/public/articles → 宝塔 Nginx → 127.0.0.1:3001/api/public/articles → Express
```

在 Mac 上验证，替换为自己的域名：

```bash
curl -I http://admin.example.com
curl -i http://api.example.com/api/public/articles
```

管理端应返回页面或跳转响应，公开文章接口应返回 `200` 和 JSON。此时只检查 HTTP 转发；正式前端已使用 HTTPS API 地址，登录与保存留到下一步验证。API 的 CORS、Cookie 和认证仍由 Express 负责，不在代理层另加宽松 CORS 规则。

配置方式见 [宝塔反向代理指南](https://docs.bt.cn/user-guide/site/php/site-config/reverse-proxy/)。面板负责生成并加载 Nginx 配置，后续也从对应站点设置中维护。

---

## 第 8 步：在宝塔申请证书并启用 HTTPS

在两个网站各自的 **设置 → SSL** 中申请或选择覆盖该域名的证书。本章使用面板支持自动续签的 **Let's Encrypt**，由宝塔完成申请、部署与续签。

```text
网站设置 → SSL → Let's Encrypt → 申请证书
→ 选择当前网站域名和验证方式
→ 申请成功后部署到对应网站
→ 确认 HTTPS 能访问，再开启“强制 HTTPS”
→ 检查自动续签状态与任务日志
```

文件验证需要域名已经解析到这台服务器，公网可访问 80，且验证文件没有被代理转走；已有 `/` 反向代理导致文件验证失败时，可改用 DNS API 验证。DNS API 验证需要配置域名服务商的授权信息，让面板能自动添加验证记录；只手工添加一次 DNS 记录，不能代替以后自动续签所需的授权。

两个网站都完成证书部署后，检查证书的域名、有效期及自动续签设置。这里用宝塔原有的证书管理，不额外安装 Certbot。具体界面和验证方式见 [宝塔网站 SSL 文档](https://docs.bt.cn/user-guide/site/php/site-config/ssl/)。

启用后验证：

```bash
curl -I https://admin.example.com
curl -i https://api.example.com/api/public/articles
```

再从浏览器完成一次真实操作：

1. 打开管理端 HTTPS 地址，用刚创建的管理员登录，确认浏览器没有证书错误。
2. 新建并保存一篇文章，重新打开，确认标题和正文正确；发布后，让个人网站通过正式 API 读取它。
3. 退出登录，确认管理接口不再允许访问。浏览器开发者工具中，请求使用正式 API 地址，登录 Cookie 带 `Secure`。

首次上线完成。接下来配置数据备份，再练习以后怎样更新项目。

---

## 第 9 步：配置数据库备份和恢复验证

数据卷能保留容器重建后的数据，但误删文章或服务器磁盘损坏时，还需要从备份恢复。本节先用 PostgreSQL 容器里已有的工具导出数据，再恢复到测试数据库，最后让宝塔定时执行备份。

### 9.1 导出一份数据库备份

在服务器的 Bash 终端执行：

```bash
(
  set -e
  umask 077
  cd /opt/mini-cms
  mkdir -p /opt/backups/mini-cms
  chmod 700 /opt/backups/mini-cms

  backup_file="/opt/backups/mini-cms/mini-cms-$(date +%Y%m%d-%H%M%S).dump"
  docker compose --env-file deploy/.env -f deploy/docker-compose.yml \
    exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' \
    > "$backup_file.tmp"
  mv "$backup_file.tmp" "$backup_file"

  find /opt/backups/mini-cms -type f -name 'mini-cms-*.dump' -mtime +6 -delete
  printf '备份完成：%s\n' "$backup_file"
)
```

`pg_dump` 导出数据库的表结构和数据，`-Fc` 生成供 `pg_restore` 恢复的归档文件。`exec -T` 在已有容器中执行命令，`>` 把结果保存到服务器的备份目录；账号和库名读取容器已有的配置。

整段遇到错误就停止，只有导出成功才把临时文件改成 `.dump`。文件名包含备份时间，脚本保留最近 7 天的文件，并输出本次备份的完整路径。记下这个路径，下一步使用。

### 9.2 恢复到测试数据库，检查文章

使用刚才生成的备份，在同一个 PostgreSQL 容器中新建 `mini_cms_restore_check` 测试库。API 仍连接原来的数据库。在服务器的 Bash 终端执行，提示时粘贴备份文件的完整路径：

```bash
(
  set -e
  cd /opt/mini-cms
  read -r -p "备份文件完整路径: " backup_file
  test -s "$backup_file"

  docker compose --env-file deploy/.env -f deploy/docker-compose.yml \
    exec -T postgres sh -c 'createdb -U "$POSTGRES_USER" -T template0 mini_cms_restore_check'
  docker compose --env-file deploy/.env -f deploy/docker-compose.yml \
    exec -T postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d mini_cms_restore_check --exit-on-error' \
    < "$backup_file"
  docker compose --env-file deploy/.env -f deploy/docker-compose.yml \
    exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d mini_cms_restore_check -v ON_ERROR_STOP=1 -c "SELECT id, title, slug FROM articles ORDER BY id DESC LIMIT 5;"'
)
```

`createdb` 创建空库，`pg_restore` 导入备份，最后的 SQL 查询恢复后的文章。确认能看到第 8 步保存的文章，且整段没有报错，才算完成恢复验证。如果测试库已经存在，命令会停止，先确认上次验证已结束，再用下面的命令清理后重试。

验证结束后删除测试库：

```bash
cd /opt/mini-cms
docker compose --env-file deploy/.env -f deploy/docker-compose.yml \
  exec -T postgres sh -c 'dropdb -U "$POSTGRES_USER" mini_cms_restore_check'
```

删除的只是 `mini_cms_restore_check`，保留原数据库和备份文件。

### 9.3 设置每日自动备份，并保存到服务器之外

在宝塔的“计划任务”中创建 **Shell 脚本**任务：在宿主机上用 Bash 执行，内容粘贴 9.1 的完整代码块，周期设为每天 03:00。先手动执行一次，确认任务报告显示成功，并出现新的 `.dump` 文件。

再在宝塔的软件商店配置所用云存储插件，例如阿里云 OSS 或腾讯云 COS。在“计划任务”中创建 **备份目录**任务：源目录为 `/opt/backups/mini-cms`，备份位置选择已配置的云存储，保留最近 7 份。执行时间安排在数据库导出完成后，例如每天 03:30；若实际导出耗时更长，就相应延后。排除 `*.tmp` 临时文件。

这里先用 `pg_dump` 导出 PostgreSQL，再备份导出目录，不把面板的“备份网站”当作数据库备份。计划任务设置见 [宝塔官方说明](https://docs.bt.cn/user-guide/crontab/task/)。

手动执行目录备份，确认远端能找到文件；下载一份、解压取出其中的 `.dump`，再按 9.2 恢复一次，确认服务器之外的副本同样可用。之后定期重复恢复验证。项目的 Dockerfile、Compose 配置和恢复步骤保存在 Git 与 README 中，数据库内容依靠这些备份恢复。

---

## 第 10 步：以后怎样更新

以后每次发布都走同一条线：**Mac 制作并上传新版镜像 → 服务器下载新版 → 更新容器。**

先在 Mac 上准备新版：

1. 完成本次修改，检查迁移文件，运行项目已有的测试和检查。
2. 把本地 `deploy/.env` 的 `IMAGE_TAG` 从 `v1` 改成新版本，例如 `v2`。每次发布使用新标签，保留旧版供核对和回退。
3. 按第 3.2～3.4 节重新制作两个应用镜像、本地试跑，再上传。确认 Docker Hub 两个仓库都有 `v2`；源代码和配置提交到 Git，记录这次版本对应的 commit。

再更新服务器：

1. 按第 9 步备份正式数据库，记录服务器当前的 `IMAGE_TAG`。
2. 将服务器 `deploy/.env` 的 `IMAGE_TAG` 改为刚上传的 `v2`，保留正式数据库密码等配置。
3. 如果本次修改了运行用的 `deploy/docker-compose.yml`，先按第 5 步从 Mac 上传该文件；仅修改业务代码时不用重新上传配置。

在服务器执行：

```bash
cd /opt/mini-cms
docker compose --env-file deploy/.env -f deploy/docker-compose.yml config
docker compose --env-file deploy/.env -f deploy/docker-compose.yml pull api admin_web_antd
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d
docker compose --env-file deploy/.env -f deploy/docker-compose.yml ps
```

`pull` 下载已经打包好的新版，`up -d` 用新版镜像更新容器。镜像拉取失败时先解决错误，成功后再执行 `up`。更新前不用 `down`，也不用在服务器运行 `build`；这里仅拉取两个应用，PostgreSQL 的版本升级另行安排。

然后检查：

```bash
curl -i https://api.example.com/api/public/articles
docker compose --env-file deploy/.env -f deploy/docker-compose.yml logs --tail=200 api
```

重新打开管理端，确认本次修改已生效，更新前保存的文章仍能查看和编辑。把本节更新命令与第 9 步实际使用的备份、恢复方法记到项目 README。

需要回退应用时，将 `IMAGE_TAG` 改回保留的旧版本，再拉取并更新容器。**切回旧镜像不会撤销数据库迁移**；先确认旧程序还能使用更新后的表结构，不能把镜像回退当作数据库恢复。

---

## 完成本章时确认的结果

- 在 Mac 上制作并验证镜像，Docker Hub 能看到对应版本，服务器拉取后直接运行。
- 通过 HTTPS 登录管理端，能保存、重新打开文章；个人网站能读取已发布内容。
- 更新或重启容器后，服务能恢复，已有文章仍在。
- 已生成数据库备份，并在测试数据库中成功恢复。

完成后回到[第 10 章项目总览](./10-MiniCMS项目总览.md)完成阶段 8 验收。

---

## 排错速查：遇到问题再看

先根据现象定位，再查看对应容器或网站的日志：

| 现象 | 先检查 |
|---|---|
| 面板打不开 | 宝塔服务、面板端口、云安全组、授权 IP、安全入口 |
| Nginx 配置保存失败或网站异常 | 宝塔显示的配置错误、Nginx 服务状态、对应站点的错误日志、80 / 443 是否被占用 |
| Mac 制作镜像失败 | Docker Desktop、Node 版本、lockfile、Dockerfile、正式 API 构建参数 |
| 上传或拉取镜像失败 | Docker Hub 是否可访问、登录权限、用户名、仓库名和版本标签是否存在 |
| 提示架构不匹配或 `exec format error` | 服务器 `uname -m` 与镜像平台是否对应，是否按第 2～3 步重新制作了正确平台的镜像 |
| 更新后还是旧页面 | 本地是否制作并上传新标签，服务器是否修改 `IMAGE_TAG`、执行 `pull` 和 `up -d` |
| API 容器反复重启 | 数据库健康、`DATABASE_URL`、迁移和 API 日志 |
| 服务器内部 API 正常，域名失败 | Nginx 的 `server_name`、`proxy_pass`、站点是否启用、80 / 443、防火墙和 DNS |
| 页面打开但请求 API 失败 | `NEXT_PUBLIC_API_BASE_URL` 是否在构建时正确，CORS 和证书 |
| 登录后仍然 401 | Cookie 的 `Secure`、Domain、SameSite、前端 credentials 和 CORS |
| 重启后数据消失 | PostgreSQL volume 是否仍挂载，是否误删卷 |
| 证书续签失败 | 宝塔 SSL 续签日志、DNS API 授权或文件验证路径、80 端口与代理规则 |
| 备份任务成功但无法恢复 | 备份内容、数据库版本、压缩密码和恢复步骤 |

## 官方参考

- [宝塔：Docker 容器与编排](https://www.bt.cn/bbs/thread-140412-1-1.html)
- [宝塔：Nginx 反向代理](https://docs.bt.cn/user-guide/site/php/site-config/reverse-proxy/)
- [宝塔：网站 SSL 与自动续签](https://docs.bt.cn/user-guide/site/php/site-config/ssl/)
- [宝塔：计划任务与备份目录](https://docs.bt.cn/user-guide/crontab/task/)
- [OpenSSH：本地端口转发（`-L`）](https://man.openbsd.org/ssh.1)
- [Nginx：提供静态文件与转发请求](https://nginx.org/en/docs/beginners_guide.html)
- [Nginx：怎样根据域名和路径处理请求](https://nginx.org/en/docs/http/request_processing.html)
- [Docker：镜像与容器](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/)
- [Docker Hub：创建镜像仓库](https://docs.docker.com/docker-hub/repos/create/)
- [Docker：跨平台构建](https://docs.docker.com/build/building/multi-platform/)
- [Docker Compose：合并运行与构建配置](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/)
- [Docker Compose：上传镜像](https://docs.docker.com/reference/cli/docker/compose/push/)
- [Docker Compose：端口映射、内部网络与服务名](https://docs.docker.com/compose/how-tos/networking/)
- [Docker：数据卷与容器的生命周期](https://docs.docker.com/engine/storage/volumes/)
- [Next.js：自托管与反向代理](https://nextjs.org/docs/app/guides/self-hosting)
- [Node.js 官方 Docker 镜像](https://github.com/nodejs/docker-node)
- [Docker Compose](https://docs.docker.com/compose/)
- [Compose run](https://docs.docker.com/reference/cli/docker/compose/run/)：运行一次性管理员初始化命令。
- [PostgreSQL 官方镜像](https://hub.docker.com/_/postgres)
- [PostgreSQL：数据库导出与恢复](https://www.postgresql.org/docs/18/backup-dump.html)
- [PostgreSQL：pg_restore](https://www.postgresql.org/docs/18/app-pgrestore.html)
