import { useRequest } from 'ahooks';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { StudentApi } from '@/services/student';
import { useStudentDetailModel } from '../models/page';
import { message } from 'antd';

export function EditForm() {
  const { student, editForm, editFormVisible, refresh, setEditFormVisible } =
    useStudentDetailModel();
  const { runAsync: handleEditSubmit, loading: editing } = useRequest(
    async (values: StudentUpdateForm) => StudentApi.update(student?.id || '', values),
    {
      manual: true,
      onSuccess: () => {
        message.success('更新成功');
        setEditFormVisible(false);
        editForm.resetFields();
        refresh();
      },
    },
  );

  return (
    <ModalForm<StudentUpdateForm>
      width={500}
      form={editForm}
      open={editFormVisible}
      title="编辑学生"
      onFinish={async (values) => {
        await handleEditSubmit(values);
      }}
      loading={editing}
      modalProps={{
        destroyOnHidden: true,
        onCancel: () => {
          setEditFormVisible(false);
          editForm.resetFields();
        },
      }}
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
