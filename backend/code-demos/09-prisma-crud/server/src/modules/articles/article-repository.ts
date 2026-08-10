import { prisma } from "../../data/client";

// Prisma Client API：
// findMany 查询多篇文章；select 指定返回哪些字段；orderBy 定义查询结果的排序方式

export async function getArticles() {
  return prisma.article.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getArticleById(articleId: number) {
  return prisma.article.findUnique({
    where: {
      id: articleId,
    },
  });
}
