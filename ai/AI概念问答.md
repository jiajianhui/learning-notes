# AI 概念问答

这份文档用于记录学习和使用 AI 工具时遇到的核心概念。

## 1. Skill

### 1.1 skill 是什么？

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

### 1.2 skill 是怎么被使用的？

最简单的理解是：

`用户提任务 -> Codex 判断是否需要某个 skill -> 读取对应的 SKILL.md -> 按其中的流程执行`

常见有两种触发方式。

#### 1.2.1 显式指定

用户直接在请求里点名某个 skill。

例如：

```text
用 skill-creator 帮我创建一个 skill，名字叫 login-bug-locator。
```

这时 Codex 会优先读取 `skill-creator` 对应的 `SKILL.md`，再按里面的规范处理任务。

#### 1.2.2 按任务语义自动匹配

用户没有点名 skill，但任务本身和某个 skill 的描述高度匹配。

例如：

```text
帮我把一段会议记录整理成结构化知识文档。
```

如果环境里有适合这类任务的 skill，Codex 可能会自动读取它并使用。

所以在实际体验上，skill 不一定总是“手动加载”，很多时候是：

`你点名使用，或者系统根据任务匹配后使用。`

### 1.3 skill 文件里通常有什么？

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

- `SKILL.md`：技能入口说明
- `references/`：补充资料
- `scripts/`：可重复执行的脚本
- `assets/`：模板、素材等输出资源

### 1.4 `SKILL.md` 是干什么的？

`SKILL.md` 是 skill 的核心文件，通常包含两部分。

#### 1.4.1 元信息

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

#### 1.4.2 正文说明

正文部分会描述这类任务应该怎么做。

例如：

- 先搜索哪些关键词
- 如何缩小范围
- 哪些操作要优先
- 哪些误区要避免

### 1.5 skill 和普通代码、plugin 有什么区别？

可以这样区分：

- `普通代码`：直接执行功能
- `plugin`：一组能力的打包，里面可能包含 skill、MCP、连接器等
- `skill`：告诉 Codex“做这类事时应该遵循什么方法”

所以 skill 更偏“方法和规则”，不一定自己完成底层执行。

### 1.6 一个简单示例

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

### 1.7 一句话总结

在 Codex CLI 里，`skill` 可以理解成：

`让 Codex 在某类任务上按固定经验、规则和流程做事的能力说明书。`

## 2. Tool Calling

### 2.1 什么是 `tool calling`？

`tool calling` 可以先理解成：

`让模型在需要时，先提出“该调用哪个工具、传什么参数”，再由外部程序真正执行。`

它的重点是：

- 模型负责判断是否需要工具
- 模型负责生成工具名和参数
- 你的程序负责真正执行
- 执行结果再返回给模型继续处理

所以它不是“模型自己动手做事”，而是：

`模型负责决策，程序负责执行。`

### 2.2 为什么需要 `tool calling`？

因为模型本身通常不能直接做这些事：

- 查数据库
- 调后端接口
- 发消息
- 查实时天气
- 写入外部系统

如果没有 `tool calling`，模型只能“说它应该怎么做”，但不一定真的能做。

### 2.3 `tool calling` 的基本流程

最常见的流程可以记成 5 步：

1. 你的程序把可用工具描述给模型
2. 模型判断是否要调用工具
3. 模型返回工具名和参数
4. 你的程序真正执行工具
5. 你的程序把执行结果再发给模型，模型继续生成最终回答

可以简化理解成：

```text
用户提问
-> 模型决定是否调用工具
-> 程序执行工具
-> 工具结果返回模型
-> 模型输出答案
```

### 2.4 一个最简单的例子

比如用户问：

```text
上海今天天气怎么样？
```

如果系统里有 `get_weather` 这个工具，那么流程可能是：

1. 模型判断这个问题需要查实时信息
2. 模型返回想调用 `get_weather`
3. 你的程序真正去查天气
4. 查到结果后再发回模型
5. 模型再组织成自然语言回答用户

