import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Input, Button, Typography, Space, message, Tag, List, Alert } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { findFiberByComponentName, getFiberInfo, getComponentName, getTargetFiberRoot, traverseFiberTree } from '../shared/fiber-utils';

const { Title, Text } = Typography;

function ControllerApp() {
  const [searchName, setSearchName] = useState('');
  const [foundName, setFoundName] = useState('');
  const [fiberInfo, setFiberInfo] = useState('');
  const [components, setComponents] = useState<{name: string; hasName: boolean}[]>([]);

  /**
   * 初始化时扫描所有组件，分析 displayName 情况
   *
   * 原理说明：
   * 在 React 中，组件的名称来源有三种：
   *
   * 1. displayName（优先使用）
   *    - 开发者手动设置的组件名称
   *    - 例如：Counter.displayName = 'Counter'
   *    - 生产环境也可能保留
   *
   * 2. 函数/类名称（fallback）
   *    - 函数声明时的名称
   *    - 例如：function Counter() {}
   *    - 生产环境代码压缩后会被替换为短名称（如 a, b, c）
   *
   * 3. 无名称
   *    - 匿名函数
   *    - 箭头函数赋值给变量
   *    - 生产环境压缩后完全无法识别
   *
   * 颜色标识：
   * - 绿色：有名称（可通过名称查找）
   * - 红色：无名称（无法通过名称查找，需要其他方式）
   */
  useEffect(() => {
    const rootFiber = getTargetFiberRoot();
    if (rootFiber) {
      const list: {name: string; hasName: boolean}[] = [];
      traverseFiberTree(rootFiber, (f) => {
        const name = f.type ? getComponentName(f.type) : null;
        if (name && !list.find(c => c.name === name)) {
          // 判断名称来源：
          // 1. 如果有 displayName，那肯定有名称
          // 2. 否则看函数名是否存在（生产环境可能被压缩）
          const hasDisplayName = (f.type as any)?.displayName?.length > 0;
          const hasFuncName = (f.type as any)?.name?.length > 0;
          list.push({
            name,
            hasName: hasDisplayName || hasFuncName
          });
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

    /**
     * 尝试通过名称查找组件
     *
     * 注意：在生产环境下，如果组件没有 displayName，
     * 函数名被压缩后，可能无法通过原名称找到组件！
     * 这就是为什么建议始终设置 displayName 的原因。
     */
    const fiber = findFiberByComponentName(rootFiber, searchName);
    if (fiber) {
      const info = getFiberInfo(fiber);
      setFoundName(info.name);
      setFiberInfo(JSON.stringify(info, null, 2));
      message.success(`找到组件: ${info.name}`);
    } else {
      setFoundName('');
      setFiberInfo('');
      // 特别提示：可能是生产环境导致名称丢失
      message.error(`未找到组件: ${searchName}（可能是生产环境名称被压缩）`);
    }
  };

  return (
    <div>
      <Title level={2}>控制面板</Title>
      <Text type="secondary">展示有/无 displayName 的区别</Text>

      <Alert
        message="displayName 重要性说明"
        description={
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>开发环境：组件名称通常是函数名</li>
            <li>生产环境：代码压缩后函数名会变成 a, b, c 等</li>
            <li>解决方案：始终使用 displayName 显式设置组件名称</li>
          </ul>
        }
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />

      <Card title="所有组件列表（绿色=有名称，红色=无名称）" style={{ marginTop: 16 }}>
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
