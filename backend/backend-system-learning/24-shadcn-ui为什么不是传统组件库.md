# 24. shadcn/ui 为什么不是传统组件库

你已经用 Ant Design 和 ProComponents 完成一套后台。接下来用同一套 Express API 做 `admin-web-shadcn`，主要学习变化在于：组件源码进入自己的项目，表格和表单的行为由你组合。

## 1. 从 Button 的导入位置看维护方式

Ant Design 从依赖包导入：

```tsx
import { Button } from "antd";
```

shadcn CLI 把组件源码和依赖加入项目后，页面从本地文件导入：

```tsx
import { Button } from "@/components/ui/button";
```

| 要做什么 | Ant Design | shadcn/ui |
|---|---|---|
| 调整外观 | 使用组件属性、主题或封装 | 修改本地组件的结构和样式 |
| 阅读主要实现 | 查看依赖源码 | 打开 `components/ui`，继续追到底层依赖 |
| 获取上游修复 | 升级依赖并处理兼容变化 | 比较本地组件与上游变化，再合并需要的修改；底层依赖仍需升级 |

本地源码也需要维护。不要用上游版本直接覆盖已经改过的组件；先比较差异，再验证页面交互。

## 2. CLI 把什么放进项目

第 25 章会初始化 shadcn/ui，并加入实际使用的组件。这里先认识两个位置：

- `components.json`：保存样式方案、路径别名等配置，让 CLI 知道后续组件放在哪里。
- `components/ui/`：保存加入项目的 UI 源码，业务页面从这里导入。

本项目统一使用 Base UI 方案。Base UI 提供焦点、键盘和弹层等底层交互，shadcn 组件在其上组合结构与样式。阅读 Select、Dialog 时，可以沿本地文件的 import 找到这层关系。

样式继续使用 Tailwind；只按当前页面需要调整布局、间距、颜色和响应式规则。

## 3. 用文章列表和表单理解怎样组合

Ant Design 的 Table、Form，以及更高层的 ProTable、DrawerForm，已经组合了较多行为。shadcn 的 Table 和 Field 更接近界面结构，需要与状态工具连接。

**文章列表：**

```text
Axios 请求 Express 当前页文章
-> TanStack Table 根据 data 和 columns 组织行与单元格
-> shadcn Table 渲染表格
-> 页面改变查询条件后重新请求
```

TanStack Table 不自带最终视觉。当前项目仍由后端筛选和分页，浏览器负责传条件、显示结果与分页控件。

**文章表单：**

```text
Input、Select、Checkbox 接收输入
-> React Hook Form 保存字段状态
-> 前端 Zod 校验
-> Axios 提交给已有 Express API
-> Field 和错误提示显示结果
```

Field 组织标签、控件和错误，React Hook Form 管理值与提交，Zod 负责校验。前端校验改善填写体验，后端继续执行已有的输入校验和业务规则。

## 4. 接下来怎样练

| 章节 | 要完成的结果 | 重点学习 |
|---|---|---|
| 25 | 第二套后台能登录、退出并显示布局 | 本地组件、Axios 和已有认证接口的连接 |
| 26、26A | 文章列表能筛选、翻页和删除 | 列、表格实例、行模型和服务端分页 |
| 27、27A | 文章能新建、编辑并显示字段错误 | React Hook Form、Controller 和 Zod |
| 28 | 独立完成标签管理，比较两套后台 | 将已有做法迁移到相邻功能 |

两套后台复用相同的业务与 API，前端代码各自维护。请求工具从 `fetch` 换成 Axios 是本轮练习安排，不是 UI 组件的要求。比较组件方案时，用实际的文章列表和表单代码说明差异。

继续 [25-用 shadcn/ui 和 Axios 建立管理后台骨架](./25-用shadcn-ui建立管理后台骨架.md)。

## 官方参考

- [shadcn/ui Introduction](https://ui.shadcn.com/docs)
- [shadcn/ui components.json](https://ui.shadcn.com/docs/components-json)
- [shadcn/ui CLI](https://ui.shadcn.com/docs/cli)
