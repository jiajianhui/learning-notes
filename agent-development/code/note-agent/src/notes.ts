import { lstat, mkdir, readFile, readdir, realpath, rename, unlink, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

export const MAX_BYTES = 16 * 1024;
export type Proposal = { id: string; root: string; path: string; before: string; after: string };

export class Notes {
  readonly root: string;
  readonly state: string;

  constructor(root: string, state: string) {
    this.root = root;
    this.state = state;
  }

  static async open(root: string, state: string) {
    return new Notes(await realpath(root), resolve(state));
  }

  private async file(path: string) {
    if (!path || basename(path) !== path || path.includes('\\') || path.startsWith('.') || !path.endsWith('.md')) {
      throw new Error('只接受笔记目录顶层的普通 .md 文件名');
    }
    const target = join(this.root, path);
    if (!(await lstat(target)).isFile()) throw new Error('不能读取符号链接或目录');
    return target;
  }

  async read(path: string) {
    const target = await this.file(path);
    if ((await lstat(target)).size > MAX_BYTES) throw new Error('笔记超过 16 KiB，请拆分后再读');
    const content = await readFile(target, 'utf8');
    if (Buffer.byteLength(content) > MAX_BYTES) throw new Error('笔记超过 16 KiB');
    return { path, content };
  }

  async search(query: string) {
    const keyword = query.trim().toLocaleLowerCase();
    if (!keyword || keyword.length > 100) throw new Error('关键词长度应为 1～100 个字符');
    const files = (await readdir(this.root, { withFileTypes: true }))
      .filter(file => file.isFile() && !file.name.startsWith('.') && file.name.endsWith('.md'))
      .map(file => file.name).sort();
    if (files.length > 50) throw new Error('笔记超过 50 篇，请选择更小的练习目录');
    const matches: { path: string; snippet: string }[] = [];
    for (const path of files) {
      const { content } = await this.read(path);
      const index = content.toLocaleLowerCase().indexOf(keyword);
      if (index >= 0 || path.toLocaleLowerCase().includes(keyword)) {
        matches.push({ path, snippet: content.slice(Math.max(0, index - 30), Math.max(0, index - 30) + 180) });
      }
    }
    return { matches: matches.slice(0, 5), total: matches.length };
  }

  async propose(path: string, oldText: string, newText: string) {
    const { content: before } = await this.read(path);
    if (!oldText || before.split(oldText).length !== 2) throw new Error('旧文本必须在原文中恰好出现一次');
    const after = before.replace(oldText, () => newText);
    if (before === after) throw new Error('新旧文本相同，没有需要保存的修改');
    if (Buffer.byteLength(after) > MAX_BYTES) throw new Error('修改后的笔记超过 16 KiB');
    const proposal: Proposal = { id: randomUUID(), root: this.root, path, before, after };
    await mkdir(join(this.state, 'proposals'), { recursive: true });
    await writeFile(join(this.state, 'proposals', `${proposal.id}.json`), JSON.stringify(proposal, null, 2), { flag: 'wx' });
    return proposal;
  }

  async loadProposal(id: string): Promise<Proposal> {
    if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error('建议 ID 格式错误');
    const value = JSON.parse(await readFile(join(this.state, 'proposals', `${id}.json`), 'utf8'));
    if (!value || value.id !== id || value.root !== this.root ||
      typeof value.path !== 'string' || typeof value.before !== 'string' || typeof value.after !== 'string' ||
      Buffer.byteLength(value.before) > MAX_BYTES || Buffer.byteLength(value.after) > MAX_BYTES) {
      throw new Error('建议内容无效，或不属于当前笔记目录');
    }
    await this.file(value.path);
    return value;
  }

  async apply(id: string, confirmed: boolean) {
    if (!confirmed) throw new Error('先 preview 查看差异，确认后使用 apply 建议ID --yes');
    const proposal = await this.loadProposal(id);
    const { content } = await this.read(proposal.path);
    if (content !== proposal.before) throw new Error('原文已变化或建议已应用，请重新生成建议');
    const target = await this.file(proposal.path);
    const temporary = join(this.root, `.note-agent-${randomUUID()}.tmp`);
    try {
      await writeFile(temporary, proposal.after, { flag: 'wx', mode: (await lstat(target)).mode });
      await rename(temporary, target);
    } finally {
      await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
    }
    return { path: proposal.path, applied: true };
  }
}

export function preview(proposal: Proposal) {
  // 教学版展示整篇替换，避免把差异算法引入 Agent 主线。
  return [`--- ${proposal.path}（原文）`, `+++ ${proposal.path}（建议）`,
    ...proposal.before.split('\n').map(line => `- ${line}`),
    ...proposal.after.split('\n').map(line => `+ ${line}`)].join('\n');
}
