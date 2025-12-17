import { useState } from 'react';
import { ProCard } from '@ant-design/pro-components';
import { Button, Tag, Space, Descriptions } from 'antd';
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

  const formatModelParams = (params?: ModelConfig['model_params']) => {
    if (!params) return '未设置';

    const items = [];
    if (params.temperature !== undefined) {
      items.push(`温度: ${params.temperature}`);
    }
    if (params.max_tokens !== undefined) {
      items.push(`最大令牌: ${params.max_tokens}`);
    }
    if (params.top_p !== undefined) {
      items.push(`Top P: ${params.top_p}`);
    }
    if (params.frequency_penalty !== undefined) {
      items.push(`频率惩罚: ${params.frequency_penalty}`);
    }
    if (params.presence_penalty !== undefined) {
      items.push(`存在惩罚: ${params.presence_penalty}`);
    }

    return items.length > 0 ? items.join(', ') : '未设置';
  };

  return (
    <>
      <ProCard
        title="模型信息"
        extra={
          <Button
            type="link"
            icon={<SettingOutlined />}
            onClick={handleOpenDrawer}
          >
            设置模型
          </Button>
        }
      >
        <Descriptions column={2} size="small">
          <Descriptions.Item label="提供方">
            <Tag color="blue">{config.model_provider || '未设置'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="模型名称">
            <Tag color="green">{config.model_name || '未设置'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="模型参数" span={2}>
            <span style={{ fontSize: 12, color: '#666' }}>
              {formatModelParams(config.model_params)}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </ProCard>

      <ModelDrawer
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        config={config}
        onSave={handleSaveConfig}
      />
    </>
  );
}
