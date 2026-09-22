# 27. shadcn/ui 怎样完成文章新建和编辑表单

文章列表已经可用。本章按“创建草稿 → 选择状态与标签 → 编辑回填 → 显示字段错误”推进，始终使用同一个 `ArticleForm`。

请求和跳转沿用已有能力。重点是 `useForm` 怎样管理值、`Controller` 怎样连接控件，以及 `handleSubmit` 怎样先校验再保存。

## 1. 先创建并保存一篇草稿

在 `admin-web-shadcn` 安装：

```bash
npm install react-hook-form @hookform/resolvers zod
npx shadcn@latest add textarea checkbox
```

Field、Input、Button、Select、Toast 已由前面章节加入。下面先完成标题、slug、摘要、正文四个字段；状态暂时使用后端已有的默认草稿，标签在下一步接入。

### 1.1 定义表单值和保存请求

新建 `features/articles/article-form-schema.ts`：

```ts
import { z } from "zod";

export const articleFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "标题不能为空")
    .max(200, "标题不能超过 200 个字符"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "slug 不能为空")
    .max(200, "slug 不能超过 200 个字符")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "slug 只能包含小写字母、数字和连字符",
    ),
  summary: z
    .string()
    .trim()
    .max(500, "摘要不能超过 500 个字符"),
  content: z
    .string()
    .trim()
    .min(1, "正文不能为空")
    .max(100_000, "正文内容过长"),
});

export type ArticleFormValues = z.infer<
  typeof articleFormSchema
>;

export const emptyArticleFormValues: ArticleFormValues = {
  title: "",
  slug: "",
  summary: "",
  content: "",
};
```

这是浏览器里的填写规则。字段名和限制继续对应已有 Express Schema，服务端校验照常执行。

在 `features/articles/api.ts` 中增加 `ArticleFormValues` 类型导入和 `createArticle()`；保留第 26 章的请求函数及导入：

```ts
import type { ArticleFormValues } from "./article-form-schema";

export function createArticle(values: ArticleFormValues) {
  const { summary, ...input } = values;
  const normalizedSummary = summary.trim();
  return apiRequest<{ id: number }>("/api/articles", {
    method: "POST",
    data: {
      ...input,
      ...(normalizedSummary ? { summary: normalizedSummary } : {}),
    },
  });
}
```

空摘要不进入创建请求；返回类型只声明当前需要的 id，不改变后端实际返回的文章数据。

### 1.2 让字段值通过校验后交给页面

新建 `features/articles/article-form.tsx`：

```tsx
"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { articleFormSchema, type ArticleFormValues } from "./article-form-schema";

type ArticleFormProps = {
  initialValues: ArticleFormValues;
  submitLabel: string;
  onSubmit: (values: ArticleFormValues) => Promise<void>;
};

export function ArticleForm({ initialValues, submitLabel, onSubmit }: ArticleFormProps) {
  const router = useRouter();
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: initialValues,
    mode: "onSubmit",
  });

  async function handleValidSubmit(values: ArticleFormValues) {
    form.clearErrors("root");
    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/login");
        return;
      }
      form.setError("root.server", {
        message: error instanceof Error ? error.message : "保存失败，请稍后重试",
      });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleValidSubmit)} className="space-y-6">
      {form.formState.errors.root?.server && (
        <p role="alert">{form.formState.errors.root.server.message}</p>
      )}
      <FieldGroup>
        {([
          { name: "title", label: "标题" },
          { name: "slug", label: "slug" },
          { name: "summary", label: "摘要" },
        ] as const).map(({ name, label }) => (
          <Controller
            key={name}
            name={name}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        ))}
        <Controller
          name="content"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>正文</FieldLabel>
              <Textarea {...field} id={field.name} aria-invalid={fieldState.invalid} className="min-h-80" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "保存中…" : submitLabel}
      </Button>
    </form>
  );
}
```

三个 Input 使用相同结构，所以按字段名生成；`as const` 保留这些具体字段名，让 Controller 能匹配 Schema。正文仍独立使用 Textarea。

沿一次输入理解新机制：`field.value` 是当前值，`field.onChange` 把输入交回 React Hook Form；提交时 `handleSubmit` 先通过 `zodResolver` 校验，成功才调用 `handleValidSubmit(values)`。失败先显示到字段，不会请求 API。

