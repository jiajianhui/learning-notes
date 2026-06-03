# 02. AeroPrecipe 风格：内容很多也要清楚

## 问题背景

做完极简列表后，下一步要进入更真实的网站形态：

```text
内容很多
筛选很多
卡片很多
但页面仍然不能乱
```

参考网站：

```text
https://aeroprecipe.com/
```

这个项目不重点学习咖啡内容，而是学习它的页面组织方式：

```text
推荐内容
-> 主内容列表
-> 筛选侧栏
-> 移动端筛选入口
-> 本地数据驱动
```

---

## 核心解释

### 1. 这个项目练什么：从静态页面到数据型页面

这次重点从“静态页面”进入“数据驱动页面”。

你要练：

- 卡片列表
- 分类和筛选
- sticky 侧栏
- 移动端筛选抽屉
- 横向滚动推荐区
- 根据本地数据渲染页面

一句话：

```text
这次练的是：内容变多后，页面怎么保持清楚。
```

---

### 2. 首页应该长什么样：主内容加筛选侧栏

建议首页包含：

- 顶部导航
- 横向推荐合集
- 主内容列表
- 桌面端筛选侧栏
- 移动端筛选按钮或抽屉
- 固定底部提示或页尾

桌面端重点是：

```text
左边或中间展示内容，右边保留筛选能力。
```

移动端重点是：

```text
筛选不能一直占空间，要收进按钮或抽屉。
```

---

### 3. 核心组件：围绕“内容”和“筛选”拆

- `SiteHeader`
- `CollectionRail`
- `RecipeCard`
- `FilterPanel`
- `FilterGroup`
- `MobileFilterDrawer`
- `SiteFooter`

---

## 技术关系

### 1. 本地数据：先用数组模拟 recipe

先用本地数组：

```ts
type Recipe = {
  title: string;
  category: string;
  method: "standard" | "inverted";
  filter: "paper" | "metal";
  time: "fast" | "medium" | "slow";
  coffeeGrams: number;
  waterMl: number;
  likes: number;
  description: string;
};
```

先不要做后端。

这一阶段要先把下面的链路跑通：

```text
recipes 数组
-> filter 条件
-> 过滤后的列表
-> 卡片渲染
-> 空状态
```

---

### 2. Tailwind 重点：卡片、侧栏、响应式

- `grid`
- `lg:grid-cols-*`
- `sticky`
- `h-screen`
- `overflow-y-auto`
- `rounded-lg`
- `border`
- `bg-*`
- `data-*` 或状态 class

---

### 3. 交互重点：筛选要真的可用

- 选择筛选条件
- 清空筛选
- 移动端打开/关闭筛选面板
- 卡片 hover
- 横向推荐区滚动

交互不要先追求复杂动画。

先保证：

```text
用户能看见当前筛选条件
能取消筛选
筛选后内容真的变化
移动端能打开和关闭筛选
```

---

## 学习建议

### 1. 先完成数据渲染，再做视觉细节

建议顺序：

```text
先写 recipes 数据
-> 渲染 RecipeCard
-> 做页面双栏布局
-> 做 FilterPanel
-> 接上筛选逻辑
-> 做移动端 drawer
-> 最后调卡片视觉和 hover
```

### 2. 完成标准

- 至少有 12 条本地内容数据
- 能按 2 到 3 个条件筛选
- 桌面端侧栏 sticky
- 移动端筛选入口可用
- 卡片密度和信息层级清楚

---

## 小结

这个项目的目标不是做一个完整咖啡社区，而是学会：

```text
当内容很多时，怎么用卡片、筛选和响应式布局保持清楚。
```

这一步做好后，你会更接近真实产品型网站。
