# 20A. 用 1Panel 和 Docker Compose 部署 Mini CMS

> 第 20 章已在本地试过前后端的启动命令。本章把同一个 Mini CMS 放到服务器，用域名和 HTTPS 访问。

遇到 SSH、用户权限或网络名词不清楚时，可以按 [Linux 学习目录中的问题导航](../../linux/README.md#正在部署-mini-cms遇到问题从这里查)回看对应章节，理解后继续本章操作。

## 建立一套可以长期复用的部署方式

以后再部署项目，希望每个项目都能明确自己的 Node.js 版本、依赖和启动方式，更新一个项目时尽量减少对其他项目的影响。因此，本章采用下面这套分工，作为个人项目和小型服务在单台服务器上部署时的默认方案：

| 部分 | 怎样安排 |
|---|---|
| 云服务器（宿主机） | 使用 Linux，安装 Docker；由 Nginx 或 OpenResty 统一接收网站请求、处理 HTTPS，再把请求交给对应项目 |
| Node.js 项目 | 在 Docker 容器中运行；把所需 Node.js 版本、依赖和启动命令写进 Dockerfile，用 Compose 保存端口、环境变量等配置 |
| 静态网站 | 构建后只需要提供 HTML、CSS、JavaScript 等文件时，优先让 Nginx 直接提供这些文件，省去常驻的 Node.js 进程 |
| 数据库 | 可以运行在 Docker 容器中，把数据保存在独立数据卷；也可以使用云厂商维护的托管数据库。两种方式都要配置备份并验证恢复 |

**这套分工可以长期复用。** 它把项目的运行环境保存在配置里，便于更新和换机器；Docker 官方也支持用 Compose 在单台服务器上部署生产应用。参见 [Compose 生产部署指南](https://docs.docker.com/compose/how-tos/production/)。

长期稳定还需要持续更新系统和依赖、留出足够资源，并把数据库备份保存到服务器之外、实际验证能够恢复。**数据卷解决重建容器后保留数据的问题，备份解决数据丢失后恢复的问题。** 当前方案依赖一台服务器，这台机器故障时，仍会影响上面的服务；以后对停机时间有更高要求，再考虑多台服务器和数据库故障自动切换。

本章用 1Panel 管理 OpenResty，由 OpenResty 承担上表中 Nginx 的网站入口职责。当前 `admin-web-antd` 使用 `next build` 后再 `next start`，需要运行 Node.js，因此和 Express 一样放在容器中。只有采用[静态导出](https://nextjs.org/docs/app/guides/static-exports)的 Next.js 项目，才适合按静态网站部署。

## 项目部署到哪里

云服务器是一台运行 Linux 的电脑。本章在这台电脑上安装 Docker Engine，再由 Docker 启动 Mini CMS 的**两个 Node.js 项目和一个数据库**：

```text
云服务器（Linux）
├── 已有的 Node.js 22 项目、MySQL：继续按原来的方式运行
└── Docker
    ├── 管理端容器：admin-web-antd，Node.js 24 + Next.js
    ├── 后端容器：server，Node.js 24 + Express
    └── 数据库容器：PostgreSQL
```

**Docker 安装在云服务器上，Mini CMS 运行在这台服务器的容器里。** 三个容器共享服务器的 CPU、内存和磁盘；每个容器有自己的运行环境，两个 Node.js 容器使用镜像里的 Node.js 24，不需要替换服务器原有的 Node.js 22。

你本地目前只把 PostgreSQL 放在 Docker 中，前后端由本机 Node.js 运行。上线时，前后端也放进 Docker，三个容器都在云服务器上运行。

`admin-web-shadcn` 留到实现后再部署。个人网站继续在原来的环境运行，改为请求 Mini CMS 的线上公开 API。

## 先看部署顺序

从上到下看，图中的步骤编号对应后文。**在 Mac 上制作并验证镜像，上传到 Docker Hub；服务器下载这份镜像运行。** 安装依赖、生成 Prisma Client、构建 Next.js 都在本地制作镜像时完成。

```mermaid
flowchart TD
    A["第 1～3 步 · 准备云服务器<br/>配置 DNS 和端口规则<br/>安装 1Panel 和 Docker<br/>准备 OpenResty"]
    B["第 4～5 步 · Mac 制作镜像<br/>按服务器架构打包、验证<br/>上传镜像到 Docker Hub"]
    C["第 6 步 · 服务器准备配置<br/>上传 Compose 和配置示例<br/>填写 deploy/.env 正式配置"]
    D["第 7 步 · 服务器下载镜像<br/>从 Docker Hub 拉取指定版本<br/>1Panel 启动 Compose 编排"]
    E["第 7 步 · 启动并初始化<br/>数据库就绪 → 迁移成功<br/>启动 API 和管理端<br/>验证接口，创建管理员"]
    F["第 8～9 步 · 公网访问<br/>OpenResty 反向代理 + HTTPS<br/>验证登录、编辑与公开阅读"]
    G["第 10～11 步 · 备份与更新<br/>备份数据库，验证恢复<br/>本地上传新版，服务器下载更新"]
    A --> B --> C --> D --> E --> F --> G
```

第 1～9 步完成首次上线，第 10～11 步接着练习备份和更新；遇到问题时再查末尾的排错表。

## 先看请求怎样到达项目

部署完成后，以请求 `https://api.example.com/api/public/articles` 为例。从上到下看请求与响应；框内的 OpenResty、API 容器和数据库容器，都在同一台云服务器上。

```mermaid
sequenceDiagram
    participant B as 调用方<br/>浏览器 / 个人网站
    box 云服务器（Linux）
        participant N as OpenResty<br/>基于 Nginx
        participant A as API 容器<br/>Node.js + Express
        participant D as 数据库容器<br/>PostgreSQL
    end

    Note over B,N: ① DNS 查询得到 api.example.com 的服务器公网 IP
    B->>N: ② 连接公网 443<br/>云安全组、主机防火墙允许通过
    Note over B,N: TLS 握手：浏览器验证网站证书，建立加密连接
    B->>N: ③ 发送 HTTPS 请求<br/>GET /api/public/articles
    N->>N: 匹配 api.example.com<br/>选择 API 网站的转发规则
    N->>A: ④ HTTP 转发到 127.0.0.1:3001<br/>Docker 端口映射到容器 3001
    A->>D: ⑤ Prisma 发起 SQL 查询<br/>内部网络：postgres:5432
    Note over D: 数据保存在<br/>PostgreSQL 数据卷
    D-->>A: 返回文章数据
    A-->>N: ⑥ 返回 200 + JSON<br/>经端口映射回到 OpenResty
    N-->>B: 通过 HTTPS 返回状态码与 JSON
    B->>B: 使用文章数据，更新页面
```

**Docker 在这里提供容器网络和端口映射；OpenResty 接收网站请求，Express 处理 API，PostgreSQL 查询数据。** API 通过内部服务名 `postgres` 直接访问数据库，这一段不再经过 OpenResty。

打开 `https://admin.example.com` 时，OpenResty 改为转发到 `127.0.0.1:3000`，由 Docker 交给管理端容器里的 Next.js。页面加载到浏览器后，前端代码向 `https://api.example.com` 请求数据，走上图的 API 链路。

个人网站的文章列表使用图中的公开接口；详情页使用 `/api/public/articles/:slug`，例如 `/api/public/articles/hello-world`，经过相同的网络链路。

### 看懂图里的网络名词

你本地已经用过 `localhost:3000` 和 `localhost:3001`。上线后，管理端和后端仍使用这两个端口，新增的是让外部请求找到它们的配置：

| 名词 | 在本项目中是什么意思 |
|---|---|
| IP 地址 | 找到云服务器这台电脑。浏览器通过服务器的公网 IP 访问它 |
| 域名、DNS | `api.example.com` 是便于记忆的名字；DNS 将这个名字解析为服务器 IP |
| 端口 | 区分同一台电脑上的服务：管理端用 3000，后端用 3001，PostgreSQL 用 5432 |
| HTTP、HTTPS；80、443 | 浏览器访问网站使用的协议，HTTPS 会加密传输。它们的默认端口分别是 80、443，所以地址中通常省略端口 |
| 安全组、主机防火墙 | 都控制允许哪些网络连接进入。安全组由云平台管理，主机防火墙运行在服务器系统中 |
| 放行端口 | 在访问规则中允许指定来源连接某个端口，例如允许公网连接 443；放行本身不会启动服务 |
| Nginx、OpenResty | 接收和处理网站请求的服务程序。OpenResty 基于 Nginx，本章用它接收 HTTP/HTTPS 请求并转发给应用 |
| 反向代理 | OpenResty 接住请求，再转发给内部服务，并将服务的响应返回给调用方 |
| `127.0.0.1` | 当前电脑自身。图中由 OpenResty 访问，所以指云服务器本机，不是访问者的电脑 |

**1Panel 用来配置网站、证书和转发规则，实际接收并转发这些请求的是 OpenResty。** 第 1 步设置 DNS 和端口规则，第 3 步安装 OpenResty，第 8～9 步配置转发和 HTTPS。

完整的请求过程，以及放行、监听、证书之间的关系，见 [Linux 08：一次 HTTPS 请求怎样到达 Express](../../linux/08-云服务器网络安全组与防火墙.md#一次-https-请求怎样到达-express)。

## Dockerfile、Compose 和 1Panel 分别做什么

知道项目运行在哪里后，接下来要让 Docker 按项目需要准备环境、启动程序。

本章就用“在本地打包，再上传”的做法。`server/Dockerfile` 告诉 Docker 怎样把后端代码、Node.js 和依赖一起打包：

```text
你的电脑：后端代码 + Dockerfile → 制作后端镜像 → push 到 Docker Hub
服务器：从 Docker Hub 拉取这个镜像 → 启动容器，运行后端
```

**这条流程里，镜像在本地做好，服务器下载后直接运行，不需要再打包。** 以后改了代码，再制作并上传新版本，服务器换成新版运行。

把这几个名词放在一起看：

| 概念 | 大白话理解 | 用你的后端举例 |
|---|---|---|
| Dockerfile | 打包说明书 | 告诉 Docker：用 Node.js 24，复制后端代码，装好依赖 |
| 镜像（image） | 打包好的程序，连运行它需要的东西也一起带上 | 可以理解成后端的一份打包版，里面已经准备好了 Node.js 和依赖 |
| 容器（container） | 先理解成在 Docker 里运行的一份程序 | 后端在里面启动，开始接收前端请求、读写数据库 |
| 镜像仓库 | 存镜像的地方，类似 GitHub 存代码 | 你可以把打包好的后端上传到这里，让服务器下载后运行 |

**GitHub 存源代码，Docker Hub 存打包好的镜像。** 本章选用 Docker Hub；GitHub 也有单独的镜像仓库服务 GHCR，但不是把镜像当普通文件提交到代码仓库。参见 [GitHub 镜像仓库说明](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)。

你的 M1 Max 负责打包，2 核 2GB 的服务器负责运行，避免构建时抢占线上网站和数据库的资源。PostgreSQL 已经有官方做好的镜像，直接下载来用。

管理端也有一份 Dockerfile，其中会执行 `npm run build`，把构建结果放进镜像。

三个容器还要分别设置数据库地址、端口、数据保存位置和启动顺序。这些配置集中写进 `deploy/docker-compose.yml`，**Compose 读取它，一次启动或停止这组容器**。第 4 步会写出这些文件，第 5 步先在本地试运行。

1Panel 提供操作这些服务的网页界面：启动和停止容器、查看日志、配置网站和 HTTPS、执行备份。它会实际执行管理操作。

### 一定要自己写 Compose 吗

不一定。也可以在 1Panel 中创建 Node.js 运行环境、选择代码目录和启动命令。它的 Node.js 运行环境使用容器镜像，因此省去自己写 Compose，并不等于不用 Docker。参见 [1Panel Node.js 运行环境](https://docs.fit2cloud.com/1panel/user_manual/websites/node/)和[官方运行环境镜像](https://github.com/1Panel-dev/runtime/blob/dev/README_zh.md)。

项目本身也可以完全不用 Docker：直接在服务器安装 Node.js 24 和 PostgreSQL，上传或拉取代码，再安装依赖、构建、启动，并配置进程管理工具，让程序退出后能重启。

本章选择 Compose，是为了把两个 Node.js 项目和数据库的配置一起保存在项目里，本地验证后能在服务器重复使用。1Panel 负责日常管理。这是一种部署方式，不是 Mini CMS 必须使用的技术。

---

## 第 1 步：准备服务器、域名和端口

### 服务器

本章使用 Ubuntu LTS、x86_64 架构的服务器，**4GB 不是硬性要求**。若已有 2GB 内存的机器还运行着 Node.js 项目、MySQL 等服务，需要先确认剩余内存，再决定是否把 Mini CMS 也部署到这台机器。

本章把 `next build` 等打包工作放在 Mac 上，服务器只下载镜像、运行服务。但运行中的 Next.js、Express、PostgreSQL 和已有服务仍会共用这 2GB 内存，上线后要在 1Panel 观察实际占用，不能把“省掉构建”理解成“运行一定够用”。

先在服务器执行 `uname -m`：本章按输出为 `x86_64` 编写，对应镜像平台 `linux/amd64`。你的 M1 是 ARM，所以后面的配置会明确指定 `linux/amd64`，让 Mac 制作适合服务器的镜像。若输出是 `aarch64`，则将后文两处 `platform` 改成 `linux/arm64`。Docker Desktop 支持这种跨架构制作，模拟另一种 CPU 时可能慢一些。参见 [Docker 跨平台构建说明](https://docs.docker.com/build/building/multi-platform/)。

### 一个域名，配置两个子域名

假设你已有 `example.com`，在域名服务商的 DNS 设置中添加两条 A 记录，记录值都填服务器的公网 IPv4 地址：

| 主机记录 | 得到的访问地址 | 用途 |
|---|---|---|
| `admin` | `admin.example.com` | 管理端 |
| `api` | `api.example.com` | 后端 API |

**只需一个已购买的域名，不需要再买两个。** `admin` 和 `api` 是这个域名下的两个子域名，指向同一台服务器。

也可以只用同一个访问地址，由路径区分管理页面和 `/api` 请求。本章沿用前文管理端、API 分开配置地址的方式，使用两个子域名。

### 放行本次需要的端口

在云服务商的安全组中按下面设置；如果服务器自身也启用了防火墙，同样放行这些端口：

| 端口 | 允许谁访问 | 用途 |
|---|---|---|
| 80、443 | 公网 | 浏览器访问网站、申请 HTTPS 证书 |
| SSH 端口（通常是 22） | 你当前电脑的公网 IP | 远程登录服务器 |
| 1Panel 安装时设置的端口 | 你当前电脑的公网 IP | 打开面板管理页面 |

3000、3001 和 5432 不向公网开放。后面的 Compose 会把它们绑定到 `127.0.0.1`，供服务器本机访问。如果这些端口已被其他项目使用，调整 Compose 映射中的主机端口，容器内部端口可以保持原值。管理端或 API 的主机端口变化时，反向代理的目标地址也要同步修改。

---

## 第 2 步：安装 1Panel

通过 SSH 登录服务器，复制 [1Panel 官网安装文档](https://1panel.cn/docs/v2/installation/online_installation/)中的命令并执行，按提示完成安装。本章需要 Docker，安装过程中选择安装；服务器已有 Docker 时使用已有环境。

保存安装结束时显示的面板地址、端口和登录信息，在安全组放行面板端口后，用浏览器打开该地址。忘记入口时，在服务器执行：

```bash
1pctl user-info
```

面板有权管理整台服务器，使用独立密码、开启 MFA，并限制为自己的公网 IP 访问。

---

## 第 3 步：准备 OpenResty

先根据服务器现状选择：

- 1Panel 已安装并运行 OpenResty：直接使用已有服务。
- 80、443 已由原有网站的 Nginx 或其他 OpenResty 使用：复用现有网站服务添加转发规则，保持旧网站运行。
- 还没有网站服务：在 1Panel“应用商店”中搜索并安装 OpenResty，HTTP、HTTPS 端口分别使用 80、443，安装后确认状态为运行中。

后面的面板操作以 1Panel 管理 OpenResty 为例。第 4～7 步先让应用运行起来，第 8 步再填写两个子域名分别转发到哪个地址。

---

## 第 4 步：为项目增加生产容器配置

在本机的 `mini-cms` 中创建下面这些文件，路径都相对于项目根目录。Dockerfile 和本地打包配置留在 Mac 上使用；服务器只需要启动用的 Compose 和正式环境配置。源代码与这些配置仍通过 Git 保存版本。

### 4.1 `server/.dockerignore`

构建镜像时排除本机的依赖、构建产物和环境配置，让镜像重新安装依赖，并在运行时读取服务器配置：

```dockerignore
node_modules
dist
coverage
.env
.env.*
```

### 4.2 `server/Dockerfile`

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

### 4.3 `admin-web-antd/.dockerignore`

```dockerignore
node_modules
.next
.env
.env.*
```

### 4.4 `admin-web-antd/Dockerfile`

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

### 4.5 `deploy/.gitignore`

```gitignore
.env
```

### 4.6 `deploy/.env.example`

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

### 4.7 `deploy/docker-compose.yml`

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

`ports` 中的 `127.0.0.1:3000:3000` 表示：将服务器本机的 3000 端口连接到管理端容器的 3000 端口。OpenResty 访问 `http://127.0.0.1:3000`，就能把请求交给容器里的 Next.js。3001 对应后端，5432 对应数据库。

其余配置对应四件事：

- **连接数据库**：后端的 `DATABASE_URL` 使用服务名 `postgres`，访问同一 Compose 中的数据库。
- **按顺序启动**：`healthcheck` 检查 PostgreSQL 是否就绪，后端等它就绪后执行迁移，迁移成功才执行 `start`。
- **保留数据**：`volumes` 把 PostgreSQL 数据保存在独立的数据卷中，重新构建应用镜像不会删除它。
- **自动重启**：`restart: unless-stopped` 让 Docker 在容器意外退出后重新启动它；手动停止的容器保持停止。

### 4.8 `deploy/docker-compose.build.yml`

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

打包时让 Compose 同时读取 4.7 和 4.8：前一份提供镜像名称与目标平台，后一份提供代码目录与构建参数。两个 `context` 都相对于 `deploy/`；服务器只使用 4.7。参见 [Compose 多文件用法](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/)和[构建目标平台说明](https://docs.docker.com/reference/compose-file/build/#platforms)。

---

## 第 5 步：在本地制作、验证并上传镜像

这一整步都在 Mac 上操作。先启动 Docker Desktop，下面的终端命令都在 `mini-cms` 根目录执行。

### 5.1 准备 Docker Hub 和本地配置

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

### 5.2 按服务器架构制作镜像

```bash
docker compose --env-file deploy/.env \
  -f deploy/docker-compose.yml -f deploy/docker-compose.build.yml config

docker compose --env-file deploy/.env \
  -f deploy/docker-compose.yml -f deploy/docker-compose.build.yml build api admin_web_antd
```

两个 `-f` 表示同时读取两份配置。检查 `config` 输出：镜像名称带自己的用户名和 `v1`，两个应用的 `platform` 都是第 1 步确认的服务器平台，管理端构建参数使用正式 API 地址。

`build` 会在 Mac 上按 Dockerfile 安装依赖、生成 Prisma Client，并完成管理端的 `next build`。结束时应没有报错。这一步得到的就是准备上传的后端和管理端镜像。

### 5.3 用这两份镜像在本地试跑

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

本轮检查镜像能否启动、迁移和读取数据。管理端浏览器请求已经指向正式 API 域名，所以完整登录、保存文章留到第 9 步在真实 HTTPS 域名下验证。

结束本地试跑：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml down
```

不要添加 `-v`。`down -v` 会删除 Compose 数据卷，里面可能有 PostgreSQL 数据。需要继续本地开发时，在项目根目录执行 `docker compose up -d postgres`，再启动原来的前后端开发命令。

### 5.4 上传已经验证过的镜像

保持 `deploy/.env` 中的用户名和版本号不变，执行：

```bash
docker compose --env-file deploy/.env \
  -f deploy/docker-compose.yml -f deploy/docker-compose.build.yml push api admin_web_antd
```

**`push` 只上传刚才做好的镜像，不会再打包。** 这里指定两个应用，不上传 PostgreSQL 官方镜像。打开 Docker Hub 的两个仓库，确认都出现了 `v1` 标签，再继续服务器部署。参见 [Compose push](https://docs.docker.com/reference/cli/docker/compose/push/)。

同时用 Git 保存这次源代码和容器配置的版本，记录 `v1` 对应哪个 commit；真实 `deploy/.env` 不提交。

---

## 第 6 步：把运行配置放到服务器

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

`cp -n` 保留已经存在的 `.env`。通过 SSH 或 1Panel 文件管理器编辑它：

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

## 第 7 步：下载镜像，在 1Panel 启动 Compose 编排

先在服务器的 `/opt/mini-cms` 目录拉取镜像。如果使用 Private 仓库，先以当前管理 Docker 的用户登录；本章是 `root`，密码提示处使用有 **Read** 权限的 Docker Hub 令牌：

```bash
docker login --username yourdockerhubname
```

Public 仓库可以不登录直接拉取。随后执行：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml pull
```

这会下载你上传的两个应用镜像和 PostgreSQL 官方镜像。**拉取成功后，服务器已经拿到打包好的程序，下一步直接启动。**

在 1Panel 中进入：

```text
容器
-> 编排
-> 创建编排
-> 名称：mini-cms-production
-> 路径选择
-> /opt/mini-cms/deploy/docker-compose.yml
```

编排名称与文件中的 `name` 保持一致，后面用命令行管理的才是同一组容器和数据卷。`deploy/.env` 与 Compose 文件位于同一目录，创建前核对 1Panel 显示的最终配置没有空变量；本次使用刚拉取的本机镜像。若面板另行要求私有仓库认证，先在其镜像仓库管理中配置同一账号的读取凭据。

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

响应应与第 5 步一致。到这里，项目已经在服务器内部运行，接下来创建管理员，再配置域名访问。

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

## 第 8 步：把两个子域名分别转发到管理端和 API

确认 `admin`、`api` 两条 DNS 记录已经指向服务器公网 IP，然后在 1Panel 的“网站”中分别创建两个反向代理网站：

### 管理端

```text
网站类型：反向代理
主域名：admin.example.com
代理地址：http://127.0.0.1:3000
```

### 后端 API

```text
网站类型：反向代理
主域名：api.example.com
代理地址：http://127.0.0.1:3001
```

先用 HTTP 检查代理链路，再开启 HTTPS。不要在 OpenResty 中再写一套宽松 CORS 规则；API 的允许来源、Cookie 和认证仍由 Express 负责。

---

## 第 9 步：申请证书并启用 HTTPS

在 1Panel 的证书页面：

```text
创建 ACME 账户
-> 选择 HTTP 或 DNS 验证
-> 为 admin.example.com 和 api.example.com 申请证书
-> 开启自动续签
-> 在两个网站中选择证书并开启 HTTPS
-> 将 HTTP 跳转到 HTTPS
```

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

## 第 10 步：配置数据库备份和恢复验证

数据卷能保留容器重建后的数据，但误删文章或服务器磁盘损坏时，还需要从备份恢复。本节先用 PostgreSQL 容器里已有的工具导出数据，再恢复到测试数据库，最后让 1Panel 定时执行备份。

### 10.1 导出一份数据库备份

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

### 10.2 恢复到测试数据库，检查文章

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

`createdb` 创建空库，`pg_restore` 导入备份，最后的 SQL 查询恢复后的文章。确认能看到第 9 步保存的文章，且整段没有报错，才算完成恢复验证。如果测试库已经存在，命令会停止，先确认上次验证已结束，再用下面的命令清理后重试。

验证结束后删除测试库：

```bash
cd /opt/mini-cms
docker compose --env-file deploy/.env -f deploy/docker-compose.yml \
  exec -T postgres sh -c 'dropdb -U "$POSTGRES_USER" mini_cms_restore_check'
```

删除的只是 `mini_cms_restore_check`，保留原数据库和备份文件。

### 10.3 设置每日自动备份，并保存到服务器之外

在 1Panel 的“计划任务”中创建 **Shell 脚本**任务：在宿主机上用 Bash 执行，内容粘贴 10.1 的完整代码块，周期设为每天 03:00。先手动执行一次，确认任务报告显示成功，并出现新的 `.dump` 文件。

再在“面板设置 → 备份账号”中配置服务器之外的对象存储或备份服务器，创建 **备份目录**任务：源目录为 `/opt/backups/mini-cms`，目标选择刚配置的备份账号，保留最近 7 份。执行时间安排在数据库导出完成后，例如每天 03:30；若实际导出耗时更长，就相应延后。排除 `*.tmp` 临时文件。

手动执行目录备份，确认远端能找到文件；下载一份、解压取出其中的 `.dump`，再按 10.2 恢复一次，确认服务器之外的副本同样可用。之后定期重复恢复验证。项目的 Dockerfile、Compose 配置和恢复步骤保存在 Git 与 README 中，数据库内容依靠这些备份恢复。

---

## 第 11 步：以后怎样更新

以后每次发布都走同一条线：**Mac 制作并上传新版镜像 → 服务器下载新版 → 更新容器。**

先在 Mac 上准备新版：

1. 完成本次修改，检查迁移文件，运行项目已有的测试和检查。
2. 把本地 `deploy/.env` 的 `IMAGE_TAG` 从 `v1` 改成新版本，例如 `v2`。每次发布使用新标签，保留旧版供核对和回退。
3. 按第 5.2～5.4 节重新制作两个应用镜像、本地试跑，再上传。确认 Docker Hub 两个仓库都有 `v2`；源代码和配置提交到 Git，记录这次版本对应的 commit。

再更新服务器：

1. 按第 10 步备份正式数据库，记录服务器当前的 `IMAGE_TAG`。
2. 将服务器 `deploy/.env` 的 `IMAGE_TAG` 改为刚上传的 `v2`，保留正式数据库密码等配置。
3. 如果本次修改了运行用的 `deploy/docker-compose.yml`，先按第 6 步从 Mac 上传该文件；仅修改业务代码时不用重新上传配置。

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

重新打开管理端，确认本次修改已生效，更新前保存的文章仍能查看和编辑。把本节更新命令与第 10 步实际使用的备份、恢复方法记到项目 README。

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
| 面板打不开 | 1Panel 服务、面板端口、云安全组、授权 IP、安全入口 |
| OpenResty 无法启动 | 80 / 443 是否被其他进程占用，应用日志 |
| Mac 制作镜像失败 | Docker Desktop、Node 版本、lockfile、Dockerfile、正式 API 构建参数 |
| 上传或拉取镜像失败 | Docker Hub 是否可访问、登录权限、用户名、仓库名和版本标签是否存在 |
| 提示架构不匹配或 `exec format error` | 服务器 `uname -m` 与镜像平台是否对应，是否按第 4～5 步重新制作了正确平台的镜像 |
| 更新后还是旧页面 | 本地是否制作并上传新标签，服务器是否修改 `IMAGE_TAG`、执行 `pull` 和 `up -d` |
| API 容器反复重启 | 数据库健康、`DATABASE_URL`、迁移和 API 日志 |
| 服务器内部 API 正常，域名失败 | OpenResty 代理、网站状态、80 / 443、防火墙和 DNS |
| 页面打开但请求 API 失败 | `NEXT_PUBLIC_API_BASE_URL` 是否在构建时正确，CORS 和证书 |
| 登录后仍然 401 | Cookie 的 `Secure`、Domain、SameSite、前端 credentials 和 CORS |
| 重启后数据消失 | PostgreSQL volume 是否仍挂载，是否误删卷 |
| 证书续签失败 | ACME、DNS / HTTP 验证、80 端口和证书日志 |
| 备份任务成功但无法恢复 | 备份内容、数据库版本、压缩密码和恢复步骤 |

## 官方参考

- [1Panel 在线安装](https://1panel.cn/docs/v2/installation/online_installation/)
- [1Panel 容器编排](https://1panel.cn/docs/v2/user_manual/containers/compose/)
- [1Panel 创建网站与反向代理](https://1panel.cn/docs/v2/user_manual/websites/website_create/)
- [1Panel 网站配置与 HTTPS](https://1panel.cn/docs/v2/user_manual/websites/website_config_basic/)
- [1Panel 证书管理](https://1panel.cn/docs/v2/user_manual/websites/certificate/)
- [1Panel 防火墙](https://1panel.cn/docs/v2/user_manual/hosts/firewall/)
- [1Panel 计划任务与备份](https://1panel.cn/docs/v2/user_manual/cronjobs/)
- [1Panel 面板设置](https://1panel.cn/docs/v2/user_manual/settings/)
- [OpenResty：基于 Nginx 的 Web 平台](https://openresty.org/cn/)
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
