import { MarkdownEditor } from '@/components';
import { ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Form } from 'antd';
import { useQuestionTypeFormModel } from '../models/page';

export function UnitForm() {
  const { isEdit } = useQuestionTypeFormModel();

  return (
    <>
      <ProFormText
        required
        name="code"
        label="编码"
        placeholder="唯一标识，如 pinyin_choice"
        disabled={isEdit}
        rules={[
          {
            pattern: /^[a-z][a-z0-9_]*$/,
            message: '编码格式：小写字母开头，只能包含小写字母、数字、下划线',
          },
        ]}
      />
      <ProFormText
        name="name"
        label="名称"
        placeholder="题型名称，如 看图选拼音"
        rules={[{ required: true, message: '请输入名称' }]}
      />
      <ProFormTextArea name="description" label="描述" placeholder="题型描述（可选）" fieldProps={{ rows: 2 }} />
      <Form.Item name="prompt" label="AI 生成指令">
        <MarkdownEditor />
      </Form.Item>
    </>
  );
}
