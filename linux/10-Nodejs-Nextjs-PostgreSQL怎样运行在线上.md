# 10. 把网站装上发射架：Next.js、Express 与 PostgreSQL 在线上碰头

前面捡到的东西看起来很散：Linux、SSH、端口、Docker、域名、证书。现在把它们全部摆上桌，拼成一张能指导网站从浏览器走到数据库的总装图：

```text
浏览器
-> HTTPS 域名
-> 反向代理
-> Next.js 页面或 Express API
-> Prisma
-> PostgreSQL
```

这一章把前面的 Linux 基础串到当前 Mini CMS：谁接收请求、谁运行代码、谁保存数据。具体 Dockerfile、Compose 和面板操作集中在[后端 20A](../backend/backend-system-learning/20A-用1Panel和Docker-Compose部署MiniCMS.md)，这里先看懂它们为什么这样配合。

## 先把所有角色请到同一张桌上

```text
互联网
├── admin.example.com:443
└── api.example.com:443
          ↓
云安全组和 UFW
          ↓
1Panel 管理的 OpenResty
├── 127.0.0.1:3000 -> Next.js 容器
└── 127.0.0.1:3001 -> Express 容器
                          ↓
                 postgres:5432（PostgreSQL 容器）
                          ↓
                     PostgreSQL 数据卷
```

公网只需要 80、443 和受限的管理入口。应用端口和数据库端口留在服务器内部。

---

## 前后端上线时分别怎样启动

开发时的 `dev` 会监听代码变化，方便修改后立即查看结果。当前 Mini CMS 上线使用下面的启动方式：

| 项目 | 上线时怎样运行 |
|---|---|
| Express：`server` | `npm run start` 执行 `tsx src/server.ts`，直接运行 TypeScript 源码，不监听修改 |
| Next.js：`admin-web-antd` | 先用 `npm run build` 生成 `.next`，再用 `npm run start` 启动 Next.js 服务 |

**当前 Express 项目通过 `tsx` 运行，不需要先生成 `dist`；Next.js 则需要先构建。** 第 20 章已经在本地试过这两条启动路径。

20A 将安装依赖、生成 Prisma Client、构建 Next.js 写进 Dockerfile；容器启动时，API 先应用已有数据库迁移，再执行 `start`。Compose 保存启动命令和重启策略，Docker 持续管理容器，退出 SSH 后应用仍然运行。

