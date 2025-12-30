import { ProFormSelect } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import { RESOURCE_OPTIONS } from '../../constants';

export default function ResourceConfigForm() {
  return (
    <>
      <ProFormSelect
        labelCol={{ span: 4 }}
        name="resourceType"
        label="资源类型"
        placeholder="请选择资源类型"
        options={RESOURCE_OPTIONS}
        initialValue="text"
        rules={[{ required: true, message: '请选择资源类型' }]}
      />
      <Form.Item
        labelCol={{ span: 4 }}
        name="resourceConfig"
        label="资源配置"
        rules={[
          {
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              try {
                JSON.parse(value);
                return Promise.resolve();
              } catch (e) {
                return Promise.reject('请输入有效的 JSON');
              }
            },
          },
        ]}
      >
        <Input.TextArea rows={3} placeholder="JSON 格式的资源配置（可选）" />
      </Form.Item>
    </>
  );
}
