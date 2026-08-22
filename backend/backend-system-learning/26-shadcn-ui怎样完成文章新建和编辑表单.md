# 26. shadcn/ui 怎样完成文章新建和编辑表单

## 这一章要完成什么

第 25 章已经完成文章列表。本章用同一个 `ArticleForm` 完成：

```text
新建页
-> 输入并校验文章
-> POST /api/articles

编辑页
-> GET /api/articles/:id
-> 回填同一张表单
-> PATCH /api/articles/:id
```

shadcn `Field` 负责表单结构，React Hook Form 管理字段和提交状态，前端 Zod 提供即时校验。Express 中已经存在的 Zod 继续保护真正的数据入口。

第一次实现时按本章完成结果。完成后再阅读 [26A](./26A-React-Hook-Form和两次Zod校验怎样配合.md)，复习表单内部数据流。

---

## 1. 安装依赖和组件

在 `admin-web-shadcn` 中执行：

```bash
npm install react-hook-form @hookform/resolvers zod

npx shadcn@latest add \
  checkbox \
  textarea
```

`select`、`field`、`input`、`button` 和 `toast` 已经在前面章节加入，不重复安装。

---

## 2. 确定目录和复用边界

```text
app/(admin)/admin/articles/
├── new/
│   └── page.tsx
└── [id]/
    └── edit/
        └── page.tsx

features/articles/
├── api.ts
├── article-form-schema.ts
├── article-form.tsx
└── types.ts
```

复用的是：

- 字段结构。
- 前端校验。
- 标签选择。
- 字段错误展示。
- 提交按钮和提交状态。

不复用的是：

- 新建调用 POST。
- 编辑先加载详情，再调用 PATCH。
- 成功后的提示文案。

---

## 3. 定义前端表单 Schema

新建 `article-form-schema.ts`：

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
  status: z.enum(["draft", "published"]),
  tagIds: z.array(z.number().int().positive()),
});

export type ArticleFormValues = z.infer<
  typeof articleFormSchema
>;

export const emptyArticleFormValues: ArticleFormValues = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  status: "draft",
  tagIds: [],
};
```

这些规则和 Express 当前 contract 保持一致，但不是把后端 Schema 导入浏览器。两个工程分别在不同运行环境中校验。

前端 Schema 解决的是填写体验：

```text
明显错误
-> 不必等待网络
-> 直接显示在字段旁边
```

后端 Schema 仍然是最终边界。

---

## 4. 补齐文章详情和请求函数

继续在 `types.ts` 中增加：

```ts
export type ArticleDetail = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  status: ArticleStatus;
  tags: TagSummary[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};
```

继续在 `api.ts` 中增加。先把第 25 章的请求函数导入补成：

```ts
import {
  apiRequest,
  apiRequestNoContent,
  apiRequestResult,
} from "@/lib/api";
import type { ArticleFormValues } from "./article-form-schema";
import type {
  ArticleDetail,
  TagSummary,
} from "./types";

export function getArticle(articleId: number) {
  return apiRequest<ArticleDetail>(
    `/api/articles/${articleId}`,
  );
}

export function getTags() {
  return apiRequest<TagSummary[]>("/api/tags");
}

export function createArticle(values: ArticleFormValues) {
  const { summary, ...input } = values;
  const normalizedSummary = summary.trim();

  return apiRequest<ArticleDetail>("/api/articles", {
    method: "POST",
    data: {
      ...input,
      ...(normalizedSummary
        ? { summary: normalizedSummary }
        : {}),
    },
  });
}

