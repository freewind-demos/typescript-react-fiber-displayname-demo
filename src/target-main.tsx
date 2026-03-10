import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Card, Typography, Space, Flex } from 'antd';

const { Title, Text } = Typography;

// 有 displayName 的组件
const CounterWithName: React.FC<{ initialCount?: number }> = ({ initialCount = 0 }) => {
  const [count, setCount] = useState(initialCount);
  return (
    <Card title="计数器 (有 displayName)" style={{ marginBottom: 16 }}>
      <Flex vertical>
        <Title level={2} style={{ textAlign: 'center' }}>{count}</Title>
        <Space>
          <Button type="primary" onClick={() => setCount(c => c + 1)}>+1</Button>
          <Button onClick={() => setCount(c => c - 1)}>-1</Button>
          <Button danger onClick={() => setCount(0)}>重置</Button>
        </Space>
      </Flex>
    </Card>
  );
};
CounterWithName.displayName = 'Counter';

// 无 displayName 的组件 (模拟生产环境压缩后)
const CounterNoName = ({ initialCount = 0 }: { initialCount?: number }) => {
  const [count, setCount] = useState(initialCount);
  return (
    <Card title="计数器 (无 displayName - 生产模式)" style={{ marginBottom: 16 }}>
      <Flex vertical>
        <Title level={2} style={{ textAlign: 'center' }}>{count}</Title>
        <Space>
          <Button type="primary" onClick={() => setCount(c => c + 1)}>+1</Button>
          <Button onClick={() => setCount(c => c - 1)}>-1</Button>
        </Space>
      </Flex>
    </Card>
  );
};
// 注意：没有 displayName，函数名也会被压缩

// 有 displayName
const MessageBoxWithName: React.FC<{ message?: string }> = ({ message = '你好！' }) => {
  return (
    <Card title="消息框 (有 displayName)">
      <Text>{message}</Text>
    </Card>
  );
};
MessageBoxWithName.displayName = 'MessageBox';

// 无 displayName
const MessageBoxNoName = ({ message = '你好！' }: { message?: string }) => {
  return (
    <Card title="消息框 (无 displayName - 生产模式)">
      <Text>{message}</Text>
    </Card>
  );
};

function TargetApp() {
  return (
    <div>
      <Title level={2}>目标应用</Title>
      <Text type="secondary">对比：有/无 displayName 的组件</Text>

      <CounterWithName initialCount={10} />
      <CounterNoName initialCount={20} />
      <MessageBoxWithName message="有名称的消息" />
      <MessageBoxNoName message="无名称的消息" />
    </div>
  );
}

const targetRootElement = document.getElementById('target-root');
if (targetRootElement) {
  const root = createRoot(targetRootElement);
  root.render(<TargetApp />);
  (window as any).__targetRootElement = targetRootElement;
}
