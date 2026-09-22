# 26. shadcn/ui 和 TanStack Table 怎样完成文章列表

第 25 章已经完成登录和请求层。现在沿着“显示真实文章 → 翻页 → 筛选 → 删除”完成列表。每一步都在上一步的页面上增加可操作的行为；第 26A 章用于完成后复习表格内部的数据流。

## 1. 先把真实文章显示出来

在 `admin-web-shadcn` 安装：

```bash
npm install @tanstack/react-table
npx shadcn@latest add table badge skeleton select alert-dialog
```

本步共同修改三个位置：`features/articles` 保存类型和请求，`app/(admin)/admin/articles` 组织页面与列，shadcn 的 `components/ui/table.tsx` 提供表格外观。

### 1.1 沿用已有响应，取得第一页

在 `features/articles/types.ts` 定义下面的类型。第 15、16 章返回的是 `articleTags[].tag`，这里继续使用这个结构，不把类型声明写成接口没有返回的 `tags`：

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
  articleTags: { tag: TagSummary }[];
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

新建 `features/articles/api.ts`。分页响应原本是 `{ data, pagination }`；请求函数把它整理成页面使用的 `{ items, total, page, pageSize }`，文章对象内部的字段保持原样。

```ts
import { apiRequestResult } from "@/lib/api";
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

  const response = await apiRequestResult<ArticleListItem[]>(
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
```

### 1.2 定义列，再把单元格渲染出来

新建 `app/(admin)/admin/articles/article-columns.tsx`：

```tsx
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { ArticleListItem } from "@/features/articles/types";

export const articleColumns: ColumnDef<ArticleListItem>[] = [
  { accessorKey: "title", header: "标题" },
  { accessorKey: "slug", header: "slug" },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => row.original.status === "published" ? "已发布" : "草稿",
  },
  {
    id: "tags",
    header: "标签",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.articleTags.map(({ tag }) => (
          <Badge key={tag.id} variant="outline">{tag.name}</Badge>
        ))}
      </div>
    ),
  },
];
```

`accessorKey` 对应文章字段；标签列用 `cell` 读取嵌套数据。`row.original` 就是本行的原始文章。

在同目录新建 `article-data-table.tsx`：

```tsx
"use client";

import {
  flexRender, getCoreRowModel, useReactTable, type ColumnDef,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { ArticleListItem } from "@/features/articles/types";

type ArticleDataTableProps = {
  data: ArticleListItem[];
  columns: ColumnDef<ArticleListItem>[];
};

export function ArticleDataTable({ data, columns }: ArticleDataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder ? null : flexRender(
                  header.column.columnDef.header, header.getContext(),
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={columns.length}>暂无文章</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
```

这里完成一条新的渲染链：`data + columns` 交给 `useReactTable()`，表格实例组织行和单元格，`flexRender()` 执行列的显示定义，shadcn 组件负责最终 HTML。当前只显示后端返回的第一页。

### 1.3 接到页面并验证

同目录的 `page.tsx` 写入：

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ApiError, isRequestCanceled } from "@/lib/api";
import { getArticles } from "@/features/articles/api";
import type { ArticleListPage, ArticleListQuery } from "@/features/articles/types";
import { ArticleDataTable } from "./article-data-table";
import { articleColumns } from "./article-columns";

