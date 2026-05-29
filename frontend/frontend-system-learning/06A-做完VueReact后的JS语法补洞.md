# 06A. 做完 Vue / React 后的 JS 语法补洞

## 问题背景

做完 Vue / React 的 Todo demo 后，很多疑问看起来像框架问题：

```text
为什么 const add = () => {} 也是函数？
为什么箭头函数有时不用 return？
为什么返回对象要写成 ({ name: "Tom" })？
为什么 Vue 可以 splice，React 更常用 filter？
```

其实它们大多是 JavaScript 基础语法问题。

这篇不是完整 JS 教程，只补写 Vue / React demo 时最容易卡住的几块：

```text
函数
表达式和语句
对象
数组
回调函数
Vue / React 状态更新差异
```

建议读完 `07`，并亲手做完 Vue / React Todo demo 后，再回来读这一篇。

---

## 核心解释

### 1. 为什么框架问题经常其实是 JS 问题

React 和 Vue 的写法不同，但组件里的逻辑仍然大量依赖 JavaScript：

```text
函数：点击按钮时执行什么逻辑
表达式：页面里显示哪个值
对象：一条 todo 或一个用户数据长什么样
数组：列表怎么新增、删除、渲染
回调：map / filter / onClick 里传进去的函数
```

所以卡在 React / Vue 时，可以先问一句：

```text
这是框架规则，还是普通 JavaScript 语法？
```

比如下面这段 React：

```tsx
<button onClick={() => removeTodo(index)}>删除</button>
```

这里既有 React 的 `onClick`，也有 JavaScript 的箭头函数：

```js
() => removeTodo(index)
```

真正卡住的，往往是后半段 JS 语法。

---

### 2. 函数：function、箭头函数、函数作为变量

函数不一定要用 `function` 开头。

传统函数写法：

```js
function add(x) {
  return x + 1;
}

console.log(add(1)); // 2
```

箭头函数写法：

```js
const add = (x) => {
  return x + 1;
};

console.log(add(1)); // 2
```

这两个本质上都是函数：

```text
function add() {}     定义一个函数
const add = () => {}  把一个函数赋值给变量 add
```

JavaScript 里函数也可以当成一个值传来传去，这就是回调函数的基础。

```js
function run(fn) {
  return fn(1);
}

const add = (x) => x + 1;

console.log(run(add)); // 2
```

React / Vue 里很常见：

```tsx
<button onClick={() => setCount(count + 1)}>+1</button>
```

这里传给 `onClick` 的就是一个函数。点击发生时，React 再调用它。

---

### 3. 表达式和语句：自动 return、JSX 里的 `{}`

表达式是“能算出一个值”的代码：

```js
x + 1
"hello"
todos.length
isDone ? "完成" : "未完成"
```

语句是“执行一个动作”的代码：

```js
const count = 0;

if (count > 0) {
  console.log(count);
}
```

箭头函数后面直接跟表达式时，会自动返回这个表达式的结果：

```js
const add = (x) => x + 1;

console.log(add(1)); // 2
```

它等价于：

```js
const add = (x) => {
  return x + 1;
};
```

如果用了 `{}`，就进入函数体，必须手动 `return`：

```js
const add = (x) => {
  x + 1;
};

console.log(add(1)); // undefined
```

React 的 JSX 里，`{}` 表示放入一个 JavaScript 表达式：

```tsx
function TodoCount({ count }: { count: number }) {
  return <span>{count + 1}</span>;
}
```

所以 JSX 里常见这种写法：

```tsx
{todos.map((todo) => (
  <li key={todo}>{todo}</li>
))}
```

这里的主线是：

```text
todos 数组
-> map 处理每一项
-> 每一项返回一个 li
-> React 把 li 列表渲染到页面
```

---

### 4. 对象：对象字面量、返回对象为什么写 `({})`

对象用来描述一组相关数据：

```js
const user = {
  name: "Tom",
  age: 18,
};

console.log(user.name); // Tom
```

Todo 也常写成对象：

```js
const todo = {
  id: 1,
  text: "学习 React",
  done: false,
};
```

箭头函数直接返回对象时，要把对象包在 `()` 里：

```js
const getUser = () => ({ name: "Tom" });

console.log(getUser()); // { name: "Tom" }
```

它等价于：

```js
const getUser = () => {
  return { name: "Tom" };
};
```

这里的 `()` 不是 `{ return }` 的简写。它只是告诉 JavaScript：

```text
后面的 { name: "Tom" } 是对象，不是函数体。
```

如果直接写成这样：

```js
const getUser = () => {
  name: "Tom";
};

console.log(getUser()); // undefined
```

JavaScript 会把 `{}` 当成函数体，所以不会自动返回对象。

---

### 5. 数组：splice / push、filter / map、展开复制

数组用来保存列表：

```js
const todos = ["学 HTML", "学 TS"];
```

`push` 会修改原数组：

```js
todos.push("学 Vue");

console.log(todos); // ["学 HTML", "学 TS", "学 Vue"]
```

`splice` 也会修改原数组：

```js
todos.splice(1, 1);

console.log(todos); // ["学 HTML", "学 Vue"]
```

