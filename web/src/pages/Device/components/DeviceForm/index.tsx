import { Form, FormInstance, Input, Modal } from 'antd';
import { VoiceSelect } from '@/pages/Device/components';

interface DeviceFormProps {
  visible?: boolean;
  form: FormInstance<RobotFormModel>;
  onSure?: () => void;
  onCancel?: () => void;
}
export function DeviceForm({ form, visible, onSure, onCancel }: DeviceFormProps) {
  return (
    <Modal
      title="设置机器人"
      maskClosable={false}
      open={visible}
      okButtonProps={{ size: 'large', style: { width: 100 } }}
      cancelButtonProps={{ size: 'large', style: { width: 100 } }}
      onOk={onSure}
      onCancel={onCancel}
    >
      <div style={{ marginBottom: 20 }}></div>
      <Form
        size="large"
        name="basic"
        form={form}
        labelCol={{ span: 4 }}
        initialValues={{ remember: true }}
        autoComplete="off"
      >
        <Form.Item<RobotFormModel> label="昵称" name="nickname" rules={[{ required: true }]}>
          <Input maxLength={20} placeholder="请输入昵称" />
        </Form.Item>
        <Form.Item<RobotFormModel> label="唤醒词" name="wakeup" rules={[{ required: true }]}>
          <Input maxLength={20} placeholder="请输入唤醒词" />
        </Form.Item>
        <Form.Item<RobotFormModel> label="欢迎语" name="welcome" rules={[{ required: true }]}>
          <Input.TextArea maxLength={100} placeholder="请输入欢迎语" />
        </Form.Item>
        <Form.Item<RobotFormModel> label="音色" name="voice" rules={[{ required: true }]}>
          <VoiceSelect placeholder="请输入昵称" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
