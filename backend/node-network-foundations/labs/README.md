# Node.js 原理观察实验

使用 Node.js 24，只依赖内置模块，无需 npm install。以下命令从 `learning-notes` 仓库根目录执行；服务器只监听本机，不连接 MiniCMS 数据库。

| 文件 | 默认端口 | 对应章节 |
|---|---|---|
| [01-listen.mjs](./01-listen.mjs) | 4311 | [03：监听与连接](../03-服务怎样监听端口并等待请求.md)、[04：HTTP 交换](../04-一次请求怎样找到你的服务.md) |
| [02-http-body.mjs](./02-http-body.mjs) | 4312 | [05：请求体的字节与 JSON](../05-JSON怎样穿过网络变成req-body.md) |
| [03-event-loop.mjs](./03-event-loop.mjs) | 4313 | [06：异步等待与同步阻塞](../06-等待数据库时Nodejs在做什么.md) |
| [04-probe.mjs](./04-probe.mjs) | 连接 4313 | 给事件循环实验发送慢请求和健康检查 |

## 1. 观察监听

终端 A：

```bash
node backend/node-network-foundations/labs/01-listen.mjs
```

终端 B：

```bash
curl -i http://127.0.0.1:4311/api/health
curl -i http://127.0.0.1:4311/missing
```

应分别返回 200 和 404，终端 A 显示请求与连接两端信息。

## 2. 观察请求体

终端 A：

```bash
node backend/node-network-foundations/labs/02-http-body.mjs
```

终端 B：

```bash
curl -i http://127.0.0.1:4312/echo \
  -H 'Content-Type: application/json' \
  --data-binary '{"title":"文章"}'
```

应返回 200，包含 received、bytes、chunks。实验只做格式解析，不做文章字段校验；不是生产环境解析器。它最多收集 1024 字节，超限时读完正文后返回 413。

## 3. 比较等待与阻塞

终端 A：

```bash
node backend/node-network-foundations/labs/03-event-loop.mjs
```

终端 B：

```bash
node backend/node-network-foundations/labs/04-probe.mjs wait
node backend/node-network-foundations/labs/04-probe.mjs block
```

两组慢请求都约两秒，但 block 组的健康检查也会被延迟。实验中的同步循环只用于本地观察。

## 4. 换端口与结束

遇到 EADDRINUSE 时不要停止未知进程，给当前实验换端口。例如事件循环实验的服务器与客户端都设置同一个新端口：

```bash
# 终端 A
PORT=4413 node backend/node-network-foundations/labs/03-event-loop.mjs
```

```bash
# 终端 B
PORT=4413 node backend/node-network-foundations/labs/04-probe.mjs wait
```

每个服务器结束后在自己的终端按 `Ctrl+C`。观察客户端会自行退出。这些实验不创建数据库记录，也不生成需清理的项目文件。
