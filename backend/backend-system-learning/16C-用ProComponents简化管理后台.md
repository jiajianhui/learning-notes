# 16C. 用 ProComponents 简化管理后台

第 14～16 章用普通 Ant Design 组件跑通了后台，16A 解释数据流，16B 解释组件怎样拆分。本章在同一个 `admin-web-antd` 中，用 ProComponents 简化文章和标签管理，保留已有的导航、列表、筛选和抽屉编辑流程。

先通过 Git 保留基础版，方便比较。这里不新建第三套后台；后面的 `admin-web-shadcn` 仍是独立项目。16B 的拆分方案不必全部实施后再来本章。

## 1. 先知道它接管什么

ProComponents 是基于 Ant Design 的业务组件。普通 Button、Alert、Popconfirm 仍可继续使用。

| 原来的组合 | 改造方向 | 仍由项目负责 |
|---|---|---|
| Table、搜索控件、列表 Effect | ProTable | 接口适配、操作按钮、错误提示 |
| Drawer、Form、提交按钮 | DrawerForm、ProForm 字段 | 回填数据、校验规则、保存请求与错误文案 |
| Layout、Menu | 按需使用 ProLayout | Next.js 路由、菜单链接和选中状态 |

数据库、Express 接口和 `features/*/api.ts` 继续复用。目标是减少重复的界面与状态代码，不改变已有业务规则。

### 安装前先匹配版本

当前工程使用 Ant Design 6。2026-09-20 核对 npm 时，ProComponents 的 `latest` 为 `2.8.10`，声明支持 Ant Design 4/5；`beta` 为 `3.1.14-7`，对应支持 Ant Design 6 的预发布版本。

先在 `admin-web-antd` 中核对，再选择兼容版本，不使用 `--force` 跳过冲突：

```bash
npm view @ant-design/pro-components dist-tags
npm view @ant-design/pro-components@3.1.14-7 peerDependencies
```

若仍采用上述 Ant Design 6 方案，可固定安装已核对的预发布版本，并保存 lockfile：

```bash
npm install --save-exact @ant-design/pro-components@3.1.14-7
```

以后使用正式兼容版本时，重新核对依赖要求和对应文档。下面展示的是改造位置与局部代码，不是完整页面。

## 2. 先让文章列表使用 ProTable

### 2.1 把接口接到 request

在文章页面从 `@ant-design/pro-components` 导入 `ProTable`、`ActionType`，从 React 导入 `useRef`。继续使用已有的 `getArticles()`，将列表请求接到 ProTable 的 `request`：

```tsx
const actionRef = useRef<ActionType | undefined>(undefined);

// 放在页面 JSX 中；columns 下一小节调整。
<ProTable<ArticleListItem, ArticleListQuery>
  rowKey="id"
  columns={columns}
  actionRef={actionRef}
  pagination={{ defaultPageSize: 10, showSizeChanger: false }}
  request={async ({ current = 1, pageSize = 10, title, status, tagId }) => {
    const result = await getArticles({
      page: current, pageSize, title, status, tagId,
    });
    return {
      data: result.data,
      total: result.pagination.total,
      success: true,
    };
  }}
  onRequestError={(error) => messageApi.error(error.message)}
/>
```

`ArticleListItem` 和 `ArticleListQuery` 来自第 16 章的文章类型文件。如果本地查询类型仍拼为 `ArtilceListQuery`，先统一名称与引用。`messageApi` 继续由页面的 `App.useApp()` 获取。

这里只有两处转换：ProTable 的 `current` 对应接口的 `page`，后端的 `pagination.total` 对应 ProTable 的 `total`。`getArticles()` 请求失败会抛错，不会执行成功返回；`onRequestError` 负责显示错误。

确认能加载和翻页后，再移除原来与它重复的 `articles`、`total`、`listLoading`、列表 Effect，以及受控分页代码。请求交给 `request` 后，不再让旧 Effect 同时请求这张表。

### 2.2 用列配置生成筛选控件

将列类型改为 `ProColumns<ArticleListItem>[]`，`ProColumns` 从同一个包导入。按原有筛选范围配置：

| 字段 | 配置思路 |
|---|---|
| 标题 | `dataIndex: "title"`，同时用于展示和搜索 |
| 状态 | `valueType: "select"`，用 `valueEnum` 配置草稿、已发布 |
| 标签筛选 | 单独配置 `dataIndex: "tagId"`、`hideInTable: true`，用 `fieldProps.options` 接收数字 id 的标签选项 |
| 标签展示 | 保留原 `articleTags` 的 `render`，设置 `hideInSearch: true` |
| ID、slug 等非搜索列 | 设置 `hideInSearch: true` |
| 操作列 | `valueType: "option"`，保留编辑按钮和删除确认 |

列既能描述表格，也能描述搜索字段；`hideInTable` 和 `hideInSearch` 控制各自出现的位置。确认筛选条件能传入 `request` 后，删除原来的搜索框和筛选 Select。

