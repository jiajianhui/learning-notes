import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const exec = promisify(execFile);
const cli = fileURLToPath(new URL('../src/cli.ts', import.meta.url));

for (const scenario of ['answer', 'incomplete', 'request_error'] as const) {
  test(`CLI 在 ${scenario} 后保存程序结果与未评估标记`, async t => {
    const folder = await mkdtemp(join(tmpdir(), 'note-agent-cli-'));
    t.after(() => rm(folder, { recursive: true, force: true }));
    await mkdir(join(folder, 'notes'));
    await writeFile(join(folder, 'notes', 'sample.md'), '# 虚构样例\n事务不能自动消除重复请求。');
    const mock = join(folder, 'mock.mjs');
    const response = {
      id: 'test-response', status: scenario === 'incomplete' ? 'incomplete' : 'completed',
      output: [{ type: 'message', content: [{ type: 'output_text', text: '虚构样例总结 [sample.md]' }] }],
    };
    await writeFile(mock, `
      import assert from 'node:assert/strict';
      globalThis.fetch = async (_url, options) => {
        const request = JSON.parse(options.body);
        assert.deepEqual(request.tools, []);
        assert.match(request.instructions, /本次请求提供的笔记正文/);
        assert.doesNotMatch(request.instructions, /先检索/);
        assert.ok(request.input.includes('事务不能自动消除重复请求'));
        ${scenario === 'request_error'
          ? "throw new Error('mock-network-error');"
          : `return new Response(${JSON.stringify(JSON.stringify(response))});`}
      };
    `);
    let exitCode = 0;
    try {
      await exec(process.execPath, ['--import', pathToFileURL(mock).href, cli, 'summarize', 'sample.md'], {
        cwd: folder,
        env: { ...process.env, OPENAI_API_KEY: 'fake-test-key', OPENAI_MODEL: 'fake-test-model', NOTES_DIR: join(folder, 'notes') },
      });
    } catch (error) {
      exitCode = (error as { code: number }).code;
    }
    assert.equal(exitCode, scenario === 'answer' ? 0 : 1);
    const logs = await readdir(join(folder, '.note-agent', 'runs'));
    assert.equal(logs.length, 1);
    const raw = await readFile(join(folder, '.note-agent', 'runs', logs[0]), 'utf8');
    const record = JSON.parse(raw);
    assert.equal(record.model, 'fake-test-model');
    assert.equal(record.verification, 'not_evaluated');
    assert.equal(record.status, scenario === 'answer' ? 'completed' : 'failed');
    assert.equal(record.traces.length, 1);
    assert.equal(record.traces[0].outcome, scenario === 'answer' ? 'answer' : 'error');
    if (scenario !== 'answer') assert.equal(record.traces[0].errorCode, scenario === 'incomplete' ? 'model_incomplete' : 'model_request_failed');
    assert.equal(raw.includes('fake-test-key'), false);
    assert.equal(raw.includes('虚构样例'), false);
  });
}
