import { DeleteOutlined } from '@ant-design/icons';
import { ProFormCheckbox, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Button, Card, Popconfirm } from 'antd';
import { VALUE_TYPE_OPTIONS } from '../utils';

export default function ParameterConfigForm({ name, onDelete }: { name: number; onDelete: () => void }) {
  return (
    <Card className="parameter-card">
      <Popconfirm title="确定删除该参数吗？" onConfirm={onDelete}>
        <Button icon={<DeleteOutlined />} danger size="small" type="text" className="absolute top-2 right-2" />
      </Popconfirm>
      <ProFormCheckbox name={[name, 'required']} label="必填" required />
      <ProFormText
        name={[name, 'key']}
        label="标识"
        placeholder="如：max_count"
        rules={[{ required: true, message: '请输入参数标识' }]}
      />
      <ProFormSelect
        name={[name, 'value_type']}
        label="类型"
        placeholder="请选择值类型"
        options={VALUE_TYPE_OPTIONS}
        rules={[{ required: true, message: '请选择值类型' }]}
      />
      <ProFormText
        className="mb-0"
        name={[name, 'description']}
        label="描述"
        placeholder="请输入参数描述"
        rules={[{ required: true, message: '请输入参数描述' }]}
      />
    </Card>
  );
}
