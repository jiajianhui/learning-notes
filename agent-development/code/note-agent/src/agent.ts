import { definitions } from './tools.ts';
import type { Mode } from './tools.ts';
import type { Model, ModelRequest, ModelResponse, ToolResult } from './model.ts';

export type Trace = {
  round: number; elapsedMs: number; tools: { name: string; ok: boolean }[];
  outcome: 'continue' | 'answer' | 'error';
  errorCode?: string;
  usage?: ModelResponse['usage'];
};
type ToolExecutor = (name: string, args: string) => Promise<{ ok: boolean; data?: unknown; error?: string }>;

export async function runAgent(goal: string, mode: Mode, model: Model, execute: ToolExecutor,
  onTrace: (trace: Trace) => void = () => {}, maxRounds = 6) {
  if (!goal.trim() || goal.length > 4000) throw new Error('任务长度应为 1～4000 个字符');
  if (!Number.isInteger(maxRounds) || maxRounds < 1 || maxRounds > 10) throw new Error('轮次上限应为 1～10');
  let input: ModelRequest['input'] = goal;
  let previousResponseId: string | undefined;
  for (let round = 1; round <= maxRounds; round++) {
    const start = Date.now();
    const trace: Trace = { round, elapsedMs: 0, tools: [], outcome: 'continue' };
    let errorCode = 'model_request_failed';
    try {
      const response = await model({ input, previousResponseId, tools: definitions(mode) });
      trace.usage = response.usage;
      errorCode = 'model_incomplete';
      if (response.status !== 'completed') throw new Error(`模型未完成本轮响应：${response.status}`);
      const calls = response.output.filter(item => item.type === 'function_call');
      if (calls.length === 0) {
        const text = response.output.filter(item => item.type === 'message')
          .flatMap(item => item.content ?? []).filter(part => part.type === 'output_text')
          .map(part => part.text ?? '').join('\n');
        errorCode = 'empty_answer';
        if (!text.trim()) throw new Error('本轮既没有工具调用，也没有可展示的回答');
        trace.outcome = 'answer';
        return text;
      }
      errorCode = 'tool_batch_limit';
      if (calls.length > 4) throw new Error('单轮工具调用超过上限');
      const results: ToolResult[] = [];
      for (const call of calls) {
        errorCode = 'invalid_tool_call';
        if (!call.name || !call.arguments || !call.call_id) throw new Error('工具调用格式错误');
        errorCode = 'tool_execution_failed';
        const toolTrace = { name: call.name, ok: false };
        trace.tools.push(toolTrace);
        const result = await execute(call.name, call.arguments);
        toolTrace.ok = result.ok;
        results.push({ type: 'function_call_output', call_id: call.call_id, output: JSON.stringify(result) });
      }
      errorCode = 'round_limit';
      if (round === maxRounds) throw new Error(`达到 ${maxRounds} 轮上限，任务未确认完成；已有修改建议仍需单独确认`);
      previousResponseId = response.id;
      input = results;
    } catch (error) {
      trace.outcome = 'error';
      trace.errorCode = errorCode;
      throw error;
    } finally {
      trace.elapsedMs = Date.now() - start;
      onTrace(trace);
    }
  }
  throw new Error(`达到 ${maxRounds} 轮上限，任务未确认完成；已有修改建议仍需单独确认`);
}
