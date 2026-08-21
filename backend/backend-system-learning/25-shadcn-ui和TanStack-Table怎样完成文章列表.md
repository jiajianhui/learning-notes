# 25. shadcn/ui 和 TanStack Table 怎样完成文章列表

## 这一章要完成什么

第 24 章已经完成项目骨架、登录状态和统一请求函数。本章使用同一套 Express API 完成：

```text
请求当前页文章
-> 显示筛选条件
-> 用 TanStack Table 组织列和行
-> 用 shadcn Table 渲染
-> 编辑、删除和翻页
```

开始前，Ant Design 后台的文章列表、筛选和分页应该已经可用。本项目继续使用同一个 Express API contract，不增加另一套接口。

TanStack Table 的概念较多。先按本章跑通结果，完成后再用 [25A](./25A-TanStack-Table从数据到表格实例.md) 串一次内部主线。

---

## 1. 安装表格和行操作需要的组件

在 `admin-web-shadcn` 中执行：

```bash
npm install @tanstack/react-table

npx shadcn@latest add \
  alert-dialog \
  badge \
  dropdown-menu \
  empty \
  select \
  skeleton \
  table
```

先不要安装 TanStack Query。本项目继续使用第 13 章已经学过的 `fetch` 和 React 请求状态，只把新的学习重点放在 UI 组合与 TanStack Table。

---

## 2. 先确定目录和职责

```text
src/app/(admin)/admin/articles/
├── page.tsx                  组合筛选、列表和页面状态
├── article-columns.tsx       定义每一列怎样读取和显示数据
├── article-data-table.tsx    创建 table 实例并渲染行
└── delete-article-button.tsx 删除确认和删除请求

src/features/articles/
├── api.ts                    请求 Express
└── types.ts                  文章列表和查询类型
```

`components/ui/table.tsx` 是 shadcn 加入项目的基础 UI 文件，不要把 Mini CMS 文章业务写进去。文章列和删除逻辑放在功能目录中。

---

## 3. 使用两个后台共同的 API contract

阶段 5 完成后，文章列表已经支持标题、状态、标签和分页。两个后台使用相同的字段名、查询参数、响应结构和错误 code，不重新设计接口。

下面用这一组名称表示共同 contract；如果项目已经使用其他名称，以 Express 的真实实现为准，并同时调整两个前端：

`src/features/articles/types.ts`：

```ts
export type ArticleStatus = "draft" | "published";

export type TagSummary = {
  id: number;
  name: string;
  slug: string;
};

export type ArticleListItem = {
  id: number;
  title: string;
  slug: string;
  status: ArticleStatus;
  tags: TagSummary[];
  createdAt: string;
  publishedAt: string | null;
};

export type ArticleListQuery = {
  title?: string;
  status?: ArticleStatus;
  tagId?: number;
  page: number;
  pageSize: number;
};

export type ArticleListPage = {
  items: ArticleListItem[];
  total: number;
  page: number;
  pageSize: number;
};
```

这里的 `page` 从 1 开始，和页面以及 Express 查询参数保持一致。TanStack Table 内部的 `pageIndex` 从 0 开始，第 6 节只在一个位置转换。

`src/features/articles/api.ts`：

```ts
import {
  apiFetchResponse,
  apiRequest,
} from "@/lib/api";
import type {
  ArticleListItem,
  ArticleListPage,
  ArticleListQuery,
} from "./types";

export async function getArticles(
  query: ArticleListQuery,
  signal?: AbortSignal,
) {
  const search = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  });

  if (query.title) search.set("title", query.title);
  if (query.status) search.set("status", query.status);
  if (query.tagId) search.set("tagId", String(query.tagId));

  const response = await apiFetchResponse<ArticleListItem[]>(
    `/api/articles?${search.toString()}`,
    { signal },
  );

  if (!response.pagination) {
    throw new Error("文章列表响应缺少 pagination");
  }

  return {
    items: response.data,
    ...response.pagination,
  } satisfies ArticleListPage;
}

export function deleteArticle(articleId: number) {
  return apiRequest(`/api/articles/${articleId}`, {
    method: "DELETE",
  });
}
```

列表只传查询条件，筛选和分页仍由 Express 和 PostgreSQL 完成。

