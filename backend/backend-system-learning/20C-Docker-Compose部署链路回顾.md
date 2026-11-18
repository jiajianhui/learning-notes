# 20C. Docker Compose 部署链路回顾

完成[第 20A 章部署](./20A-用宝塔和Docker-Compose部署MiniCMS.md)后，回看各文件负责什么，以及它们怎样把 Mac 上的代码变成服务器上的容器。

## 1. 原来手动做的事，放进了哪些文件

本地开发时，你安装依赖、执行 `npm run dev`。部署时，准备环境和启动程序的动作交给 Docker，具体做法写在这些文件里：

| 文件 | 负责什么 | 本项目在哪里使用 |
|---|---|---|
| 两个应用各自的 `Dockerfile` | 写明制作镜像的步骤：准备 Node.js、安装依赖、复制代码、构建；设置容器的默认启动命令 | Mac 构建时 |
| 两个应用各自的 `.dockerignore` | 排除无需参与构建的本地文件，如 `node_modules`、`.env`、`.env.local` | Mac 构建时 |
| `deploy/docker-compose.build.yml` | 指定应用的代码目录和构建参数，如前端 API、图片上传地址 | Mac 构建时 |
| `deploy/docker-compose.yml` | 指定镜像名称，以及容器的环境变量、启动命令、端口、数据卷和依赖关系 | Mac 构建与试跑、服务器运行 |
| `deploy/.env` | 提供具体值，填入 Compose 中的 `${变量名}` | Mac、服务器各自一份 |

**文件写配置，命令决定做什么**：`build` 制作镜像，`pull` 下载镜像，`up -d` 创建或更新容器并在后台运行。

## 2. 从 Mac 上的代码，到服务器上的容器

整条线是：**Mac 制作镜像 → 交付镜像和运行配置 → 服务器启动容器。**

**① 在 Mac 制作镜像**

在 Mac 的 `mini-cms` 根目录执行：

```bash
docker compose --env-file deploy/.env \
  -f deploy/docker-compose.yml \
  -f deploy/docker-compose.build.yml \
  build api admin_web_antd
```

`--env-file` 指定变量文件，两个 `-f` 指定两份配置。以同名服务 `api` 为例：

| 文件 | `api` 的配置 |
|---|---|
| `deploy/docker-compose.yml` | `image`：生成的镜像叫什么 |
| `deploy/docker-compose.build.yml` | `build.context: ../server`：相对于 `deploy/`，去 `server/` 找代码和 Dockerfile |

Compose 把两处 `api` 的配置组合成一个服务：**按 `server/Dockerfile` 构建，再用 `image` 指定的名称给镜像命名。** 管理端同理。

管理端的两个地址也在这时传入：

```text
Mac 的 deploy/.env：NEXT_PUBLIC_API_BASE_URL、NEXT_PUBLIC_UPLOAD_URL
→ docker-compose.build.yml 的 build.args
→ Dockerfile 的 ARG / ENV
→ next build 写入前端构建结果
```

因此，更换这两个地址需要重新构建、部署管理端镜像；只改服务器的 `.env` 不会改变已构建的前端。

构建出的应用镜像包含 Node.js、代码和依赖，管理端还包含 `.next/` 构建结果。PostgreSQL 使用下载的官方镜像。三个镜像在 Mac 试跑通过后，就可以交付。

**② 把镜像和运行配置交给服务器**

- **镜像**：Mac 用 `push` 上传 ACR，服务器用 `pull` 下载。
- **运行配置**：上传 `deploy/docker-compose.yml` 和 `.env`，把服务器这份 `.env` 改为 ACR 的 VPC 地址和正式数据库配置，镜像版本与上传的一致。

源码已随镜像到达服务器；源码目录、Dockerfile 和 `docker-compose.build.yml` 留在 Mac。

**③ 在服务器启动容器**

在服务器的 `/opt/mini-cms` 目录执行：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d
```

这次只指定运行配置。服务器的 `.env` 仍有两类用途：

- `IMAGE_PREFIX`、`IMAGE_TAG` 填入 `image`，决定使用哪个镜像。
- `POSTGRES_*`、`DATABASE_URL`、`ADMIN_WEB_ORIGIN` 通过 `environment` 传入相应容器，供数据库和 API 运行时使用。

**`.env` 不会整份自动传入容器，变量的用途取决于 Compose 在哪里引用它。** 当前运行配置没有引用 `NEXT_PUBLIC_*`，所以它们在服务器这份 `.env` 中不起作用。

Compose 按配置启动 PostgreSQL，等待数据库健康检查通过后，让 API 执行 `npm run db:migrate:deploy && npm run start`；管理端执行 `npm run start`。两个应用都使用镜像中准备好的 Node.js。

## 3. 请求怎样找到容器里的程序

运行配置中的 `ports` 把服务器端口接到容器；Nginx 再把域名请求转给这些端口：

```text
拿页面：浏览器 → admin 域名 → Nginx → 127.0.0.1:3000 → 管理端容器
拿数据：浏览器里的页面 → api 域名 → Nginx → 127.0.0.1:3001 → API 容器 → postgres:5432
```

这里的 `127.0.0.1` 是 Nginx 所在的云服务器。API 通过 Compose 内部网络，用服务名 `postgres` 找数据库；在 API 容器中写 `localhost`，指向的是 API 容器自己。

## 4. 发布新版时，程序和数据分别怎样变化

更新流程：**Mac 构建并上传新版镜像 → 服务器修改 `IMAGE_TAG` → `pull` 下载 → `up -d` 更新容器。** 完整命令见 [20A 第 10 步](./20A-用宝塔和Docker-Compose部署MiniCMS.md#第-10-步以后怎样更新)。

文章保存在 `postgres_data` 数据卷中，由运行配置的 `volumes` 挂载给数据库容器。更新应用镜像会继续使用原来的数据；Mac 与服务器的数据卷各自独立，本地文章不会随镜像上传。
