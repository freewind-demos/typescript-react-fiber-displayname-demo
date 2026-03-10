# React Fiber displayName Demo

## 概述

本 Demo 展示**有/无 displayName** 的区别，帮助理解生产环境下的组件查找。

## 场景

- **左侧**：目标应用（有/无 displayName 的组件）
- **右侧**：控制面板

## displayName 是什么？

- **开发环境**：组件默认使用函数名作为标识，如 `Counter`
- **生产环境**：代码压缩后函数名会丢失，变成 `a` 或 `b`

```typescript
// 有 displayName
const Counter = () => { ... };
Counter.displayName = 'Counter';

// 无 displayName (生产模式)
const Counter = () => { ... }; // 压缩后可能变成 a = () => { ... }
```

## 获取组件名称

```typescript
function getComponentName(type) {
  if (typeof type === 'function') {
    return type.displayName || type.name || null;
  }
}
```

## 运行

```bash
pnpm install
pnpm start
```

## 功能

1. 展示所有组件列表，绿色标签表示有名称，红色表示无名称
2. 可以按名称查找组件
3. 对比开发模式和生产模式的区别
