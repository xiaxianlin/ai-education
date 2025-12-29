import { ProFormDigit } from '@ant-design/pro-components';
import { Form } from 'antd';

interface QuestionCountConfigFormProps {
  name: string;
}

export default function QuestionCountConfigForm({ name }: QuestionCountConfigFormProps) {
  return (
    <Form.Item name={name} noStyle>
      <ProFormDigit
        labelAlign="left"
        labelCol={{ span: 5 }}
        name={[name, 'total']}
        label="总题数"
        placeholder="请输入总题数"
        fieldProps={{ min: 1, precision: 0 }}
      />
      <ProFormDigit
        labelAlign="left"
        labelCol={{ span: 5 }}
        name={[name, 'per_group']}
        label="每组题数"
        placeholder="请输入每组题数"
        fieldProps={{ min: 1, precision: 0 }}
      />
      <ProFormDigit
        labelAlign="left"
        labelCol={{ span: 5 }}
        name={[name, 'max_groups']}
        label="最大组数"
        placeholder="请输入最大组数"
        fieldProps={{ min: 1, precision: 0 }}
      />
      <ProFormDigit
        labelAlign="left"
        labelCol={{ span: 5 }}
        name={[name, 'time_limit_minutes']}
        label="时间限制（分钟）"
        placeholder="请输入时间限制"
        fieldProps={{ min: 1, precision: 0 }}
      />
    </Form.Item>
  );
}
