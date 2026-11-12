import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Notes, preview } from './notes.ts';
import { createExecutor } from './tools.ts';
import { runAgent } from './agent.ts';
import type { ModelResponse } from './model.ts';

const folder = await mkdtemp(join(tmpdir(), 'note-agent-demo-'));
try {
  await mkdir(join(folder, 'notes'));
  const before = '# 事务\n事务让多步修改一起成功或失败。\n';
  await writeFile(join(folder, 'notes', 'database.md'), before);
  const notes = await Notes.open(join(folder, 'notes'), join(folder, 'state'));
  const execute = createExecutor(notes, 'propose');
  const actions = [
    ['search_notes', { query: '事务' }],
    ['read_note', { path: 'database.md' }],
    ['propose_replace', { path: 'database.md', old_text: '事务让多步修改一起成功或失败。', new_text: '事务像一个整体包裹：里面的多步修改要么全部生效，要么全部撤回。' }],
  ] as const;
  let step = 0;
  let proposalId = '';
  console.log('离线演示：模型回复按脚本生成，文件工具真实执行。');
  const answer = await runAgent('解释事务并提出一处改写建议', 'propose', async (): Promise<ModelResponse> => {
    const action = actions[step++];
    return {
      id: `demo-${step}`, status: 'completed',
      output: action
        ? [{ type: 'function_call', name: action[0], arguments: JSON.stringify(action[1]), call_id: `call-${step}` }]
        : [{ type: 'message', content: [{ type: 'output_text', text: '已参考 database.md 生成建议，原文尚未修改。' }] }],
    };
  }, async (name, args) => {
    const result = await execute(name, args);
    if (result.ok && result.data && 'id' in result.data) proposalId = result.data.id;
    return result;
  }, trace => console.log(`第 ${trace.round} 轮：${trace.tools.map(tool => tool.name).join(', ') || '回答'}`));
  console.log(answer);
  console.log(preview(await notes.loadProposal(proposalId)));
  if ((await notes.read('database.md')).content !== before) throw new Error('建议阶段不应修改原文');
  console.log('演示程序现在显式确认，只写入临时笔记副本。');
  await notes.apply(proposalId, true);
  console.log(await readFile(join(folder, 'notes', 'database.md'), 'utf8'));
} finally {
  await rm(folder, { recursive: true, force: true });
}
