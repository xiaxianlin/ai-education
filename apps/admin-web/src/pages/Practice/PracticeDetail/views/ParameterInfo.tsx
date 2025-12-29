import { Descriptions, Empty } from 'antd';
import { VALUE_TYPE_LABELS } from '../../PracticeForm/utils';

interface PracticeParameter {
  key: string;
  description: string;
  value_type: 'string' | 'number' | 'object' | 'array' | 'boolean';
  required: boolean;
}

interface ParameterInfoProps {
  parameterConfig?: PracticeParameter[];
}

export function ParameterInfo({ parameterConfig }: ParameterInfoProps) {
  if (!parameterConfig || parameterConfig.length === 0) {
    return <Empty description="暂无参数配置" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {parameterConfig.map((param) => (
        <Descriptions key={param.key} column={1} size="small" bordered>
          <Descriptions.Item label="参数标识">{param.key}</Descriptions.Item>
          <Descriptions.Item label="类型">{VALUE_TYPE_LABELS[param.value_type] || param.value_type}</Descriptions.Item>
          <Descriptions.Item label="必填">{param.required ? '是' : '否'}</Descriptions.Item>
          <Descriptions.Item label="描述">{param.description || '-'}</Descriptions.Item>
        </Descriptions>
      ))}
    </div>
  );
}
