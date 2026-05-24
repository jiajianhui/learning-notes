# 03. 从 JavaScript 到 TypeScript

## 问题背景

你看现代前端项目时，经常会看到这些文件：

```text
main.ts
main.tsx
App.tsx
vite.config.ts
tsconfig.json
```

于是很容易产生疑问：TypeScript 是不是一门新的前端语言？学了 TypeScript 还要不要学 JavaScript？

本文属于七层体系中的第二层：语言增强层。

```text
上一层基础：HTML / CSS / JavaScript / DOM
当前层：TypeScript
下一层：React / Vue 等 UI 框架经常使用 TypeScript
```

## 核心解释

### JavaScript 在前端中的核心地位

浏览器原生执行的是 JavaScript。无论你写 React、Vue、Next.js、Nuxt.js，最终都离不开 JavaScript 的运行模型。

JavaScript 负责：

- 描述页面交互。
- 处理数据和逻辑。
- 调用浏览器 API。
- 组织模块。
- 驱动框架运行。

所以 TypeScript 不是绕开 JavaScript，而是站在 JavaScript 上。

### TypeScript 是什么

TypeScript 可以简单理解为：

```text
TypeScript = JavaScript + 类型系统
```

比如 JavaScript：

```js
function formatPrice(price) {
  return price.toFixed(2);
}
```

如果传错参数，可能运行时才报错：

```js
formatPrice("19.9");
```

TypeScript 会提前提醒：

```ts
function formatPrice(price: number) {
  return price.toFixed(2);
}

formatPrice("19.9"); // 类型错误
```

TypeScript 写完后需要被转换成 JavaScript，浏览器最终运行的仍然是 JavaScript。

## 技术关系

### TypeScript 不是替代 JavaScript

| 问题 | JavaScript | TypeScript |
|---|---|---|
| 浏览器能否直接运行 | 能 | 通常需要编译成 JS |
| 是否有静态类型检查 | 弱 | 强 |
| 是否改变运行时本质 | 是运行时语言 | 不改变 JS 运行时 |
| 学习前提 | 基础语法和运行机制 | 先懂 JS 再学类型 |

一个常见误区是：学 TypeScript 就不用学 JavaScript。实际正好相反，TypeScript 的很多概念都建立在 JavaScript 上，比如对象、数组、函数、模块、异步、闭包。

### TypeScript 解决什么问题

TypeScript 主要解决“代码规模变大后的可维护性”问题。

| 场景 | 没有类型时的问题 | TypeScript 带来的帮助 |
|---|---|---|
| 函数参数 | 不知道该传什么 | 参数类型清楚 |
| 接口数据 | 不知道字段有哪些 | 数据结构可声明 |
| 组件 props | 使用方容易传错 | 编辑器提前提示 |
| 重构代码 | 改名和改字段容易漏 | 类型检查能发现影响范围 |
| 多人协作 | 约定藏在脑子里 | 类型变成显式文档 |

React 组件 props 示例：

```tsx
type UserCardProps = {
  name: string;
  age: number;
};

function UserCard(props: UserCardProps) {
  return <div>{props.name}：{props.age}</div>;
}
```

Vue 组件 props 示例：

```vue
<script setup lang="ts">
defineProps<{
  name: string;
  age: number;
}>();
</script>
```

类型让组件怎么用变得更清楚。

### 为什么现代项目经常使用 TypeScript

现代 React / Vue / Next / Nuxt 项目经常用 TypeScript，是因为这些项目通常具备几个特点：

- 组件多。
- 数据结构多。
- 文件多。
- 协作人数多。
- 重构频繁。
- 编辑器提示很重要。

TypeScript 能把很多错误提前到开发阶段发现，而不是等用户点击页面后才发现。

### TypeScript 和其他层的关系

```text
HTML / CSS / JS / DOM
        ↓
TypeScript 增强 JS 的可维护性
        ↓
React / Vue 用 TS 描述 props、state、事件、数据
        ↓
Vite / Next / Nuxt 负责把 TS 转成浏览器可运行的 JS
```

它不是 UI 框架，也不是构建工具，而是语言增强层。

## 学习建议

初学者学 TypeScript，不要一开始钻进复杂类型体操。更实用的目标是能写、能读、能改真实项目。

建议先掌握：

| 内容 | 学到什么程度 |
|---|---|
| 基本类型 | `string`、`number`、`boolean`、数组、对象 |
| 函数类型 | 能给参数和返回值加类型 |
| type / interface | 能描述对象结构和组件 props |
| 联合类型 | 能理解 `string | number` 这种写法 |
| 可选属性 | 能理解 `name?: string` |
| 泛型基础 | 能读懂常见的 `Array<T>`、`Promise<T>` |
| 类型推断 | 知道很多时候不用手写所有类型 |

暂时可以少碰：

- 复杂条件类型。
- 大量嵌套泛型。
- 类型体操题。
- 为了炫技而写的复杂类型工具。

更好的练习方式是：把一个小 JS 项目改成 TS 项目，给函数、数据、组件 props 补类型。

## 小结

TypeScript 位于第二层：语言增强层。

它不是 React，不是 Vue，也不是 Vite。它的核心价值是给 JavaScript 增加类型系统，让项目更容易维护、重构和协作。

记住这句话就够了：

```text
JavaScript 决定前端能运行什么，TypeScript 帮你更可靠地写 JavaScript。
```

