import { DeleteOutlined } from '@ant-design/icons';
import { ProFormCheckbox, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Card } from 'antd';
import { VALUE_TYPE_OPTIONS } from '../utils';

export default function ParameterConfigForm({ name, onDelete }: { name: number; onDelete: () => void }) {
  return (
    <Card actions={[<DeleteOutlined onClick={onDelete} />]}>
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
      <ProFormTextArea
        name={[name, 'description']}
        label="描述"
        placeholder="请输入参数描述"
        fieldProps={{ rows: 2 }}
        rules={[{ required: true, message: '请输入参数描述' }]}
      />
    </Card>
  );
}
