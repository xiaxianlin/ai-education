import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ProFormCheckbox } from '@ant-design/pro-components';
import { Button, Flex, Form, Input } from 'antd';

interface FeedbackConfigFormProps {
  name: string;
}

export default function FeedbackConfigForm({ name }: FeedbackConfigFormProps) {
  return (
    <Form.Item name={name} noStyle>
      <Form.Item label="基础" labelCol={{ span: 4 }} labelAlign="left">
        <Flex gap={16} align="center">
          <ProFormCheckbox name={[name, 'instant_feedback']}>即时反馈</ProFormCheckbox>
          <ProFormCheckbox name={[name, 'show_explanation']}>显示解析</ProFormCheckbox>
        </Flex>
      </Form.Item>
      <Form.Item label="游戏化" labelCol={{ span: 4 }} labelAlign="left">
        <Flex gap={16} align="center">
          <ProFormCheckbox name={[name, 'gamification', 'enable_points']}>启用积分</ProFormCheckbox>
          <ProFormCheckbox name={[name, 'gamification', 'enable_badges']}>启用徽章</ProFormCheckbox>
          <ProFormCheckbox name={[name, 'gamification', 'enable_progress']}>启用进度</ProFormCheckbox>
        </Flex>
      </Form.Item>
      <Form.Item label="鼓励消息" tooltip="添加鼓励消息" labelCol={{ span: 4 }} labelAlign="left">
        <Form.List name={[name, 'encouragement_messages']}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name: fieldName }) => (
                <Flex key={key} gap={8} align="center" style={{ marginBottom: 8 }}>
                  <Form.Item
                    name={fieldName}
                    style={{ flex: 1, marginBottom: 0 }}
                    rules={[{ required: true, message: '请输入鼓励消息' }]}
                  >
                    <Input placeholder="请输入鼓励消息，例如：做得很好！" />
                  </Form.Item>
                  <Button danger icon={<DeleteOutlined />} onClick={() => remove(fieldName)} />
                </Flex>
              ))}
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ marginTop: 8 }}>
                  添加鼓励消息
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form.Item>
    </Form.Item>
  );
}