---

## 4. 先写一个只负责渲染的 DataTable

新建 `article-data-table.tsx`：

```tsx
"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type ArticleDataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  total: number;
  loading: boolean;
};

export function ArticleDataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onPaginationChange,
  total,
  loading,
}: ArticleDataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total,
    state: {
      pagination,
    },
    onPaginationChange,
  });

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-muted-foreground"
              >
                暂无文章
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end gap-2 border-t p-3">
        <Button
          variant="outline"
          size="sm"
          disabled={loading || !table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          上一页
        </Button>
        <span className="text-sm text-muted-foreground">
          第 {pagination.pageIndex + 1} 页
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={loading || !table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          下一页
        </Button>
      </div>
    </div>
  );
}
```

这段代码不认识文章字段。它只接收：

```text
columns
-> 每一列怎样显示

data
-> 当前页已经由 Express 筛选好的数据

pagination
-> 当前页码和每页数量
```

`manualPagination: true` 表示浏览器不再对当前数组做第二次分页。

---

## 5. 定义文章列

新建 `article-columns.tsx`：

```tsx
"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ArticleListItem } from "@/features/articles/types";
import { DeleteArticleButton } from "./delete-article-button";

export function getArticleColumns(
  onDeleted: () => void,
): ColumnDef<ArticleListItem>[] {
  return [
    {
      accessorKey: "title",
      header: "标题",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.slug}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "published"
              ? "default"
              : "secondary"
          }
        >
          {row.original.status === "published" ? "已发布" : "草稿"}
        </Badge>
      ),
    },
    {
      id: "tags",
      header: "标签",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.map((tag) => (
            <Badge key={tag.id} variant="outline">
              {tag.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "创建时间",
      cell: ({ row }) =>
        new Intl.DateTimeFormat("zh-CN", {
          dateStyle: "medium",
        }).format(new Date(row.original.createdAt)),
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            render={
              <Link
                href={`/admin/articles/${row.original.id}/edit`}
              />
            }
          >
            编辑
          </Button>
          <DeleteArticleButton
            article={row.original}
            onDeleted={onDeleted}
          />
        </div>
      ),
    },
  ];
}
```

`accessorKey` 表示直接读取某个字段；`id` 适合标签和操作这类自定义列。列定义只处理当前行怎样显示，不发送列表请求。

---

## 6. 让页面拥有查询和分页状态

`page.tsx` 需要使用 `useEffect` 和点击事件，因此是 Client Component：

```tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import type {
  PaginationState,
  Updater,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getArticles,
} from "@/features/articles/api";
import type {
  ArticleListPage,
  ArticleListQuery,
} from "@/features/articles/types";
import { ApiError } from "@/lib/api";
import { ArticleDataTable } from "./article-data-table";
import { getArticleColumns } from "./article-columns";

const initialQuery: ArticleListQuery = {
  page: 1,
  pageSize: 10,
};

export default function ArticlesPage() {
  const router = useRouter();
  const [draftTitle, setDraftTitle] = useState("");
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<ArticleListPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadArticles = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");

      try {
        const nextResult = await getArticles(query, signal);
        setResult(nextResult);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        if (
          requestError instanceof ApiError &&
          requestError.status === 401
        ) {
          router.replace("/login");
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "网络异常，请稍后重试",
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [query, router],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadArticles(controller.signal);
    return () => controller.abort();
  }, [loadArticles]);

  const handleDeleted = useCallback(() => {
    if (result && result.items.length === 1 && query.page > 1) {
      setQuery((current) => ({
        ...current,
        page: current.page - 1,
      }));
      return;
    }

    void loadArticles();
  }, [loadArticles, query.page, result]);

  const columns = useMemo(
    () => getArticleColumns(handleDeleted),
    [handleDeleted],
  );

  const pagination: PaginationState = {
    pageIndex: query.page - 1,
    pageSize: query.pageSize,
  };

  function handlePaginationChange(
    updater: Updater<PaginationState>,
  ) {
    const next =
      typeof updater === "function"
        ? updater(pagination)
        : updater;

    setQuery((current) => ({
      ...current,
      page: next.pageIndex + 1,
      pageSize: next.pageSize,
    }));
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery((current) => ({
      ...current,
      title: draftTitle.trim() || undefined,
      page: 1,
    }));
  }

  // JSX 放在下一节。
}
```

