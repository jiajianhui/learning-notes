# 06. React 和 Vue 最小语法：写 Demo 前够用的 20%

## 问题背景

上一篇已经知道 React / Vue 为什么出现：

```text
原生 DOM：数据变了，你手动改页面。
React/Vue：数据变了，框架帮你更新页面。
```

但只知道“为什么”还不够。你马上要做 `03-vue` 或 `04-react`，如果完全不讲语法，会从 Vanilla TS 突然跳到框架代码，断层会很明显。

这一篇只讲够写“计数器 + Todo”用的最小语法。

不讲：

```text
生命周期
watch / computed
自定义 Hook
Context
组件通信大全
路由
状态管理
```

先抓 20% 高频写法，能把同一个 demo 写出来就够。

---

## 核心解释

### 1. 框架代码在写什么

原生 DOM 里，你通常这样想：

```text
找到 DOM
监听事件
修改数据
手动更新 DOM
```

React / Vue 里，你要换成这样想：

```text
声明状态
把状态写进 UI
事件里修改状态
框架根据状态更新页面
```

这就是从“操作 DOM”切到“状态驱动 UI”。

---

### 2. Vue 最小语法

Vue 常见写法是 `.vue` 单文件组件：

```vue
<script setup lang="ts">
const message = "你好 Vue";
</script>

<template>
  <h1>{{ message }}</h1>
</template>
```

先记住两块：

| 区域 | 负责什么 |
|---|---|
| `<script setup>` | 写数据、函数、事件逻辑 |
| `<template>` | 写页面结构 |

### Vue：显示数据

```vue
<script setup lang="ts">
const title = "待办列表";
</script>

<template>
  <h1>{{ title }}</h1>
</template>
```

`{{ title }}` 表示把数据插进页面。

### Vue：响应式状态

页面会变化的数据，用 `ref`：

```vue
<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <p>{{ count }}</p>
</template>
```

在 `<script setup>` 里读写时用 `.value`：

```ts
count.value += 1;
```

在 `<template>` 里不用写 `.value`：

```vue
{{ count }}
```

### Vue：点击事件

```vue
<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <button @click="count++">+1</button>
  <span>{{ count }}</span>
</template>
```

`@click` 就是监听点击。

### Vue：输入框

```vue
<script setup lang="ts">
import { ref } from "vue";

const content = ref("");
</script>

<template>
  <input v-model="content" />
  <p>{{ content }}</p>
</template>
```

`v-model` 表示输入框内容和 `content` 互相同步。

### Vue：列表渲染

```vue
<script setup lang="ts">
import { ref } from "vue";

const todos = ref<string[]>(["学 HTML", "学 TS"]);
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo">
      {{ todo }}
    </li>
  </ul>
</template>
```

`v-for` 用来循环列表。

### Vue：Todo 最小版

```vue
<script setup lang="ts">
import { ref } from "vue";

const content = ref("");
const todos = ref<string[]>([]);

function addTodo() {
  const text = content.value.trim();

  if (!text) {
    return;
  }

  todos.value.push(text);
  content.value = "";
}

function removeTodo(index: number) {
  todos.value.splice(index, 1);
}
</script>

<template>
  <input v-model="content" />
  <button @click="addTodo">添加</button>

  <ul>
    <li v-for="(todo, index) in todos" :key="todo">
      {{ todo }}
      <button @click="removeTodo(index)">删除</button>
    </li>
  </ul>
</template>
```

你先能看懂这段，就足够开始写 Vue 版 demo。

---

### 3. React 最小语法

React 常见写法是组件函数 + JSX：

```tsx
function App() {
  const message = "你好 React";

  return <h1>{message}</h1>;
}
```

先记住：

| 写法 | 负责什么 |
|---|---|
| `function App()` | 一个组件 |
| `return (...)` | 返回 UI |
| `{message}` | 把 JS 数据插进 JSX |

### React：显示数据

```tsx
function App() {
  const title = "待办列表";

  return <h1>{title}</h1>;
}
```

JSX 里用 `{}` 放 JavaScript 表达式。

### React：状态

页面会变化的数据，用 `useState`：

```tsx
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return <span>{count}</span>;
}
```

`count` 是当前数据，`setCount` 用来更新数据。

### React：点击事件

```tsx
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <span>{count}</span>
    </>
  );
}
```

React 里事件名用驼峰：`onClick`。

### React：输入框

```tsx
import { useState } from "react";

function App() {
  const [content, setContent] = useState("");

  return (
    <>
      <input
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      <p>{content}</p>
    </>
  );
}
```

React 里输入框常见写法是：

```text
value 负责显示当前值
onChange 负责把用户输入写回状态
```

### React：列表渲染

```tsx
const todos = ["学 HTML", "学 TS"];

return (
  <ul>
    {todos.map((todo) => (
      <li key={todo}>{todo}</li>
    ))}
  </ul>
);
```

React 里用 `map` 把数组变成 JSX 列表。

### React：Todo 最小版

```tsx
import { useState } from "react";

function App() {
  const [content, setContent] = useState("");
  const [todos, setTodos] = useState<string[]>([]);

  function addTodo() {
    const text = content.trim();

    if (!text) {
      return;
    }

    setTodos([...todos, text]);
    setContent("");
  }

  function removeTodo(index: number) {
    setTodos(todos.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <>
      <input
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      <button onClick={addTodo}>添加</button>

      <ul>
        {todos.map((todo, index) => (
          <li key={todo}>
            {todo}
            <button onClick={() => removeTodo(index)}>删除</button>
          </li>
        ))}
      </ul>
    </>
  );
}
```

你先能看懂这段，就足够开始写 React 版 demo。

---

## 技术关系

### Vue 和 React 的共同主线

| 任务 | Vue | React |
|---|---|---|
| 声明状态 | `ref(0)` | `useState(0)` |
| 显示数据 | `{{ count }}` | `{count}` |
| 点击事件 | `@click="addTodo"` | `onClick={addTodo}` |
| 输入框 | `v-model="content"` | `value` + `onChange` |
| 列表渲染 | `v-for` | `map` |
| 条件显示 | `v-if` | `condition ? ... : ...` |

两者语法不同，但都在做同一件事：

```text
状态 -> UI
事件 -> 改状态
状态变化 -> 框架更新 UI
```

### 和 Vanilla TS 的区别

Vanilla TS 里：

```text
你维护 todos
你清空 ul
你创建 li
你 appendChild
```

Vue / React 里：

```text
你维护 todos
你描述列表怎么由 todos 生成
框架更新真实 DOM
```

这就是为什么下一步要用框架重写同一个功能。

---

## 学习建议

不要把这篇当成 React/Vue 完整教程。

现在只要能回答这些问题：

```text
数据放在哪里？
页面怎么显示数据？
点击按钮怎么改数据？
输入框怎么绑定数据？
数组怎么渲染成列表？
删除按钮怎么知道删哪一项？
```

能回答这些，就可以开始做 `03-vue` 或 `04-react`。

真正复杂的组件通信、路由、状态管理，后面再学。

---

## 小结

写框架 demo 先抓这条链：

```text
状态
事件
列表
表单
条件显示
```

Vue 更像增强版 HTML：

```text
ref / v-model / @click / v-for
```

React 更像用 JavaScript 表达 UI：

```text
useState / onClick / onChange / map
```

掌握这些 20%，就够你把“计数器 + Todo”从 Vanilla TS 改写成 Vue 或 React。
