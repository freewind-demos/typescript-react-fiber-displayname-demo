import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Input, Button, Typography, Space, message, Tag, List } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { findFiberByComponentName, getFiberInfo, getComponentName, getTargetFiberRoot, traverseFiberTree } from '../shared/fiber-utils';

const { Title, Text } = Typography;

function ControllerApp() {
  const [searchName, setSearchName] = useState('');
  const [foundName, setFoundName] = useState('');
  const [fiberInfo, setFiberInfo] = useState('');
  const [components, setComponents] = useState<{name: string; hasName: boolean}[]>([]);

  useEffect(() => {
    const rootFiber = getTargetFiberRoot();
    if (rootFiber) {
      const list: {name: string; hasName: boolean}[] = [];
      traverseFiberTree(rootFiber, (f) => {
        const name = f.type ? getComponentName(f.type) : null;
        if (name && !list.find(c => c.name === name)) {
          // Check if the name came from displayName or function.name
          const hasDisplayName = (f.type as any)?.displayName?.length > 0;
          list.push({ name, hasName: hasDisplayName || (f.type as any)?.name?.length > 0 });
        }
      });
      setComponents(list);
    }
  }, []);

  const handleFind = () => {
    if (!searchName.trim()) {
      message.warning('请输入组件名称');
      return;
    }
    const rootFiber = getTargetFiberRoot();
    if (!rootFiber) {
      message.error('找不到 fiber 根节点');
      return;
    }
    const fiber = findFiberByComponentName(rootFiber, searchName);
    if (fiber) {
      const info = getFiberInfo(fiber);
      setFoundName(info.name);
      setFiberInfo(JSON.stringify(info, null, 2));
      message.success(`找到组件: ${info.name}`);
    } else {
      setFoundName('');
      setFiberInfo('');
      message.error(`未找到组件: ${searchName}`);
    }
  };

  return (
    <div>
      <Title level={2}>控制面板</Title>
      <Text type="secondary">展示有/无 displayName 的区别</Text>

      <Card title="所有组件列表" style={{ marginTop: 16 }}>
        <List
          size="small"
          dataSource={components.filter(c => !['div', 'span', 'button'].includes(c))}
          renderItem={(item) => (
            <List.Item>
              <Text>{item.name}</Text>
              <Tag color={item.hasName ? 'green' : 'red'}>
                {item.hasName ? '有名称' : '无名称'}
              </Tag>
            </List.Item>
          )}
        />
      </Card>

      <Card title="按名称查找" style={{ marginTop: 16 }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            placeholder="输入组件名称"
            prefix={<SearchOutlined />}
            onPressEnter={handleFind}
          />
          <Button type="primary" onClick={handleFind}>查找</Button>
        </Space.Compact>
      </Card>

      {foundName && (
        <Card title="组件信息" style={{ marginTop: 16 }}>
          <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 12, borderRadius: 4, fontSize: 12 }}>
            {fiberInfo}
          </pre>
        </Card>
      )}
    </div>
  );
}

const controllerRootElement = document.getElementById('controller-root');
if (controllerRootElement) {
  const root = createRoot(controllerRootElement);
  root.render(<ControllerApp />);
}
