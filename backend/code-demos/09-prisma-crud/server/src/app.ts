// 导入 Express
import express from "express";

// 创建服务器应用
const app = express();

// 将 JSON 请求体解析到 req.body
app.use(express.json());

// 导入文章 CRUD 函数
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} from "./modules/articles/article-repository";

// 健康检查接口
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// 获取文章列表接口
app.get("/api/articles", async (_req, res) => {
  const articles = await getArticles();
  res.json({ data: articles });
});

// 查询某篇文章接口
app.get("/api/articles/:id", async (req, res) => {
  // 路由参数是字符串，需转为数字
  const id = Number(req.params.id);

  // Id 不是整数，或者小于等于 0；Number.isInteger 是 JS 内置方法，用来判断一个值是不是整数。
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: "文章 ID 不正确" });
    return;
  }

  const article = await getArticleById(id);

  // 文章不存在
  if (!article) {
    res.status(404).json({ message: "文章不存在" });
    return;
  }

  res.json({ data: article });
});

// 创建文章接口
app.post("/api/articles", async (req, res) => {
  const article = await createArticle(req.body);

  res.status(201).json({ data: article });
});

// 修改文章接口
app.patch("/api/articles/:id", async (req, res) => {
  const id = Number(req.params.id);

  // 校验 ID
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: "文章 ID 不正确" });
    return;
  }

  const article = await updateArticle(id, req.body);

  res.status(200).json({ data: article });
});

// 删除某篇文章接口
app.delete("/api/articles/:id", async (req, res) => {
  const id = Number(req.params.id);

  // 校验 ID
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: "文章 ID 不正确" });
    return;
  }

  const article = await deleteArticle(id);

  res.json({ data: article });
});

// 启动服务器并监听 3000 端口
app.listen(3000, () => {
  console.log("server is running");
});
