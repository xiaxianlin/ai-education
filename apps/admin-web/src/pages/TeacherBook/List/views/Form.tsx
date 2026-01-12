import { ModalForm, ProFormSelect } from '@ant-design/pro-components';

import { useConfigs } from '@/hooks';
import { TextbookVersionSelect } from '@/components';
import { useTeacherBookListModel } from '../models/page';

export default function FormView() {
  const { semesters } = useConfigs();
  const {
    subject,
    formProps: { form, visible, item, onCancel, handleSubmit },
  } = useTeacherBookListModel();

  return (
    <ModalForm<SaveTeacherBookRequest>
      width={600}
      form={form}
      open={visible}
      title={item ? '更新教师用书' : '新增教师用书'}
      onFinish={handleSubmit}
      modalProps={{ destroyOnClose: true, onCancel }}
      layout="horizontal"
      size="large"
      labelAlign="left"
      labelCol={{ span: 3 }}
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
