import { TextbookVersionSelect } from '@/components';
import { useConfigs } from '@/hooks';
import { ModalForm, ProFormSelect } from '@ant-design/pro-components';
import { useTextbookConfigModel } from '../models/page';

export default function FormView() {
  const { semesters } = useConfigs();
  const {
    subject,
    formProps: { form, visible, item, onCancel, handleSubmit },
  } = useTextbookConfigModel();

  return (
    <ModalForm<SaveStudentTextbookConfigRequest>
      width={600}
      form={form}
      open={visible}
      title={item ? '更新教材配置' : '新增教材配置'}
      onFinish={handleSubmit}
      modalProps={{ destroyOnClose: true, onCancel }}
      layout="horizontal"
      size="large"
      labelAlign="left"
      labelCol={{ span: 4 }}
    >
      <div className="pt-3" />
      <TextbookVersionSelect subject={subject} />
      <ProFormSelect
        name="semester"
        label="学期"
        placeholder="请选择学期"
        rules={[{ required: true }]}
        valueEnum={semesters?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {})}
      />
    </ModalForm>
  );
}
