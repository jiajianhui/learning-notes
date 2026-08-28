# 18A. 用 1Panel 和 Docker Compose 部署 Mini CMS

> Mini CMS 阶段 8（可选）：阶段 7 完成后再使用。本章不使用宝塔，也不通过上传散文件的方式发布项目。

## 这一章完成什么

第 18 章已经建立了构建、环境变量、生产迁移、日志和备份的地图。本章把这些要求落到一台真实服务器：

```text
1Panel
├── 管理 Docker 和 Compose
├── 用 OpenResty 管理网站与反向代理
├── 申请和续签 HTTPS 证书
├── 管理主机防火墙
└── 执行备份和计划任务

Mini CMS 仓库
├── server Dockerfile
├── admin-web-antd Dockerfile
├── deploy/docker-compose.yml
├── deploy/.env.example
└── Prisma 迁移、构建和启动命令
```

第一次只要求上线：

```text
admin-web-antd
server
PostgreSQL
```

`admin-web-shadcn` 完成后可以增加同类服务，但不要为了部署提前创建空项目。

最终链路：

```text
浏览器
├── https://admin.example.com
└── https://api.example.com
           ↓
云安全组和主机防火墙
           ↓
1Panel 管理的 OpenResty：80 / 443
├── 反向代理到 127.0.0.1:3000 -> admin-web-antd 容器
└── 反向代理到 127.0.0.1:3001 -> server 容器
                                            ↓
                                   postgres:5432
                                            ↓
                                    PostgreSQL 数据卷
```

---

## 为什么使用 Compose，不直接依赖 1Panel Node 运行环境

1Panel 可以创建 Node.js 运行环境网站，也可以管理 Docker Compose。这套项目选择 Compose，原因是：

- 后端学习路线固定使用 Node.js 22，Compose 可以用 `node:22` 明确锁定版本。
- Next.js、Express 和 PostgreSQL 可以由一份配置组织。
- 同一份配置可以先在本地验证，再交给 1Panel 管理。
- 迁移到另一台 Linux 服务器时，不依赖原面板中不可见的点击记录。
- 1Panel 继续负责容器状态、OpenResty、证书、防火墙和备份，职责仍然明确。

这里不是否定 1Panel 的 Node 运行环境。单个脚本或简单网站可以使用它；Mini CMS 有多个 Node.js 项目和数据库，Compose 更符合当前学习目标。

---

## 开始前必须满足的项目状态

当前阶段完成下面检查后才能部署：

### server

- `npm run build` 能生成可运行的生产代码。
- `npm run start` 运行生产构建，不使用 `tsx watch`。
- `npm run test` 可以验证核心 API。
- `npm run db:generate` 可以生成 Prisma Client。
- `npm run db:migrate:deploy` 执行 `prisma migrate deploy`。
- 有 `GET /api/articles/health`。
- CORS 和 CSRF 来源从 `ADMIN_WEB_ORIGINS` 读取，不再写死开发地址。
- Cookie 在生产环境使用 `Secure`，并保持阶段 6 的认证和 CSRF 防护。

### admin-web-antd

- `npm run build` 和 `npm run start` 可用。
- `NEXT_PUBLIC_API_BASE_URL` 可以指向正式 API 域名。
- 请求继续携带阶段 6 需要的 Cookie，并正确处理 401。

### PostgreSQL

- `prisma/migrations` 已提交。
- 新数据库可以用 `prisma migrate deploy` 建立结构。
- 已经知道怎样生成和恢复备份。

### 整个仓库

- 真实 `.env` 不在 Git 中。
- 有 `.env.example` 说明必需字段。
- 阶段 7 的测试和项目 README 已完成。
- 已决定第一轮只上线 Ant Design 后台，还是两套后台都上线。

如果这些条件还没满足，回到对应阶段补齐，不用 1Panel 隐藏项目自身缺失的生产能力。

---

## 第 1 步：准备服务器、域名和端口

第一台服务器建议：

- Ubuntu LTS。
- x86_64。
- 2 个 CPU 核心、4 GB 左右内存作为练习起点。
- 磁盘能容纳镜像、构建缓存、PostgreSQL 数据和备份。

准备两个域名：

```text
admin.example.com -> 服务器公网 IP
api.example.com   -> 服务器公网 IP
```

云安全组第一轮只放行：

| 端口 | 来源 | 用途 |
|---|---|---|
| SSH 端口 | 自己的可信公网 IP | 远程管理和救援 |
| 80 | 公网 | HTTP 和证书验证 |
| 443 | 公网 | HTTPS |
| 1Panel 端口 | 自己的可信公网 IP | 面板管理 |

不要公开：

```text
3000 / 3001 / 3002
5432
Docker daemon
```

