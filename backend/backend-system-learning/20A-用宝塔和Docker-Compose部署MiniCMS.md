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

在云安全组及已启用的主机防火墙中，确认以下 TCP 端口已放行。已有网站或服务的规则先保留：

| 公网入口 | 端口 | 用途 |
|---|---|---|
| 网站 | 80、443 | 80 用于 HTTP 和部分证书验证，443 用于 HTTPS |
| SSH | 实际 SSH 端口，通常为 22 | 从 Mac 登录服务器、上传文件，也供 TablePro 建立 SSH 隧道 |
| 宝塔后台 | 现有宝塔面板的端口 | 在浏览器中管理服务器 |

**3000、3001、5432 不需要向公网放行。** 本章通过 Docker 将它们映射到服务器的 `127.0.0.1`，只供服务器本机访问。Nginx 接收公网的 80／443 请求，再通过本机的 3000、3001 转发给管理端和 API；API 通过 Docker 内部网络访问数据库的 `postgres:5432`。

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

TablePro 查库也使用上表中的 SSH 入口，由它内置的隧道转发到服务器本机的 `127.0.0.1:5432`。具体配置放在[第 6 步：用 TablePro 查看线上数据库](#用-tablepro-查看线上数据库)。

---

## 第 2 步：为项目增加生产容器配置

这一步要把两件事写清楚：**怎样把代码做成镜像，以及怎样用镜像启动服务。** 先沿着图看一遍，第 3 步再实际执行：

```mermaid
flowchart TD
    S["前后端代码 + 各自的 Dockerfile<br/>.dockerignore 排除无需打包的文件"]
    E["deploy/.env.example<br/>第 3.1 节复制并填写为 deploy/.env"]
    B["第 3.2 节：制作镜像<br/>读取 docker-compose.yml<br/>和 docker-compose.build.yml"]
    I["后端镜像 + 管理端镜像"]
    P["PostgreSQL 官方镜像"]
    R["第 3.3 节：启动服务<br/>读取 docker-compose.yml"]
    C["后端、管理端、数据库<br/>三个运行中的容器"]
    S --> B
    E -->|提供镜像名、版本和 API 域名| B
    B --> I
    I --> R
    P --> R
    E -->|提供数据库等运行配置| R
    R --> C
```

图里的两份 Compose 配置各有用途：`docker-compose.yml` 定义三个服务用什么镜像、怎样运行；`docker-compose.build.yml` 补充两个应用的代码目录和构建参数。**制作镜像时合并读取两份，启动服务时只读取第一份。** PostgreSQL 使用官方镜像，所以不需要为它写 Dockerfile。

现在在编辑器中打开本机 `mini-cms`，按下面的路径新建文件；还没有 `deploy` 文件夹时，先手动创建。Dockerfile 和构建配置在 Mac 上使用，服务器只需要运行配置和正式 `.env`。源代码与配置模板通过 Git 保存版本，真实 `.env` 由下面的 `.gitignore` 排除。

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

它负责让 Git 忽略同目录下保存真实配置的 `.env`。前面的 `.dockerignore` 控制哪些文件不参与打包，这里的 `.gitignore` 控制哪些文件不提交到 Git：

```gitignore
.env
```

### 2.6 `deploy/.env.example`

这份文件是配置模板，先保存变量名和示例值。第 3.1 节会保留模板，复制出本机实际使用的 `.env`：

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

`ports` 的格式是 `宿主机监听地址:宿主机端口:容器端口`。例如 `127.0.0.1:3000:3000` 将服务器本机的 3000 端口映射到管理端容器的 3000 端口，Nginx 访问 `http://127.0.0.1:3000` 就能把请求交给 Next.js。3001 对应后端，配置方式相同。

数据库的 `127.0.0.1:5432:5432` 为 TablePro 的 SSH 隧道提供本机连接目标；API 使用 `postgres:5432`，不经过这个映射。参见 [Docker 端口映射](https://docs.docker.com/engine/network/port-publishing/)和[Compose 内部网络](https://docs.docker.com/compose/how-tos/networking/)。

如果宿主机的 3001 已被旧项目占用，将 API 映射改成 `127.0.0.1:13001:3001`，第 7 步的 Nginx 代理地址相应改为 `http://127.0.0.1:13001`。容器内仍使用 3001，公网网站仍使用 80／443；管理端端口冲突时按相同方式处理。

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

文件准备好后，对照开头的图检查：两个应用各有 Dockerfile 和 `.dockerignore`，`deploy` 中有两份 Compose、`.env.example` 和 `.gitignore`。此时还没有制作镜像；接下来先填写本机配置，再执行构建。

---

## 第 3 步：在本地制作、验证并上传镜像

这一整步都在 Mac 上操作，顺序是：**填写配置 → 制作镜像 → 本地试跑 → 上传镜像。** 文件操作使用编辑器，登录、查看状态和上传使用 Docker Desktop；解析配置、构建和首次启动仍用 Compose 命令，让第 2 步保存的配置实际生效。下面的终端命令都在 `mini-cms` 根目录执行。

### 3.1 准备 Docker Hub 和本地配置

登录 [Docker Hub](https://hub.docker.com/)，在自己的账号下创建两个镜像仓库：`mini-cms-api` 和 `mini-cms-admin`。Public 允许任何人下载，Private 只允许有权限的账号下载；镜像里包含项目代码，按代码是否愿意公开选择。创建方式见 [Docker Hub 仓库说明](https://docs.docker.com/docker-hub/repos/create/)。

打开 Docker Desktop，点击右上角 **Sign in**，在浏览器中登录刚才创建仓库的同一个 Docker 账号，再回到 Docker Desktop 确认已显示登录账号。后面会在它的 Images 页面上传镜像。参见 [Docker Desktop 登录入口](https://docs.docker.com/desktop/use-desktop/)。

接着在编辑器的文件列表中准备本机配置。如果 `deploy/.env` 已存在，直接打开检查；首次创建时按下面两步操作：

1. 在 `deploy` 文件夹中复制 `.env.example`，粘贴到同一个文件夹。
2. 将副本重命名为 `.env`，保留原来的 `.env.example`。

打开 `deploy/.env`，按下面三组填写：**镜像叫什么、后端怎样连接数据库、浏览器怎样访问网站。** 三组配置分别交给不同的对象使用。

**① 镜像：属于谁，这次是哪个版本**

`DOCKERHUB_USERNAME` 填 Docker Hub 用户名，`IMAGE_TAG` 填本次版本号 `v1`。假设用户名是 `yourname`，Compose 会这样组合镜像名称：

```mermaid
flowchart TD
    U["DOCKERHUB_USERNAME = yourname<br/>IMAGE_TAG = v1"]
    A["后端镜像<br/>yourname/mini-cms-api:v1"]
    W["管理端镜像<br/>yourname/mini-cms-admin:v1"]
    U -->|与后端仓库名组合| A
    U -->|与管理端仓库名组合| W
```

把 `yourname` 换成自己的 Docker Hub 用户名。`mini-cms-api`、`mini-cms-admin` 对应刚才创建的两个仓库；`v1` 是镜像版本标签，以后发布新版时再改成 `v2` 等新标签。

**② 数据库：一边创建账号和库，一边用相同信息连接**

这里的数据库账号由你给 PostgreSQL 设置，与 Docker Hub 账号无关。同一组账号、密码和库名，要分别告诉数据库和后端：

```mermaid
flowchart TD
    P["POSTGRES_USER：数据库账号<br/>POSTGRES_PASSWORD：数据库密码<br/>POSTGRES_DB：数据库名称"]
    D["交给 PostgreSQL 容器<br/>在首次初始化时创建账号和数据库"]
    U["DATABASE_URL<br/>把相同的账号、密码、库名<br/>与数据库地址手动写成一条连接串"]
    A["交给 Express 后端<br/>按连接串找到并访问数据库"]
    P --> D
    P -->|填写相同的值| U
    U --> A
```

例如，数据库账号和库名都用 `mini_cms`，这四行就应对应起来：

```dotenv
POSTGRES_USER=mini_cms
POSTGRES_PASSWORD=your_local_password
POSTGRES_DB=mini_cms
DATABASE_URL=postgresql://mini_cms:your_local_password@postgres:5432/mini_cms
```

将两处 `your_local_password` 换成**同一个本地练习密码**。`DATABASE_URL` 的格式是 `postgresql://账号:密码@主机:端口/库名`；这里的 `postgres` 对应 Compose 中的数据库服务名，`5432` 是数据库在容器内的端口。后端容器通过这个名字找到数据库，所以这里保留 `postgres`，不填 Mac 的 `localhost`。

**③ 网站地址：管理端在哪里，API 在哪里**

沿用第 1 步确定的两个子域名。图中的 `example.com` 都替换为自己的域名：

```mermaid
flowchart TD
    M["ADMIN_DOMAIN<br/>admin.example.com"]
    N["记录管理端域名<br/>第 7 步在宝塔手动配置网站入口"]
    O["ADMIN_WEB_ORIGIN<br/>https://admin.example.com"]
    E["传给 Express 后端<br/>用于检查管理页面的请求来源"]
    A["API_DOMAIN<br/>api.example.com"]
    W["NEXT_PUBLIC_API_BASE_URL<br/>https://api.example.com<br/>写进管理端，供浏览器请求 API"]
    M --> N
    M -->|手动加上 https:// 后填写| O
    O --> E
    A -->|构建配置自动加上 https://| W
```

在 `.env` 中，`ADMIN_DOMAIN`、`API_DOMAIN` 只填域名，`ADMIN_WEB_ORIGIN` 填管理端的完整来源地址，包含 `https://`，不加 `/admin` 等页面路径。`NEXT_PUBLIC_API_BASE_URL` 由构建配置根据 `API_DOMAIN` 生成，不需要在这个 `.env` 中另加一行。

当前 `ADMIN_DOMAIN` 只用于记录和后面手动配置；填写这些变量不会自动创建 DNS 记录或宝塔网站。这里先把选好的地址告诉程序，第 7～8 步再接通域名和 HTTPS。

**API 域名必须在这次打包前填好。** 它会写进管理端镜像；本地验证通过后上传的就是这一份镜像，不能保留 `api.example.com` 等到服务器再改。数据库密码只在容器运行时传入，不会作为构建参数打进镜像。

### 3.2 按服务器架构制作镜像

先查看两份 Compose 合并、填入 `.env` 中的值后，最终得到什么配置：

```bash
docker compose --env-file deploy/.env \
  -f deploy/docker-compose.yml -f deploy/docker-compose.build.yml config
```

这条命令可以分成下面几部分理解：

| 部分 | 本次做什么 |
|---|---|
| `docker compose` | 使用 Compose 管理这一组服务 |
| `--env-file deploy/.env` | 从这个文件读取变量值，用来填入 Compose 中的 `${IMAGE_TAG}`、`${DATABASE_URL}` 等位置 |
| 两个 `-f 文件路径` | 按顺序读取并合并两份 Compose 配置，第二份补充构建信息 |
| `config` | 检查并输出解析后的配置，这一步不会构建镜像或启动容器 |

命令末尾的 `\` 表示同一条命令在下一行继续，方便阅读。检查 `config` 输出：镜像名称带自己的用户名和 `v1`，两个应用的 `platform` 都是第 1 步确认的服务器平台，管理端构建参数使用正式 API 地址。输出也会包含数据库密码，只在自己电脑上查看。

确认后，把最后的动作换成 `build`，制作两个应用镜像：

```bash
docker compose --env-file deploy/.env \
  -f deploy/docker-compose.yml -f deploy/docker-compose.build.yml build api admin_web_antd
```

`api`、`admin_web_antd` 是 Compose 中的两个服务名，表示只构建它们。`build` 会在 Mac 上按各自 Dockerfile 安装依赖、生成后端 Prisma Client，并完成管理端的 `next build`。结束时应没有报错；在 Docker Desktop 的 **Images → Local** 中，应能找到带自己用户名和 `v1` 标签的 `mini-cms-api`、`mini-cms-admin` 两个镜像。

### 3.3 用这两份镜像在本地试跑

本轮先确认镜像能启动、数据库迁移能完成、接口能读取数据库。完整登录和文章编辑留到第 8 步，在正式 HTTPS 地址下验证。

先给这次试跑腾出端口：

1. 在原来启动前后端的两个终端中按 `Ctrl+C`，停止占用 3000、3001 的开发进程。
2. 打开 Docker Desktop 的 **Containers**，找到本地开发使用的 PostgreSQL 容器，点击 **Stop**，释放 5432 端口。停止会保留容器和数据卷，不要点击删除。

下面会创建独立的 `mini-cms-production` Compose 项目和数据卷，不使用原来的开发数据库。

在项目根目录执行启动命令。这里使用刚才制作的镜像，只读取运行配置：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d
```

沿用 3.2 的读法：`--env-file` 指定这次用的变量文件，`-f` 指定运行配置；末尾的 **`up` 创建并启动容器，`-d` 让容器在后台运行**，命令完成后终端可以继续输入其他命令。整句就是“按这份配置启动三个服务，并让它们在后台持续运行”。参见 [Compose 命令参数](https://docs.docker.com/reference/cli/docker/compose/)和 [up 命令](https://docs.docker.com/reference/cli/docker/compose/up/)。

`.env` 中的值先用于填好 Compose 配置；例如 `DATABASE_URL` 再通过 `api.environment` 传入后端容器。这样后端才能连接这次试跑的 PostgreSQL。

回到 Docker Desktop 的 **Containers**，展开新出现的 **mini-cms-production**：

- 三个容器应处于运行状态；进入 PostgreSQL 容器详情，可在 **Inspect** 中查看 `State.Health.Status`，应为 `healthy`。
- 打开 API 容器的 **Logs**，应看到迁移成功或没有待执行迁移，随后 Express 启动。

查看日志和容器状态都可以在这个界面完成，关闭详情页不会停止服务。参见 [Docker Desktop 容器管理](https://docs.docker.com/desktop/use-desktop/container/)。

接着在 **Apifox** 中发送下面两个请求，检查响应状态和内容：

| 请求 | 应看到什么 | 验证了什么 |
|---|---|---|
| `GET http://127.0.0.1:3001/api/public/articles` | `200`，JSON 包含 `data`、`pagination`；新数据库没有文章时，`data` 是空数组 | 后端已启动，并且能查询数据库 |
| `HEAD http://127.0.0.1:3000` | 首页的响应状态和响应头；当前首页跳转到 `/admin/articles`，通常返回 `307`，`Location` 为目标路径 | Next.js 已启动，能接收页面请求 |

`HEAD` 只要求返回状态和响应头，不返回页面正文。如果 Apifox 自动跟随跳转，可能看到目标页的 `200`；要查看首页原始的 `307` 和 `Location`，关闭这个请求的自动重定向后再发送。

如果使用终端检查，对应命令仍是下面两条，和 Apifox 任选一种即可：

```bash
curl -i http://127.0.0.1:3001/api/public/articles
curl -I http://127.0.0.1:3000
```

小写 `-i` 在响应正文之外显示状态和响应头；大写 `-I` 发送 `HEAD` 请求，只看状态和响应头。上面的 `curl` 命令不会自动跟随跳转，也不会执行页面 JavaScript。参见 [curl 参数说明](https://curl.se/docs/manpage.html)。

**为什么没有登录，也能得到响应？** 这两个请求检查的是不同入口：

- `/api/public/articles` 是第 19 章提供给网站访客的公开接口，允许匿名读取已发布文章。
- `http://127.0.0.1:3000` 请求的是 Next.js 首页。当前 `admin-web-antd/app/page.tsx` 会先返回跳转到 `/admin/articles` 的响应；浏览器加载管理页面后，`admin-web-antd/app/admin/layout.tsx` 才会请求 `/api/auth/me` 检查登录，未登录时转到登录页。只检查首页响应还没有走到这一段。
- 真正读取管理数据时，Express 的 `/api/articles`、`/api/tags` 等接口会检查登录 Cookie，没有有效凭证就返回 `401`。`HEAD` 和 `curl` 都不会绕过认证。

因此，这里验证的是“服务能响应请求”，登录保护是否完整生效要在第 8 步继续验证。此时服务器可以还没有准备 Docker 和网站入口；管理端构建时已写入正式 API 域名，本地浏览器中的登录检查会请求那个地址，所以本轮不要求在本地管理页面完成登录。

检查结束后，在 Docker Desktop 的 **Containers** 中点击 **mini-cms-production** 这一组的 **Stop**，停止本次试跑的三个容器，保留镜像和数据。需要继续本地开发时，再启动原来开发用的 PostgreSQL 容器，并在两个终端中启动原来的前后端开发命令。

### 3.4 上传已经验证过的镜像

在 Docker Desktop 的 **Images → Local** 中找到刚才验证过的两个镜像：

- `你的DockerHub用户名/mini-cms-api:v1`
- `你的DockerHub用户名/mini-cms-admin:v1`

分别打开镜像的操作菜单，选择 **Push to Hub**，等待上传成功。镜像名称中的用户名必须属于当前登录的账号；这里上传的是已经构建好的 `v1`，不会重新打包，也不用上传 PostgreSQL 官方镜像。参见 [Docker Desktop 上传镜像](https://docs.docker.com/desktop/use-desktop/images/#push-an-image-to-docker-hub)。

打开 Docker Hub 的两个仓库，确认都出现了 `v1` 标签，再继续服务器部署。以后发布 `v2` 时，先修改 `.env` 中的 `IMAGE_TAG` 并重新构建、验证，再选择对应的 `v2` 镜像上传。

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

服务器接下来会从 Docker Hub 下载程序，现在先准备“用什么配置运行”。**这一步在宝塔的文件管理器中完成目录创建、文件上传和编辑，最后再用终端检查配置。**

代码已经在镜像里，这里只上传本机 `mini-cms/deploy` 中的两个文件：`docker-compose.yml` 和 `.env.example`。

在宝塔左侧打开 **文件**，按下面的顺序操作：

1. 进入 `/opt`，新建 `mini-cms` 文件夹，再在其中新建 `deploy`；已有目录直接进入。
2. 在 `/opt/mini-cms/deploy` 点击 **上传**，选择上述两个本地文件。Mac 文件选择框若看不到 `.env.example`，按 `Command + Shift + .` 显示隐藏文件。
3. 首次配置时，新建一个名为 `.env` 的文件，将 `.env.example` 的全部内容复制进去。已经有 `.env` 时直接打开编辑，保留已有正式配置。
4. 按下表填写并保存 `.env`，然后打开它的权限设置：所有者使用本章的 `root`，权限设为 `600`。它表示只有所有者能读写这个文件；只修改 `.env` 的权限。

变量的对应关系沿用[第 3.1 节](#31-准备-docker-hub-和本地配置)，这次填写服务器实际使用的值：

| 配置 | 服务器上怎样填写 |
|---|---|
| `DOCKERHUB_USERNAME`、`IMAGE_TAG` | 与已上传的镜像一致，例如自己的用户名和 `v1`，让服务器能找到这一版程序 |
| `POSTGRES_USER`、`POSTGRES_PASSWORD`、`POSTGRES_DB`、`DATABASE_URL` | 使用正式数据库账号、密码和库名；连接串中的三项与前面一致，主机仍为 `postgres` |
| `ADMIN_DOMAIN`、`API_DOMAIN`、`ADMIN_WEB_ORIGIN` | 与第 3 步选定的正式地址一致；管理端镜像已经写入当时的 API 地址 |

服务器的 `.env` 使用正式密码，不上传 Mac 上练习用的 `.env`。完成后，在宝塔文件列表中应看到：

```text
/opt/mini-cms/deploy/
├── docker-compose.yml
├── .env.example
└── .env
```

文件管理操作见 [宝塔文件管理器](https://docs.bt.cn/user-guide/files/)。接着打开宝塔左侧 **终端**，连接当前服务器，使用本章的 `root` 账号。先执行下面两行，进入 Bash 和项目目录：

```bash
bash
cd /opt/mini-cms
```

`bash` 让后面的密码输入、备份脚本使用同一种 Shell，`cd` 切换当前操作目录。**第 5～10 步中标明“服务器终端”的命令，都在这台服务器上执行。** 每次重新连接后，先进入 `/opt/mini-cms`；也可以沿用 Mac 的 `ssh aliyun` 连接同一台服务器，二者选一种即可。参见 [宝塔终端说明](https://docs.bt.cn/user-guide/xterm/)。

在启动前解析一次配置：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml config
```

`config` 只检查并显示最终配置，不会启动服务。核对两个应用的镜像名称和版本、三个服务的端口，以及 API 的数据库地址和管理端来源。输出包含正式密码，只在自己终端查看。没有配置错误后，进入第 6 步。

---

## 第 6 步：拉取镜像并启动 Compose，在宝塔查看状态

这一步让服务器真正运行 Mini CMS：**下载镜像 → 按配置启动 → 查看运行结果。** 下载和启动使用 Compose，状态和日志在宝塔查看。

**先下载镜像。** 在服务器终端的 `/opt/mini-cms` 目录操作。如果使用 Private 仓库，先在 Docker 账号设置中[创建有 Read 权限的个人访问令牌](https://docs.docker.com/security/access-tokens/personal-access-tokens/)，再登录；将命令中的用户名换成自己的，密码提示处粘贴令牌：

```bash
docker login --username yourdockerhubname
```

Mac 上 Docker Desktop 的登录状态不会自动带到服务器。Public 仓库可以跳过登录，直接执行下面的下载命令：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml pull
```

`pull` 读取 Compose 中的 `image`，下载你上传的两个应用镜像和 PostgreSQL 官方镜像。它只下载，不启动程序；等待三个镜像全部拉取成功再继续。

**再启动服务。** 仍在同一个服务器终端执行：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d
```

`up -d` 按运行配置创建并在后台启动三个容器，Compose 项目名为 `mini-cms-production`。其中后端启动时还会沿着配置完成下面的流程：

```mermaid
flowchart LR
    P["PostgreSQL 健康检查通过"]
    M["API 容器执行<br/>npm run db:migrate:deploy"]
    A["迁移成功后执行<br/>npm run start"]
    P --> M --> A
```

迁移使用镜像中已有的 SQL 文件建立或更新表结构，成功后才启动 Express。这一步已由 Compose 的 `command` 安排好，首次启动不用再手动执行一次迁移。

**然后在宝塔查看结果。** 打开 **Docker → 容器**，找到属于 `mini-cms-production` 的三个容器；支持发现本地编排的版本，也会在“容器编排”中显示它。

不要再把相同配置复制到面板创建第二套编排，否则可能出现端口冲突或连接到另一份数据卷。

| 查看位置 | 应看到什么 |
|---|---|
| 三个容器的状态 | 都处于运行中，没有反复重启 |
| PostgreSQL 容器详情 | 健康状态为 `healthy` |
| API 容器日志 | 迁移成功或没有待执行迁移，随后 Express 启动 |
| 各容器的端口映射 | 宿主机地址是 `127.0.0.1`，对应 3000、3001、5432，而非公网监听 |

日常查看日志、资源占用和简单启停都可以在宝塔完成，参见 [宝塔容器管理](https://docs.bt.cn/user-guide/docker/container/)。如果面板没有显示健康状态或完整端口，在服务器终端执行下面的命令补充查看：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml ps
```

`ps` 列出这组容器的状态和端口。最后确认服务能响应请求，**下面两条仍在服务器终端执行**：

```bash
curl -i http://127.0.0.1:3001/api/public/articles
curl -I http://127.0.0.1:3000
```

这里的 `127.0.0.1` 指执行命令的服务器本机；在 Mac 的 Apifox 中填写相同地址，会访问 Mac 自己。当前应用端口只允许服务器本机连接，所以这次用服务器终端检查，第 7 步接通域名后再改用 Mac 上的 Apifox。

公开文章接口应返回 `200` 和 JSON，新库的 `data` 为空数组；管理端返回首页或跳转响应，当前首页通常是 `307`。这与[第 3.3 节](#33-用这两份镜像在本地试跑)相同，只检查服务响应，完整登录留到 HTTPS 就绪后。

---

### 在新数据库中创建首个管理员

迁移只建立表，不会复制本地管理员。现在要运行第 17A 章的 `admin:create` 脚本，在正式数据库中创建能登录后台的账号。镜像已经包含这个脚本及运行工具。

确认宝塔中的 API 迁移日志正常后，在服务器的 Bash 终端、`/opt/mini-cms` 目录操作。先逐行输入下面两条命令，每条执行后按提示填写；密码输入时不显示字符：

```bash
read -r -p "管理员用户名: " ADMIN_USERNAME
read -r -s -p "管理员密码（至少 12 位）: " ADMIN_PASSWORD
```

再执行初始化，并清除本次终端中临时保存的账号密码变量：

```bash
printf '\n'
export ADMIN_USERNAME ADMIN_PASSWORD
docker compose --env-file deploy/.env -f deploy/docker-compose.yml \
  run --rm --no-deps -e ADMIN_USERNAME -e ADMIN_PASSWORD api npm run admin:create
unset ADMIN_USERNAME ADMIN_PASSWORD
```

关键命令可以这样读：

| 部分 | 作用 |
|---|---|
| `run --rm --no-deps` | 创建一个临时容器执行任务，结束后删除它；数据库已运行，不再启动依赖服务 |
| `-e ADMIN_USERNAME -e ADMIN_PASSWORD` | 将刚输入并导出的两个变量传给临时容器 |
| `api npm run admin:create` | 复用 `api` 的镜像和数据库配置，这次执行创建管理员脚本 |

密码通过隐藏输入传入，不写进命令历史或配置文件。确认看到管理员创建成功的提示且没有错误后，再配置域名；HTTPS 就绪后用这个账号验证登录。该脚本对同名账号会更新密码，首次创建后不作为日常发布步骤。参见 [Compose run](https://docs.docker.com/reference/cli/docker/compose/run/)。

### 用 TablePro 查看线上数据库

需要查库时，在 Mac 的 TablePro 中新建 PostgreSQL 连接，在 **Network → Connect via** 选择 **SSH Tunnel**，填写两组配置：

| 配置 | 地址与端口 | 登录凭证 |
|---|---|---|
| SSH | 服务器公网 IP、实际 SSH 端口（通常为 22） | 沿用登录这台服务器的 SSH 用户和 Mac 上的私钥 |
| 数据库 | `127.0.0.1`、`5432` | 服务器 `deploy/.env` 中的 `POSTGRES_DB`、`POSTGRES_USER`、`POSTGRES_PASSWORD` |

这里的数据库地址指**服务器本机**。TablePro 先通过 SSH 连接服务器，再把目标 `127.0.0.1:5432` 告诉服务器上的 SSH 服务，由它连接数据库并转发通信。

点击 **Test Connection**，成功后保存并连接，确认能看到线上数据库的表。隧道由 TablePro 自动管理，不需要另开终端。参见 [TablePro SSH 连接说明](https://tablepro.app/blog/postgresql-ssh-tunnel-mac)。

---

## 第 7 步：把两个子域名分别转发到管理端和 API

第 6 步已确认程序在服务器内部可用。这一步给它们接上域名，让 Mac 上的浏览器也能访问。

先在域名服务商的 DNS 控制台检查 `admin`、`api` 两条 A 记录，记录值都应为服务器公网 IPv4。然后在宝塔里为两个子域名各建一个网站，再配置反向代理：

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

现在在 Mac 的 **Apifox** 中发送两个请求，将域名替换为自己的：

| 请求 | 应看到什么 |
|---|---|
| `HEAD http://admin.example.com` | 首页或跳转响应；当前首页通常是 `307`，跟随跳转后可能看到 `200` |
| `GET http://api.example.com/api/public/articles` | `200` 和包含 `data`、`pagination` 的 JSON |

这说明公网请求已通过 Nginx 到达对应容器。此时只检查 HTTP 转发；正式前端已使用 HTTPS API 地址，登录与保存留到下一步验证。API 的 CORS、Cookie 和认证仍由 Express 负责，不在代理层另加宽松 CORS 规则。

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

启用后，在 Mac 的 Apifox 中把第 7 步两个请求的 `http://` 改为 `https://`，重新发送。公开接口应正常返回 JSON，管理端应返回首页或跳转响应，两者都不应出现证书校验错误。

再从浏览器完成一次真实操作，这次验证完整的登录和文章管理链路：

1. 打开管理端 HTTPS 地址，用刚创建的管理员登录，确认浏览器没有证书错误。
2. 新建并保存一篇文章，重新打开，确认标题和正文正确；发布后，让个人网站通过正式 API 读取它。
3. 退出登录，确认管理接口不再允许访问。浏览器开发者工具中，请求使用正式 API 地址，登录 Cookie 带 `Secure`。

首次上线完成。接下来配置数据备份，再练习以后怎样更新项目。

---

## 第 9 步：配置数据库备份和恢复验证

数据卷能保留容器重建后的数据；误删文章或服务器磁盘损坏时，还需要一份可以恢复的备份。本节先走通这条线，再让宝塔定时执行：

```mermaid
flowchart TD
    D["正式 PostgreSQL 数据库"]
    F["服务器上的 .dump 备份文件"]
    T["独立的恢复测试库<br/>mini_cms_restore_check"]
    V["用 TablePro 查看恢复后的文章"]
    O["服务器之外的云存储副本"]
    D -->|9.1：pg_dump 导出| F
    F -->|9.2：pg_restore 导入| T
    T --> V
    F -->|9.3：宝塔定时上传| O
```

导出和恢复交给 PostgreSQL 自带的工具；查看文件用宝塔，检查恢复的数据用 TablePro。恢复演练使用单独的测试库，API 始终连接原来的正式库。

### 9.1 导出一份数据库备份

这段脚本完成三件事：准备备份目录、导出数据库、清理超过保留期的旧备份。第 9.3 节会将同一段脚本交给宝塔定时执行，所以这里保留完整的目录准备和文件整理步骤。

先在服务器的 Bash 终端执行一次：

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

先理解真正导出数据的这一行：

| 部分 | 放在本次备份里理解 |
|---|---|
| `exec -T postgres` | 在已运行的 PostgreSQL 容器里执行命令，关闭交互终端，便于把输出保存成文件 |
| `sh -c '…'` | 让容器里的 Shell 读取容器自身的数据库账号、库名，再执行其中的命令 |
| `pg_dump -U … -d … -Fc` | 用指定账号导出指定数据库；`-Fc` 生成供 `pg_restore` 恢复的归档格式 |
| `> "$backup_file.tmp"` | 将导出的内容写到服务器上的临时备份文件 |

外层括号让脚本在单独的 Shell 环境里运行；`set -e` 让出错时停止，`umask`、`chmod` 限制备份文件和目录的访问权限。导出成功后，`mv` 才将临时文件改成 `.dump`；`find` 清理超过保留期的旧备份，正常每天执行时保留最近 7 天的文件。参见 [Compose exec](https://docs.docker.com/reference/cli/docker/compose/exec/)和 [PostgreSQL 导出说明](https://www.postgresql.org/docs/18/app-pgdump.html)。

看到“备份完成”后，在宝塔 **文件** 中打开 `/opt/backups/mini-cms`，确认出现带本次时间的 `.dump`，文件大小不为 0。记录终端输出的完整路径，下一节用它恢复。文件已生成只是第一项检查，能恢复出文章才说明这次备份可用。

### 9.2 恢复到测试数据库，检查文章

现在验证刚才的文件能否还原出文章。下面两条数据库命令依次做两件事：`createdb` 新建空的测试库，`pg_restore` 把备份导入这个测试库。

在服务器的 Bash 终端执行下面整段，提示时粘贴第 9.1 节输出的备份文件完整路径：

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
)
```

`test -s` 检查备份文件存在且非空；`< "$backup_file"` 把这个文件交给恢复命令读取，方向与导出时的 `>` 相反。`--exit-on-error` 要求恢复遇到错误就停止。如果测试库已存在，创建命令会停止；先确认上次演练已结束，再按本节末尾的命令清理测试库后重试。

命令执行完且没有错误后，在 Mac 的 **TablePro** 中检查数据：

1. 按第 6 步的方法新建一个临时 PostgreSQL 连接，SSH 信息、数据库账号和密码沿用线上连接，**数据库名填写 `mini_cms_restore_check`**。
2. 连接后打开 `articles` 表，找到第 8 步保存的文章，核对标题和正文内容。确认查看的是恢复测试库。
3. 检查完成后断开这个临时连接，再回到服务器终端删除测试库：

```bash
cd /opt/mini-cms
docker compose --env-file deploy/.env -f deploy/docker-compose.yml \
  exec -T postgres sh -c 'dropdb -U "$POSTGRES_USER" mini_cms_restore_check'
```

`dropdb` 删除指定数据库。这里固定删除演练用的 `mini_cms_restore_check`，保留正式数据库和备份文件；TablePro 的临时连接可以一并移除。

### 9.3 设置每日自动备份，并保存到服务器之外

第 9.1～9.2 节验证通过后，再把重复执行交给宝塔。这里安排两个任务：先导出数据库，再把导出文件复制到服务器之外。

先打开宝塔 **计划任务 → 添加任务**，创建导出任务：

| 设置项 | 填写内容 |
|---|---|
| 任务类型、名称 | Shell 脚本；Mini CMS 数据库导出 |
| 执行身份与环境 | 服务器上的 `root`，使用 Bash 执行 |
| 脚本内容 | 第 9.1 节已经验证过的完整代码块，保留外层括号 |
| 执行周期 | 每天 03:00，按服务器时间 |

保存后点击任务的 **执行**，再打开任务日志，确认出现“备份完成”，并在宝塔文件管理器中看到新的 `.dump`。以后需要立即备份，也可以点击这个任务的“执行”。

再在宝塔软件商店配置所用的云存储插件，例如阿里云 OSS 或腾讯云 COS，然后创建第二个计划任务：

| 设置项 | 填写内容 |
|---|---|
| 任务类型、名称 | 备份目录；Mini CMS 备份文件上传 |
| 源目录 | `/opt/backups/mini-cms` |
| 备份位置 | 已配置的云存储，保留最近 7 份 |
| 排除规则 | `*.tmp`，跳过尚未完成的导出文件 |
| 执行周期 | 每天 03:30，按服务器时间；应晚于数据库导出完成，耗时更长时相应延后 |

这两个任务的输入不同：第一个读取 PostgreSQL，第二个读取已经导出的文件。计划任务设置见 [宝塔官方说明](https://docs.bt.cn/user-guide/crontab/task/)。

手动执行第二个任务，在云存储控制台确认远端文件已出现。下载一份、解压取出 `.dump`，再在宝塔文件管理器的 `/opt/backups/mini-cms` 下新建 `remote-check` 文件夹，将下载的副本上传到其中，避免覆盖原文件。按第 9.2 节填写这份上传文件的路径，再恢复检查一次，确认服务器之外的副本同样可用。之后定期重复恢复验证。

项目的 Dockerfile、Compose 配置和恢复步骤保存在 Git 与 README 中；文章、管理员等数据库内容依靠这些备份恢复。

---

## 第 10 步：以后怎样更新

以后每次发布都走同一条线：**Mac 制作并上传新版镜像 → 宝塔备份并修改版本号 → 服务器拉取并更新 → 浏览器验证。**

先在 Mac 上准备新版：

1. 完成本次修改，检查迁移文件，运行项目已有的测试和检查。
2. 在编辑器中把本地 `deploy/.env` 的 `IMAGE_TAG` 从 `v1` 改成新版本，例如 `v2`。每次发布使用新标签，保留旧版供核对和回退。
3. 按第 3.2～3.4 节重新制作两个应用镜像、本地试跑，再通过 Docker Desktop 上传。确认 Docker Hub 两个仓库都有 `v2`；源代码和配置提交到 Git，记录这次版本对应的 commit。

再在宝塔准备服务器配置：

1. 在 **计划任务** 中手动执行第 9.3 节的数据库导出任务，确认成功并记下本次备份路径。记录服务器当前的 `IMAGE_TAG`。
2. 在 **文件** 中打开 `/opt/mini-cms/deploy/.env`，只把 `IMAGE_TAG` 改为刚上传的 `v2`，保留正式数据库密码等配置。
3. 如果本次修改了 `deploy/docker-compose.yml`，按第 5 步上传并更新服务器上的同名文件。仅改业务代码时不用重传配置，更不用上传本地 `.env`。

打开服务器终端，先检查配置：

```bash
cd /opt/mini-cms
docker compose --env-file deploy/.env -f deploy/docker-compose.yml config
```

确认没有配置错误，两个应用都使用 `v2`，再下载新版镜像：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml pull api admin_web_antd
```

`pull` 只下载，原来的容器此时还在运行。等待两个镜像全部拉取成功；下载失败时先解决错误。

下载成功后，再执行更新：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d
```

`up -d` 按新镜像更新容器，API 启动时仍会先执行迁移。这里仅拉取两个应用，PostgreSQL 的版本升级另行安排；更新前不用 `down`，服务器也不用重新 `build`。

更新后通过界面检查三件事：

1. 在宝塔 **Docker → 容器** 中确认应用运行正常，API 日志中的迁移和启动没有错误。
2. 在 Mac 的 Apifox 中请求正式 HTTPS 公开文章接口，确认返回正常。
3. 在浏览器重新打开管理端，登录后确认本次修改已生效，更新前保存的文章仍能查看和编辑。

把本节更新命令与第 9 步实际使用的备份、恢复方法记到项目 README。后续接入代码推送后的自动发布时，可以复用这条已经验证过的流程。

需要回退应用时，在宝塔文件管理器中将 `IMAGE_TAG` 改回保留的旧版本，再执行相同的拉取、更新和验证步骤。**切回旧镜像不会撤销数据库迁移**；先确认旧程序还能使用更新后的表结构，不能把镜像回退当作数据库恢复。

---

## 完成本章时确认的结果

- 在 Mac 上制作并验证镜像，Docker Hub 能看到对应版本，服务器拉取后直接运行。
- 通过 HTTPS 登录管理端，能保存、重新打开文章；个人网站能读取已发布内容。
- 更新或重启容器后，服务能恢复，已有文章仍在。
- 已配置定时备份和服务器之外的副本，并用恢复测试库验证文章可读。

完成后回到[第 10 章项目总览](./10-MiniCMS项目总览.md)完成阶段 8 验收。

---

## 排错速查：遇到问题再看

先根据现象定位，再查看对应容器或网站的日志：

| 现象 | 先检查 |
|---|---|
| 面板打不开 | 宝塔服务、面板端口、云安全组、授权 IP、安全入口 |
| Nginx 配置保存失败或网站异常 | 宝塔显示的配置错误、Nginx 服务状态、对应站点的错误日志、80 / 443 是否被占用 |
| Mac 制作镜像失败 | Docker Desktop、Node 版本、lockfile、Dockerfile、正式 API 构建参数 |
| 上传或拉取镜像失败 | Mac 上查看 Docker Desktop 的上传结果；服务器上查看 `pull` 的错误。核对登录账号、仓库名、标签和 Docker Hub 网络连接 |
| 提示架构不匹配或 `exec format error` | 服务器 `uname -m` 与镜像平台是否对应，是否按第 2～3 步重新制作了正确平台的镜像 |
| 更新后还是旧页面 | Docker Hub 是否已有新标签；宝塔中的正式 `.env` 是否改了 `IMAGE_TAG`，是否完成 `pull` 和 `up -d` |
| API 容器反复重启 | 在宝塔打开 API 容器日志，查看数据库连接或迁移错误；核对 PostgreSQL 健康状态和正式 `DATABASE_URL` |
| 服务器内部 API 正常，域名失败 | 在宝塔检查站点是否启用、绑定域名和反向代理目标是否正确，再检查 DNS、80 / 443 与防火墙 |
| 页面打开但请求 API 失败 | `NEXT_PUBLIC_API_BASE_URL` 是否在构建时正确，CORS 和证书 |
| 登录后仍然 401 | Cookie 的 `Secure`、Domain、SameSite、前端 credentials 和 CORS |
| 重启后数据消失 | PostgreSQL volume 是否仍挂载，是否误删卷 |
| 证书续签失败 | 宝塔 SSL 续签日志、DNS API 授权或文件验证路径、80 端口与代理规则 |
| 备份任务成功但无法恢复 | 宝塔任务日志和 `.dump` 文件大小、恢复命令的错误；下载的是目录压缩包时，先解压取出 `.dump` |

## 官方参考

- [宝塔：文件管理器](https://docs.bt.cn/user-guide/files/)
- [宝塔：在线终端](https://docs.bt.cn/user-guide/xterm/)
- [宝塔：容器管理](https://docs.bt.cn/user-guide/docker/container/)
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
- [Docker Desktop：查看与上传镜像](https://docs.docker.com/desktop/use-desktop/images/)
- [Docker Compose：端口映射、内部网络与服务名](https://docs.docker.com/compose/how-tos/networking/)
- [Docker：数据卷与容器的生命周期](https://docs.docker.com/engine/storage/volumes/)
- [Next.js：自托管与反向代理](https://nextjs.org/docs/app/guides/self-hosting)
- [Node.js 官方 Docker 镜像](https://github.com/nodejs/docker-node)
- [Docker Compose](https://docs.docker.com/compose/)
- [Compose run](https://docs.docker.com/reference/cli/docker/compose/run/)：运行一次性管理员初始化命令。
- [PostgreSQL 官方镜像](https://hub.docker.com/_/postgres)
- [PostgreSQL：数据库导出与恢复](https://www.postgresql.org/docs/18/backup-dump.html)
- [PostgreSQL：pg_restore](https://www.postgresql.org/docs/18/app-pgrestore.html)
