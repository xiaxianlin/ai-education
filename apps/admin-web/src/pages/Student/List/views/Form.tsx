import { ModalForm, ProFormText } from '@ant-design/pro-components';

import { useStudentListModel } from '../models/page';

export default function FormView() {
  const {
    formProps: { form, visible, item, onCancel, handleSubmit },
  } = useStudentListModel();

  return (
    <ModalForm<SaveStudentRequest>
      width={500}
      form={form}
      open={visible}
      title={item ? '更新学生' : '新增学生'}
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
        label="姓名"
        placeholder="请输入姓名"
        rules={[{ required: true, message: '请输入姓名' }]}
        fieldProps={{ maxLength: 50 }}
      />
      <ProFormText
        name="phone"
        label="手机号"
        placeholder="请输入手机号"
        rules={[
          { required: true, message: '请输入手机号' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
        ]}
        fieldProps={{ maxLength: 11 }}
      />
    </ModalForm>
  );
}


