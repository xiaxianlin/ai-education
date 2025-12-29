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
      <ProFormSelect
        labelAlign="left"
        labelCol={{ span: 4 }}
        name={[name, 'level']}
        label="难度等级"
        placeholder="请选择难度等级"
        options={LEVEL_OPTIONS}
      />
      <ProFormDigit
        labelAlign="left"
        labelCol={{ span: 4 }}
        name={[name, 'target_accuracy']}
        label="目标正确率"
        placeholder="请输入目标正确率（0-100）"
        fieldProps={{ min: 0, max: 100, step: 1, precision: 0, suffix: '%' }}
      />
      <ProFormDigit
        labelAlign="left"
        labelCol={{ span: 4 }}
        name={[name, 'distribution', 'easy']}
        label="简单题占比"
        placeholder="请输入简单题占比"
        fieldProps={{ min: 0, precision: 0, suffix: '%' }}
      />
      <ProFormDigit
        labelAlign="left"
        labelCol={{ span: 4 }}
        name={[name, 'distribution', 'medium']}
        label="中等题占比"
        placeholder="请输入中等题占比"
        fieldProps={{ min: 0, precision: 0, suffix: '%' }}
      />
      <ProFormDigit
        labelAlign="left"
        labelCol={{ span: 4 }}
        name={[name, 'distribution', 'hard']}
        label="困难题占比"
        placeholder="请输入困难题占比"
        fieldProps={{ min: 0, precision: 0, suffix: '%' }}
      />
    </Form.Item>
  );
}
