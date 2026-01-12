import { ModalForm, ProFormDigit, ProFormText } from '@ant-design/pro-components';

import { useTextbookVersionListModel } from '../models/page';

export default function FormView() {
  const {
    formProps: { form, visible, item, onCancel, handleSubmit },
  } = useTextbookVersionListModel();

  return (
    <ModalForm<SaveTextbookVersionRequest>
      width={600}
      form={form}
      open={visible}
      title={item ? '更新教材版本' : '新增教材版本'}
      onFinish={handleSubmit}
      modalProps={{ destroyOnClose: true, onCancel }}
      layout="horizontal"
      size="large"
      labelAlign="left"
      labelCol={{ span: 4 }}
    >
      <div className="pt-3" />
      <ProFormText
        name="name"
        label="版本名称"
        placeholder="请输入版本名称，如：人教版"
        rules={[{ required: true, message: '请输入版本名称' }]}
      />
      <ProFormDigit
        name="revision_year"
        label="修订年份"
        placeholder="请输入修订年份，如：2023"
        rules={[
          { required: true, message: '请输入修订年份' },
          { type: 'number', min: 2000, max: 2100, message: '年份必须在2000-2100之间' },
        ]}
        fieldProps={{
          precision: 0,
          max: 2100,
          min: 2000,
        }}
      />
    </ModalForm>
  );
}
