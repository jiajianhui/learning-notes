# 23. shadcn/ui 为什么不是传统组件库

## 问题背景

Mini CMS 使用同一个 Express 后端，完成两个并列的管理后台项目：

```text
mini-cms/
├── server/                Express 正式后端
├── admin-web-antd/        Ant Design 后台项目
└── admin-web-shadcn/      shadcn/ui 后台项目
```

实现时先完成 Ant Design，再进入 shadcn/ui。这个顺序是为了先稳定 API 和业务流程，再集中学习 shadcn/ui、TanStack Table 与 React Hook Form，不代表两个项目有主次。最终目标是两套后台都能独立完成核心管理链路。

本章先解决一个容易误解的问题：

```text
shadcn/ui 不是 Next.js 这样的应用框架，
也不是安装一个运行时包就结束的传统组件库。
```

读完后应该能判断 shadcn/ui、Tailwind CSS、Base UI、TanStack Table、React Hook Form 和 Zod 分别负责什么。第 24 章再创建项目。

---

## 1. 先放回前端技术分层

| 技术 | 当前项目中负责什么 |
|---|---|
| Next.js | 路由、页面结构、构建和运行方式 |
| React | 组件、状态和页面更新 |
| TypeScript | 检查组件、请求和表单数据的类型 |
| Tailwind CSS | 通过工具类组织样式 |
| shadcn/ui | 把可修改的组件源码加入项目，并提供统一的组合方式和默认视觉 |
| Base UI | 提供弹窗、下拉菜单等组件底层的交互和可访问性行为 |
| TanStack Table | 管理列、行和表格状态，不负责最终视觉 |
| React Hook Form | 管理表单字段、提交状态和字段错误 |
| Zod | 在浏览器运行时校验表单值 |

所以这一套组合不是：

```text
shadcn/ui
-> 包办整个前端
```

而是：

```text
Next.js 组织应用
-> React 组织页面
-> shadcn/ui 提供可修改的 UI 组件
-> TanStack Table 或 React Hook Form 补充复杂行为
-> Express 继续处理真正的业务和数据
```

---

## 2. 传统组件库和源码分发有什么区别

### 2.1 Ant Design：从依赖中导入组件

Ant Design 安装在 `node_modules` 中，业务代码通过包名导入：

```tsx
import { Button, Form, Table } from "antd";
```

组件的主要实现由 Ant Design 项目维护。当前项目负责传入数据、属性和事件。

需要修复或升级时，通常先更新 npm 依赖，再根据更新说明处理变化。

### 2.2 shadcn/ui：把组件源码加入当前项目

运行：

```bash
npx shadcn@latest add button
```

CLI 会把 Button 的源码和需要的依赖加入当前工程，例如：

```text
admin-web-shadcn/
└── src/
    └── components/
        └── ui/
            └── button.tsx
```

页面随后从自己的目录导入：

```tsx
import { Button } from "@/components/ui/button";
```

关键区别不是导入路径，而是维护责任发生了变化：

| 问题 | Ant Design | shadcn/ui |
|---|---|---|
| 组件主要实现在哪里 | `node_modules/antd` | 当前项目的 `components/ui` |
| 能否直接修改组件源码 | 通常不修改依赖源码 | 可以，源码本来就属于项目 |
| 怎样获得上游修复 | 升级依赖 | 查看差异，再决定是否合并 |
| 深度定制 | 使用主题、属性或封装 | 可以直接修改组件结构和样式 |

这就是 shadcn/ui 所说的 Open Code：它提供的是一套组件源码分发方式，用来建立自己的组件系统。

---

## 3. CLI、`components.json` 和组件文件怎样配合

第一次执行 `shadcn init` 后，项目会出现 `components.json`。它主要告诉 CLI：

- 当前项目使用什么样式和底层组件方案。
- 全局 CSS 在哪里。
- `components`、`ui`、`lib` 等路径别名指向哪里。
- 后续执行 `shadcn add` 时，文件应该写到哪里。

可以先把它理解成：

```text
components.json
-> 给 shadcn CLI 提供项目地图

components/ui/
-> 保存已经加入项目的真实组件源码

app/ 和 components/
-> 使用这些 UI 组件组合业务页面
```

`components.json` 只服务于 CLI，不会替代 Next.js 的 `package.json`、`tsconfig.json` 和 `app/` 路由。

---

## 4. Base UI 为什么还在 shadcn/ui 下面

弹窗和下拉菜单不只是画一个方框。它们还要处理：

- 键盘焦点怎样进入和离开。
- Esc 是否关闭。
- 弹层打开后背景是否还能操作。
- 屏幕阅读器怎样理解标题和说明。

Base UI 这类底层组件库主要提供这些行为，shadcn/ui 再在上面组织结构和样式：