所以这里真正查天气的不是模型，而是外部程序。

### 2.5 `function calling` 和 `tool calling` 一样吗？

不完全一样。

最简单的记法是：

- `tool calling`：更大的概念
- `function calling`：其中一种常见实现方式

也就是说：

`function calling` 是 `tool calling` 的一个子集。

更直观地看：

- `tool calling` 强调的是：模型可以调用外部能力
- `function calling` 强调的是：这些外部能力以“函数接口”的形式描述给模型

### 2.6 按一次网络请求来理解 `tool calling`

例如用户问：

```text
上海今天天气怎么样？
```

整条链路是：

```text
前端 -> 服务端 -> 模型 -> 服务端 -> 工具 -> 服务端 -> 模型 -> 前端
```

**步骤 1：前端把问题发给你的服务**

```js
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
});
```

这一步只是把用户问题送到后端。

**步骤 2：服务端把“问题 + 可用工具”发给模型**

```js
const firstResponse = await client.responses.create({
  model: "gpt-4.1",
  input: userMessage,
  tools: [
    {
      type: "function",
      name: "get_weather",
      description: "查询指定城市天气",
      parameters: {
        type: "object",
        properties: {
          location: { type: "string" }
        },
        required: ["location"],
        additionalProperties: false
      }
    }
  ]
});
```

这一步是在问模型：

`这个问题要不要调用工具？`

**步骤 3：模型返回要调用的工具和参数**

```js
const toolCall = firstResponse.output.find(
  (item) => item.type === "function_call"
);

if (!toolCall) {
  return res.json({ answer: firstResponse.output_text });
}
```

这里还没有真的查天气，只是先判断模型有没有发起工具调用。

**步骤 4：服务端真正执行工具**

```js
const args = JSON.parse(toolCall.arguments);
const weatherResult = await getWeather(args.location);
```

这一步才是真正去查天气、查数据库或调后端接口。

**步骤 5：服务端把工具结果再发给模型**

```js
const finalResponse = await client.responses.create({
  model: "gpt-4.1",
  previous_response_id: firstResponse.id,
  input: [
    {
      type: "function_call_output",
      call_id: toolCall.call_id,
      output: JSON.stringify(weatherResult)
    }
  ]
});
```

这一步是在告诉模型：

`工具已经执行完了，请基于结果生成最终回答。`

**步骤 6：服务端把最终回答返回给前端**

```js
res.json({ answer: finalResponse.output_text });
```

例如最终返回：

```text
上海今天 24°C，多云。
```

### 2.7 一个更完整的示例

```js
import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function getWeather(location) {
  return {
    location,
    temperature: 24,
    condition: "多云"
  };
}

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  const firstResponse = await client.responses.create({
    model: "gpt-4.1",
    input: userMessage,
    tools: [
      {
        type: "function",
        name: "get_weather",
        description: "查询指定城市天气",
        parameters: {
          type: "object",
          properties: {
            location: { type: "string" }
          },
          required: ["location"],
          additionalProperties: false
        }
      }
    ]
  });

  const toolCall = firstResponse.output.find(
    (item) => item.type === "function_call"
  );

  if (!toolCall) {
    return res.json({ answer: firstResponse.output_text });
  }

  const args = JSON.parse(toolCall.arguments);
  const weatherResult = await getWeather(args.location);

  const finalResponse = await client.responses.create({
    model: "gpt-4.1",
    previous_response_id: firstResponse.id,
    input: [
      {
        type: "function_call_output",
        call_id: toolCall.call_id,
        output: JSON.stringify(weatherResult)
      }
    ]
  });

  return res.json({ answer: finalResponse.output_text });
});
```

### 2.8 一句话总结

`tool calling` 就是：模型决定调用什么工具，外部程序真正执行，再把结果回给模型。`
