# 02. HTML / CSS / JavaScript：前端基础层

## 问题背景

很多初学者会问：如果我已经在学 React 或 Vue，还要不要认真学 HTML、CSS、JavaScript？

答案是：要。React 和 Vue 不是浏览器的原生语言，它们最终仍然要落到 HTML、CSS、JavaScript 和 DOM 上。你可以用框架提高开发效率，但不能绕过浏览器的基本规则。

本文属于七层体系中的第一层：基础层。

```text
第一层：基础层
HTML / CSS / JavaScript / DOM

上一层：没有更底的前端应用层
下一层：TypeScript、React、Vue、Vite 等都建立在这些基础之上
```

## 核心解释

### HTML 是结构

HTML 负责描述页面里有什么内容，以及内容之间的大致结构。

```html
<article>
  <h1>现代前端学习</h1>
  <p>先理解结构、样式和交互。</p>
  <button>开始学习</button>
</article>
```

它更关心：

- 这里是标题还是段落。
- 这里是按钮还是输入框。
- 页面内容如何组织。
- 元素之间是什么层级关系。

### CSS 是样式

CSS 负责让结构变得可见、可读、好看。

```css
article {
  max-width: 720px;
  margin: 0 auto;
}

button {
  padding: 8px 12px;
  border-radius: 6px;
}
```

它更关心：

- 颜色、字体、间距。
- 布局方式。
- 响应式适配。
- 动画和状态样式。

### JavaScript 是交互和逻辑

JavaScript 负责让页面“动起来”，处理用户行为和业务逻辑。

```js
const button = document.querySelector("button");

button.addEventListener("click", () => {
  alert("开始学习");
});
```

它更关心：

- 点击后发生什么。
- 数据如何计算。
- 请求结果如何展示。
- 页面状态如何变化。

### DOM 是什么

DOM 可以理解成浏览器把 HTML 解析后形成的“页面对象树”。

```html
<body>
  <h1>标题</h1>
  <button>按钮</button>
</body>
```

浏览器会把它理解成类似这样的结构：

```text
document
└── body
    ├── h1
    └── button
```

JavaScript 通过 DOM API 操作页面：

```js
const title = document.querySelector("h1");
title.textContent = "新的标题";
```

React 和 Vue 虽然让你少写很多 DOM 操作，但它们最终仍然会更新真实 DOM。

## 技术关系

### 浏览器如何理解 HTML / CSS / JS

简化后可以看成：

```text
HTML -> 解析成 DOM 树
CSS -> 解析成样式规则
JavaScript -> 执行逻辑，读取或修改 DOM

DOM + CSS -> 渲染成你看到的页面
```

关系图：

```text
HTML 负责骨架
  ↓
DOM 是浏览器理解后的页面结构
  ↑
JavaScript 读取和修改 DOM
  ↓
CSS 控制 DOM 元素如何显示
```

### 原生能力和框架能力的关系

| 原生前端能力 | 框架里的对应能力 |
|---|---|
| HTML 标签 | JSX / Vue Template |
| CSS 样式 | CSS Modules / scoped CSS / 组件样式 |
| DOM 操作 | React/Vue 的渲染机制 |
| 事件监听 | `onClick` / `@click` |
| 数据变化后手动改页面 | 数据驱动视图 |

举个对比：

原生写法：

```js
let count = 0;
const button = document.querySelector("#counter");

button.addEventListener("click", () => {
  count += 1;
  button.textContent = `点击 ${count} 次`;
});
```

React 写法：

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      点击 {count} 次
    </button>
  );
}
```

Vue 写法：

```vue
<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <button @click="count++">点击 {{ count }} 次</button>
</template>
```

框架让你少关心“怎么手动改 DOM”，更多关心“数据是什么，界面应该长什么样”。

## 学习建议

基础层不需要一开始学到极深，但要达到能读懂项目的程度。

### HTML 建议掌握

| 能力 | 为什么重要 |
|---|---|
| 常见标签 | React/Vue 模板本质上还是在描述 HTML |
| 表单元素 | 真实项目经常有输入、选择、提交 |
| 语义化 | 有助于可访问性和页面结构理解 |
| 元素嵌套规则 | 避免写出浏览器解析异常的结构 |

### CSS 建议掌握

| 能力 | 为什么重要 |
|---|---|
| 盒模型 | 布局问题的基础 |
| Flex / Grid | 现代布局最常用 |
| 定位 | 弹窗、浮层、固定栏都依赖它 |
| 响应式 | 页面要适配不同屏幕 |
| 状态样式 | hover、focus、disabled 很常见 |

### JavaScript 建议掌握

| 能力 | 为什么重要 |
|---|---|
| 变量、函数、对象、数组 | 所有框架代码都离不开 |
| 模块导入导出 | 现代项目文件组织基础 |
| Promise / async await | 请求和异步逻辑基础 |
| DOM API | 理解框架最终在操作什么 |
| 事件机制 | 点击、输入、提交都基于事件 |

不要把基础当成“学完才准学框架”的门槛。更好的方式是：先掌握基本模型，再通过框架项目反复补基础。

## 小结

第一层是现代前端的地基：

```text
HTML：页面结构
CSS：视觉表现
JavaScript：交互逻辑
DOM：浏览器中的页面对象模型
```

React、Vue、Vite、Next、Nuxt 都不能让你跳过这层。框架越高级，越需要你知道它最终是在帮你组织和更新什么。

