# GitHub 核心功能速查

## 1. 先一句话理解

GitHub = `Git` + `远程协作平台`

- `Git`：本地版本管理
- `GitHub`：代码托管、协作、审查、自动化、发布

如果你现在只会 `commit` 和 `branch`，下一步最值得学的是：

`PR + Issue + Actions`

---

## 2. GitHub 核心模块

| 模块 | 作用 | 你可以怎么理解 |
|---|---|---|
| Repository | 仓库 | 项目的总容器 |
| Branch | 分支 | 独立开发线 |
| Commit | 提交 | 一次保存 |
| Pull Request | PR | 合并申请 |
| Review | 审查 | 合并前检查代码 |
| Issue | 任务/问题 | 要做什么 |
| Actions | 自动化 | 自动跑检查、构建、部署 |
| Workflow | 自动化流程 | Actions 的配置文件 |
| Release | 发布版本 | 正式版本记录 |
| Tag | 版本标记 | 某次提交的版本点 |

---

## 3. 最核心的几个概念

### 3.1 Repository

- 一个项目通常对应一个仓库
- 仓库里有代码、提交记录、分支、Issue、PR、Actions
- 仓库可以是 `public` 或 `private`

---

### 3.2 Branch

- `main`：主分支，通常放稳定代码
- `feature/*`：新功能分支
- `fix/*`：修复分支

最实用的理解：

- 新功能通常新建一个分支
- 一个分支最好只做一件事
- 合并后通常删除该分支

常见起手动作：

```bash
git checkout main
git pull
git checkout -b feature/login
```

意思是：

- 先切到 `main`
- 先同步最新代码
- 再基于最新 `main` 创建新分支

---

### 3.3 Pull Request / PR

PR 可以直接理解成：

`合并申请`

它的意思不是你执行了 `git pull`，而是：

`请求目标分支把我的改动拉进去`

例如：

`feature/login -> main`

表示：

`请把 feature/login 的改动合并进 main`

PR 的作用：

- 看这次改了什么
- 看代码差异
- 让别人 review
- 跑自动检查
- 审核通过后再合并

---

### 3.4 Review

Review 通常发生在 PR 里。

作用：

- 找 bug
- 看实现是否合理
- 保持代码风格一致

常见结果：

- `Comment`
- `Approve`
- `Request changes`

---

### 3.5 Issue

Issue 用来记录：

- bug
- 需求
- 待办事项
- 技术讨论

最简单的理解：

- `Issue`：要做什么
- `PR`：怎么改的代码

---

### 3.6 Actions / Workflow

`GitHub Actions` 是 GitHub 的自动化系统。  
`Workflow` 是 Actions 的配置流程。

常见用途：

- push 后自动测试
- PR 后自动检查
- 自动构建
- 自动部署

配置文件一般在：

`.github/workflows/*.yml`

只先记 3 个词：

- `workflow`：整套自动流程
- `job`：流程里的一项任务
- `step`：任务里的具体步骤

最简单的例子：

```yaml
name: test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm test
```

---

### 3.7 Release / Tag

- `commit`：一次提交
- `tag`：给某次提交做版本标记
- `release`：一个正式发布版本

例如：

`v1.0.0`

---

## 4. 个人项目最实用的流程

```text
main
  -> 新建功能分支
  -> 开发并 commit
  -> 发起 PR
  -> 看 diff / review
  -> Actions 自动检查
  -> merge 回 main
  -> 删除功能分支
```

即使是个人项目，也建议这么做。

好处：

- 改动更清楚
- 更不容易误改
- 回顾更方便

---

## 5. Git 常用命令速查

| 命令 | 作用 | 你可以怎么理解 |
|---|---|---|
| `git status` | 看当前状态 | 现在仓库是什么情况 |
| `git branch` | 看本地分支 | 我有哪些分支 |
| `git branch -a` | 看所有分支 | 本地和远程有哪些分支 |
| `git checkout branch-name` | 切换分支 | 切到另一条开发线 |
| `git checkout -b feature/login` | 新建并切换分支 | 拉一条新开发线 |
| `git add .` | 添加改动 | 放进待提交区 |
| `git commit -m "..."` | 提交代码 | 保存一次版本 |
| `git pull` | 拉取远程更新 | 把最新代码拉下来 |
| `git push` | 推送本地提交 | 把本地代码传到仓库 |
| `git push -u origin feature/login` | 首次推送新分支 | 把新分支发到远程并建立关联 |
| `git log --oneline` | 看提交历史 | 看之前提交过什么 |
| `git diff` | 看改动内容 | 看你改了哪些地方 |
| `git branch -d feature/login` | 删除本地分支 | 删除已用完的分支 |

最常用的一组命令：

`git pull -> git checkout -b feature/xxx -> git add . -> git commit -m "..." -> git push -u origin feature/xxx`

---

## 6. 参与开源项目的流程

和个人项目很像，但通常会多一个 `fork`。

常见流程：

1. `fork` 原项目到你自己的 GitHub
2. `clone` 你自己的 fork 到本地
3. 从本地 `main` 拉一个新分支
4. 修改代码并 `commit`
5. `push` 到 GitHub 上你自己 fork 仓库里的功能分支
6. 从你的功能分支向原项目的 `main` 发起 `PR`
7. 等待 review
8. 由维护者决定是否 `merge`

最重要的理解：

- 你通常不能直接 `push` 到原项目的 `main`
- 你是先 `push` 到 GitHub 上你自己 fork 仓库里的功能分支
- 再由维护者把你的 PR `merge` 到原项目

可以这样记：

`your-fork/feature/xxx -> upstream/main`

---

## 7. 参与开源项目的要点

开始前先看：

- `README`
- `CONTRIBUTING.md`
- 当前的 Issue 和 PR

优先选这些任务：

- `good first issue`
- `help wanted`
- 文档修复
- 小 bug

提 PR 时注意：

- 一个 PR 只做一件事
- 标题和说明写清楚
- 按项目模板填写
- 不夹带无关改动

第一次参与开源，建议先从：

- 文档
- 错别字
- 示例代码

开始。

---

## 8. 初学者可参与的开源项目

优先选这类项目：

- 活跃
- 有 `CONTRIBUTING` 文档
- 明确欢迎新手贡献
- 有 `good first issue`

比较适合起步的入口：

| 项目 / 入口 | 适合原因 | 链接 |
|---|---|---|
| First Contributions | 专门练第一次 PR | https://github.com/firstcontributions/first-contributions |
| Up For Grabs | 收集新手可做的任务 | https://github.com/up-for-grabs/up-for-grabs.net |
| GitHub Docs | 文档仓库，贡献路径清晰 | https://github.com/github/docs |
| MDN Content | 适合文档和内容修改 | https://github.com/mdn/content |
| VS Code | 有 `good first issue` 和明确贡献说明 | https://github.com/microsoft/vscode/wiki/How-to-Contribute |

建议：

- 第一次贡献：`First Contributions`
- 想找新手任务：`Up For Grabs`
- 想练文档型贡献：`GitHub Docs` 或 `MDN Content`

GitHub 官方找项目说明：

https://docs.github.com/articles/finding-open-source-projects-on-github

---

## 9. 先学什么

建议顺序：

1. 分支的基本使用
2. PR 的创建、查看 diff、合并
3. Issue 的基本使用
4. Actions 和 Workflow 的基本概念
5. Release / Tag

---

## 10. 一句话总结

GitHub 不只是“存代码”，它的核心价值是：

`围绕代码，提供协作、审查、任务管理、自动化和发布。`
