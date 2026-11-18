# 20C. Docker Compose 部署链路回顾

完成[第 20A 章部署](./20A-用宝塔和Docker-Compose部署MiniCMS.md)后，用这篇短文回看：本地能运行的 Mini CMS，怎样变成服务器上的三个服务。

## 1. 原来手动做的事，放进了哪些文件

本地开发时，前后端由你在终端执行 `npm run dev`，PostgreSQL 由 Docker 启动。部署时，前后端也进入容器，原来手动准备和启动项目的动作写进了配置：

| 文件 | 接手了什么 |
|---|---|
| 两个应用各自的 `Dockerfile` | 准备 Node.js、复制代码、安装依赖；后端生成 Prisma Client，管理端执行 `next build`，并分别设置启动命令 |
| `deploy/docker-compose.build.yml` | 告诉 Compose 去哪个代码目录构建两个应用，并传入管理端构建需要的 API 地址 |
| `deploy/docker-compose.yml` | 指定三个服务的镜像，以及容器的环境变量、启动命令、端口、数据卷和依赖关系 |
| `deploy/.env` | 提供镜像地址、版本、数据库连接等值，填入 Compose 配置中的 `${变量名}` |

**Dockerfile 负责把程序和运行依赖做成镜像，Compose 按配置把镜像运行成容器。** Express 仍然执行 `tsx src/server.ts`；Next.js 先构建再启动。业务代码继续处理原来的文章和登录请求。

## 2. 从 Mac 上的代码，到服务器上的容器

整条线是：**Mac 制作镜像 → 交付镜像和运行配置 → 服务器启动容器。**

**① 在 Mac 制作镜像**

构建命令用两个 `-f` 指定两份 Compose 文件。它们都写了 `api`，分别提供：

| 文件 | `api` 的配置 |
|---|---|
| `deploy/docker-compose.yml` | `image`：生成的镜像叫什么 |
| `deploy/docker-compose.build.yml` | `build.context: ../server`：去哪里找代码和 Dockerfile |

Compose 把同名服务的配置组合起来，就知道：**用 `server/` 中的 Dockerfile 构建后端，并给镜像设置指定名称。** 管理端同理。

Docker 按各自的 Dockerfile 准备 Node.js、复制代码、安装依赖。后端还生成 Prisma Client；管理端执行 `next build`，把生成的 `.next/` 保存在镜像中。

管理端需要的 API 地址和图片上传地址也在这时写入：Mac 的 `deploy/.env` 中的 `API_DOMAIN`、`NEXT_PUBLIC_UPLOAD_URL` → Compose 的 `build.args` → Dockerfile 的 `ARG/ENV` → `next build`。以后更换任一地址，都需要重新构建并部署管理端镜像；本地开发的 `.env.local` 不会进入镜像。

PostgreSQL 使用下载的官方镜像。三个镜像在本地试跑通过后，就可以交付。

**② 把镜像和运行配置交给服务器**

- **镜像**：Mac 用 `push` 上传 ACR，服务器用 `pull` 下载。应用代码、Node.js 和依赖已经随镜像到达服务器。
- **运行配置**：单独上传 `docker-compose.yml` 和 `.env`，在服务器的 `.env` 中填写 ACR 的 VPC 地址、镜像版本和正式数据库配置。

服务器用现成镜像启动应用，无需另外上传源码目录。Dockerfile 和 `docker-compose.build.yml` 用于 Mac 上的构建，服务器运行时只读取 `docker-compose.yml`。

**③ 在服务器启动容器**

在服务器的 `/opt/mini-cms` 目录执行：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d
```

Compose 读取服务器的 `.env`，填入运行配置，再创建容器。例如，`DATABASE_URL` 通过 `api.environment` 传进 API 容器，供 Prisma 连接线上数据库。

按当前配置，PostgreSQL 先启动；API 的 `depends_on` 等待数据库健康检查通过，再执行 `npm run db:migrate:deploy && npm run start`，先更新数据库结构，再启动 Express。管理端用 `npm run start` 提供页面，两个应用都使用容器内的 Node.js。

至此，代码已经在服务器上运行。线上数据库保存自己的数据，本地文章不会随着镜像上传。

## 3. 请求怎样找到容器里的程序

服务运行后，打开文章列表会发生两次请求：

```text
拿页面：浏览器 → admin 域名 → Nginx → 管理端容器
拿数据：浏览器里的页面 → api 域名 → Nginx → API 容器 → PostgreSQL
```

对照配置看三个地址，最容易混淆的地方就在这里：

| 谁在连接谁 | 使用的地址 | 为什么这样写 |
|---|---|---|
| 浏览器连接 API | `https://api.example.com` | 浏览器通过公网访问服务器上的 Nginx |
| 服务器上的 Nginx 连接 API 容器 | `127.0.0.1:3001` | Compose 的 `ports` 中，`127.0.0.1:3001:3001` 把服务器本机端口映射到容器内端口 |
| API 容器连接 PostgreSQL | `postgres:5432` | 两个服务在同一 Compose 网络里，`postgres` 是数据库服务名 |

**`localhost` 指发起连接的那个运行环境自身。** 浏览器里是你的电脑，服务器终端里是云服务器，API 容器里是 API 容器自己。所以 API 找数据库时使用 `postgres`，这段连接不经过 Nginx，也不经过宿主机的数据库端口映射。

## 4. 发布新版时，程序和数据分别怎样变化

更新时仍是同一条链：**Mac 构建新版应用镜像并上传 → 服务器修改镜像版本、`pull` → `up -d` 更新应用容器。** `pull` 只下载镜像；执行 `up -d` 后，才按新镜像更新运行中的应用。

文章保存在服务器的 `postgres_data` 数据卷中，PostgreSQL 容器把它挂到 `/var/lib/postgresql`。更新两个应用镜像会继续使用原来的数据库；保留并重新挂载同一个数据卷时，重建数据库容器也能读到原有数据。Mac 试跑创建的同名卷与服务器上的卷互相独立。

回看 Compose 时，就沿着这条线读：**`image` 找到程序 → `environment` 给它配置 → `command` 启动程序 → `ports` 和内部网络接通请求 → `volumes` 保存数据库数据。**