export function updateArticle(
  articleId: number,
  values: ArticleFormValues,
) {
  return apiRequest<ArticleDetail>(
    `/api/articles/${articleId}`,
    {
      method: "PATCH",
      data: {
        ...values,
        summary: values.summary.trim() || null,
      },
    },
  );
}
```

新建时，空摘要不进入请求；编辑时，清空摘要会提交 `null`。这和前面为创建、更新接口定义的字段规则一致。

如果 Ant Design 项目已经把标签请求和类型放在 `features/tags/`，shadcn/ui 项目也可以采用相同的功能目录规则，但两边仍各自维护前端代码。

---

## 5. 创建可复用 ArticleForm

新建 `article-form.tsx`：

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  type FieldPath,
  useForm,
} from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TagSummary } from "./types";
import {
  articleFormSchema,
  type ArticleFormValues,
} from "./article-form-schema";
import { ApiError } from "@/lib/api";

type ArticleFormProps = {
  initialValues: ArticleFormValues;
  tags: TagSummary[];
  submitLabel: string;
  onSubmit: (values: ArticleFormValues) => Promise<void>;
};

const articleFieldNames = new Set([
  "title",
  "slug",
  "summary",
  "content",
  "status",
  "tagIds",
]);

export function ArticleForm({
  initialValues,
  tags,
  submitLabel,
  onSubmit,
}: ArticleFormProps) {
  const router = useRouter();
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: initialValues,
    mode: "onSubmit",
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  async function handleValidSubmit(
    values: ArticleFormValues,
  ) {
    form.clearErrors("root");

    try {
      await onSubmit(values);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        form.setError("root.server", {
          message: "网络异常，请稍后重试",
        });
        return;
      }

      if (error.status === 401) {
        router.replace("/login");
        return;
      }

      if (error.code === "SLUG_CONFLICT") {
        form.setError("slug", {
          message: error.message,
        });
        return;
      }

      let hasFieldError = false;

      for (const detail of error.details ?? []) {
        const fieldName = detail.field?.split(".")[0];

        if (
          fieldName &&
          articleFieldNames.has(fieldName)
        ) {
          form.setError(
            fieldName as FieldPath<ArticleFormValues>,
            { message: detail.message },
          );
          hasFieldError = true;
        }
      }

      if (!hasFieldError) {
        form.setError("root.server", {
          message: error.message,
        });
      }
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleValidSubmit)}
      className="space-y-6"
    >
      {form.formState.errors.root?.server && (
        <Alert variant="destructive">
          <AlertTitle>保存失败</AlertTitle>
          <AlertDescription>
            {form.formState.errors.root.server.message}
          </AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        {/* 字段控件放在下面各节。 */}
      </FieldGroup>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "保存中…"
            : submitLabel}
        </Button>
      </div>
    </form>
  );
}
```

`form.reset(initialValues)` 很重要：编辑页的文章详情是异步加载的，第一次渲染时还没有真实文章，加载成功后需要用 `reset` 更新整张表单。

---

## 6. 输入框、正文和错误怎样连接

在 `FieldGroup` 中先加入标题：

```tsx
<Controller
  name="title"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>标题</FieldLabel>
      <Input
        {...field}
        id={field.name}
        aria-invalid={fieldState.invalid}
        placeholder="请输入文章标题"
      />
      {fieldState.invalid && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )}
/>
```

`Controller` 把 React Hook Form 的字段状态交给 `Input`：

```text
field.value
-> 当前字段值

field.onChange
-> 输入变化时更新表单

fieldState.error
-> 当前字段错误
```

`slug` 和 `summary` 使用同样结构。正文改用 `Textarea`：

```tsx
<Controller
  name="content"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>正文</FieldLabel>
      <Textarea
        {...field}
        id={field.name}
        aria-invalid={fieldState.invalid}
        className="min-h-80 font-mono"
        placeholder="使用 Markdown 编写正文"
      />
      {fieldState.invalid && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )}
/>
```

当前项目正文仍然是普通多行文本或 Markdown，不增加富文本编辑器。

---

## 7. 用 Select 连接文章状态

`Select` 不是原生 input，需要显式连接 `value` 和 `onValueChange`：

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

选择 `published` 只提交状态。`publishedAt` 什么时候写入仍由 Express 的发布规则决定，前端不自己生成发布时间。

---

## 8. 用 Checkbox 管理标签 id 数组

文章与标签是多对多，表单只提交选中的 `tagIds`：

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

浏览器只管理数字 id 数组；Express 再检查标签是否真实存在，并在事务中更新文章与标签关系。

---

## 9. 新建页怎样使用 ArticleForm

`new/page.tsx` 是 Client Component。它先加载标签，再显示表单：

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { ArticleForm } from "@/features/articles/article-form";
import {
  emptyArticleFormValues,
  type ArticleFormValues,
} from "@/features/articles/article-form-schema";
import {
  createArticle,
  getTags,
} from "@/features/articles/api";
import type { TagSummary } from "@/features/articles/types";
import { ApiError } from "@/lib/api";

