# 09. 打开 Docker 套娃：容器不是一台迷你云服务器

Docker Desktop 图标一点，PostgreSQL 就跑起来了。看起来像是 Mac 直接变出了一个 Linux 小服务器。

打开这只套娃，里面其实藏着不同层：

```text
我已经在用 Linux 了吗？
Docker 容器是不是一台小服务器？
```

先猜一次，再看答案：

```text
Mac 上：macOS -> Docker Desktop 的 Linux 虚拟机 -> 容器
Linux 上：Ubuntu -> Docker Engine -> 容器
```

这一章的第一轮练习回到 Mac，并使用已经熟悉的 Docker Desktop。原因很简单：现在要拆开容器心智模型，不顺便增加一套会随版本变化的 Docker Engine 安装流程。

先在 Mac 确认：

```bash
docker version
docker compose version
```

等 Mini CMS 进入真实部署阶段，后端第 18A 章会让 1Panel 在 Ubuntu 上管理 Docker 与 Compose。届时可以在服务器重复本章的 Nginx 实验；容器、镜像和端口映射的含义不会改变，只是少了一层 Docker Desktop 维护的隐藏 Linux 虚拟机。

## 套娃里还有五件道具

| 对象 | 作用 |
|---|---|
| Image | 创建容器的只读模板 |
| Container | 从镜像启动的隔离进程 |
| Volume | 独立于容器生命周期保存数据 |
| Network | 让容器按服务名互相通信 |
| Compose | 用一份配置组织多个服务 |

容器删除后，容器可写层中的数据可能消失；数据库必须使用明确的持久卷和备份。

---

## `127.0.0.1:5432:5432` 到底有几个 5432

```yaml
ports:
  - "127.0.0.1:5432:5432"
```

从左到右：

```text
主机监听地址
:
主机端口
:
容器端口
```

表示只有主机自己能通过 5432 进入 PostgreSQL 容器。

```yaml
ports:
  - "5432:5432"
```

通常会监听主机所有网络接口，是否可从公网进入还取决于防火墙和安全组。数据库不应该使用这种方式公开到互联网。

在 Linux 服务器上还要多记一件事：Docker 发布的端口可能绕过部分 UFW 规则。不能因为 UFW 没有放行 5432，就放心写成 `5432:5432`；数据库继续绑定 `127.0.0.1` 或只放进 Compose 内部网络，并同时检查云安全组与 Docker 规则。

---

## 两个容器都说 localhost，指的却不是对方

假设 Compose 有：

```yaml
services:
  api:
  postgres:
```

在 `api` 容器中：

```text
localhost -> api 容器自己
postgres:5432 -> 名为 postgres 的数据库服务
```

所以数据库地址通常是：

```text
postgresql://user:password@postgres:5432/database
```

不是 `localhost:5432`。

---

## 用 Compose 给全家拍一张合照

```text
Next.js 容器
Express 容器
PostgreSQL 容器
```

Compose 可以统一声明：

- Node.js 和 PostgreSQL 镜像版本。
- 环境变量来自哪里。
- 哪些端口只绑定在主机本地。
- PostgreSQL 数据卷。
- 服务依赖和健康检查。
- 重启策略。

面板可以启动和观察 Compose，但项目的运行关系仍然应该保存在 Compose 文件中。

---

## 让 Nginx 从套娃里探个头

```bash
docker run --rm -d --name linux-port-demo -p 127.0.0.1:8080:80 nginx
docker ps
curl http://127.0.0.1:8080
docker logs linux-port-demo
```

数据流：

```text
curl 访问主机 127.0.0.1:8080
-> Docker 转发到容器 80
-> Nginx 返回页面
```

`--rm` 让停止后的练习容器自动删除。

---

## 别急着删，先用手电筒照一圈

```bash
docker ps
docker images
docker volume ls
docker network ls
docker inspect linux-port-demo
docker stop linux-port-demo
docker ps -a --filter name=linux-port-demo
```

先观察状态，再停止。因为启动时使用了 `--rm`，`docker stop` 后练习容器会被删除，最后一条命令不应该再找到它。

等真实项目目录中已经有 `compose.yaml` 或 `docker-compose.yml`，才在那个目录执行：

```bash
docker compose ps
docker compose logs -f
```

本章没有创建 Compose 文件，所以这两条只负责预告第 10 章和后端部署实操，不属于当前 Nginx 练习。卷可能包含数据库数据，不根据“当前没挂载”就随意清理。

---

## Docker 再能干，也管不到这些事

容器不能替代：

- 云服务器实例。
- 云安全组和主机防火墙。
- 域名和 HTTPS。
- 数据库迁移和备份。
- 宿主机更新和磁盘监控。
- SSH 或其他救援入口。

容器里通常也不运行完整 systemd。容器的长期运行由 Docker 和 Compose 的重启策略管理。

## 套娃拆完以后

现在把这个地址从右往左读一遍：

```text
127.0.0.1:8080:80
```

容器中的 Nginx 监听 80，Docker 把它接到主机 8080，而且只让主机自己从 `127.0.0.1` 进入。

能顺手画出 `macOS → Linux 虚拟机 → 容器`，并让 API 使用 `postgres:5432` 找数据库，这只 Docker 套娃就不再神秘了。

下一站进入[第 10 章](./10-Nodejs-Nextjs-PostgreSQL怎样运行在线上.md)，把容器、反向代理、环境变量、迁移和备份拼成一张真正能指导部署的总装图。

## 路边资料

- [Docker：发布端口](https://docs.docker.com/get-started/docker-concepts/running-containers/publishing-ports/)
- [Docker：多容器应用](https://docs.docker.com/get-started/docker-concepts/running-containers/multi-container-applications/)
- [Docker Engine 与防火墙注意事项](https://docs.docker.com/engine/install/ubuntu/#firewall-limitations)
