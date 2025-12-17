import { ProCard } from '@ant-design/pro-components';
import { Button, Tag, Empty, List, Flex } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { TemplateParameter } from '../utils/templateParser';
import ParameterDrawer from './ParameterDrawer';
import { useBoolean } from 'ahooks';

interface Props {
  parameters: TemplateParameter[];
  values: Record<string, any>;
  onParametersChange: (values: Record<string, any>) => void;
}

export default function ParameterInfo({ parameters, values, onParametersChange }: Props) {
  const [drawerVisible, { setTrue: handleOpenDrawer, setFalse: handleCloseDrawer }] = useBoolean(false);

  const handleSaveParameters = (newValues: Record<string, any>) => {
    onParametersChange(newValues);
  };

  const hasParameters = parameters.length > 0;

  return (
    <>
      <ProCard
        title="输入参数"
        bordered
        headerBordered
        extra={
          hasParameters && (
            <Button type="text" icon={<SettingOutlined />} onClick={handleOpenDrawer}>
              设置
            </Button>
          )
        }
      >
        {!hasParameters ? (
          <Empty description="当前模板无需配置参数" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            size="small"
            dataSource={parameters}
            renderItem={(param) => {
              const value = values[param.name];
              const isUnset = value === undefined || value === null || value === '';

              return (
                <List.Item>
                  <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                    <Flex gap={8} align="center">
                      <span style={{ fontWeight: 500 }}>{param.name}</span>
                      {param.required && <Tag color="red">必填</Tag>}
                    </Flex>
                    <span
                      style={{
                        color: isUnset ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.65)',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isUnset ? '未设置' : value}
                    </span>
                  </Flex>
                </List.Item>
              );
            }}
          />
        )}
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
