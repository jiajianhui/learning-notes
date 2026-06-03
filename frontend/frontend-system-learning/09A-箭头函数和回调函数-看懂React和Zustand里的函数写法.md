# 09A. 箭头函数和回调函数：看懂 React 和 Zustand 里的函数写法

## 问题背景

做完 `06-react-zustand` 后，很容易卡在这句：

```ts
increase: () => set((state) => ({ count: state.count + 1 }))
```

它看起来比 Vue / Pinia 难很多。

但这里的重点不是 Zustand 多复杂，而是 JavaScript 里一个很重要的能力：

```text
函数可以当成一个值，传给别人，等以后再执行。
```

先记住一句话：

```text
箭头函数不是“有参数才用”。
箭头函数常用于“把函数当成值传出去”。
```

---

## 核心解释

### 1. 箭头函数本质上还是函数

这两种写法都在定义函数：

```js
function add(x) {
  return x + 1;
}
```

```js
const add = (x) => {
  return x + 1;
};
```

箭头函数可以再短一点：

```js
const add = (x) => x + 1;
```

上面这句等价于：

```js
const add = function (x) {
  return x + 1;
};
```

所以不要先把箭头函数想复杂。它就是一种更短的函数写法。

---

### 2. 什么时候需要“传一个函数”

有些地方不是要你马上执行代码，而是要你给它一段逻辑。

比如 React 事件：

```tsx
<button onClick={increase}>+1</button>
```

意思是：

```text
把 increase 这个名字对应的函数值交给 React。
等用户点击按钮时，React 再调用它。
```

如果你这样写：

```tsx
<button onClick={increase()}>+1</button>
```

就变成：

```text
页面渲染时立刻执行 increase()
把执行结果交给 onClick
```

这通常是错的。

所以核心判断不是“有没有参数”，而是：

```text
我要现在执行它？
还是把这个函数交给别人以后执行？
```

---

### 3. 有参数时为什么经常多包一层箭头函数

无参数时，可以直接把函数名写进去：

```tsx
<button onClick={increase}>+1</button>
```

这里的 `increase` 不是字符串名字，而是一个表达式。

它的值就是这个函数本身：

```ts
const increase = useCounterStore((state) => state.increase);
```

所以可以理解成：

```text
把 increase 这个变量里保存的函数交给 React。
```

有参数时，如果直接写：

```tsx
<button onClick={removeTodo(index)}>删除</button>
```

这会立刻执行 `removeTodo(index)`，不是等点击再执行。

所以要包一层：

```tsx
<button onClick={() => removeTodo(index)}>删除</button>
```

这相当于先声明一个新函数：

```ts
const handleClick = () => removeTodo(index);
```

再把这个新函数交给 React：

```tsx
<button onClick={handleClick}>删除</button>
```

这句的意思是：

```text
先创建一个没有参数的新函数。
等点击时，这个新函数再执行 removeTodo(index)。
```

所以不是“有参数就必须箭头函数”。

更准确地说：

```text
当你需要等以后再带参数执行某个函数时，常用箭头函数包一层。
```

---

### 4. 拆开 Zustand 的 increase

先看原写法：

```ts
increase: () => set((state) => ({ count: state.count + 1 }))
```

它可以拆成三层。

第一层：

```ts
increase: () => ...
```

意思是：

```text
increase 这个字段保存的是一个函数。
以后调用 increase() 时，才会执行里面的逻辑。
```

第二层：

```ts
set((state) => ...)
```

意思是：

```text
调用 set。
传给 set 一个函数。
Zustand 会把当前 state 交给这个函数。
```

因为新的 `count` 依赖旧的 `state.count`，所以这里用函数：

```ts
set((state) => ({ count: state.count + 1 }))
```

第三层：

```ts
({ count: state.count + 1 })
```

意思是返回一个对象：

```ts
{
  count: state.count + 1
}
```

外面那层 `()` 很重要。因为箭头函数直接返回对象时，要写成：

```ts
() => ({ count: 1 })
```

如果写成这样：

```ts
() => { count: 1 }
```

JavaScript 会把 `{}` 当成函数代码块，不会当成对象返回。

