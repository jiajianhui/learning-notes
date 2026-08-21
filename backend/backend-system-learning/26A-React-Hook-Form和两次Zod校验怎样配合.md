# 26A. React Hook Form 和两次 Zod 校验怎样配合

## 问题背景

第 26 章已经完成文章新建和编辑。本章不增加字段，只串起一次表单提交：

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

## 7. 编辑页为什么需要 `reset()`

`defaultValues` 只在表单第一次创建时读取。编辑页第一次渲染时，请求可能还没有返回：

```text
第一次渲染
-> 只有空值

文章请求成功
-> 得到真实 initialValues
```

需要显式执行：

```ts
form.reset(initialValues);
```

它用文章详情重新建立整张表单的当前值和初始状态。不要为每个字段分别调用 `setValue()`，除非只想修改其中一个字段。

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
- 编辑页没有正确回填：回看第 7 节。
- 提交失败后输入丢失：回看第 8 节。

能说清这条线，就可以进入第 27 章：

```text
控件变化
-> React Hook Form 保存字段
-> 前端 Zod 校验
-> Express 再校验
-> 成功跳转，失败 setError
```