保存、删除成功后，用 `actionRef.current?.reload()` 重新获取文章列表，替代页面的 `refreshVersion`。`actionRef` 是调用表格方法的入口，不是一份列表状态。

验证：标题、状态、标签可以组合查询，翻页带上正确条件，操作后数据与总数更新。第 16 章的“快速切换条件”和“删除最后一页唯一一条数据”也要重测；若版本未自动退页，可在删除后用 `reload(true)` 回到第一页重新获取，不能把空白页当作完成。

## 3. 再用 DrawerForm 简化表单

先保留原来的文章详情请求和 `initialValues` 转换，将 `ArticleForm` 的字段逐步换成 ProForm 字段：

| 原字段 | 对应组件 |
|---|---|
| 标题、slug | `ProFormText` |
| 摘要、正文 | `ProFormTextArea` |
| 状态、标签 | `ProFormSelect`，标签通过 `fieldProps={{ mode: "multiple" }}` 开启多选 |

字段的 `name`、`rules`、选项和值类型沿用现有定义。随后由 `DrawerForm<ArticleFormValues>` 包住这些字段，替代外层 Drawer 与 Form；不要把已有的整个 `ArticleForm` 再嵌进去，造成两层 Form。已有抽屉开关通过 `open={drawerOpen}`、`onOpenChange={setDrawerOpen}` 接入，继续由页面决定新建或编辑。

DrawerForm 的 `onFinish` 等待保存请求，返回 `true` 表示成功并关闭，返回 `false` 保留抽屉。下面是创建表单的局部属性写法：

```tsx
onFinish={async (values) => {
  setSubmitError(null);
  try {
    await createArticle(values);
    messageApi.success("文章已创建");
    void actionRef.current?.reload();
    return true;
  } catch (error) {
    setSubmitError(error instanceof Error ? error.message : "保存失败");
    return false;
  }
}}
```

DrawerForm 根据异步提交管理提交按钮的加载，可以移除手写 `submitting`；`submitError` 和表单内的 Alert 继续保留。编辑时调用 `updateArticle()`，没有修改则提示并返回 `false`，不要误关抽屉。

文章编辑仍需获取详情，`summary ?? ""`、标签 id 提取也仍需要；标签编辑则继续直接用当前行回填。异步详情到达后再挂载带初始值的表单，或使用表单实例回填，不假设修改 `initialValues` 会自动更新已经挂载的表单。

本章版本通过 `drawerProps={{ destroyOnHidden: true }}` 配置关闭后销毁内容；如果错误状态保存在抽屉外的父组件，打开新表单时仍需清空。先确认创建、回填、重复 slug 提示和再次打开都正常，再移除旧 Drawer 及其重复控制代码。

## 4. 将同样的做法用到标签页和布局

标签页沿用 ProTable 和 DrawerForm，但标签不分页：设置 `pagination={false}`，`request` 返回 `{ data: await getTags(), success: true }`。新建、编辑仍只有名称和 slug；删除后重新获取标签列表。

布局最后处理。当前导航简单时可以继续保留；若使用 ProLayout，就用它替换已有后台 Layout、Menu，保留文章与标签入口，菜单通过 Next.js Link 跳转，用当前 pathname 控制选中项。ProLayout 不会自动接管 Next.js 路由，也不需要另建一套 Umi 工程。

保持原有页面区域和操作位置即可，不为像素级复刻增加大量覆盖样式。仍然使用 Next.js、Ant Design Provider 和原来的请求封装。

## 5. 用同一组操作比较改造前后

在 `admin-web-antd` 中运行 `npx tsc --noEmit` 和 `npm run build`，再检查：

- 文章与标签都能新建、编辑、删除，失败时保留输入并提示原因。
- 文章筛选、分页、标签回填、发布与撤回行为一致。
- 操作后重新获取数据，慢速网络下有加载提示；没有新旧两套请求同时执行。
- 文章列表代码减少的部分，能明确对应到 ProTable 的请求、搜索或分页能力。

本章完成后，继续在这个 `admin-web-antd` 上接第 17、17A 章的登录。第 24～28 章另建 shadcn/ui 后台，最终比较的是“Ant Design + ProComponents”与“shadcn/ui + TanStack Table + React Hook Form”；基础 Ant Design 版本通过 Git 回看。

## 官方参考

- [ProTable 使用说明](https://github.com/ant-design/pro-components/blob/master/guidelines/components/pro-table.md)
- [DrawerForm 使用说明](https://github.com/ant-design/pro-components/blob/master/guidelines/components/drawer-form.md)
- [发布标签与版本](https://www.npmjs.com/package/@ant-design/pro-components?activeTab=versions)

官方示例可能跨版本，安装版本的类型声明与依赖要求应一起核对，尤其是 Drawer 的销毁属性。
