import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Notes, MAX_BYTES } from '../src/notes.ts';
import { createExecutor } from '../src/tools.ts';

async function fixture(t: TestContext) {
  const folder = await mkdtemp(join(tmpdir(), 'note-agent-test-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  await mkdir(join(folder, 'notes'));
  await writeFile(join(folder, 'notes', 'database.md'), '# 事务\n事务让多步修改一起成功或失败。\n');
  return { folder, notes: await Notes.open(join(folder, 'notes'), join(folder, 'state')) };
}

test('搜索返回来源与摘录，找不到时不制造结果', async t => {
  const { notes } = await fixture(t);
  assert.equal((await notes.search('事务')).matches[0].path, 'database.md');
  assert.deepEqual(await notes.search('火星'), { matches: [], total: 0 });
  await assert.rejects(notes.search(' '), /关键词/);
});

test('目录穿越、符号链接和超大笔记不能进入工具结果', async t => {
  const { folder, notes } = await fixture(t);
  await writeFile(join(folder, 'secret.md'), 'not a note');
  await symlink(join(folder, 'secret.md'), join(notes.root, 'link.md'));
  await assert.rejects(notes.read('../secret.md'), /顶层/);
  await assert.rejects(notes.read('link.md'), /符号链接/);
  assert.equal((await notes.search('secret')).total, 0);
  await writeFile(join(notes.root, 'large.md'), 'x'.repeat(MAX_BYTES + 1));
  await assert.rejects(notes.read('large.md'), /16 KiB/);
});

test('建议不会写入，必须确认，应用后不能重复覆盖', async t => {
  const { notes } = await fixture(t);
  const before = (await notes.read('database.md')).content;
  const proposal = await notes.propose('database.md', '一起成功或失败', '要么全部成功，要么全部撤回');
  assert.equal((await notes.read('database.md')).content, before);
  await assert.rejects(notes.apply(proposal.id, false), /确认/);
  await notes.apply(proposal.id, true);
  assert.equal((await notes.read('database.md')).content, proposal.after);
  await assert.rejects(notes.apply(proposal.id, true), /原文已变化/);
});

test('生成建议后原文被修改，应用旧建议必须失败', async t => {
  const { notes } = await fixture(t);
  const proposal = await notes.propose('database.md', '# 事务', '# 数据库事务');
  await writeFile(join(notes.root, 'database.md'), '用户的新内容');
  await assert.rejects(notes.apply(proposal.id, true), /原文已变化/);
  assert.equal((await notes.read('database.md')).content, '用户的新内容');
});

test('多处匹配不能猜着替换，替换文本中的美元符号保持原样', async t => {
  const { notes } = await fixture(t);
  await writeFile(join(notes.root, 'database.md'), '重复 重复');
  await assert.rejects(notes.propose('database.md', '重复', '新'), /恰好/);
  const proposal = await notes.propose('database.md', '重复 重复', '$&');
  assert.equal(proposal.after, '$&');
});

test('只读模式拒绝建议工具，模型在所有模式下都没有 apply 工具', async t => {
  const { notes } = await fixture(t);
  assert.equal((await createExecutor(notes, 'ask')('propose_replace', '{}')).ok, false);
  assert.equal((await createExecutor(notes, 'propose')('apply', '{}')).ok, false);
});

test('工具必须先读当前版本，参数错误可作为反馈返回', async t => {
  const { notes } = await fixture(t);
  const execute = createExecutor(notes, 'propose');
  const args = JSON.stringify({ path: 'database.md', old_text: '# 事务', new_text: '# 数据库事务' });
  assert.equal((await execute('propose_replace', args)).ok, false);
  assert.equal((await execute('read_note', '{broken')).ok, false);
  assert.equal((await execute('read_note', '{"path":"database.md","extra":1}')).ok, false);
  assert.equal((await execute('read_note', '{"path":"database.md"}')).ok, true);
  assert.equal((await execute('propose_replace', args)).ok, true);
  await writeFile(join(notes.root, 'database.md'), '# 事务\n新的版本');
  assert.equal((await execute('propose_replace', args)).ok, false);
});

test('文件缺失时给出可行动作，不把本机路径交给模型', async t => {
  const { notes } = await fixture(t);
  const result = await createExecutor(notes, 'ask')('read_note', '{"path":"missing.md"}');
  assert.equal(result.ok, false);
  assert.match(result.error ?? '', /search_notes/);
  assert.equal(JSON.stringify(result).includes(notes.root), false);
});