这里把输入中的 `draftTitle` 和真正发送给 API 的 `query.title` 分开。用户点击查询后才发送请求，也能在筛选变化时把页码重置为 1。

---

## 7. 组合筛选、状态和翻页按钮

继续在 `page.tsx` 返回：

```tsx
return (
  <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row">
      <div>
        <h1 className="text-2xl font-semibold">文章管理</h1>
        <p className="text-sm text-muted-foreground">
          管理草稿、标签和发布状态
        </p>
      </div>

      <Button render={<Link href="/admin/articles/new" />}>
        新建文章
      </Button>
    </div>

    <form
      onSubmit={handleSearch}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <Input
        value={draftTitle}
        onChange={(event) => setDraftTitle(event.target.value)}
        placeholder="按标题筛选"
        className="sm:max-w-xs"
      />
      <Button type="submit" variant="outline">
        查询
      </Button>
    </form>

    {error && (
      <Alert variant="destructive">
        <AlertTitle>文章加载失败</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadArticles()}
          >
            重试
          </Button>
        </AlertDescription>
      </Alert>
    )}

    {loading && !result ? (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    ) : result ? (
      <ArticleDataTable
        columns={columns}
        data={result.items}
        total={result.total}
        loading={loading}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
      />
    ) : null}
  </div>
);
```

状态优先级是：

```text
第一次请求且没有旧数据
-> Skeleton

请求失败
-> Alert 和重试

请求成功但 items 为空
-> DataTable 内显示空状态

请求成功且有数据
-> 表格
```

筛选页面还要按共同 contract 增加状态和标签 `Select`。它们和标题筛选使用相同规则：更新查询条件时把 `page` 重置为 1。

---

## 8. 增加删除确认

新建 `delete-article-button.tsx`：

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { deleteArticle } from "@/features/articles/api";
import type { ArticleListItem } from "@/features/articles/types";
import { ApiError } from "@/lib/api";

export function DeleteArticleButton({
  article,
  onDeleted,
}: {
  article: ArticleListItem;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);

    try {
      await deleteArticle(article.id);
      toast.add({
        type: "success",
        title: "文章已删除",
      });
      onDeleted();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/login");
        return;
      }

      toast.add({
        type: "error",
        title: "删除失败",
        description:
          error instanceof ApiError
            ? error.message
            : "网络异常，请稍后重试",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="sm" />
        }
      >
        删除
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除这篇文章？</AlertDialogTitle>
          <AlertDialogDescription>
            将删除“{article.title}”，此操作不能撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? "删除中…" : "确认删除"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

删除成功后重新请求当前页，不要只在浏览器数组中移除一行。这样页面会重新使用 Express 返回的总数和当前页数据。

`handleDeleted` 还会检查当前页是否只剩一条数据。删除最后一条后先退回上一页，再由查询状态触发新请求，避免停在已经不存在的空页。

---

## 9. 本章检查点

1. 首次进入文章页时显示 loading，成功后显示真实数据。
2. 没有文章时显示 empty，不是空白页面。
3. Express 停止或返回错误时显示 Alert，并可以重试。
4. 标题、状态、标签筛选都由 API 执行。
5. 修改筛选条件后回到第一页。
6. 上一页和下一页不会越界。
7. 行操作使用当前文章的真实 id。
8. 删除前必须确认，失败时页面不会错误移除数据。
9. 401 会回到登录页。
10. Ant Design 后台仍能看到同一批数据。

最后执行：

```bash
npm run lint
npx tsc --noEmit
npm run build
```

三个检查通过后，阅读 [25A](./25A-TanStack-Table从数据到表格实例.md)，用短主线复习这一章。

## 官方参考

- [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/base/data-table)
- [shadcn/ui Alert Dialog](https://ui.shadcn.com/docs/components/base/alert-dialog)
- [TanStack Table React 文档](https://tanstack.com/table/latest/docs/framework/react)
- [TanStack Table Pagination](https://tanstack.com/table/latest/docs/api/features/pagination)
