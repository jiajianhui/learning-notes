# 09. Router 和 Store 最小语法：把两个页面和共享状态跑起来

## 问题背景

读完 `08-SPA前端路由和状态管理` 后，你已经知道：

```text
Router 管页面位置。
Store 管共享数据。
```

但只知道概念还不够。下一步做 `05-router` 和 `06-state-management` 时，需要先看见代码长什么样。

这一篇只讲够写 demo 的最小语法：

```text
定义两个页面
-> 用 Router 切换页面
-> 定义一个 store
-> 两个页面共用同一个 count
```

不讲：

```text
路由守卫
嵌套路由
动态路由参数
异步请求状态
复杂模块拆分
Redux 完整模式
```

先抓住最核心的一条：

```text
URL 变化 -> Router 换页面组件
共享数据变化 -> Store 通知用到它的组件更新
```

---

## 核心解释

### 1. 这次 demo 要做什么

沿用前面的“计数器 + 列表”小功能，只加两个能力：

```text
/counter  显示计数器页
/todos    显示列表页
```

两个页面都能看到同一个 `count`：

```text
CounterPage 点 +1
TodosPage 里看到的 count 也跟着变
```

这时分工很清楚：

| 能力 | 负责什么 |
|---|---|
| Router | 当前显示 `CounterPage` 还是 `TodosPage` |
| Store | `count` 放在哪里，哪些页面可以读和改 |

---

### 2. React Router 最小语法：URL 对应组件

React 常见路由工具是 `react-router-dom`。

安装：

```bash
npm install react-router-dom
```

最小文件结构可以先这样：

```text
src/
  App.tsx
  pages/
    CounterPage.tsx
    TodosPage.tsx
```

`App.tsx` 里放路由：

```tsx
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { CounterPage } from "./pages/CounterPage";
import { TodosPage } from "./pages/TodosPage";

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/counter">计数器</Link>
        <Link to="/todos">列表</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/counter" replace />} />
        <Route path="/counter" element={<CounterPage />} />
        <Route path="/todos" element={<TodosPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

先记这几个写法：

| 写法 | 你可以怎么理解 |
|---|---|
| `BrowserRouter` | 开启前端路由能力 |
| `Link to="/counter"` | 点击后切换 URL，不整页刷新 |
| `Routes` | 放一组路由规则 |
| `Route path="/counter"` | URL 是 `/counter` 时显示哪个组件 |
| `Navigate` | 访问 `/` 时自动跳到 `/counter` |

页面组件先保持很简单：

```tsx
export function CounterPage() {
  return <h1>计数器页</h1>;
}
```

```tsx
export function TodosPage() {
  return <h1>列表页</h1>;
}
```

到这里，Router 已经完成了自己的工作：

```text
URL 是 /counter -> 显示 CounterPage
URL 是 /todos   -> 显示 TodosPage
```

---

### 3. Zustand 最小语法：把 count 放到共享 store

React 里想轻量管理共享状态，可以用 Zustand。

安装：

```bash
npm install zustand
```

新建 store 文件：

```text
src/
  stores/
    useCounterStore.ts
```

```ts
import { create } from "zustand";

type CounterState = {
  count: number;
  increase: () => void;
  reset: () => void;
};

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));
```

先记住：

| 写法 | 你可以怎么理解 |
|---|---|
| `create(...)` | 创建一个 store |
| `count` | 共享数据 |
| `increase` | 修改共享数据的方法 |
| `set(...)` | 通知 Zustand 更新 store |
| `useCounterStore(...)` | 组件里读取 store 的 Hook |

`CounterPage.tsx` 使用 store：

```tsx
import { useCounterStore } from "../stores/useCounterStore";

export function CounterPage() {
  const count = useCounterStore((state) => state.count);
  const increase = useCounterStore((state) => state.increase);
  const reset = useCounterStore((state) => state.reset);

  return (
    <main>
      <h1>计数器页</h1>
      <p>count: {count}</p>
      <button onClick={increase}>+1</button>
      <button onClick={reset}>重置</button>
    </main>
  );
}
```

`TodosPage.tsx` 也读取同一个 store：

```tsx
import { useState } from "react";
import { useCounterStore } from "../stores/useCounterStore";

export function TodosPage() {
  const [content, setContent] = useState("");
  const [todos, setTodos] = useState<string[]>([]);
  const count = useCounterStore((state) => state.count);

  function addTodo() {
    const text = content.trim();

    if (!text) {
      return;
    }

    setTodos([...todos, text]);
    setContent("");
  }

  return (
    <main>
      <h1>列表页</h1>
      <p>共享 count: {count}</p>

      <input
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      <button onClick={addTodo}>添加</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo}>{todo}</li>
        ))}
      </ul>
    </main>
  );
}
```

这里要看懂一个点：

```text
todos 还是 TodosPage 自己的局部 state。
count 才放进 store，因为它要跨页面共享。
```

不要因为学了 store，就把所有数据都放进 store。

---

### 4. Vue Router 最小语法：URL 对应页面组件

Vue 常见路由工具是 `vue-router`。

安装：

```bash
npm install vue-router
```

最小文件结构可以先这样：

```text
src/
  App.vue
  main.ts
  router.ts
  pages/
    CounterPage.vue
    TodosPage.vue
```

`router.ts` 里定义路由：

```ts
import { createRouter, createWebHistory } from "vue-router";
import CounterPage from "./pages/CounterPage.vue";
import TodosPage from "./pages/TodosPage.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/counter" },
    { path: "/counter", component: CounterPage },
    { path: "/todos", component: TodosPage },
  ],
});
```

`main.ts` 里把 router 接到 Vue 应用上：

```ts
import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "./router";

