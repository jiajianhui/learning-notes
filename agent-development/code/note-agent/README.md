# 本地学习笔记助手：配套代码

这是 `agent-development` 系列的完整对照项目，独立于 Mini CMS。逐步实现请从[系列入口](../../README.md)阅读；本文件负责启动和查命令。

使用 Node.js 24（24.14 或更高的 24.x）、TypeScript 和 Node 内置模块。Node 直接运行 `.ts`，`tsc` 单独检查类型；没有运行时 npm 依赖。

```bash
npm ci
npm run start -- search 事务
npm run start -- read database.md
npm run demo
npm run demo:failure
npm run check
```

在本目录执行命令。`demo` 使用固定的模拟模型回复、真实文件工具和临时目录，不需要 API Key，不会修改样例笔记。它证明执行流程能跑通，不能证明真实模型的回答质量。

`demo:failure` 注入两种离线故障：模型请求失败、工具连续失败直到轮次耗尽。它展示失败轮次的 `outcome` 与 `errorCode`，不调用网络或修改笔记。

## 使用真实模型

复制 `.env.example` 为 `.env`，在本机编辑 Key 和模型名，选择账号可用且支持 Responses API 函数调用的模型。模型名没有预设，避免把某个价格和能力会变化的型号写死。

```bash
cp .env.example .env
npm run start -- summarize database.md
npm run start -- ask "事务与重试有什么关系？请引用笔记文件名。"
npm run start -- propose "把 database.md 中的‘事务让多步修改一起成功或失败。’改写得更易懂，保持原意。"
```

“本地”指工具读取本地文件；真实模型使用 OpenAI 云端 API，被读取的笔记会随请求发送到 API。先使用仓库里的虚构样例。当前实现用 `previous_response_id` 衔接服务端保存的响应，每次 CLI 调用都是新任务，不做跨任务记忆。

`propose` 只保存建议，终端会显示建议 ID、前后差异及后续命令。把下列 `建议ID` 替换成实际值：

```bash
npm run start -- preview 建议ID
npm run start -- apply 建议ID --yes
```

只有带 `--yes` 的 `apply` 命令会写回笔记；模型没有这个工具。原文若已变化，旧建议会被拒绝。

## 范围和文件

- 默认读取 `notes/` 顶层的普通 `.md` 文件，忽略子目录、隐藏文件和符号链接。
- 单篇最多 16 KiB，最多扫描 50 篇；关键词搜索最多返回 5 条短摘录。第一版不处理整个大型知识库。
- `.note-agent/proposals/` 保存建议，`.note-agent/runs/` 保存模型名、时间、命令、轮次、工具名、停止原因、耗时和 token 用量，不记录 Key 或正文。它是轻量诊断日志，不包含完整请求，不能独立重放任务。
- `src/notes.ts`：搜索、读取、建议和确认写入。
- `src/tools.ts`：工具说明、参数检查与执行分发。
- `src/model.ts`：HTTP 调用与响应检查。
- `src/agent.ts`：执行循环。
- `src/cli.ts`：命令入口。
- `test/`：离线测试；真实模型评估使用[评估表](../../evals/用例与记录.md)。

可通过 `NOTES_DIR` 选择另一个笔记目录。这里的边界检查面向单用户教学练习，不是多用户文件服务器或隔离沙箱；运行时不要让其他程序同时替换文件。

日志中的 `status: completed` 仅表示正常返回答案，`verification: not_evaluated` 表示效果尚未评分。每轮 `outcome` 分为 `continue`、`answer`、`error`；`errorCode` 区分 `model_request_failed`、`model_incomplete`、`empty_answer`、`round_limit` 等原因。

## 独立开发练习

Worktree 和 PR 练习需要把此目录复制成仓库外的独立项目，再初始化 Git，具体见[第 03 章](../../03-给任务独立的工作台.md)。不要在本目录创建嵌套 Git 仓库。

`ci/quality.yml` 是独立项目的 CI 模板；复制到独立仓库的 `.github/workflows/quality.yml` 后才会运行。学习笔记仓库不自动启用它。