```text
Base UI
-> 底层交互和可访问性行为

shadcn/ui 组件源码
-> 组合底层能力并加入默认样式

业务页面
-> 传入 Mini CMS 的文章、标签和操作
```

shadcn/ui 项目使用创建时选定的 Base UI 方案。以后即使 shadcn/ui 还支持其他底层方案，也不要在同一个项目里混用。

---

## 5. Tailwind CSS 负责样式，不负责业务

shadcn/ui 组件通过 Tailwind CSS 工具类表达布局和视觉：

```tsx
<div className="flex items-center justify-between gap-4">
  <h1 className="text-2xl font-semibold">文章管理</h1>
</div>
```

这些类名分别表达弹性布局、两端对齐、间距和字号。它们不会：

- 请求 Express API。
- 保存文章。
- 判断管理员是否登录。
- 替代 React 状态。

Tailwind CSS 只是另一种写 CSS 的组织方式。第一轮只学习当前页面实际用到的布局、间距、颜色和响应式类，不需要先背完整工具类列表。

---

## 6. 为什么表格和表单还要增加其他库

### 6.1 shadcn Table 主要提供结构和视觉

`Table`、`TableHeader`、`TableRow` 和 `TableCell` 可以显示表格，但它们不知道：

- Mini CMS 有哪些列。
- 当前处于第几页。
- 行操作怎样找到文章 id。
- 筛选条件怎样发送给 Express。

复杂文章列表因此会加入 TanStack Table：

```text
Express 返回当前页文章
-> TanStack Table 按列定义组织行
-> shadcn Table 把表头和单元格渲染出来
```

### 6.2 shadcn Field 主要提供表单结构

`Field`、`FieldLabel` 和 `FieldError` 能组织标签、控件和错误提示，但不会自动管理整张文章表单。

第 26 章会加入：

```text
React Hook Form
-> 保存字段值、提交状态和字段错误

前端 Zod
-> 提交前校验标题、slug 和正文

shadcn Field
-> 把输入控件和错误展示出来
```

Express 中的 Zod 仍然保留，因为浏览器中的校验可以被绕过。

---

## 7. 两套后台中的组件对应关系

| Ant Design 后台项目 | shadcn/ui 后台项目 |
|---|---|
| `Layout`、`Menu` | `Sidebar`、`Breadcrumb` |
| `Table` | `Table` + TanStack Table |
| `Form` | `Field` + React Hook Form + Zod |
| `Modal`、`Popconfirm` | `Dialog`、`AlertDialog` |
| `message` | `Toast` |
| `Spin` | `Spinner`、`Skeleton` |
| `Alert`、`Empty` | `Alert`、`Empty` |

这张表只表示当前项目中的职责对应，不表示两边 API 一一相同。比较重点是：

```text
同一份 Express API
-> Ant Design 怎样快速完成
-> shadcn/ui 怎样通过组合完成
```

---

## 8. 组件进入项目后怎样更新

已经加入 `components/ui` 的文件可能被当前项目修改过，因此不能把上游版本直接覆盖进来。

需要检查更新时先查看差异：

```bash
npx shadcn@latest add button --dry-run
npx shadcn@latest add button --diff
```

再判断：

```text
上游修复了什么
-> 当前项目修改了什么
-> 是否需要手动合并
-> 类型检查和页面交互是否仍然通过
```

不要为了追求“永远最新”频繁重装没有问题的组件。当前项目先固定能运行的代码，真正遇到功能或安全更新时再处理。

---

## 9. shadcn/ui 项目的学习范围

当前必学：

- 源码分发模式。
- Tailwind CSS 的最小页面样式。
- Sidebar、Table、AlertDialog、Field 和 Toast。
- TanStack Table 的列、行和服务端分页边界。
- React Hook Form 与前端 Zod 的表单链路。

这次不做：

- 新增后端接口或数据库表。
- 重新设计文章和标签业务规则。
- 把两套前端的 UI 组件抽成共享包。
- 富文本编辑器、多角色和新的权限系统。
- 同时混用 Base UI、Radix UI 和 React Aria。

---

## 小结

先记住这一条：

```text
shadcn CLI 把组件源码加入项目
-> 项目拥有并维护这些 UI 组件
-> 业务页面继续组合组件并调用 Express
-> 复杂表格和表单再由专门工具补充行为
```

下一章会创建 `admin-web-shadcn`，先完成端口、API 请求、登录保护和后台骨架。文章表格和复杂表单分别留到第 25、26 章。

## 官方参考

- [shadcn/ui Introduction](https://ui.shadcn.com/docs)
- [shadcn/ui Next.js 安装](https://ui.shadcn.com/docs/installation/next)
- [shadcn/ui components.json](https://ui.shadcn.com/docs/components-json)
- [shadcn/ui CLI](https://ui.shadcn.com/docs/cli)
