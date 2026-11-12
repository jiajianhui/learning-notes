import { runAgent } from './agent.ts';
import type { Model } from './model.ts';

const scenarios: { name: string; model: Model }[] = [
  { name: '模型请求失败', model: async () => { throw new Error('模拟网络故障'); } },
  { name: '工具一直失败，直到轮次上限', model: async () => ({
    id: 'offline-response', status: 'completed', output: [{
      type: 'function_call', name: 'read_note', call_id: 'offline-call', arguments: '{"path":"missing.md"}',
    }],
  }) },
];

console.log('离线故障演示：模型与工具结果均为模拟，无网络请求。');
for (const scenario of scenarios) {
  console.log(`\n场景：${scenario.name}`);
  try {
    await runAgent('读取笔记', 'ask', scenario.model,
      async () => ({ ok: false, error: '笔记不存在，请先搜索准确文件名' }),
      trace => console.log(JSON.stringify(trace, null, 2)), 2);
  } catch (error) {
    console.log(`预期停止：${error instanceof Error ? error.message : '未知错误'}`);
  }
}
