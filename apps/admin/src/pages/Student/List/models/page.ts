import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { useRequest } from 'ahooks';
import { StudentApi } from '@/services/student';
import { message, Modal } from 'antd';

const useContainer = () => {
  const actionRef = useRef<ActionType>();
  const form = useSimpleForm<StudentForm | StudentUpdateForm, Student>({
    onSubmit: () => actionRef.current?.reload(),
  });

  const { runAsync: handleSubmit } = useRequest(
    async (values: StudentForm | StudentUpdateForm) => {
      if (form.edited) {
        await StudentApi.update(form.edited.id, values as StudentUpdateForm);
      } else {
        const password = await StudentApi.create(values as StudentForm);
        Modal.success({
          title: '创建成功',
          content: `学生密码：${password}，请妥善保管`,
          okText: '确定',
        });
      }
    },
    {
      manual: true,
      onSuccess: () => {
        message.success(form.edited ? '更新成功' : '创建成功');
        form.onCancel();
        form.onSubmit();
      },
    },
  );

  const handleDelete = (student: Student) => {
    Modal.confirm({
      centered: true,
      title: '删除确认',
      content: `确定要删除学生「${student.name}」吗？`,
      okType: 'danger',
      onOk: async () => {
        await StudentApi.delete(student.id);
        message.success('删除成功');
        actionRef.current?.reload();
      },
    });
  };

  return {
    ...form,
    actionRef,
    handleSubmit,
    handleDelete,
  };
};

export const StudentListModel = createContainer(useContainer);
export const useStudentListModel = StudentListModel.useContainer;