表单等待父页面的 `onSubmit`。请求失败留在本页并保留输入；`isSubmitting` 管理等待期间的按钮状态。后端字段错误在第 4 节细化，目前先显示整表错误。

### 1.3 从新建页保存到列表

新建 `app/(admin)/admin/articles/new/page.tsx`：

```tsx
"use client";

import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { ArticleForm } from "@/features/articles/article-form";
import { createArticle } from "@/features/articles/api";
import { emptyArticleFormValues, type ArticleFormValues } from "@/features/articles/article-form-schema";

export default function NewArticlePage() {
  const router = useRouter();

  async function handleSubmit(values: ArticleFormValues) {
    await createArticle(values);
    toast.add({ type: "success", title: "文章创建成功" });
    router.push("/admin/articles");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">新建文章</h1>
      <ArticleForm initialValues={emptyArticleFormValues} submitLabel="创建文章" onSubmit={handleSubmit} />
    </div>
  );
}
```

在列表页导入 Next.js `Link`，在标题旁加入 `<Button render={<Link href="/admin/articles/new" />}>新建文章</Button>`。

**验证：** 空标题不发请求；填好内容后返回列表并看到新草稿；重复 slug 会保留输入并显示后端错误。第一次保存链路到这里已经完成。

## 2. 接入状态和标签

### 2.1 扩展同一份 Schema 和初始值

在原 `articleFormSchema` 的 `z.object()` 中增加：

```ts
status: z.enum(["draft", "published"]),
tagIds: z.array(z.number().int().positive()),
```

在 `emptyArticleFormValues` 中增加 `status: "draft"`、`tagIds: []`。类型由 Schema 推导，请求函数的 `...input` 会把这两个新字段一并提交。

### 2.2 新建页先取得标签选项

在新建页从 `@/features/articles/api` 补充导入 `getTags`，从 React 导入 `useEffect`、`useState`，从 `@/features/articles/types` 导入 `TagSummary` 类型，并从已有请求层和 UI 目录导入 `ApiError`、`Button`。在 `NewArticlePage` 中加入以下状态和 Effect：

```tsx
const [tags, setTags] = useState<TagSummary[]>([]);
const [loading, setLoading] = useState(true);
const [loadError, setLoadError] = useState("");
const [loadVersion, setLoadVersion] = useState(0);

useEffect(() => {
  let active = true;
  setLoading(true);
  setLoadError("");
  getTags()
    .then((nextTags) => { if (active) setTags(nextTags); })
    .catch((error) => {
      if (!active) return;
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/login");
        return;
      }
      setLoadError("标签加载失败");
    })
    .finally(() => { if (active) setLoading(false); });
  return () => { active = false; };
}, [loadVersion, router]);
```

在原页面 `return` 之前增加加载与重试分支：

```tsx
if (loading) return <p role="status">正在加载标签…</p>;
if (loadError) return (
  <div role="alert">
    <p>{loadError}</p>
    <Button onClick={() => setLoadVersion((current) => current + 1)}>重试</Button>
  </div>
);
```

给表单调用增加 `tags={tags}`。同时在 `ArticleFormProps` 增加 `tags: TagSummary[]`，组件参数中解构 `tags`；`TagSummary` 从已有 `./types` 导入。

### 2.3 将 Select 和 Checkbox 连接到表单

在表单文件导入 `@/components/ui/select` 中的 `Select`、`SelectContent`、`SelectItem`、`SelectTrigger`、`SelectValue`。在已有 FieldGroup 中加入状态控件：

```tsx
<Controller
  name="status"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="article-status">
        状态
      </FieldLabel>
      <Select
        name={field.name}
        value={field.value}
        items={[{ label: "草稿", value: "draft" }, { label: "已发布", value: "published" }]}
        onValueChange={field.onChange}
      >
        <SelectTrigger
          id="article-status"
          aria-invalid={fieldState.invalid}
        >
          <SelectValue placeholder="选择状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">草稿</SelectItem>
          <SelectItem value="published">
            已发布
          </SelectItem>
        </SelectContent>
      </Select>
      {fieldState.invalid && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )}
/>
```

`value` 和 `onValueChange` 将 Select 的值交给 React Hook Form，`items` 对应值与显示文案。前端只提交状态，发布时间仍由 Express 决定。

