import { ModalForm, ProFormSelect } from '@ant-design/pro-components';

import { useConfigs } from '@/hooks';
import { useTextbookListModel } from '../models/page';

export default function FormView() {
  const { semesters, textbook_versions } = useConfigs();
  const {
    formProps: { form, visible, item, onCancel, handleSubmit },
  } = useTextbookListModel();

  return (
    <ModalForm<SaveTextbookRequest>
      width={600}
      form={form}
      open={visible}
      title={item ? '更新教材' : '新增教材'}
      onFinish={handleSubmit}
      modalProps={{ destroyOnClose: true, onCancel }}
      layout="horizontal"
      size="large"
      labelAlign="left"
      labelCol={{ span: 3 }}
    >
      <div className="pt-3" />
      <ProFormSelect
        name="version"
        label="版本"
        placeholder="请选择版本"
        rules={[{ required: true }]}
        valueEnum={textbook_versions?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {})}
      />
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
