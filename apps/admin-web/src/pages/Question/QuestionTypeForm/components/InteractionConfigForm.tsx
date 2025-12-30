import { ProFormSelect } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import { INTERACTION_OPTIONS } from '../../constants';

export default function InteractionConfigForm() {
  return (
    <>
      <ProFormSelect
        labelCol={{ span: 4 }}
        name="interactionType"
        label="交互类型"
        placeholder="请选择交互类型"
        rules={[{ required: true, message: '请选择交互类型' }]}
        options={INTERACTION_OPTIONS}
      />
      <Form.Item
        labelCol={{ span: 4 }}
        name="interactionConfig"
        label="交互配置"
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
        <Input.TextArea rows={3} placeholder="JSON 格式的交互配置（可选）" />
      </Form.Item>
    </>
  );
}