再导入 `Checkbox`，并从 `@/components/ui/field` 补充导入 `FieldSet`、`FieldLegend`。在同一 FieldGroup 中加入标签控件：

```tsx
<Controller
  name="tagIds"
  control={form.control}
  render={({ field, fieldState }) => (
    <FieldSet data-invalid={fieldState.invalid}>
      <FieldLegend variant="label">标签</FieldLegend>
      <FieldGroup
        data-slot="checkbox-group"
        className="grid gap-3 sm:grid-cols-2"
      >
        {tags.map((tag) => {
          const checked = field.value.includes(tag.id);

          return (
            <Field
              key={tag.id}
              orientation="horizontal"
            >
              <Checkbox
                id={`tag-${tag.id}`}
                checked={checked}
                onCheckedChange={(nextChecked) => {
                  field.onChange(
                    nextChecked
                      ? [...field.value, tag.id]
                      : field.value.filter(
                          (tagId) => tagId !== tag.id,
                        ),
                  );
                }}
              />
              <FieldLabel htmlFor={`tag-${tag.id}`}>
                {tag.name}
              </FieldLabel>
            </Field>
          );
        })}
      </FieldGroup>
      {fieldState.invalid && (
        <FieldError errors={[fieldState.error]} />
      )}
    </FieldSet>
  )}
/>
```

勾选时把数字 id 加入数组，取消时移除。`tags` 是全部可选项，`tagIds` 是本次提交的选择；保存后的关联仍由后端维护。

**验证：** 新建草稿和已发布文章各一篇；选择两个标签，列表正确显示名称；不选标签也能保存。正文继续作为字符串编辑，解析和排版留到第 19 章。

## 3. 编辑时先加载详情，再挂载同一张表单

### 3.1 取得详情并提交修改

在 `features/articles/types.ts` 增加详情类型。它保留列表已有的 `articleTags` 结构，再补完整正文和摘要：

```ts
export type ArticleDetail = ArticleListItem & {
  summary: string | null;
  content: string;
  updatedAt: string;
};
```

在 `api.ts` 增加 `ArticleDetail` 类型导入，追加两个函数，已有 `getTags()`、`createArticle()` 保留：

```ts
export function getArticle(articleId: number) {
  return apiRequest<ArticleDetail>(`/api/articles/${articleId}`);
}

export function updateArticle(articleId: number, values: ArticleFormValues) {
  return apiRequest<ArticleDetail>(`/api/articles/${articleId}`, {
    method: "PATCH",
    data: { ...values, summary: values.summary.trim() || null },
  });
}
```

创建时空摘要省略，编辑时清空摘要提交 `null`，沿用后端已有语义。

### 3.2 将详情转换为 initialValues

