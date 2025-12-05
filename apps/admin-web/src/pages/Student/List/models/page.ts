import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { useRequest } from 'ahooks';
import { adminApi } from '@ai-education/shared-frontend';
import { message, Modal } from 'antd';

const useContainer = () => {
  const actionRef = useRef<ActionType>();
  const form = useSimpleForm<StudentForm | StudentUpdateForm, Student>({
    onSubmit: () => actionRef.current?.reload(),
  });

  const { runAsync: handleSubmit } = useRequest(
    async (values: StudentForm | StudentUpdateForm) => {
      if (form.edited) {
        await adminApi.updateStudent(form.edited.id, values as StudentUpdateForm);
      } else {
        await adminApi.createStudent(values as StudentForm);
        Modal.success({
          title: '创建成功',
          content: `学生已创建，默认密码为手机号后6位`,
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
        await adminApi.deleteStudent(student.id);
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

