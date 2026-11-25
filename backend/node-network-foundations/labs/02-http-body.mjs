import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 4312);
const maxBytes = 1024;

const server = createServer((req, res) => {
  const send = (status, body) => {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(body));
  };

  if (req.method !== "POST" || req.url !== "/echo") {
    req.resume();
    send(404, { error: "use POST /echo" });
    return;
  }

  const mediaType = req.headers["content-type"]?.split(";")[0].trim().toLowerCase();
  if (mediaType !== "application/json") {
    req.resume();
    send(415, { error: "use application/json" });
    return;
  }

  const chunks = [];
  let bytes = 0;
  let chunkCount = 0;
  req.on("data", (chunk) => {
    bytes += chunk.length;
    chunkCount += 1;
    console.log(`chunk ${chunkCount}: ${chunk.length} bytes`);
    if (bytes <= maxBytes) chunks.push(chunk);
  });

  req.on("end", () => {
    if (bytes > maxBytes) {
      send(413, { error: "body exceeds 1024 bytes", bytes });
      return;
    }

    const text = Buffer.concat(chunks).toString("utf8");
    let value;
    try {
      value = JSON.parse(text);
    } catch {
      send(400, { error: "invalid JSON" });
      return;
    }
    send(200, { received: value, bytes, chunks: chunkCount });
  });

  req.on("error", (error) => {
    console.error("request interrupted:", error.message);
    res.destroy();
  });
});

server.on("error", (error) => {
  console.error(error.code, error.message);
  process.exitCode = 1;
});

server.listen(port, "127.0.0.1", () => {
  console.log(`POST http://127.0.0.1:${port}/echo`);
});