具体命令见[第 20 章：前后端上线时分别怎样启动](../backend/backend-system-learning/20-从开发环境到线上运行.md#2-前后端上线时分别怎样启动)。

---

## 有些变量上车前就要写好

当前 Express 运行时读取：

- `DATABASE_URL`。
- `PORT`。
- `NODE_ENV`：生产环境设为 `production`，当前项目据此设置 Cookie 的 `Secure`。
- `ADMIN_WEB_ORIGIN`：允许访问管理 API 的管理端来源。

Next.js 浏览器端公开变量常在构建时写入静态资源，例如：

```text
NEXT_PUBLIC_API_BASE_URL
```

这个值会进入浏览器端构建结果。改变正式 API 地址后，需要重新构建管理端；只改容器启动时的变量，不会改写已经生成的代码。

真实 `.env` 不进入 Git。`.env.example` 只保留字段名和非敏感示例。

---

## 数据库醒了，不代表表结构已经就位

```text
PostgreSQL 容器启动
-> 数据库进程可以接受连接

prisma migrate deploy
-> 按仓库中已有迁移更新生产表结构
```

生产环境不使用 `prisma migrate dev` 创建临时迁移。修改结构前先确认备份，迁移成功也不代表业务数据已经验证。

---

## OpenResty 怎样把请求交给应用

第 08 章已经讲过[反向代理与 HTTPS](./08-云服务器网络安全组与防火墙.md#一次-https-请求怎样到达-express)。在当前项目中，OpenResty 接收公网 80、443 的请求，处理 HTTPS，再按域名选择目标：`admin.example.com` 交给 Next.js，`api.example.com` 交给 Express。

Express 继续负责登录验证、业务处理和数据库读写。排错时可以分别查看 OpenResty 的入口日志和 API 容器的应用日志，判断请求在哪一步失败。

---

## 1Panel 给你按钮，但运行关系仍要留在代码里

例如使用 1Panel 时，可以通过它管理：

```text
Docker Compose
OpenResty 反向代理
SSL 证书
防火墙
日志与备份任务
```

项目仍应保留 Dockerfile、Compose、环境变量示例、迁移和启动命令。换一台 Linux 服务器时，不能只有原面板中的点击记录。

---

## 上线不等于故事结束

先在服务器内部请求已有的公开文章接口：

```bash
curl -i http://127.0.0.1:3001/api/public/articles
```

返回 `200`，且 JSON 包含 `data`、`pagination`，说明这次请求已由 Express 处理并完成数据库查询。没有已发布文章时，`data` 可以是空数组。这与 20A 的验证方式一致。

你当前工程的 `/api/health` 只返回服务运行状态，没有查询数据库。因此它能检查 API 是否响应，公开文章接口还能检查数据库读取；两者都不能替代登录、保存和重新打开文章的业务验证。

日志至少回答：

- 哪个方法和路径被请求。
- 返回什么状态码。
- 花了多长时间。
- 未知错误在服务器内部是什么。

当前 Mini CMS 的文章、标签、管理员和会话保存在 PostgreSQL 中，使用数据库逻辑备份导出结构和数据；Dockerfile、Compose、示例配置和恢复步骤保存在 Git 与 README 中。

数据卷保存正在使用的数据，备份提供能够恢复的历史副本。按[20A 第 10 步](../backend/backend-system-learning/20A-用1Panel和Docker-Compose部署MiniCMS.md#第-10-步配置数据库备份和恢复验证)完成导出、恢复到测试库、查询文章，再设置每日备份和服务器之外的副本。

---

## 第一次搬家与以后换家具

首次部署：

```text
准备服务器和网络
-> 获取固定版本代码
-> 写入生产环境变量
-> 构建镜像
-> 启动数据库
-> 应用迁移
-> 启动应用
-> 配置反向代理和 HTTPS
-> 外部验证
-> 配置备份并做恢复测试
```

更新：

```text
确认版本和变更
-> 备份数据
-> 获取新代码
-> 重建镜像
-> 应用迁移
-> 替换容器
-> 检查接口、日志和业务链路
```

回滚代码不一定能回滚数据库结构。发布前要判断迁移是否向后兼容。

---

## 上线前的口头彩排

不看图，从浏览器开始讲一遍：

```text
HTTPS 请求怎样从 443 到达 Next.js 或 Express？
Express 为什么用 postgres:5432，而不是 localhost？
哪个变量必须在 Next.js 构建前确定？
数据库启动、迁移、备份和恢复分别发生什么？
如果页面突然打不开，去哪里看第一条线索？
```

能把这段故事讲顺，进入面板实操后就不会只剩下一串点击；你会知道一套 Web 应用为什么能在线上活着。

## 从发射架走到真的上线

这套 Linux 路线的完成标准是：你能看懂服务器环境，并能判断一次部署中的文件、用户、进程、端口、容器与网络分别出了什么问题。

真实上线属于 Mini CMS 项目的最终阶段，按这个顺序继续：

1. 阅读[后端第 20 章：从本地到服务器，上线前需要改什么](../backend/backend-system-learning/20-从开发环境到线上运行.md)，理解启动、配置和数据库的差别，在本地试过前后端启动命令。
2. 使用[后端第 20A 章：用 1Panel 和 Docker Compose 部署 Mini CMS](../backend/backend-system-learning/20A-用1Panel和Docker-Compose部署MiniCMS.md)，在真实服务器配置 Compose、OpenResty、HTTPS 和备份。
3. 从外部浏览器打开正式域名，完成登录、保存和重新打开文章，再检查公开接口、容器状态与日志。

```text
Linux 00～10
-> 看懂和掌控运行环境

后端 20 / 20A
-> 把已经完成的 Mini CMS 真正部署上去
```

当 HTTPS 页面能打开、文章管理和公开阅读可用、数据库备份也完成一次恢复验证，这趟“从 Mac 出发，去 Linux 里跑一个网站”的旅程才算真正抵达。