createApp(App).use(router).mount("#app");
```

`App.vue` 里放导航和页面出口：

```vue
<template>
  <nav>
    <RouterLink to="/counter">计数器</RouterLink>
    <RouterLink to="/todos">列表</RouterLink>
  </nav>

  <RouterView />
</template>
```

先记这几个写法：

| 写法 | 你可以怎么理解 |
|---|---|
| `createRouter` | 创建路由对象 |
| `createWebHistory()` | 使用正常 URL 模式 |
| `routes` | 一组 URL 和组件的对应关系 |
| `RouterLink` | 点击后切换 URL，不整页刷新 |
| `RouterView` | 当前页面组件显示的位置 |

页面组件先保持很简单：

```vue
<template>
  <h1>计数器页</h1>
</template>
```

```vue
<template>
  <h1>列表页</h1>
</template>
```

到这里，Vue Router 已经完成了自己的工作：

```text
URL 是 /counter -> 显示 CounterPage.vue
URL 是 /todos   -> 显示 TodosPage.vue
```

---

### 5. Pinia 最小语法：把 count 放到共享 store

Vue 里常见状态管理工具是 Pinia。

安装：

```bash
npm install pinia
```

新建 store 文件：

```text
src/
  stores/
    counter.ts
```

```ts
import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", {
  state: () => ({
    count: 0,
  }),
  actions: {
    increase() {
      this.count += 1;
    },
    reset() {
      this.count = 0;
    },
  },
});
```

`main.ts` 里把 Pinia 接到 Vue 应用上：

```ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import { router } from "./router";

createApp(App).use(createPinia()).use(router).mount("#app");
```

先记住：

| 写法 | 你可以怎么理解 |
|---|---|
| `defineStore("counter", ...)` | 定义一个名叫 counter 的 store |
| `state` | 共享数据 |
| `actions` | 修改共享数据的方法 |
| `useCounterStore()` | 组件里拿到这个 store |
| `createPinia()` | 让整个 Vue 应用可以使用 Pinia |

`CounterPage.vue` 使用 store：

```vue
<script setup lang="ts">
import { useCounterStore } from "../stores/counter";

const counter = useCounterStore();
</script>

<template>
  <main>
    <h1>计数器页</h1>
    <p>count: {{ counter.count }}</p>
    <button @click="counter.increase()">+1</button>
    <button @click="counter.reset()">重置</button>
  </main>
</template>
```

`TodosPage.vue` 也读取同一个 store：

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useCounterStore } from "../stores/counter";

const counter = useCounterStore();
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
</script>

<template>
  <main>
    <h1>列表页</h1>
    <p>共享 count: {{ counter.count }}</p>

    <input v-model="content" />
    <button @click="addTodo">添加</button>

    <ul>
      <li v-for="todo in todos" :key="todo">
        {{ todo }}
      </li>
    </ul>
  </main>
</template>
```

这里和 React 版一样：

```text
todos 还是 TodosPage 自己的局部 ref。
count 才放进 store，因为它要跨页面共享。
```

---

## 技术关系

### 1. React 和 Vue 的对应关系

| 任务 | React | Vue |
|---|---|---|
| 路由工具 | React Router | Vue Router |
| 导航链接 | `Link` | `RouterLink` |
| 页面出口 | `Routes` + `Route` | `RouterView` |
| 轻量 store | Zustand | Pinia |
| 组件里读 store | `useCounterStore(...)` | `useCounterStore()` |

语法不同，但主线一样：

```text
先把页面拆成组件
再让 URL 决定显示哪个页面组件
最后把跨页面数据放到 store
```

---

### 2. Router 和 Store 不要混在一起

Router 适合放：

```text
当前在哪个页面
路径参数
查询参数
```

Store 适合放：

```text
登录用户
购物车数量
跨页面共享 count
多个远距离组件都要用的数据
```

局部 state / ref 适合放：

```text
输入框内容
弹窗开关
当前页面内部的小列表
只在一个组件里用的数据
```

一句话判断：

```text
和 URL 有关，先想 Router。
多个远距离组件要共享，才想 Store。
只在当前组件里用，留在 state/ref。
```

---

## 学习建议

做 demo 时按这个顺序，不容易乱：

```text
1. 先做两个空页面：CounterPage / TodosPage
2. 再加 Router：能在 /counter 和 /todos 之间切换
3. 再加 store：两个页面都能看到同一个 count
4. 最后再把 Todo 列表补回来
```

如果卡住，可以按这个表回看：

| 卡住的地方 | 回看哪一节 |
|---|---|
| 不知道 URL 怎么换页面 | 2 / 4 Router 最小语法 |
| 不知道导航链接怎么写 | `Link` / `RouterLink` |
| 不知道页面显示在哪里 | `Routes` + `Route` / `RouterView` |
| 不知道共享 count 放哪 | 3 / 5 Store 最小语法 |
| 不知道哪些数据该放 store | 技术关系第 2 节 |

现在不需要背 API。你只要能说清楚：

```text
这个文件在定义路由。
这个文件在定义 store。
这个页面在读取 store。
这个页面自己的输入框状态没有必要放 store。
```

就够继续往后学。

---

## 小结

Router 和 Store 的最小主线是：

```text
Router：URL -> 页面组件
Store：共享数据 -> 多个组件一起用
```

React 里常见组合：

```text
React Router + Zustand
```

Vue 里常见组合：

```text
Vue Router + Pinia
```

读完这一篇，就可以在已有 React/Vue demo 上加两个页面，再把 `count` 从单个组件挪到 store 里。
