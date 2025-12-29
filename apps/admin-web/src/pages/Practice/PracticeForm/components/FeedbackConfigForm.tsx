import { ProFormCheckbox } from '@ant-design/pro-components';
import { Flex, Form, Input } from 'antd';

interface FeedbackConfigFormProps {
  name: string;
}

export default function FeedbackConfigForm({ name }: FeedbackConfigFormProps) {
  return (
    <Form.Item name={name} noStyle>
      <Flex gap={16} align="center" justify="space-between">
        <ProFormCheckbox name={[name, 'instant_feedback']}>即时反馈</ProFormCheckbox>
        <ProFormCheckbox name={[name, 'show_explanation']}>显示解析</ProFormCheckbox>
        <ProFormCheckbox name={[name, 'gamification', 'enable_points']}>启用积分</ProFormCheckbox>
        <ProFormCheckbox name={[name, 'gamification', 'enable_badges']}>启用徽章</ProFormCheckbox>
        <ProFormCheckbox name={[name, 'gamification', 'enable_progress']}>启用进度</ProFormCheckbox>
      </Flex>
      <Form.Item
        name={[name, 'encouragement_messages']}
        label="鼓励消息"
        tooltip="每行一条消息"
        style={{ marginBottom: 0 }}
      >
        <Form.Item
          noStyle
          getValueFromEvent={(e) => {
            const value = e.target.value;
            if (!value) return undefined;
            return value.split('\n').filter((line: string) => line.trim());
          }}
          getValueProps={(value) => ({
            value: Array.isArray(value) ? value.join('\n') : '',
          })}
        >
          <Input.TextArea
            rows={8}
            placeholder="每行一条鼓励消息&#10;例如：&#10;做得很好！&#10;继续加油！"
          />
        </Form.Item>
      </Form.Item>
    </Form.Item>
  );
}
