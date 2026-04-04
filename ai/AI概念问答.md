# AI 概念问答

这份文档用于记录在学习和使用 AI 工具过程中遇到的概念问题，后续可以持续追加。

## 1. 在 Codex CLI 里，skill 是什么？

可以先把 `skill` 理解成：

`给 Codex 的专项工作说明书`

它不是传统意义上的代码库、插件包或 npm 依赖，更像是一套可复用的任务方法。

一个 skill 通常会告诉 Codex：

- 什么场景下应该使用它
- 遇到这类任务时推荐怎么做
- 需要优先看哪些资料
- 需要遵守哪些规则
- 是否要配合脚本、参考文档、模板文件一起使用

所以从作用上看，skill 更像：

- 任务 SOP
- 经验包
- 专项提示词
- 工作流程说明

## 2. 在 Codex CLI 里，skill 是怎么被使用的？

最简单的理解是：

`用户提任务 -> Codex 判断是否需要某个 skill -> 读取对应的 SKILL.md -> 按其中的流程执行`

常见有两种触发方式：

### 2.1 显式指定

用户直接在请求里点名某个 skill。

例如：

```text
用 skill-creator 帮我创建一个 skill，名字叫 login-bug-locator。
```

这时 Codex 会优先读取 `skill-creator` 对应的 `SKILL.md`，再按里面的规范处理任务。

### 2.2 按任务语义自动匹配

用户没有点名 skill，但任务本身和某个 skill 的描述高度匹配。

例如：

```text
帮我把一段会议记录整理成结构化知识文档。
```

如果环境里有适合这类任务的 skill，Codex 可能会自动读取它并使用。

所以在实际体验上，skill 不一定总是“手动加载”，很多时候是：

`你点名使用，或者系统根据任务匹配后使用。`

## 3. skill 文件里通常有什么？

一个最小 skill 至少会有一个 `SKILL.md` 文件。

常见结构如下：

```text
your-skill/
├── SKILL.md
├── references/
├── scripts/
└── assets/
```

其中最核心的是：

- `SKILL.md`：技能的入口说明
- `references/`：补充资料
- `scripts/`：可重复执行的脚本
- `assets/`：模板、素材等输出资源

## 4. `SKILL.md` 是干什么的？

`SKILL.md` 是 skill 的核心文件。

它通常包含两部分：

### 4.1 元信息

一般写在 YAML frontmatter 里，例如：

```md
---
name: bug-triage
description: Use this skill when the user asks to locate likely files, trace call paths, and narrow down bug-related code in an unfamiliar repository.
---
```

这里最重要的是：

- `name`
- `description`

因为 Codex 会根据这些信息判断这个 skill 在什么场景下可能有用。

### 4.2 正文说明

正文部分会描述这类任务应该怎么做。

例如：

- 先搜索哪些关键词
- 如何缩小范围
- 哪些操作要优先
- 哪些误区要避免

## 5. skill 和普通代码/插件有什么区别？

可以这样区分：

- `普通代码`：直接执行功能
- `plugin`：一组能力的打包，里面可能包含 skill、MCP、连接器等
- `skill`：告诉 Codex“做这类事时应该遵循什么方法”

所以 skill 更偏“方法和规则”，不一定自己完成底层执行。

## 6. 一个简单 demo

假设有一个 skill 叫 `bug-triage`，作用是快速定位 bug 相关代码。

用户可以这样用：

```text
使用 bug-triage，帮我定位登录失败可能相关的文件，不要先改代码。
```

Codex 可能会按这个 skill 的规则去做：

1. 搜索 `login`、`auth`、`session`、`token`
2. 找到登录入口页面、接口、认证中间件
3. 沿调用链继续追踪相关文件
4. 只阅读必要代码，不盲目扫全仓库
5. 最后总结可能的修复点

所以 skill 的价值在于：

`让某类任务的处理方式更稳定、更像有经验的人在做。`

## 7. 一句话总结

在 Codex CLI 里，`skill` 可以理解成：

`让 Codex 在某类任务上按固定经验、规则和流程做事的能力说明书。`
