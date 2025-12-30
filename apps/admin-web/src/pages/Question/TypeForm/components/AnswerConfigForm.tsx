import { ProFormSelect } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import { ANSWER_OPTIONS } from '../../constants';

export default function AnswerConfigForm() {
  return (
    <>
      <ProFormSelect
        labelCol={{ span: 4 }}
        name="answerType"
        label="答案类型"
        placeholder="请选择答案类型"
        rules={[{ required: true, message: '请选择答案类型' }]}
        options={ANSWER_OPTIONS}
      />
      <Form.Item
        labelCol={{ span: 4 }}
        name="answerConfig"
        label="答案配置"
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
        <Input.TextArea rows={3} placeholder="JSON 格式的答案配置（可选）" />
      </Form.Item>
    </>
  );
}
