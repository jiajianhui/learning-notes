# 27A. React Hook Form 和两次 Zod 校验怎样配合

## 问题背景

第 27 章已经完成文章新建和编辑。本章不增加字段，只串起一次表单提交：

```text
用户输入
-> React Hook Form 保存字段状态
-> 前端 Zod 校验
-> onSubmit 发送 HTTP 请求
-> Express Zod 再校验
-> 保存或返回错误
-> 表单显示结果
```

这里最容易混淆的是：`Field`、React Hook Form、前端 Zod 和 Express Zod 都接触文章输入，但职责不同。

---

## 1. 四个对象分别负责什么

| 对象 | 当前项目中的职责 |
|---|---|
| shadcn `Field` | 组织 label、输入控件、说明和错误的页面结构 |
| React Hook Form | 保存字段值、字段错误、是否修改过和是否正在提交 |
| 前端 Zod | 在浏览器提交前检查表单值 |
| Express Zod | 在服务器收到请求后检查不可信输入 |

`Field` 不会自动保存整张表单，前端 Zod 也不能阻止其他客户端绕过浏览器直接请求 API。

---

## 2. `useForm()` 建立表单实例

```ts
const form = useForm<ArticleFormValues>({
  resolver: zodResolver(articleFormSchema),
  defaultValues: initialValues,
});
```

这一步把三部分组合起来：

```text
ArticleFormValues
-> TypeScript 认识字段类型

defaultValues
-> React Hook Form 知道初始字段值

zodResolver(articleFormSchema)
-> 提交时把数据交给前端 Zod
```

`form` 是当前表单的控制对象，后面会使用 `form.control`、`form.handleSubmit`、`form.setError` 和 `form.formState`。

---

## 3. `Controller` 连接非原生状态

```tsx
<Controller
  name="status"
  control={form.control}
  render={({ field, fieldState }) => (
    <Select
      value={field.value}
      onValueChange={field.onChange}
    />
  )}
/>
```

`Controller` 根据 `name` 找到一个字段，再把当前值和修改函数交给 UI 控件。

```text
Select 发生变化
-> field.onChange(newValue)
-> React Hook Form 更新 status
-> 下一次渲染得到新的 field.value
```

`fieldState.error` 则来自前端 Zod 或 `form.setError()`。

---

## 4. `handleSubmit()` 决定能不能调用 API

```tsx
<form onSubmit={form.handleSubmit(handleValidSubmit)}>
```

点击保存后的方向是：

```text
React Hook Form 收集字段
-> zodResolver 调用 articleFormSchema
├── 失败：写入字段错误，不调用 handleValidSubmit
└── 成功：把校验后的 values 交给 handleValidSubmit
```

所以 `handleValidSubmit` 收到的已经通过前端规则，但仍然必须发送到 Express 重新校验。

---

## 5. 为什么前后端需要两次 Zod

前端校验可以提供快速反馈：

```text
slug 含空格
-> 浏览器立即提示
```

但请求可以来自：

- 被修改过的浏览器代码。
- Apifox。
- 另一个前端。
- 恶意脚本。

因此 Express 仍然执行：

```text
request.body
-> 后端 Schema.parse()
-> 只有合法数据进入 service 或 repository
```

两次校验的关系是：

```text
前端 Zod：改善体验
后端 Zod：保护系统
```

即使两边规则相似，也不要删除后端校验。

---

## 6. 三类错误怎样回到表单

### 前端字段错误

前端 Zod 产生，React Hook Form 自动放入：

```ts
form.formState.errors.title
```

### 后端字段错误

Express 返回 422 和 `details`，页面使用：

```ts
form.setError("title", {
  message: "标题不能为空",
});
```

### 整张表单错误

网络失败或未知错误不一定属于某个字段：

```ts
form.setError("root.server", {
  message: "保存失败，请稍后重试",
});
```

409 slug 冲突虽然来自数据库唯一约束，但用户可以修改 slug 解决，所以适合显示到 `slug` 字段。

---

## 7. 当前编辑页为什么不需要 reset

第 27 章先显示加载状态，文章详情与标签都返回后才挂载 `ArticleForm`。因此要区分页面与表单的首次渲染：

```text
页面首次渲染 → 显示加载状态，表单尚未创建
详情返回 → 转换 initialValues → 挂载表单
useForm 的 defaultValues → 直接读取真实文章
```

当前实现没有先挂载一个空表单，不需要为了异步请求再调用 `reset()`。切换文章时，页面的加载分支和 `key={articleId}` 会让新文章使用新的表单实例。

如果以后保留同一个已挂载表单，再把另一篇文章传给它，`defaultValues` 不会因为属性变化自动重新初始化。那时才需要显式调用 `form.reset(nextValues)`，同时确认是否允许覆盖尚未保存的输入。

`reset()` 会一起更新当前值和表单的初始状态；只想修改某个字段时，才考虑 `setValue()`。

---

## 8. 提交失败为什么不能 reset

`reset()` 会改变表单当前值。失败时执行它，可能覆盖用户刚刚输入但还没保存的长正文。

正确方向：

```text
提交失败
-> 保留 values
-> setError 显示问题
-> 用户修改后再次提交

提交成功
-> 跳转列表或用服务器返回值更新表单
```

`form.formState.isSubmitting` 只负责提交期间禁用按钮，不代表服务器已经保存成功。

---

## 回看导航

- 不清楚 `Field` 和 React Hook Form 的区别：回看第 1 节。
- 不清楚 `Controller`：回看第 3 节。
- 前端错误为什么不调用 API：回看第 4 节。
- 不清楚为什么校验两次：回看第 5 节。
- 分不清 defaultValues 与 reset 的使用条件：回看第 7 节。
- 提交失败后输入丢失：回看第 8 节。

能说清这条线，就可以进入第 28 章：

```text
控件变化
-> React Hook Form 保存字段
-> 前端 Zod 校验
-> Express 再校验
-> 成功跳转，失败 setError
```
