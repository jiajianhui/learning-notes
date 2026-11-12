# 12. 评估进阶：怎样证明一次改动确实有帮助？

## 从“这一题答得不错”，走到可比较的证据

第 07 章区分了程序测试和模型效果。这一章把检索问题单独拿出来，做一次可复现比较。

像修改教学方法后不能只展示一个高分学生，我们也不能只挑一条成功查询。先固定题目、正确资料和评分方法，再比较改动。这样即使结果没有提高，也能知道哪里没改善。

继续使用自己的练习目录和第 09 章检索代码，新建 `evaluate.ts`。题目直接写在文件内，不需要另建数据目录：

<details>
<summary>展开 evaluate.ts 完整内容</summary>

<!-- file: evaluate.ts -->
```ts
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { search, type Strategy } from './retrieval.ts';

export type Case = { id: string; split: 'dev' | 'holdout'; query: string; relevant: string[] };
export const cases: Case[] = [
  {"id":"d1","split":"dev","query":"事务","relevant":["transaction"]},
  {"id":"d2","split":"dev","query":"失败后再试一次","relevant":["retry"]},
  {"id":"d3","split":"dev","query":"同一个操作提交两遍","relevant":["idempotency"]},
  {"id":"d4","split":"dev","query":"火星城市人口","relevant":[]},
  {"id":"h1","split":"holdout","query":"访问控制","relevant":["permission"]},
  {"id":"h2","split":"holdout","query":"缓存","relevant":["cache"]}
];
export function evaluate(selected: Case[], strategy: Strategy, k = 3) {
  const rows = selected.map(item => {
    const found = [...new Set(search(item.query, strategy, k).map(x => x.id))];
    const hits = item.relevant.filter(id => found.includes(id));
    const first = found.findIndex(id => item.relevant.includes(id));
    return { ...item, found, recall: item.relevant.length ? hits.length / item.relevant.length : null,
      reciprocalRank: item.relevant.length ? (first < 0 ? 0 : 1 / (first + 1)) : null,
      correctlyEmpty: item.relevant.length ? null : found.length === 0 };
  });
  const positive = rows.filter(x => x.recall !== null);
  const negative = rows.filter(x => x.correctlyEmpty !== null);
  return { strategy, k, cases: rows.length, positiveCases: positive.length, noAnswerCases: negative.length,
    meanRecallAtK: positive.length ? positive.reduce((sum, x) => sum + x.recall!, 0) / positive.length : null,
    meanReciprocalRank: positive.length ? positive.reduce((sum, x) => sum + x.reciprocalRank!, 0) / positive.length : null,
    noAnswerCorrect: negative.length ? negative.filter(x => x.correctlyEmpty).length / negative.length : null,
    rows };
}
if (resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const split = args.length === 0 ? 'dev' : args.length === 2 && args[0] === '--split' ? args[1] : '';
  if (split !== 'dev' && split !== 'holdout') throw new Error('用法：node evaluate.ts [--split dev|holdout]');
  const report = { at: new Date().toISOString(), split, dataset: 'evaluate.ts 中的固定六题',
    note: '人工构造的极小检索教学集，不是回答正确率或泛化能力证明',
    results: (['literal', 'expanded'] as const).map(strategy => evaluate(cases.filter(x => x.split === split), strategy)) };
  await mkdir('.runs', { recursive: true });
  const file = `.runs/retrieval-${split}.json`;
  await writeFile(file, JSON.stringify(report, null, 2));
  console.table(report.results.map(({ rows, ...summary }) => summary));
  console.log(`逐题结果：${file}；再次运行会覆盖同组记录，比较前请另存。`);
}
```

</details>

执行：

```bash
node evaluate.ts
```

程序使用文件中标为 `dev` 的四道开发题，对比字面搜索 `literal` 与规则扩展 `expanded`，输出汇总和 `.runs/retrieval-dev.json`。文件记录日期、策略、k 和逐题候选；再次运行会覆盖同组报告，比较前请另存。

## 先看一题，再读指标名字

问题“失败后再试一次”的标注资料是 `retry`。字面搜索没有命中；规则扩展把问题映射到“重试”，命中了它。

- **Recall@k（召回率）**：应找到的相关资料中，前 k 个候选找到了多少？本例按文档 ID 去重；每道有答案的题只有一个相关文档，因此该题找到是 1，没找到是 0。
- **MRR（平均倒数排名）**：第一个相关文档排第几？排第一记 1，第二记 1/2，前 k 个候选里没找到记 0，再对有答案的题求平均。
- **无答案题的空结果比例**：对于标注为无相关资料的题，系统是否返回空候选？它单独计算，不把“什么都没查到”混成高召回率。

本例默认 `k=3`，先取最多三个片段，再按文档 ID 去重计算。语料很小，每篇默认只有一个片段；扩展语料后要重新明确按片段还是按文档评分。

打开报告，手算 `d2` 的分数，再和代码 `evaluate()` 对照。这比只看总分更容易发现指标是否回答了你关心的问题。

## 开发题提升后，检查没用来调规则的题

```bash
node evaluate.ts --split holdout
```

`holdout` 是留出组，可以理解为练习册之外的检查题。两条扩展规则根据开发题写出；留出组的“访问控制”仍搜不到权限文档，“缓存”可以命中。

当前固定教学数据的预期是：

| 题组 | 字面搜索的平均 Recall@3 | 规则扩展的平均 Recall@3 |
|---|---|---|
| 开发组的 3 道有答案题 | 1/3 | 1 |
| 留出组的 2 道有答案题 | 1/2 | 1/2 |

开发组另有一道无答案题，两种方法都为空；留出组没有无答案题，所以这一项显示 `null`，不能写成 100%。

这个结果说明两条规则修好了已知表达，没有证明一般语义检索已经变好。题目只有六道，且是作者构造的；看过留出题并据此调参后，它就不再是你的未见题，需要补新的独立用例。

## 检索指标不能冒充整个 Agent 的成绩

正确片段出现了，模型仍可能忽略限制条件。没有正确片段，模型也可能凭已有知识答对。因此整个产品还需要另外检查：

| 要判断什么 | 应记录什么 |
|---|---|
| 检索有没有找到资料 | 候选、来源和检索指标 |
| 回答是否有依据 | 答案与原文对照，具体评分要点 |
| 工具是否越权或重复执行 | 实际工具结果和资源最终状态 |
| 运行代价是否可接受 | 总耗时、轮次、token 用量、失败比例 |

[第 07 章的评估用例](./07-Agent调试与效果评估.md)负责真实模型问答与建议。当前检索脚本没有调用生成模型，所以不能把它的分数写成“Agent 正确率”。没有真实请求也不能填模型成本与端到端延迟。

## 做一次完整的小改进

先保存原始报告，再只改一个因素，例如开发组中某种表达的查询规则。运行开发组，检查新增命中有没有带来误命中，然后用新的独立问题复查。

```mermaid
flowchart LR
    A[定义任务与评分] --> B[保存基线逐题结果]
    B --> C[按失败原因改一个因素]
    C --> D[开发组比较]
    D --> E[独立题复查]
    E --> F[记录收益、退化和限制]
    F --> A
```

基线是改动前的可比较版本，回归是确认旧任务没有被改坏。不要同时换模型、切片长度、提示词与检索算法，再把所有提升归给其中一项。

合上文档解释：为什么开发组从 1/3 提升到 1，还不能写“检索问题已解决”？拿报告中的留出失败和样本量作答，而不是只说“数据还不够”。

下一章：[把项目变成能展示的能力证据](./13-项目作品与面试表达.md)。
