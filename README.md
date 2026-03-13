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

## 深入学习

### 一个奇怪的问题

如果你做过通过名称查找组件的实验，可能会发现一个奇怪的现象：在开发环境可以正常找到组件，但在生产环境却找不到。

这是怎么回事？

### 函数名的消失

问题出在 JavaScript 的压缩机制。

开发时，我们的组件可能是这样的：

```javascript
function Counter() {
  return <div>0</div>;
}
```

函数名是 `Counter`，可以通过 `Counter.name` 获取到。

但生产环境为了减小文件体积，会进行压缩（minify）。压缩工具会把变量名、函数名都改成短名字：

```javascript
function a() {
  return <div>0</div>;
}
```

现在 `a.name` 返回的是 `"a"`，而不是 `"Counter"`。完全变了一个人。

### displayName 的救赎

displayName 是 React 组件的一个特殊属性，专门用来解决函数名丢失的问题。

```javascript
function Counter() {
  return <div>0</div>;
}
Counter.displayName = 'Counter';
```

这样即使函数名被压缩成 `a`，组件的名称仍然可以正确显示为 `Counter`。

### 获取组件名称的正确方式

所以获取组件名称应该这样写：

```javascript
function getComponentName(type) {
  if (typeof type === 'function') {
    // displayName 优先，然后是函数名
    return type.displayName || type.name || null;
  }
  if (typeof type === 'string') {
    return type;
  }
  return null;
}
```

优先级是：displayName > 函数名 > null。

### 生产环境的困境

在生产环境中，如果组件没有设置 displayName，通过名称查找就会失败。

这也是为什么 React DevTools 在开发环境很好用，但生产环境有时会遇到麻烦。

### 为什么要设置 displayName？

以下几个场景特别需要设置 displayName：

**高阶组件**

高阶组件返回的是一个新函数，函数名会被改成默认的 "WrappedComponent" 或类似的匿名函数。

```javascript
function withLoading(Component) {
  return function WithLoading(props) {
    if (props.isLoading) return <Loading />;
    return <Component {...props} />;
  };
  // 必须设置 displayName！
  WithLoading.displayName = `withLoading(${Component.displayName || Component.name})`;
}
```

**匿名组件**

箭头函数组件没有函数名，必须用 displayName：

```javascript
const Button = () => <button />;
Button.displayName = 'Button';
```

**从其他模块导入的组件**

有时导入的组件名也不是你想显示的名称，可以用 displayName 重新定义。

### displayName 的实际影响

displayName 不仅影响调试，还影响很多方面：

- React DevTools 中的组件显示名称
- 错误提示中的组件名称
- 通过名称查找组件的功能
- 日志和监控中的组件识别

### 最佳实践

为了避免生产环境的问题，建议：

1. 始终为高阶组件设置 displayName
2. 为匿名组件（箭头函数）设置 displayName
3. 在团队内部建立规范，要求设置 displayName
4. 使用 TypeScript 或 ESLint 插件检查

### 总结

displayName 是组件的"备用名字"：

- 开发环境可以用函数名，不一定需要 displayName
- 生产环境函数名会被压缩，必须靠 displayName
- 高阶组件和匿名组件尤其需要设置 displayName

理解这个机制，可以避免生产环境调试时的很多麻烦。