export default function ArticlesPage() {
  const router = useRouter();
  const [query, setQuery] = useState<ArticleListQuery>({ page: 1, pageSize: 10 });
  const [result, setResult] = useState<ArticleListPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    getArticles(query, controller.signal)
      .then((nextResult) => {
        if (!controller.signal.aborted) setResult(nextResult);
      })
      .catch((requestError) => {
        if (controller.signal.aborted || isRequestCanceled(requestError)) return;
        if (requestError instanceof ApiError && requestError.status === 401) {
          router.replace("/login");
          return;
        }
        setError(requestError instanceof Error ? requestError.message : "请求失败");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [query, refreshVersion, router]);

  function reload() {
    setRefreshVersion((current) => current + 1);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">文章管理</h1>
      {loading && <p role="status">正在加载文章…</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <Button onClick={reload} disabled={loading}>重试</Button>
        </div>
      )}
      {result && <ArticleDataTable data={result.items} columns={articleColumns} />}
    </div>
  );
}
```

请求和错误处理沿用上一套后台的思路。这里把重试也交回同一个 Effect；后续翻页、筛选和删除刷新继续走这条链，旧请求在清理时取消。

**验证：** 登录后看到真实文章和标签；空列表显示“暂无文章”；关闭 Express 后出现错误，恢复服务并点击重试能重新获取。此时还没有分页按钮，只显示第一页。

## 2. 让翻页改变后端查询

页码同时影响 API 和表格，因此仍由页面的 `query` 保存。TanStack 使用从 0 开始的 `pageIndex`，接口使用从 1 开始的 `page`，只在页面边界转换。

在 `page.tsx` 导入 `PaginationState`、`Updater` 类型，并在组件中加入：

```tsx
const pagination: PaginationState = {
  pageIndex: query.page - 1,
  pageSize: query.pageSize,
};

function handlePaginationChange(updater: Updater<PaginationState>) {
  const next = typeof updater === "function" ? updater(pagination) : updater;
  setQuery((current) => ({
    ...current,
    page: next.pageIndex + 1,
    pageSize: next.pageSize,
  }));
}
```

将页面中的表格调用补成：

```tsx
<ArticleDataTable
  data={result.items}
  columns={articleColumns}
  total={result.total}
  loading={loading}
  pagination={pagination}
  onPaginationChange={handlePaginationChange}
/>
```

表格文件从 `@tanstack/react-table` 增加导入 `PaginationState`、`OnChangeFn` 类型，从 `@/components/ui/button` 导入 `Button`。给 `ArticleDataTableProps` 增加以下属性，组件参数也一起解构：

```ts
total: number;
loading: boolean;
pagination: PaginationState;
onPaginationChange: OnChangeFn<PaginationState>;
```

在原 `useReactTable()` 配置中增加：

```ts
manualPagination: true,
rowCount: total,
state: { pagination },
onPaginationChange,
```

保留原有 Table，用一个 `<div>` 包住它，在 Table 后面加入分页区：

```tsx
<div className="flex items-center justify-end gap-3 py-3">
  <Button disabled={loading || !table.getCanPreviousPage()} onClick={() => table.previousPage()}>
    上一页
  </Button>
  <span>第 {pagination.pageIndex + 1} 页，共 {total} 条</span>
  <Button disabled={loading || !table.getCanNextPage()} onClick={() => table.nextPage()}>
    下一页
  </Button>
</div>
```

按钮通过表格的分页方法调用 `onPaginationChange`，页面更新 `query`，Effect 才真正向后端请求。`manualPagination` 表示传入的数据已经由后端分页，不再对这 10 条做一次浏览器分页。

**验证：** 使用第 16 章的测试文章翻到第二页，Network 中是 `page=2`；总条数保持不变，第一、最后一页的按钮不会越界。

## 3. 筛选与分页使用同一份 query

先接标题查询：页面从 React 导入 `FormEvent` 类型，从 `@/components/ui/input` 导入 `Input`，增加输入状态和提交函数：

```tsx
const [draftTitle, setDraftTitle] = useState("");

function handleSearch(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setQuery((current) => ({ ...current, title: draftTitle.trim() || undefined, page: 1 }));
}
```

在页面标题下方加入：

```tsx
<form onSubmit={handleSearch} className="flex gap-3">
  <Input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="按标题筛选" />
  <Button type="submit">查询</Button>
