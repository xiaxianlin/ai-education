import { Form, Input } from 'antd';
import { FEEDBACK_CONFIG_EXAMPLE } from '../../constants';

export default function FeedbackConfigForm() {
  return (
    <Form.Item
      labelCol={{ span: 4 }}
      name="feedbackConfig"
      label="反馈配置"
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
      <Input.TextArea
        rows={6}
        placeholder={`JSON 格式的反馈配置，示例：\n${JSON.stringify(FEEDBACK_CONFIG_EXAMPLE, null, 2)}`}
      />
    </Form.Item>
  );
}