新建 `app/(admin)/admin/articles/[id]/edit/page.tsx`：

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { ArticleForm } from "@/features/articles/article-form";
import type { ArticleFormValues } from "@/features/articles/article-form-schema";
import {
  getArticle,
  getTags,
  updateArticle,
} from "@/features/articles/api";
import type {
  ArticleDetail,
  TagSummary,
} from "@/features/articles/types";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const articleId = Number(params.id);
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [tags, setTags] = useState<TagSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadVersion, setLoadVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    if (!Number.isInteger(articleId) || articleId <= 0) {
      setLoadError("文章 id 不合法");
      setLoading(false);
      return;
    }

    Promise.all([
      getArticle(articleId),
      getTags(),
    ])
      .then(([nextArticle, nextTags]) => {
        if (!active) return;
        setArticle(nextArticle);
        setTags(nextTags);
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/login");
          return;
        }

        if (error instanceof ApiError && error.status === 404) {
          setLoadError("文章不存在");
          return;
        }

        setLoadError("文章加载失败");
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [articleId, loadVersion, router]);

  const initialValues = useMemo<ArticleFormValues | null>(
    () =>
      article
        ? {
            title: article.title,
            slug: article.slug,
            summary: article.summary ?? "",
            content: article.content,
            status: article.status,
            tagIds: article.articleTags.map(({ tag }) => tag.id),
          }
        : null,
    [article],
  );

  async function handleSubmit(values: ArticleFormValues) {
    await updateArticle(articleId, values);
    toast.add({
      type: "success",
      title: "文章保存成功",
    });
    router.push("/admin/articles");
  }

  if (loading) return <p>正在加载文章…</p>;
  if (loadError || !initialValues) {
    return (
      <div role="alert">
        <p>{loadError || "文章不存在"}</p>
        <Button onClick={() => setLoadVersion((current) => current + 1)}>重试</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">编辑文章</h1>
      <ArticleForm
        key={articleId}
        initialValues={initialValues}
        tags={tags}
        submitLabel="保存修改"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

这里等待文章与标签都加载完成，才挂载 `ArticleForm`。`initialValues` 在表单首次创建时已经是真实数据，因此使用 `defaultValues` 即可，不需要为这次加载再加 `reset()` Effect。`key={articleId}` 让同一路由切换文章时也有明确的表单身份；第 27A 章再解释哪些场景需要 `reset()`。

回填时把 `summary: null` 转成空字符串，把 `articleTags[].tag.id` 转成 `tagIds`；请求响应的形状和第 16A 章一致。

在第 26 章的操作列中，用 `<div className="flex gap-2">` 包住编辑和删除按钮。导入 `Link` 和 `Button`，在原删除按钮旁增加：

```tsx
<Button variant="outline" render={<Link href={`/admin/articles/${row.original.id}/edit`} />}>
  编辑
</Button>
```

**验证：** 打开带标签的文章，字段与已选标签正确；修改正文、清空摘要和标签后保存，再次打开确认结果；不存在的 id 显示明确提示。

## 4. 把后端错误显示到对应位置

正常保存与编辑已经可用，现在细化 `ArticleForm` 中的提交失败处理。Axios 拦截器已经把响应转换成 `ApiError`，不再重新解析 HTTP。

从 `react-hook-form` 增加导入 `FieldPath` 类型，并在组件外定义允许映射的字段：

```ts
const articleFieldNames = new Set(["title", "slug", "summary", "content", "status", "tagIds"]);
```

只替换 `handleValidSubmit()` 的 `catch` 内容，原来的 `try`、`onSubmit` 和控件保留：

```ts
if (!(error instanceof ApiError)) {
  form.setError("root.server", { message: "网络异常，请稍后重试" });
  return;
}

if (error.status === 401) {
  router.replace("/login");
  return;
}

if (error.code === "SLUG_CONFLICT") {
  form.setError("slug", { message: error.message });
  return;
}

let hasFieldError = false;
for (const detail of error.details ?? []) {
  const fieldName = detail.field?.split(".")[0];
  if (fieldName && articleFieldNames.has(fieldName)) {
    form.setError(fieldName as FieldPath<ArticleFormValues>, {
      message: detail.message,
    });
    hasFieldError = true;
  }
}

if (!hasFieldError) {
  form.setError("root.server", { message: error.message });
}
```

三类结果现在有不同去处：前端校验自动进入字段错误；后端 422 的 `details` 和 409 的 `SLUG_CONFLICT` 映射到字段；网络或其他业务失败进入 `root.server`。不属于当前字段的错误仍作为整表提示。

**验证：** 重复 slug 显示在 slug 旁；后端返回带 `details` 的 422 时，对应字段显示错误；断开后端再保存，正文仍保留；会话失效时跳转登录。失败时不调用 `reset()`。

## 5. 完成页面反馈与回看

将新建、编辑页的加载文字完善为 Skeleton，将错误区和整表错误改为 Alert，保留重试；这些视觉组合沿用第 26 章，不另写一套状态逻辑。

完整操作一次“新建 → 选择标签 → 编辑 → 清空摘要 → 发布 → 返回列表”，再执行：

```bash
npm run lint
npx tsc --noEmit
npm run build
```

通过后阅读 [27A](./27A-React-Hook-Form和两次Zod校验怎样配合.md)，复习字段值、校验和错误如何流动，再进入第 28 章独立完成标签管理。

## 官方参考

- [shadcn/ui React Hook Form](https://ui.shadcn.com/docs/forms/react-hook-form)
- [shadcn/ui Field](https://ui.shadcn.com/docs/components/base/field)
- [shadcn/ui Select](https://ui.shadcn.com/docs/components/base/select)
- [React Hook Form](https://react-hook-form.com/docs)
