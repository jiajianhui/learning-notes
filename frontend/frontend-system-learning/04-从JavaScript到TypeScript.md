# 04. 从 JavaScript 到 TypeScript

## 问题背景

现代前端项目里经常看到：

```text
main.ts
main.tsx
App.tsx
vite.config.ts
tsconfig.json
```

于是很容易误会：

```text
TypeScript 是不是一套新的前端？
学了 TypeScript 还要不要学 JavaScript？
```

本文属于第二层：语言增强层。

```text
JavaScript 是底座。
TypeScript 是 JavaScript 的类型增强。
```

| 问题 | 答案 |
|---|---|
| 解决什么 | 给 JS 增加类型约束，让项目更好维护 |
| 依赖什么 | JavaScript 基础 |
| 上一层关系 | 建立在 HTML / CSS / JS / DOM 之上 |
| 下一层关系 | React/Vue 常用 TS 描述 props、state、API 返回数据 |

---

## 核心解释

### 1. 浏览器最终运行的仍然是 JavaScript

不管你写 React、Vue、Next 还是 Nuxt，最后都离不开 JavaScript。

JavaScript 负责：

```text
交互逻辑
数据处理
模块组织
异步请求
浏览器 API 调用
框架运行
```

TypeScript 不是绕开 JavaScript，而是站在 JavaScript 上。

---

### 2. TypeScript 到底加了什么

一句话：

```text
TypeScript = JavaScript + 类型系统
```

JavaScript：

```js
function formatPrice(price) {
  return price.toFixed(2);
}

formatPrice("19.9");
```

可能运行时才发现传错了。

TypeScript：

```ts
function formatPrice(price: number) {
  return price.toFixed(2);
}

formatPrice("19.9"); // 类型错误
```

编辑器和工具会提前提醒你。

---

### 3. TypeScript 解决的是维护问题

项目小的时候，很多约定靠脑子记。

项目大了以后，你会开始问：

```text
这个函数参数是什么？
API 返回什么字段？
组件 props 怎么传？
todo 有没有 id？
```

TypeScript 把这些约定写出来：

```ts
type Todo = {
  id: number;
  text: string;
  done: boolean;
};

const todos: Todo[] = [];
```

这里的 `Todo` 可以理解成“一个待办对象应该长什么样”。以后前端调用 Express API 时，后端可能返回这样的 JSON：

```json
{
  "id": 1,
  "text": "学习 TypeScript",
  "done": false
}
```

前端就可以用 `type` 描述它：

```ts
type Todo = {
  id: number;
  text: string;
  done: boolean;
};
```

也可以用 `interface` 描述：

```ts
interface Todo {
  id: number;
  text: string;
  done: boolean;
}
```

如果这个数据要传给组件，还可以继续描述 props：

```tsx
type TodoItemProps = {
  todo: Todo;
};

function TodoItem({ todo }: TodoItemProps) {
  return <li>{todo.text}</li>;
}
```

注意这里有两个容易混的词：

| 词 | 意思 |
|---|---|
| TypeScript 的 `interface` | 一种描述对象结构的语法 |
| API 返回数据 | 后端接口返回的数据，比如用户、文章、todo |

这不是为了“看起来高级”，而是为了少在运行时踩低级坑。

---

## 技术关系

### 不要把 TypeScript 当运行时

看到 `.ts`、`.tsx`、`tsconfig.json` 时，要这样理解：

```text
你写 TypeScript
工具检查类型
工具把 TS 转成 JS
浏览器运行 JS
```

| 现象 | 背后是谁 |
|---|---|
| 参数类型报错 | TypeScript |
| `main.ts` 能在浏览器工作 | Vite 等工具转换 |
| React props 有类型提示 | TypeScript 描述组件入参 |
| 浏览器真正执行 | JavaScript |

---

### TypeScript 和其他层的关系

```text
第一层：HTML / CSS / JS / DOM
第二层：TypeScript 增强 JS
第三层：React / Vue 常用 TS 描述 props、state、数据
第四层：Vite 等工具负责把 TS 处理成 JS
```

它不是 UI 框架，也不是构建工具。

---

### Swift 背景下怎么看 TS

你长期写 Swift，TypeScript 会更顺手一些。

| Swift 里的习惯 | TypeScript 里的价值 |
|---|---|
| 明确类型 | 函数参数、对象字段更清楚 |
| 编译期提示 | 提前发现一部分错误 |
| 结构化建模 | 用 `type` / `interface` 描述数据 |
| 重构依赖 IDE | 类型系统帮助找影响范围 |

但要注意：

```text
先懂 JavaScript，再用 TypeScript。
不要把 TypeScript 当成跳过 JS 的捷径。
```

---

## 学习建议

初学 TypeScript，先学实用部分：

| 内容 | 目标 |
|---|---|
| 基本类型 | `string`、`number`、`boolean` |
| 数组和对象 | 能描述列表和数据结构 |
| 函数类型 | 能给参数和返回值加类型 |
| `type` / `interface` | 能描述对象结构、API 返回数据和组件 props |
| 联合类型 | 能读懂 `string | number` |
| 可选属性 | 能读懂 `name?: string` |
| 类型推断 | 知道不是每个变量都要手写类型 |

先别急着碰：

```text
复杂条件类型
类型体操
过深的泛型嵌套
为了炫技写的工具类型
```

这些类型写法后面会在 Vite + Vanilla TS 版里用上：

| 原生 JS 写法 | TS 里可以怎么理解 |
|---|---|
| `let total = 0` | TS 会推断 `total` 是 `number` |
| `const todos = []` | 更清楚的写法是 `const todos: string[] = []` |
| `document.querySelector("#btn")` | 可以写成 `document.querySelector<HTMLButtonElement>("#btn")` |
| `{ id, text, done }` | 可以抽成 `type Todo = { ... }` |

Vite + Vanilla TS 版本放到读完 06 之后做。

```text
04 讲的是 TypeScript 属于哪一层。
06 才讲 Vite 怎么启动项目、处理 TS、提供开发服务器。
```

---

## 小结

TypeScript 位于第二层：语言增强层。

```text
JavaScript 决定前端能运行什么。
TypeScript 帮你更可靠地写 JavaScript。
```

它不是 React，不是 Vue，也不是 Vite。
