import { prisma } from "../../data/client";

// Prisma Client API：
// findMany 查询多篇文章；select 指定返回哪些字段；orderBy 定义查询结果的排序方式

// 查询所有文章
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

// 查询某篇文章
export async function getArticleById(articleId: number) {
  return prisma.article.findUnique({
    where: {
      id: articleId,
    },
  });
}

// 创建文章
export function createArticle(input: {
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  status?: "draft" | "published";
}) {
  return prisma.article.create({
    data: input,
  });
}

// 更新文章
export function updateArticle(
  articleId: number,
  input: {
    title?: string;
    slug?: string;
    summary?: string | null;
    content?: string;
    status?: "draft" | "published";
  },
) {
  return prisma.article.update({
    where: {
      id: articleId,
    },
    data: input,
  });
}

// 删除某篇文章
export async function deleteArticle(articleId: number) {
  return prisma.article.delete({
    where: {
      id: articleId,
    },
  });
}
