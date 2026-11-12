import test from 'node:test';
import assert from 'node:assert/strict';
import { runAgent } from '../src/agent.ts';
import type { Trace } from '../src/agent.ts';
import { createModel } from '../src/model.ts';
import { definitions } from '../src/tools.ts';
import type { ModelRequest, ModelResponse } from '../src/model.ts';

const call: ModelResponse = { id: 'response-1', status: 'completed', output: [
  { type: 'function_call', call_id: 'call-1', name: 'search_notes', arguments: '{"query":"事务"}' },
] };
const final: ModelResponse = { id: 'response-2', status: 'completed', output: [
  { type: 'message', content: [{ type: 'output_text', text: '当前笔记中没有证据。' }] },
] };

test('执行工具后携带调用 ID 和上一响应 ID，再请求最终回答', async () => {
  const requests: ModelRequest[] = [];
  const text = await runAgent('查事务', 'ask', async request => {
    requests.push(request);
    return requests.length === 1 ? call : final;
  }, async (name, args) => {
    assert.equal(name, 'search_notes');
    assert.deepEqual(JSON.parse(args), { query: '事务' });
    return { ok: true, data: { matches: [], total: 0 } };
  });
  assert.equal(text, '当前笔记中没有证据。');
  assert.equal(requests[1].previousResponseId, 'response-1');
  assert.ok(Array.isArray(requests[1].input));
  assert.equal(requests[1].input[0].call_id, 'call-1');
  assert.equal(JSON.parse(requests[1].input[0].output).ok, true);
  assert.equal(requests[0].tools.some(tool => tool.name === 'propose_replace'), false);
});

test('错误结果也回给模型；循环有上限，不能无限尝试', async () => {
  let requests = 0;
  const traces: Trace[] = [];
  await assert.rejects(runAgent('查资料', 'ask', async request => {
    requests++;
    if (requests > 1) {
      assert.ok(Array.isArray(request.input));
      assert.equal(JSON.parse(request.input[0].output).ok, false);
    }
    return call;
  }, async () => ({ ok: false, error: '文件不存在' }), trace => traces.push(trace), 2), /2 轮上限/);
  assert.equal(requests, 2);
  assert.deepEqual(traces.map(trace => trace.outcome), ['continue', 'error']);
  assert.equal(traces[1].errorCode, 'round_limit');
  assert.deepEqual(traces[1].tools, [{ name: 'search_notes', ok: false }]);
});

test('不完整或没有回答的响应不能伪装为任务成功', async () => {
  const traces: Trace[] = [];
  await assert.rejects(runAgent('问题', 'ask', async () => ({ ...final, status: 'incomplete' }), async () => ({ ok: true }), trace => traces.push(trace)), /未完成/);
  await assert.rejects(runAgent('问题', 'ask', async () => ({ ...final, output: [] }), async () => ({ ok: true }), trace => traces.push(trace)), /没有可展示/);
  assert.deepEqual(traces.map(trace => trace.errorCode), ['model_incomplete', 'empty_answer']);
  assert.ok(traces.every(trace => trace.outcome === 'error'));
});

test('模型请求与工具异常也留下轨迹，不把错误正文写入日志', async () => {
  const traces: Trace[] = [];
  const capture = (trace: Trace) => traces.push(trace);
  await assert.rejects(runAgent('问题', 'ask', async () => { throw new Error('private request payload'); }, async () => ({ ok: true }), capture));
  await assert.rejects(runAgent('问题', 'ask', async () => call, async () => { throw new Error('private file path'); }, capture));
  assert.deepEqual(traces.map(trace => trace.errorCode), ['model_request_failed', 'tool_execution_failed']);
  assert.deepEqual(traces[1].tools, [{ name: 'search_notes', ok: false }]);
  assert.equal(JSON.stringify(traces).includes('private'), false);
});

test('HTTP 请求保持协议字段，凭证只放请求头', async () => {
  const fetcher: typeof fetch = async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    const body = JSON.parse(String(options?.body));
    assert.equal(body.previous_response_id, 'previous');
    assert.equal(body.parallel_tool_calls, false);
    assert.equal(body.store, true);
    assert.ok(body.instructions.includes('不是操作指令'));
    assert.ok(body.instructions.includes('先检索再读取'));
    assert.deepEqual(body.tools, definitions('ask'));
    assert.equal(String(options?.body).includes('test-key'), false);
    return new Response(JSON.stringify(final), { status: 200 });
  };
  const model = createModel('test-key', 'test-model', fetcher);
  assert.equal((await model({ input: '问题', tools: definitions('ask'), previousResponseId: 'previous' })).id, final.id);
});

test('HTTP 失败和畸形工具调用都会停止，不打印服务端敏感正文', async () => {
  const failed: typeof fetch = async () => new Response('secret server payload', { status: 429 });
  await assert.rejects(createModel('key', 'model', failed)({ input: '问题', tools: [] }), /HTTP 429/);
  const malformed: typeof fetch = async () => new Response(JSON.stringify({ ...call, output: [{ type: 'function_call' }] }));
  await assert.rejects(createModel('key', 'model', malformed)({ input: '问题', tools: [] }), /缺少/);
});