`filter` 会返回一个新数组：

```js
const nextTodos = todos.filter((todo) => todo !== "学 Vue");

console.log(nextTodos); // ["学 HTML"]
```

`map` 也会返回一个新数组，常用于把数据变成另一种形式：

```js
const labels = todos.map((todo) => `任务：${todo}`);

console.log(labels); // ["任务：学 HTML", "任务：学 Vue"]
```

`filter` 和 `map` 里的箭头函数就是回调函数：

```js
todos.filter((todo, index) => index !== 1);
```

这里的参数可以先这样记：

```text
todo  当前这一项
index 当前这一项的位置
```

如果只需要 `index`，不需要当前项，常写成：

```js
todos.filter((_, index) => index !== 1);
```

`_` 不是特殊语法，只是表示“这个参数我不用”。

复制数组常用展开运算符：

```js
const nextTodos = [...todos, "学 React"];
```

这表示：

```text
把 todos 里的旧内容展开
再追加一个新内容
生成一个新数组
```

---

### 6. Vue / React 状态更新差异：ref 可直接改，state 要 set 新值

Vue 的 `ref` 是响应式的。数组内部变化，Vue 也能追踪到：

```vue
<script setup lang="ts">
import { ref } from "vue";

const todos = ref<string[]>(["学 HTML", "学 TS"]);

function addTodo() {
  todos.value.push("学 Vue");
}

function removeTodo(index: number) {
  todos.value.splice(index, 1);
}
</script>
```

所以 Vue 里可以直接用：

```text
push
splice
pop
```

React 的 `state` 不建议直接修改原数组，要通过 `setTodos` 设置一个新数组：

```tsx
import { useState } from "react";

function TodoList() {
  const [todos, setTodos] = useState<string[]>(["学 HTML", "学 TS"]);

  function addTodo() {
    setTodos([...todos, "学 React"]);
  }

  function removeTodo(index: number) {
    setTodos(todos.filter((_, currentIndex) => currentIndex !== index));
  }
}
```

不是 `filter` 比 `splice` 高级，而是 React 更依赖“设置一个新值”来触发更新。

如果你想在 React 里用 `splice`，也要先复制一份：

```tsx
const nextTodos = [...todos];

nextTodos.splice(index, 1);
setTodos(nextTodos);
```

核心区别：

```text
Vue：响应式系统能追踪 ref 里的数组变化
React：把 state 当成不可变数据，更新时 set 一个新数组
```

---

### 7. 记忆口诀和最小 demo 对照

先记这几句：

```text
函数：
function add() {}       传统函数
const add = () => {}    箭头函数，本质也是函数

箭头函数：
x => x + 1              自动 return
x => { return x + 1 }   手动 return
x => { x + 1 }          返回 undefined

返回对象：
() => ({ name: "Tom" }) 自动返回对象，() 只是包住对象
() => { return { name: "Tom" } } 是等价写法

数组更新：
push / splice           修改原数组
filter / map            返回新数组
[...todos, item]        复制旧数组并追加新内容

框架差异：
Vue：可以直接改 ref 数组
React：不要直接改 state，要 set 新数组
```

同一个删除操作，对照看最清楚。

Vue：

```ts
function removeTodo(index: number) {
  todos.value.splice(index, 1);
}
```

React：

```tsx
function removeTodo(index: number) {
  setTodos(todos.filter((_, currentIndex) => currentIndex !== index));
}
```

两段代码目的相同：

```text
从 todos 里删除指定位置的那一项
```

只是更新方式不同：

```text
Vue 直接改响应式数组
React 生成新数组，再 set 回状态
```

---

## 技术关系

这篇属于基础层和 UI 框架层之间的补洞：

```text
02 HTML / CSS / JavaScript：知道 JS 是基础
06 React / Vue 最小语法：先把 demo 写出来
06A JS 语法补洞：做完 demo 后解释为什么这么写
07 Vite 和构建工具：理解项目怎么跑起来
```

它不是单独的新技术，只是帮你把框架代码里常见的 JavaScript 语法看顺。

---

## 学习建议

不要一开始就背完所有语法。建议按真实卡点回看：

| 卡住的地方 | 回看哪一节 |
|---|---|
| 不理解 `const add = () => {}` | 函数 |
| 不理解什么时候写 `return` | 表达式和语句 |
| 不理解 `({ name: "Tom" })` | 对象 |
| 不理解 `filter((_, index) => ...)` | 数组 |
| 不理解 Vue / React 删除写法不同 | 状态更新差异 |

真正要掌握的是这条链：

```text
数据
-> 用函数处理
-> 得到新的值或数组
-> 框架根据状态更新 UI
```

---

## 小结

做 Vue / React 时，不要把所有困惑都归因于框架。

很多时候，问题其实在这一层：

```text
函数怎么定义
表达式有没有返回值
对象怎么返回
数组是改原值还是生成新值
回调函数什么时候执行
```

把这些补上之后，再看 Vue 的 `ref`、React 的 `useState`、`map` 渲染列表和 `filter` 删除列表，就会顺很多。