export default function NewArticlePage() {
  const router = useRouter();
  const [tags, setTags] = useState<TagSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getTags()
      .then(setTags)
      .catch((error) => {
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/login");
          return;
        }

        setLoadError("标签加载失败");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSubmit(values: ArticleFormValues) {
    await createArticle(values);
    toast.add({
      type: "success",
      title: "文章创建成功",
    });
    router.push("/admin/articles");
  }

  if (loading) return <p>正在加载标签…</p>;
  if (loadError) return <p>{loadError}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">新建文章</h1>
      <ArticleForm
        initialValues={emptyArticleFormValues}
        tags={tags}
        submitLabel="创建文章"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

完整实现时，把标签的 loading 和 error 换成第 25 章已经用过的 Skeleton、Alert 和重试按钮，不要只保留文字占位。

---

## 10. 编辑页怎样回填同一张表单

`[id]/edit/page.tsx` 需要同时加载文章详情和标签：

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

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const articleId = Number(params.id);
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [tags, setTags] = useState<TagSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
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
        setArticle(nextArticle);
        setTags(nextTags);
      })
      .catch((error) => {
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
      .finally(() => setLoading(false));
  }, [articleId, router]);

  const initialValues = useMemo<ArticleFormValues | null>(
    () =>
      article
        ? {
            title: article.title,
            slug: article.slug,
            summary: article.summary ?? "",
            content: article.content,
            status: article.status,
            tagIds: article.tags.map((tag) => tag.id),
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
    return <p>{loadError || "文章不存在"}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">编辑文章</h1>
      <ArticleForm
        initialValues={initialValues}
        tags={tags}
        submitLabel="保存修改"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

完整实现还要区分：

- 401：跳转登录页。
- 404：明确显示文章不存在。
- 其他失败：显示 Alert 和重试。

这些状态在第 13、16A 和 25 章已经练过，这里只换成文章详情请求。

---

## 11. 后端错误怎样落到字段

Axios 遇到非 2xx 响应时，会进入第 24 章配置的响应拦截器，再统一转换成 `ApiError`。

建议映射：

| 后端结果 | 表单处理 |
|---|---|
| 422 且 details 指向 `title` 等字段 | `form.setError(fieldName)` |
| 409 slug 冲突 | `form.setError("slug")` |
| 401 | 跳转登录页 |
| 404 | 编辑页显示文章不存在 |
| 500 或网络失败 | `root.server` 显示整表错误 |

提交失败时不要调用 `form.reset()`，这样用户已经输入的正文不会丢失。

当前项目第 11 章已经把重复 slug 约定为 `SLUG_CONFLICT`。后续如果 Express contract 调整，两个后台都要同步使用同一个 code，不要各自创造名字。

---

## 12. 本章检查点

### 新建

- 空标题和错误 slug 不发送请求。
- 正确内容能创建文章并回到列表。
- 空摘要不会被错误保存成无意义的空字符串。
- 标签 id 由复选框数组产生。

### 编辑

- 文章详情和标签加载完成后正确回填。
- 清空摘要后保存为 `null`。
- 文章不存在时显示 404 状态。
- 更新失败时保留用户输入。

### 共同状态

- 提交期间按钮禁用，避免重复请求。
- 422 显示到对应字段。
- slug 冲突显示在 slug 字段旁。
- 401 回到登录页。
- 成功提示只在 Express 真正返回成功后出现。

最后执行：

```bash
npm run lint
npx tsc --noEmit
npm run build
```

三个检查通过后，阅读 [26A](./26A-React-Hook-Form和两次Zod校验怎样配合.md)，再进入第 27 章独立完成标签管理。

## 官方参考

- [shadcn/ui React Hook Form](https://ui.shadcn.com/docs/forms/react-hook-form)
- [shadcn/ui Field](https://ui.shadcn.com/docs/components/base/field)
- [shadcn/ui Select](https://ui.shadcn.com/docs/components/base/select)
- [React Hook Form](https://react-hook-form.com/docs)
- [Zod](https://zod.dev/)
