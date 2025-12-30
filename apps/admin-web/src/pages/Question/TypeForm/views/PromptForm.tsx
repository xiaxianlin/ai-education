import { ProFormTextArea } from '@ant-design/pro-components';

export function PromptForm() {
  return (
    <ProFormTextArea
      name="aiPrompt"
      placeholder="用于生成该题型题目的 AI 指令"
      fieldProps={{ rows: 26 }}
    />
  );
}

