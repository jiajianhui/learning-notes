# 24A. TanStack Table：从数据到表格实例

## 问题背景

第 24 章已经完成文章列表。这一章不再增加功能，只把 TanStack Table 的几个对象串成一条短主线：

```text
data + columns
-> useReactTable()
-> table 实例
-> row model
-> flexRender()
-> shadcn Table
```

如果第 24 章能运行，但看不清 `ColumnDef`、`table` 和 `row model` 怎样配合，就从这里重新理解。

---

## 1. headless 表格是什么意思

TanStack Table 是 headless 工具：它管理表格数据和行为，但不决定最终 HTML 与视觉。

```text
TanStack Table
-> 哪些列、哪些行、当前页和状态

shadcn Table
-> table、thead、tr、td 的结构和样式
```

所以页面需要同时使用两者。只安装 TanStack Table 不会自动出现一张带样式的表格。

---

## 2. `data` 是 Express 已经返回的当前页

```ts
const data: ArticleListItem[] = result.items;
```

每个元素代表一行文章。当前项目已经让 Express 执行筛选、排序和分页，所以传给 TanStack Table 的不是数据库全部文章，而是当前页结果。

不要再对 `data` 调用前端分页，避免：

```text
Express 已经返回第 2 页的 10 条
-> 浏览器又从这 10 条中切一次第 2 页
-> 得到空表格
```

---

## 3. `columns` 告诉表格怎样理解每一列

最简单的列：

```ts
{
  accessorKey: "status",
  header: "状态",
}
```

它告诉 TanStack Table：这一列从每行的 `status` 字段读取数据。

需要自定义显示时使用 `cell`：

```tsx
{
  accessorKey: "status",
  header: "状态",
  cell: ({ row }) => (
    <Badge>
      {row.original.status === "published" ? "已发布" : "草稿"}
    </Badge>
  ),
}
```

`row.original` 是 Express 返回的原始文章对象。操作列没有对应字段时，使用稳定的 `id: "actions"`。

---

## 4. `useReactTable()` 生成表格实例

```ts
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  manualPagination: true,
  rowCount: total,
  state: { pagination },
  onPaginationChange,
});
```

它没有渲染页面，而是把数据、列和状态组合成一个可查询的 `table` 对象。

常用结果：

| 调用 | 得到什么 |
|---|---|
| `table.getHeaderGroups()` | 可以渲染的表头分组 |
| `table.getRowModel().rows` | 当前准备渲染的行 |
| `row.getVisibleCells()` | 当前行可见的单元格 |
| `table.getCanPreviousPage()` | 是否还能向前翻页 |
| `table.getCanNextPage()` | 是否还能向后翻页 |

---

## 5. row model 是处理后的行视图

`data` 是输入，row model 是 TanStack Table 根据当前配置整理出的行。

当前练习只注册：

```ts
getCoreRowModel: getCoreRowModel()
```

因为筛选、排序和分页都在 Express。没有加入：

```ts
getFilteredRowModel()
getSortedRowModel()
getPaginationRowModel()
```

这不是缺少功能，而是职责已经放在后端。

---

## 6. `flexRender()` 把列定义变成 React 内容

`header` 和 `cell` 既可能是普通文字，也可能是返回 JSX 的函数。`flexRender()` 统一处理两种情况：

```tsx
flexRender(
  cell.column.columnDef.cell,
  cell.getContext(),
)
```

然后把结果放进 shadcn `TableCell`。所以完整方向是：

```text
ColumnDef 中的 cell
-> flexRender 执行
-> 得到 React 内容
-> TableCell 显示
```

---

## 7. 服务端分页时谁拥有状态

当前页码同时影响 API 请求和表格按钮，因此由文章页面拥有：

```text
页面 query.page
-> 发送给 Express
-> Express 返回当前页
-> 转成 TanStack pagination.pageIndex
-> 交给 table 实例
```

注意两边起点不同：

```text
API page：从 1 开始
TanStack pageIndex：从 0 开始
```

只在页面边界转换：

```ts
const pagination = {
  pageIndex: query.page - 1,
  pageSize: query.pageSize,
};
```

不要让多个组件各自猜测要不要加 1。

---

## 回看导航

- 不清楚 shadcn Table 与 TanStack Table 的区别：回看第 1 节。
- 不清楚 `data` 为什么只有当前页：回看第 2、5 节。
- 不清楚列怎样读取文章：回看第 3 节。
- 不清楚 `table` 从哪里来：回看第 4 节。
- 翻页出现偏移：回看第 7 节。

能说清下面这条线，就可以进入第 25 章：

```text
Express 当前页数据
-> data 和 columns
-> table 实例整理行
-> flexRender 产生单元格内容
-> shadcn Table 显示
```

