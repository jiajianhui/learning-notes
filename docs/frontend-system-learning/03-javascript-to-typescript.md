# 03 从 JavaScript 到 TypeScript

> 所属层级：**第二层：语言增强层**。

## 问题背景

常见误区：
- TypeScript 是另一门完全不同的语言
- 学 TS 就不用学 JS

## 核心解释

### JavaScript 的核心地位
前端运行环境原生执行的是 JavaScript。无论 React/Vue/Next/Nuxt，最终都落到 JS。

### TypeScript 是什么
TypeScript = JavaScript + 类型系统 + 更强的开发期检查。

它不是替代 JS，而是增强 JS 的可维护性。

### TypeScript 解决什么问题
- 大项目中变量/函数含义不清
- 团队协作时接口契约容易漂移
- 重构时风险大

TS 通过类型提示和编译期检查降低这些风险。

## 与上下层关系

- 依赖第一层：TS 写的仍是前端基础能力
- 支撑第三层：React/Vue 项目常用 TS 提升可维护性

## 初学者学到什么程度合适

建议掌握：
- 基础类型、联合类型
- 接口与类型别名
- 函数参数/返回值标注
- 泛型的基础使用（如 `Promise<T>`）

暂时不必深挖类型体操。

## 常见代码对比

```ts
// JavaScript 风格（无类型约束）
function greet(user) {
  return `Hi, ${user.name}`
}

// TypeScript 风格（明确契约）
type User = { name: string }
function greet(user: User): string {
  return `Hi, ${user.name}`
}
```

## 学习建议

- 先能写 JS，再把常用 JS 项目逐步加上 TS
- 把 TS 当“防错系统”，不是“炫技系统”

## 小结

第二层的价值在于“提高工程可控性”。TS 让 JS 在中大型项目中更可靠。
