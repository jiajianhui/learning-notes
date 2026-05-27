# 02. HTML / CSS / JavaScript：前端基础层

## 问题背景

学了 React 或 Vue，还要不要学原生基础？

要。框架会改变写法，但不会改变浏览器的底层模型。

本文属于第一层：基础层。

```text
HTML / CSS / JavaScript / DOM
```

| 问题 | 答案 |
|---|---|
| 解决什么 | 让浏览器能显示页面、应用样式、响应交互 |
| 依赖什么 | 浏览器本身 |
| 下一层关系 | TypeScript、React/Vue、Vite 都建立在这一层之上 |

你现在写过 `minimal-frontend-demo/01-html-css-js`，这篇要做的事很简单：把你刚写过的代码放回基础层理解。

---

## 核心解释

### 1. 三件事分工不同

| 技术 | 负责什么 | 在你的 demo 里像什么 |
|---|---|---|
| HTML | 页面结构 | `span`、`button`、`input`、`ul` |
| CSS | 页面样式 | 颜色、间距、布局 |
| JavaScript | 交互逻辑 | 点击加一、添加待办、删除待办 |
| DOM | JS 操作页面的接口 | `querySelector`、`textContent`、`appendChild` |

所以不要把前端理解成“写 JS”。前端最底层一直是：

```text
结构 + 样式 + 逻辑 + 浏览器对象模型
```

---

### 2. HTML 是结构

HTML 负责“页面里有什么”。

```html
<p>当前计数：<span id="span">0</span></p>
<button id="btn">+</button>

<input id="input" type="text">
<button id="addBtn">添加</button>
<ul id="ul"></ul>
```

这里的重点不是好不好看，而是给 JavaScript 留下可操作的目标。

---

### 3. CSS 是样式

CSS 负责“页面长什么样”。

```css
main {
  max-width: 720px;
  margin: 40px auto;
  font-family: system-ui, sans-serif;
}

button {
  padding: 6px 12px;
  border: 1px solid #222;
  border-radius: 6px;
  cursor: pointer;
}

li {
  margin-top: 8px;
}
```

CSS 不负责点击逻辑，也不负责数据变化。它只负责让元素有布局、尺寸、颜色、间距和状态样式。

---

### 4. JavaScript 通过 DOM 找到 HTML

你的代码里有这些选择：

```js
const spanEl = document.querySelector("#span");
const btnEl = document.querySelector("#btn");
const inputEl = document.querySelector("#input");
const ulEl = document.querySelector("#ul");
```

这就是 DOM 的意义：

```text
HTML 是页面结构。
DOM 是浏览器把 HTML 变成的对象树。
JavaScript 通过 DOM API 操作页面。
```

如果 HTML 里没有对应的 `id`，JS 就找不到元素。

---

### 5. 数据不会自动同步到页面

原生写法里，数据和页面是分开的。

```js
let total = 0;

btnEl.addEventListener("click", () => {
  total += 1;
  spanEl.textContent = String(total);
});
```

`total += 1` 只改变变量。

真正让页面变化的是：

```js
spanEl.textContent = String(total);
```

待办列表也是一样：

```js
todos.push(content);
renderList();
```

数组变了不等于页面变了。你还要重新渲染列表。

---

## 技术关系

### 原生基础和框架的关系

| 原生写法 | React / Vue 里的对应概念 |
|---|---|
| HTML 标签 | JSX / Vue template |
| CSS 样式 | 组件样式、scoped CSS、CSS Modules |
| `addEventListener` | `onClick` / `@click` |
| 普通变量 | state / ref |
| 手动改 DOM | 框架根据数据更新 DOM |

框架不是把基础替换掉，而是把基础重新组织了一遍。

---

### 同一个计数器的三种写法

原生 JavaScript：

```js
let total = 0;
const spanEl = document.querySelector("#span");
const btnEl = document.querySelector("#btn");

btnEl.addEventListener("click", () => {
  total += 1;
  spanEl.textContent = String(total);
});
```

React：

```tsx
function Counter() {
  const [total, setTotal] = useState(0);

  return <button onClick={() => setTotal(total + 1)}>点击 {total} 次</button>;
}
```

Vue：

```vue
<script setup lang="ts">
import { ref } from "vue";

const total = ref(0);
</script>

<template>
  <button @click="total++">点击 {{ total }} 次</button>
</template>
```

对比重点：

| 写法 | 状态在哪里 | 页面怎么更新 |
|---|---|---|
| 原生 JS | 普通变量 `total` | 手动改 `textContent` |
| React | `useState` | React 重新渲染 |
| Vue | `ref` | Vue 响应式更新 |

---

### 浏览器实际理解的仍然是这些

不管你以后写什么框架，浏览器最终理解的是：

```text
HTML
CSS
JavaScript
DOM
```

React 的 JSX、Vue 的 template、TypeScript 的类型，最后都要经过工具处理，变成浏览器能运行的东西。

---

## 学习建议

基础层不用一次学成专家，但要够用。

| 方向 | 先学到什么程度 |
|---|---|
| HTML | 常见标签、表单、语义化、嵌套关系 |
| CSS | 盒模型、Flex、Grid、定位、响应式 |
| JavaScript | 变量、函数、数组、对象、事件、模块、异步 |
| DOM | 能查找元素、监听事件、修改文本、创建节点 |

做 01 原生 demo 时，盯住这几个问题：

```text
HTML 提供了哪些元素？
JS 用哪些 id 找到它们？
哪些代码只改了数据？
哪些代码真的改了页面？
```

### 读完 02 做什么

读完 02，做第一版：

```text
frontend/minimal-frontend-demo/01-html-css-js/
```

功能保持不变：

```text
计数器
Todo 输入
添加 Todo
删除 Todo
```

这一版只用 HTML / CSS / JavaScript，不用 Node、Vite、React、Vue。

---

## 小结

第一层是地基。

```text
HTML 负责结构
CSS 负责样式
JavaScript 负责逻辑
DOM 让 JS 能操作页面
```

你以后学 React/Vue，不是为了忘掉基础，而是为了少写混乱的手动 DOM 操作。
