import { Notes, preview } from './notes.ts';

export type Mode = 'ask' | 'propose';

function definition(name: string, description: string, fields: Record<string, string>) {
  return {
    type: 'function' as const, name, description, strict: true,
    parameters: {
      type: 'object',
      properties: Object.fromEntries(Object.entries(fields).map(([key, description]) => [key, { type: 'string', description }])),
      required: Object.keys(fields), additionalProperties: false,
    },
  };
}

export function definitions(mode: Mode) {
  const tools = [
    definition('search_notes', '按一个短关键词对笔记文件名和正文做字面匹配，返回最多 5 条摘录与总命中数。没有命中时换短词；total 大于 matches 长度时应缩小关键词，不代表已读完所有结果。', { query: '一个关键词，例如：事务；不要填写整句问题' }),
    definition('read_note', '读取指定笔记全文。比较或引用前先读取，搜索摘录不一定包含完整证据。', { path: '搜索结果中的顶层 .md 文件名' }),
  ];
  if (mode === 'propose') tools.push(definition('propose_replace', '对本轮已读笔记生成单处替换建议，不修改原文。', {
    path: '已读取的文件名', old_text: '原文中恰好出现一次的完整文本', new_text: '替换后的文本',
  }));
  return tools;
}

export function createExecutor(notes: Notes, mode: Mode) {
  const readVersions = new Map<string, string>();
  return async (name: string, rawArguments: string) => {
    try {
      const tool = definitions(mode).find(tool => tool.name === name);
      if (!tool) throw new Error('当前模式没有这个工具；请使用提供的工具，不能自行执行写回');
      const args = JSON.parse(rawArguments);
      const required = tool.parameters.required;
      if (!args || typeof args !== 'object' || Array.isArray(args) ||
        Object.keys(args).length !== required.length ||
        !required.every(key => typeof args[key] === 'string')) throw new Error(`工具参数格式错误；只填写这些字符串字段：${required.join(', ')}`);
      if (name === 'search_notes') return { ok: true, data: await notes.search(args.query) };
      if (name === 'read_note') {
        const note = await notes.read(args.path);
        readVersions.set(note.path, note.content);
        return { ok: true, data: note };
      }
      const current = await notes.read(args.path);
      if (readVersions.get(args.path) !== current.content) throw new Error('请先读取当前版本的笔记，再提出修改');
      const proposal = await notes.propose(args.path, args.old_text, args.new_text);
      return { ok: true, data: { id: proposal.id, path: proposal.path, preview: preview(proposal), applied: false } };
    } catch (error) {
      if (error instanceof SyntaxError) return { ok: false, error: '参数不是有效 JSON；请按工具 Schema 重新生成对象' };
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return { ok: false, error: '笔记文件不存在；请先用 search_notes 查找准确文件名，再读取' };
      }
      return { ok: false, error: error instanceof Error ? error.message : '工具执行失败' };
    }
  };
}
