import { createServer } from "node:http";
import { setTimeout as delay } from "node:timers/promises";
import { performance } from "node:perf_hooks";

const port = Number(process.env.PORT ?? 4313);

const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (req.method !== "GET" || !["/wait", "/block"].includes(req.url)) {
    res.writeHead(404);
    res.end("route not found");
    return;
  }

  const mode = req.url;
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  // 标记交给底层发送后才开始工作，让独立客户端可以发出健康检查。
  res.write("started\n", async () => {
    console.log(`${mode}: started`);
    if (mode === "/wait") {
      await delay(2000);
    } else {
      const end = performance.now() + 2000;
      while (performance.now() < end) {
        // 仅用于本地实验：故意占用主线程。
      }
    }
    res.end("done\n");
    console.log(`${mode}: done`);
  });
});

server.on("error", (error) => {
  console.error(error.code, error.message);
  process.exitCode = 1;
});

server.listen(port, "127.0.0.1", () => {
  console.log(`http://127.0.0.1:${port}: /api/health, /wait, /block`);
});