---

### 5. 用 function 写一遍就不神秘了

这句：

```ts
increase: () => set((state) => ({ count: state.count + 1 }))
```

可以写成长版本：

```ts
increase: function () {
  set(function (state) {
    return {
      count: state.count + 1,
    };
  });
}
```

两者主线一样：

```text
increase 是一个函数
-> increase 里面调用 set
-> set 接收一个函数
-> 这个函数根据旧 state 返回新状态对象
```

箭头函数只是把这个过程写短了。

---

## 技术关系

### 1. 为什么 React / Zustand 里箭头函数多

React 和 Zustand 里经常出现这种模式：

```text
把函数交给框架或工具
等事件发生或状态更新时再执行
```

比如：

```tsx
<button onClick={() => removeTodo(index)}>删除</button>
```

```ts
increase: () => set((state) => ({ count: state.count + 1 }))
```

所以你会看到很多箭头函数。

---

### 2. Zustand 和 Pinia 拿旧值的方式不一样

Zustand 里常这样写：

```ts
increase: () => set((state) => ({ count: state.count + 1 }))
```

这里的 `state` 是 Zustand 传给你的：

```text
你调用 set。
Zustand 把当前 state 传进来。
你根据旧 state 返回新状态对象。
```

Pinia option store 里常这样写：

```ts
increase() {
  this.count += 1;
}
```

这里不是 Pinia 传了一个 `state` 参数。

Pinia 是让 `this` 指向当前 store：

```text
this.count 就是当前 store 里的 count。
```

所以可以先这样记：

```text
Zustand 用参数 state 拿旧状态。
Pinia 用 this 拿当前 store。
```

---

### 3. 为什么 Vue / Pinia 里看起来少很多

Pinia action 常这样写：

```ts
actions: {
  increase() {
    this.count += 1;
  },
}
```

这里的 `increase() {}` 是对象方法简写。

它等价于：

```ts
actions: {
  increase: function () {
    this.count += 1;
  },
}
```

所以可以这样理解：

```text
actions 是一个对象。
对象里是一组 key-value。

increase 是 key。
function () { this.count += 1 } 是 value。
这个 value 是一个函数。
```

也就是说：

```ts
actions: {
  increase() {
    this.count += 1;
  },
}
```

只是下面这种写法的简写：

```ts
actions: {
  increase: function () {
    this.count += 1;
  },
}
```

它和单独声明函数不是一回事：

```ts
function increase() {
  this.count += 1;
}
```

上面这个是单独声明一个函数，没有放进 `actions` 对象。

Pinia 里是把函数作为 value 放进 `actions` 对象，Pinia 再把它当作 action 使用。

这里靠的是 `this`：

```text
this 指向当前 store。
this.count 就是 store 里的 count。
```

箭头函数没有自己的 `this`。

所以 Pinia action 里通常不写：

```ts
increase: () => {
  this.count += 1;
}
```

Vue 模板里也帮你省掉了很多包装：

```vue
<button @click="counter.increase()">+1</button>
```

你看起来是在模板里直接写调用，但 Vue 会在点击时处理它，不是普通 JavaScript 立即执行的场景。

---

## 学习建议

看到箭头函数时，先问三个问题：

```text
1. 这个函数是现在执行，还是交给别人以后执行？
2. 它有没有依赖旧数据？
3. 它是不是直接返回一个对象？
```

对应到 `06-react-zustand`：

```ts
increase: () => set((state) => ({ count: state.count + 1 }))
```

可以这样读：

```text
increase 是以后调用的函数。
set 需要一个函数来拿旧 state。
这个函数返回一个新的对象。
```

---

## 小结

记住这几句就够了：

```text
箭头函数不是“有参数才用”。
箭头函数常用于“把函数当成值传出去”。

React / Zustand 里函数传来传去，所以箭头函数多。
Vue / Pinia 里模板和 this 帮你包了一层，所以箭头函数少。

Zustand 用 state 参数拿旧状态。
Pinia 用 this 拿当前 store。

() => ({ count: 1 })
表示直接返回对象。
```

如果你能把箭头函数改写成 `function + return`，就说明你已经看懂它了。
