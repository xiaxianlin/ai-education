import { useRequest } from 'ahooks';
import { ModalForm, ProFormRadio, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { adminApi } from '@/lib/api';
import { useStudentDetailModel } from '../models/page';
import { GRADES } from '@/constants/course';
import { useAntdApp } from '@/lib/antdApp';

export function EditForm() {
  const { message } = useAntdApp();
  const { student, editForm, editFormVisible, refresh, setEditFormVisible } =
    useStudentDetailModel();
  const { runAsync: handleEditSubmit, loading: editing } = useRequest(
    async (values: SaveStudentRequest) => adminApi.updateStudent((student as any)?.id || '', values),
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
    <ModalForm<SaveStudentRequest>
      width={500}
      form={editForm}
      open={editFormVisible}
      title="编辑学生"
      onFinish={async (values) => {
        await handleEditSubmit(values);
      }}
      loading={editing}
      modalProps={{
        destroyOnClose: true,
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
      <ProFormSelect
        name="grade"
        label="年级"
        placeholder="请选择年级"
        rules={[{ required: true, message: '请选择年级' }]}
        options={Object.keys(GRADES).map((grade) => ({
          label: GRADES[Number(grade)],
          value: Number(grade),
        }))}
      />
      <ProFormRadio.Group
        name="status"
        label="状态"
        options={[
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ]}
      />
    </ModalForm>
  );
}
