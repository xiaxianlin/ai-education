import { useState } from 'react';
import { ProCard } from '@ant-design/pro-components';
import { Button, Tag, Space, Empty, Progress } from 'antd';
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

  const total = parameters.length;
  const requiredCount = parameters.filter((p) => p.required).length;
  const filledRequired = parameters.filter((p) => {
    if (!p.required) return false;
    const v = values[p.name];
    return v !== undefined && v !== null && v !== '';
  }).length;
  const percent = requiredCount === 0 ? 100 : Math.round((filledRequired / requiredCount) * 100);

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
      <ProCard title="参数信息" bordered={false} headStyle={{ padding: 0 }} bodyStyle={{ padding: 0 }}>
        {total === 0 ? (
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', paddingTop: 4 }}>
            当前模板未包含可配置参数
          </div>
        ) : (
          <>
            {/* 顶部统计概览 */}
            <div style={{ marginBottom: 12 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space size="large">
                  <span>参数总数：{total}</span>
                  <span>必填：{requiredCount}</span>
                  <span>已填写：{filledRequired}</span>
                </Space>
                <Progress
                  percent={percent}
                  size="small"
                  status={percent === 100 ? 'success' : 'active'}
                  showInfo={false}
                />
              </Space>
            </div>

            {/* 参数标签展示 */}
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
                            {isUnset && <Tag>未设置</Tag>}
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
          </>
        )}
      </ProCard>

      <ParameterDrawer
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        parameters={parameters}
        values={values}
        onSave={handleSaveParameters}
      />

      <Button
        type="link"
        icon={<SettingOutlined />}
        onClick={handleOpenDrawer}
        style={{ paddingLeft: 0, marginTop: 8 }}
      >
        设置参数
      </Button>
    </>
  );
}
