import { performance } from "node:perf_hooks";

const mode = process.argv[2] ?? "wait";
if (!["wait", "block"].includes(mode)) {
  throw new Error("参数只能是 wait 或 block");
}

const port = Number(process.env.PORT ?? 4313);
const baseURL = `http://127.0.0.1:${port}`;
const startedAt = performance.now();
const slowResponse = await fetch(`${baseURL}/${mode}`);
if (!slowResponse.ok) throw new Error(`慢请求返回 ${slowResponse.status}`);

const reader = slowResponse.body.getReader();
const firstChunk = await reader.read();
console.log(`收到开始标记: ${new TextDecoder().decode(firstChunk.value).trim()}`);

const healthStartedAt = performance.now();
const healthResponse = await fetch(`${baseURL}/api/health`);
if (!healthResponse.ok) throw new Error(`健康检查返回 ${healthResponse.status}`);
const health = await healthResponse.json();
console.log(`健康检查: ${health.status}, ${Math.round(performance.now() - healthStartedAt)}ms`);

while (!(await reader.read()).done) {
  // 消费剩余正文，等慢请求真正结束。
}
console.log(`${mode} 整轮完成: ${Math.round(performance.now() - startedAt)}ms`);
