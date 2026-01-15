import { JsonEditor } from '@/components/JsonEditor';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-components';
import { Form } from 'antd';
import { useEffect } from 'react';
import { useQuestionListModel } from '../models/page';

export function QuestionFormModal() {
  const { form, item, visible, onCancel, handleSubmit } = useQuestionListModel();

  useEffect(() => {
    if (!visible || !item) return;
    form.setFieldsValue({
      explanation: item.explanation,
      content_raw: JSON.stringify(item.content, null, 2),
      answer_raw: JSON.stringify(item.answer, null, 2),
    });
  }, [visible, item, form]);

  return (
    <ModalForm
      width={600}
      form={form}
      open={visible}
      title="编辑题目"
      onFinish={handleSubmit}
      modalProps={{ destroyOnClose: true, onCancel }}
      labelCol={{ span: 4 }}
    >
      <ProFormTextArea name="explanation" label="题目解析" placeholder="输入解析" fieldProps={{ rows: 4 }} />
      <Form.Item label="题目内容" name="content_raw" rules={[{ required: true, message: '请输入题目内容' }]}>
        <JsonEditor height="350px" />
      </Form.Item>
      <Form.Item label="答案配置" name="answer_raw" rules={[{ required: true, message: '请输入答案配置' }]}>
        <JsonEditor height="250px" />
      </Form.Item>
    </ModalForm>
  );
}
