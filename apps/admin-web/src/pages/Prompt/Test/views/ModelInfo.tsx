import { useState } from 'react';
import { Button, Tag, Descriptions } from 'antd';
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 500 }}>模型配置</div>
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
            选择用于本次测试的模型与参数
          </div>
        </div>
        <Button
          type="link"
          icon={<SettingOutlined />}
          onClick={handleOpenDrawer}
        >
          设置模型
        </Button>
      </div>

      <Descriptions column={2} size="small" colon={false}>
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

      <ModelDrawer
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        config={config}
        onSave={handleSaveConfig}
      />
    </>
  );
}
