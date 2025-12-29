import { ProFormTextArea } from '@ant-design/pro-components';

export function PromptForm() {
  return (
    <>
      <ProFormTextArea
        name="prompt"
        label="提示词模板"
        placeholder="请输入提示词模板内容"
        fieldProps={{ rows: 26 }}
        rules={[{ required: true, message: '请输入提示词模板内容' }]}
      />
    </>
  );
}

