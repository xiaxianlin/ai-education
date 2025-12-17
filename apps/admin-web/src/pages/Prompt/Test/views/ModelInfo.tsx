import { useState } from 'react';
import { ProCard } from '@ant-design/pro-components';
import { Button, Tag, Flex, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { ModelConfig } from './ModelDrawer';
import ModelDrawer from './ModelDrawer';

interface Props {
  config: ModelConfig;
  onConfigChange: (config: ModelConfig) => void;
}

export default function ModelInfo({ config, onConfigChange }: Props) {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleOpenDrawer = () => {
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };

  const handleSaveConfig = (newConfig: ModelConfig) => {
    onConfigChange(newConfig);
  };

  return (
    <>
      <ProCard
        title="模型配置"
        subTitle="选择用于本次测试的模型与参数"
        bordered
        headerBordered
        extra={
          <Button type="text" icon={<SettingOutlined />} onClick={handleOpenDrawer}>
            设置
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Flex justify="space-between" align="center">
            <span style={{ color: 'rgba(0,0,0,0.65)' }}>提供方</span>
            <Tag color="blue">{config.model_provider || '未设置'}</Tag>
          </Flex>
          <Flex justify="space-between" align="center">
            <span style={{ color: 'rgba(0,0,0,0.65)' }}>模型名称</span>
            <Tag color="green">{config.model_name || '未设置'}</Tag>
          </Flex>
          <Flex justify="space-between" align="center">
            <span style={{ color: 'rgba(0,0,0,0.65)' }}>温度</span>
            <span>{config.model_params?.temperature ?? 0.7}</span>
          </Flex>
        </Space>
      </ProCard>

      <ModelDrawer visible={drawerVisible} onClose={handleCloseDrawer} config={config} onSave={handleSaveConfig} />
    </>
  );
}
