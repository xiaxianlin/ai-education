import { useState } from 'react';
import { ProCard } from '@ant-design/pro-components';
import { Button, Tag, Space, Empty } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { TemplateParameter } from '../utils/templateParser';
import ParameterDrawer from './ParameterDrawer';

interface Props {
  parameters: TemplateParameter[];
  values: Record<string, any>;
  onParametersChange: (values: Record<string, any>) => void;
}

export default function ParameterInfo({ parameters, values, onParametersChange }: Props) {
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 如果没有参数，不显示该模块
  if (parameters.length === 0) {
    return null;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'string':
        return 'blue';
      case 'number':
        return 'green';
      case 'boolean':
        return 'orange';
      case 'object':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'string':
        return '字符串';
      case 'number':
        return '数字';
      case 'boolean':
        return '布尔值';
      case 'object':
        return '对象';
      default:
        return type;
    }
  };

  const handleOpenDrawer = () => {
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };

  const handleSaveParameters = (newValues: Record<string, any>) => {
    onParametersChange(newValues);
  };

  return (
    <>
      <ProCard
        title="参数信息"
        extra={
          <Button
            type="link"
            icon={<SettingOutlined />}
            onClick={handleOpenDrawer}
          >
            设置参数
          </Button>
        }
      >
        <div>
          {parameters.length > 0 ? (
            <Space wrap>
              {parameters.map((param) => {
                const value = values[param.name];
                const isUnset = value === undefined || value === null || value === '';

                return (
                  <div key={param.name} style={{ marginBottom: 8 }}>
                    <Space align="start">
                      <Space>
                        <span>{param.name}</span>
                        <Tag color={getTypeColor(param.type)}>
                          {getTypeText(param.type)}
                        </Tag>
                        {param.required && <Tag color="red">必填</Tag>}
                        {!isUnset && <Tag color="green">已设置</Tag>}
                      </Space>
                      {!isUnset && (
                        <span style={{ color: 'rgba(0, 0, 0, 0.65)', wordBreak: 'break-all' }}>
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </span>
                      )}
                    </Space>
                  </div>
                );
              })}
            </Space>
          ) : (
            <Empty description="暂无参数" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </ProCard>

      <ParameterDrawer
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        parameters={parameters}
        values={values}
        onSave={handleSaveParameters}
      />
    </>
  );
}