3000 和 3001 后面只绑定 `127.0.0.1`，由同机 OpenResty 访问。5432 也只绑定服务器本机，方便备份和检查，不向公网开放。

---

## 第 2 步：安装并保护 1Panel

只使用 [1Panel 官方安装文档](https://1panel.cn/docs/v2/installation/online_installation/) 当前提供的命令。执行前先打开官方脚本地址确认来源，不从第三方教程复制改写版安装脚本。

官方交互式安装命令当前为：

```bash
bash -c "$(curl -sSL https://resource.fit2cloud.com/1panel/package/v2/quick_start.sh)"
```

按照提示设置：

- 非默认、未占用的面板端口。
- 不容易猜到的安全入口。
- 独立用户名和高强度密码。
- 安装目录和 Docker 选项。

安装后可以在 SSH 中查看入口：

```bash
1pctl user-info
```

首次登录后立即完成：

1. 开启 MFA。
2. 设置合理的登录超时。
3. 为面板启用 HTTPS。
4. 在面板安全设置和云安全组中限制允许访问的 IP。
5. 保存 `1pctl` 恢复方式，避免面板设置错误后没有入口。

面板端口不因为有“安全入口”就可以长期向所有 IP 开放。安全入口、密码、MFA、HTTPS 和来源限制解决不同问题。

---

## 第 3 步：安装 OpenResty

1Panel 的网站功能依赖 OpenResty。

在 1Panel 中：

```text
应用商店
-> 搜索 OpenResty
-> 选择稳定版本安装
-> 确认 80、443 没有被其他程序占用
```

安装后先不要创建网站。应用容器还没运行时，反向代理没有正确上游。

OpenResty 由 1Panel 管理，负责 80、443、证书和反向代理；它不代替 Express 的 CORS、认证和业务错误处理。

---

## 第 4 步：为项目增加生产容器配置

下面文件属于最终 `mini-cms` 仓库。阶段 8 实操时创建，不把它们只留在 1Panel 编辑器中。

### 4.1 `server/.dockerignore`

```dockerignore
node_modules
dist
coverage
.env
.env.*
```

### 4.2 `server/Dockerfile`

这个第一版强调容易理解和可运行，不追求最小镜像。它依赖前置条件中的 `build`、`start` 和 Prisma scripts 已经真实可用。

```dockerfile
FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json ./
COPY src ./src

RUN DATABASE_URL=postgresql://build:build@postgres:5432/build npm run db:generate
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "run", "start"]
```

镜像中暂时保留开发依赖，是因为 `prisma migrate deploy` 需要 Prisma CLI。后续确认迁移流程后，可以再拆 migration stage 和精简 runtime image，不在第一次部署同时优化。

### 4.3 `admin-web-antd/.dockerignore`

```dockerignore
node_modules
.next
.env
.env.*
```

### 4.4 `admin-web-antd/Dockerfile`

```dockerfile
FROM node:22-bookworm-slim

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
POSTGRES_USER=mini_cms
POSTGRES_PASSWORD=replace_with_a_long_random_password
POSTGRES_DB=mini_cms
DATABASE_URL=postgresql://mini_cms:replace_with_a_long_random_password@postgres:5432/mini_cms

ADMIN_DOMAIN=admin.example.com
API_DOMAIN=api.example.com
ADMIN_WEB_ORIGINS=https://admin.example.com
```

数据库密码进入 URL 时，`@`、`:`、`/`、`#` 等字符需要 URL 编码。第一次可以使用足够长的随机字母和数字组合，避免手写两处值时产生编码差异。

### 4.7 `deploy/docker-compose.yml`

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
    build:
      context: ../server
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: ${DATABASE_URL}
      ADMIN_WEB_ORIGINS: ${ADMIN_WEB_ORIGINS}
    depends_on:
      postgres:
        condition: service_healthy
    command: ["sh", "-c", "npm run db:migrate:deploy && npm run start"]
    ports:
      - "127.0.0.1:3001:3001"

  admin_web_antd:
    build:
      context: ../admin-web-antd
      args:
        NEXT_PUBLIC_API_BASE_URL: "https://${API_DOMAIN}"
    restart: unless-stopped
    depends_on:
      - api
    ports:
      - "127.0.0.1:3000:3000"

volumes:
  postgres_data:
```

这份配置的关键不是 YAML 语法，而是：

```text
PostgreSQL 使用持久卷
-> API 通过 postgres:5432 访问数据库
-> 生产迁移在 API 启动前执行
-> 两个 Web 端口只绑定服务器本机
-> OpenResty 再把 HTTPS 请求转进来
```

如果以后部署 `admin-web-shadcn`，增加一个同类服务即可。容器内部仍可使用 3000，主机绑定 `127.0.0.1:3002:3000`，不需要复制后端和数据库；同时把两个正式后台来源都写入 `ADMIN_WEB_ORIGINS`，用英文逗号分隔。不要在启用 Cookie credentials 时改成 `*`。

---

## 第 5 步：先在本地验证生产 Compose

不要把云服务器当第一次运行 Dockerfile 的调试机。

在 `mini-cms` 根目录：

```bash
cp deploy/.env.example deploy/.env
```

填写本地测试值后：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml config
docker compose --env-file deploy/.env -f deploy/docker-compose.yml build
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d
docker compose --env-file deploy/.env -f deploy/docker-compose.yml ps
docker compose --env-file deploy/.env -f deploy/docker-compose.yml logs -f api
```

验证：

```bash
curl http://127.0.0.1:3001/api/articles/health
curl -I http://127.0.0.1:3000
```

结束本地练习：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml down
```

不要添加 `-v`。`down -v` 会删除 Compose 数据卷，里面可能有 PostgreSQL 数据。

---

## 第 6 步：把固定版本代码放到服务器

推荐目录：

```text
/opt/mini-cms
```

用 Git 获取代码，不用 1Panel 文件管理器上传整个 `node_modules`：

```bash
sudo mkdir -p /opt/mini-cms
sudo chown deploy:deploy /opt/mini-cms
git clone git@github.com:your-account/mini-cms.git /opt/mini-cms
cd /opt/mini-cms
git status
```

这里假设远程管理用户叫 `deploy`，仓库位于 GitHub；实际使用时替换用户名和仓库地址。空的目标目录可以直接作为 `git clone` 目标。

如果仓库是私有的，使用只针对该仓库的 deploy key。不要把个人访问令牌写进 Git 远程 URL。

在服务器创建真实配置：

```bash
cp deploy/.env.example deploy/.env
chmod 600 deploy/.env
```

通过 SSH 编辑或用 1Panel 文件管理器填写真实值。再次确认：

```bash
git status --short
```

真实 `deploy/.env` 不应出现在待提交文件里。

在启动前先解析 Compose：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml config
```

检查输出中端口、域名和服务名是否正确。不要把包含真实密钥的完整输出粘贴到聊天或工单。

---

## 第 7 步：在 1Panel 创建 Compose 编排

在 1Panel 中进入：

```text
容器
-> 编排
-> 创建编排
-> 路径选择
-> /opt/mini-cms/deploy/docker-compose.yml
```

`deploy/.env` 与 Compose 文件位于同一目录，便于 Docker Compose 读取变量。创建前核对 1Panel 显示的最终配置没有空变量。

启动后查看：

- 三个容器是否运行。
- PostgreSQL 健康检查是否通过。
- API 日志中迁移是否成功。
- 3000、3001、5432 是否只绑定 `127.0.0.1`。

在 SSH 中交叉验证：

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml ps
ss -lntp
curl http://127.0.0.1:3001/api/articles/health
curl -I http://127.0.0.1:3000
```

1Panel 页面和 CLI 看到的是同一组 Docker 对象。页面异常时仍然可以用 CLI 和日志判断真实状态。

---

## 第 8 步：创建两个反向代理网站

确认域名已经解析到公网 IP，然后在 1Panel 创建：

### 管理后台

```text
网站类型：反向代理
主域名：admin.example.com
代理地址：http://127.0.0.1:3000
```

### API

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
curl https://api.example.com/api/articles/health
```

再从 Mac 浏览器检查：

- 证书域名和有效期正确。
- 管理后台请求正式 API 域名。
- 登录 Cookie 带 `Secure`。
- CORS 只允许正式后台来源。
- 页面刷新和 API 错误仍然有正确反馈。

自动续签不是“永远不用管”。域名解析、DNS API 凭证、80 端口或网站配置变化都可能让续签失败，需要查看证书和任务日志。

---

## 第 10 步：配置数据库备份和恢复验证

PostgreSQL 只绑定 `127.0.0.1:5432`。可以在 1Panel 数据库管理中把它作为本机 PostgreSQL 实例添加，再使用计划任务做数据库备份；如果当前版本不能直接识别外部 Compose 数据库，就使用 1Panel 的 Shell 计划任务执行 `pg_dump`。

备份至少做到：

- 每天自动备份 PostgreSQL。
- 设置保留份数，避免磁盘被填满。
- 同时保存到服务器之外的备份账号或对象存储。
- 备份 `deploy/docker-compose.yml`、非敏感配置说明和必要上传目录。
- 不只备份 Docker volume 的底层文件。

最重要的验收不是“任务显示成功”，而是：

```text
创建一份测试数据库
-> 导入最近备份
-> 检查表结构和文章数据
-> 记录恢复步骤和耗时
```

1Panel 系统快照、云服务器快照和 PostgreSQL 逻辑备份职责不同，不互相替代。

---

## 第 11 步：以后怎样更新

更新前：

1. 阅读本次变更和迁移。
2. 运行本地测试和生产构建。
3. 创建数据库备份。
4. 记录当前可回退的 Git commit。

服务器获取代码：

```bash
cd /opt/mini-cms
git pull --ff-only
docker compose --env-file deploy/.env -f deploy/docker-compose.yml config
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d --build
docker compose --env-file deploy/.env -f deploy/docker-compose.yml ps
```

然后检查：

```bash
curl https://api.example.com/api/articles/health
docker compose --env-file deploy/.env -f deploy/docker-compose.yml logs --tail=200 api
```

1Panel 用来观察容器、日志和资源状态。命令仍然写在文档中，是为了让更新过程可以复现，而不是只能记住“在面板点了哪里”。

回退旧代码不能自动撤销数据库迁移。需要在设计迁移时考虑向后兼容，并在高风险变更前验证恢复方案。

---

## 常见问题按层排查

| 现象 | 先检查 |
|---|---|
| 面板打不开 | 1Panel 服务、面板端口、云安全组、授权 IP、安全入口 |
| OpenResty 无法启动 | 80 / 443 是否被其他进程占用，应用日志 |
| 容器构建失败 | Node 版本、lockfile、Dockerfile、构建时环境变量 |
| API 容器反复重启 | 数据库健康、`DATABASE_URL`、迁移和 API 日志 |
| 服务器内部 API 正常，域名失败 | OpenResty 代理、网站状态、80 / 443、防火墙和 DNS |
| 页面打开但请求 API 失败 | `NEXT_PUBLIC_API_BASE_URL` 是否在构建时正确，CORS 和证书 |
| 登录后仍然 401 | Cookie 的 `Secure`、Domain、SameSite、前端 credentials 和 CORS |
| 重启后数据消失 | PostgreSQL volume 是否仍挂载，是否误删卷 |
| 证书续签失败 | ACME、DNS / HTTP 验证、80 端口和证书日志 |
| 备份任务成功但无法恢复 | 备份内容、数据库版本、压缩密码和恢复步骤 |

固定顺序：

```text
容器进程
-> 容器日志
-> 主机本地端口
-> OpenResty 反向代理
-> HTTPS 证书
-> 防火墙和安全组
-> DNS
-> 浏览器 CORS 和 Cookie
```

---

## 1Panel 没有替项目解决什么

- 不会自动补齐 `build`、`start` 和 `test`。
- 不会替 Express 设计 CORS、Cookie 和认证。
- 不会判断 Prisma 迁移是否安全。
- 不会自动保护提交到 Git 的密钥。
- 不会证明备份可以恢复。
- 不会让公开 5432 变得安全。
- 不会让 Docker Compose 和 README 变得可有可无。

本章使用面板是为了减少重复运维操作，同时保留对系统真实结构的理解。

---

## 最终验收

- 1Panel 使用强密码、MFA、HTTPS 和来源限制。
- 80、443 对公网开放，SSH 和面板端口限制来源。
- 3000、3001 和 5432 只绑定 `127.0.0.1`。
- `admin.example.com` 和 `api.example.com` 通过 HTTPS 可用。
- Compose 从仓库文件创建，真实 `.env` 不在 Git 中。
- PostgreSQL 使用持久卷，迁移使用 `prisma migrate deploy`。
- 重启 Compose 和服务器后，应用和数据仍然可用。
- 1Panel 能查看容器与网站日志。
- 自动备份已经执行，并完成一次恢复验证。
- 新服务器可以根据项目 README、Dockerfile、Compose 和环境变量重新部署。

完成后回到[第 10 章项目总览](./10-MiniCMS项目总览.md)完成阶段 8 验收。

## 官方参考

- [1Panel 在线安装](https://1panel.cn/docs/v2/installation/online_installation/)
- [1Panel 容器编排](https://1panel.cn/docs/v2/user_manual/containers/compose/)
- [1Panel 创建网站与反向代理](https://1panel.cn/docs/v2/user_manual/websites/website_create/)
- [1Panel 网站配置与 HTTPS](https://1panel.cn/docs/v2/user_manual/websites/website_config_basic/)
- [1Panel 证书管理](https://1panel.cn/docs/v2/user_manual/websites/certificate/)
- [1Panel 防火墙](https://1panel.cn/docs/v2/user_manual/hosts/firewall/)
- [1Panel 计划任务与备份](https://1panel.cn/docs/v2/user_manual/cronjobs/)
- [1Panel 面板设置](https://1panel.cn/docs/v2/user_manual/settings/)
- [Docker Compose](https://docs.docker.com/compose/)
- [PostgreSQL 官方镜像](https://hub.docker.com/_/postgres)
