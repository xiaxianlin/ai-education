import { FormInstance } from 'antd';
import { Button, Form, Input, Space } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { ProCard } from '@ant-design/pro-components';

type Props = {
  isNew: boolean;
  form: FormInstance<Prompt>;
  onCreate: () => Promise<void>;
  onUpdate: () => Promise<void>;
};

export function PromptForm({ isNew, form, onCreate, onUpdate }: Props) {
  return (
    <ProCard>
      <Form layout="vertical" form={form}>
        <Form.Item label="名称" name="name" rules={[{ required: true }]}>
          <Input placeholder="请输入名称" />
        </Form.Item>
        <Form.Item label="Slug" name="slug" rules={[{ required: true }]} tooltip="唯一短名">
          <Input placeholder="唯一标识" disabled={!isNew} />
        </Form.Item>
        <Form.Item label="分类" name="category" rules={[{ required: true }]}>
          <Input placeholder="image_gen / audio_gen / question_gen 等" />
        </Form.Item>
        <Form.Item label="标签" name="tags">
          <Input placeholder="逗号分隔标签" />
        </Form.Item>
        <Form.Item label="描述" name="description">
          <TextArea rows={3} />
        </Form.Item>
        <Space>
          {isNew ? (
            <Button type="primary" onClick={onCreate}>
              创建 Prompt
            </Button>
          ) : (
            <Button type="primary" onClick={onUpdate}>
              保存
            </Button>
          )}
        </Space>
      </Form>
    </ProCard>
  );
}

