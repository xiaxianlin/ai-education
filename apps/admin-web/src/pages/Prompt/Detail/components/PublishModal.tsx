import { adminApi } from '@/lib/api';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';
import { ButtonSize } from 'antd/es/button';

interface PublishModalProps {
  versionId: number;
  size?: ButtonSize;
  buttonType?: 'primary' | 'link';
  onSuccess?: () => void;
}
export function PublishModal({ size, versionId, buttonType = 'primary', onSuccess }: PublishModalProps) {
  const [form] = Form.useForm<{ changelog: string }>();
  return (
    <ModalForm<{ changelog: string }>
      width={500}
      form={form}
      autoFocusFirstInput
      title="发布提示词"
      trigger={
        <Button size={size} type={buttonType}>
          发布
        </Button>
      }
      onFinish={async (values) => {
        try {
          await adminApi.publishPromptVersion(versionId, values.changelog);
          message.success('发布成功');
          onSuccess?.();
          return true;
        } catch (error: any) {
          message.error(error?.message || '发布失败');
          return false;
        }
      }}
    >
      <ProFormTextArea name="changelog" label="变更说明" rules={[{ required: true, message: '请输入变更说明' }]} />
    </ModalForm>
  );
}
