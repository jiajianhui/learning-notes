import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 4311);

const server = createServer((req, res) => {
  const { remoteAddress, remotePort, localAddress, localPort } = req.socket;
  console.log(`${req.method} ${req.url}`);
  console.log(`${remoteAddress}:${remotePort} -> ${localAddress}:${localPort}`);

  const isHealth = req.method === "GET" && req.url === "/api/health";
  res.writeHead(isHealth ? 200 : 404, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(isHealth
    ? { status: "ok", pid: process.pid }
    : { error: "route not found" }));
});

server.on("error", (error) => {
  console.error(error.code, error.message);
  process.exitCode = 1;
});

server.listen(port, "127.0.0.1", () => {
  console.log(`PID ${process.pid}: http://127.0.0.1:${port}`);
});
