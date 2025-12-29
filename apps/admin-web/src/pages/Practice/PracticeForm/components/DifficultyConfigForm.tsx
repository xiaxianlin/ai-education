import { ProFormDigit, ProFormSelect } from '@ant-design/pro-components';
import { Form } from 'antd';

interface DifficultyConfigFormProps {
  name: string;
}

const LEVEL_OPTIONS = [
  { label: '基础', value: 'basic' },
  { label: '中级', value: 'intermediate' },
  { label: '高级', value: 'advanced' },
];

export default function DifficultyConfigForm({ name }: DifficultyConfigFormProps) {
  return (
    <Form.Item name={name} noStyle>
      <ProFormSelect name={[name, 'level']} label="难度等级" placeholder="请选择难度等级" options={LEVEL_OPTIONS} />
      <ProFormDigit
        name={[name, 'target_accuracy']}
        label="目标正确率"
        placeholder="请输入目标正确率（0-1）"
        fieldProps={{ min: 0, max: 1, step: 0.1, precision: 2 }}
      />
      <ProFormDigit
        name={[name, 'distribution', 'easy']}
        label="简单题数"
        placeholder="请输入简单题数"
        fieldProps={{ min: 0, precision: 0 }}
      />
      <ProFormDigit
        name={[name, 'distribution', 'medium']}
        label="中等题数"
        placeholder="请输入中等题数"
        fieldProps={{ min: 0, precision: 0 }}
      />
      <ProFormDigit
        name={[name, 'distribution', 'hard']}
        label="困难题数"
        placeholder="请输入困难题数"
        fieldProps={{ min: 0, precision: 0 }}
      />
    </Form.Item>
  );
}
