// 导入 Express
import express from "express";

// 创建服务器应用
const app = express();

// 导入文章查询函数
import {
  getArticles,
  getArticleById,
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
  }

  const article = await getArticleById(id);

  // 文章不存在
  if (!article) {
    res.status(404).json({ message: "文章不存在" });
  }

  res.json({ data: article });
});

// 启动服务器并监听 3000 端口
app.listen(3000, () => {
  console.log("hi");
});