</form>
```

`draftTitle` 是正在填写的值，`query.title` 是已提交的查询条件。点击查询后才发送请求，翻页继续使用已提交条件。

状态和标签筛选作为本步的自主练习，使用已经安装的 Base UI Select，按以下契约接入：

| 控件 | 值与处理 |
|---|---|
| 状态 | “全部”移除 `query.status`；其他值为 `draft`、`published` |
| 标签 | 请求 `GET /api/tags` 得到选项；“全部”移除 `query.tagId`；选中值保持数字 id |
| 两个控件共同规则 | 更新对应查询条件时将 `page` 设为 1，保留其他条件 |
| 重置 | 清空输入与筛选，将 query 恢复为 `{ page: 1, pageSize: 10 }` |

在 `features/articles/api.ts` 增加 `apiRequest` 和 `TagSummary` 导入，再增加 `getTags()`，第 27 章表单继续复用它：

```ts
export function getTags() {
  return apiRequest<TagSummary[]>("/api/tags");
}
```

标签选项只需在页面加载时获取，失败时在筛选区显示错误并允许重试；不要把这次请求混入文章列表错误。Base UI Select 用 `value`、`onValueChange` 连接值，并用 `items` 提供值与显示文案的对应关系；实际组合参照下方官方 Select 文档。

**验证：** 在第二页选择草稿和一个标签，回到第一页且请求带上两个条件；翻页保留筛选；清空条件恢复全部文章。自行补齐这组控件后再进入删除。

## 4. 删除成功后重新获取列表

在 `features/articles/api.ts` 增加 `apiRequestNoContent` 导入和删除函数。这里不使用删除响应的数据：

```ts
export function deleteArticle(articleId: number) {
  return apiRequestNoContent(`/api/articles/${articleId}`, { method: "DELETE" });
}
```

在文章页面同目录新建 `delete-article-button.tsx`：

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
  disabled,
}: {
  article: ArticleListItem;
  onDeleted: () => void;
  disabled: boolean;
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
          <Button variant="destructive" size="sm" disabled={disabled || deleting} />
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

`onDeleted` 在删除成功后通知页面刷新；失败时保留列表。`disabled` 用于列表正在刷新时暂时关闭新的删除入口。

接下来修改 `article-columns.tsx`：增加 `DeleteArticleButton` 导入，把 `export const articleColumns = [...]` 改成返回同一数组的函数，原来的列保留，并在数组末尾增加操作列：

```tsx
export function getArticleColumns(onDeleted: () => void, loading: boolean): ColumnDef<ArticleListItem>[] {
  return [
    // 保留已有的标题、slug、状态、标签列。
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <DeleteArticleButton article={row.original} onDeleted={onDeleted} disabled={loading} />
      ),
    },
  ];
}
```

在 `page.tsx` 将 `articleColumns` 导入改为 `getArticleColumns`，增加：

```tsx
function handleDeleted() {
  if (result?.items.length === 1 && query.page > 1) {
    setQuery((current) => ({ ...current, page: current.page - 1 }));
  } else {
    reload();
  }
}

const columns = getArticleColumns(handleDeleted, loading);
```

表格调用中的 `columns={articleColumns}` 改为 `columns={columns}`。删除最后一页唯一一条记录时，先退页再请求；其他删除只触发刷新。最终行数据和总数都以接口返回为准。

**验证：** 取消确认不请求 API；确认删除后列表与总数更新；删除末页唯一记录能退页；删除失败不会假装移除数据。

## 5. 完善反馈并进入表单章

按已有页面经验，把加载文字完善为 Skeleton 或表格上方的刷新提示，把错误区换成 Alert，保留重试。空数据和请求失败使用不同反馈。详情编辑与新建入口在第 27 章对应页面建立后再接入。

检查标题、状态、标签组合查询，翻页、删除、会话失效和网络失败；再运行：

```bash
npm run lint
npx tsc --noEmit
npm run build
```

通过后用 [26A](./26A-TanStack-Table从数据到表格实例.md) 复习 `data → columns → table → 单元格`，再进入第 27 章。

## 官方参考

- [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/base/data-table)
- [shadcn/ui Select](https://ui.shadcn.com/docs/components/base/select)
- [shadcn/ui Alert Dialog](https://ui.shadcn.com/docs/components/base/alert-dialog)
- [TanStack Table Pagination](https://tanstack.com/table/v8/docs/guide/pagination)
