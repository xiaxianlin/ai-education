import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { adminApi } from '@/lib/api';
import { useAntdApp } from '@/lib/antdApp';

const useContainer = () => {
  const { message, modal } = useAntdApp();
  const actionRef = useRef<ActionType>();
  const formProps = useSimpleForm<SaveStudentRequest, Student>({
    service: async (values, item) => {
      if (item) {
        await adminApi.updateStudent(item.id, values);
      } else {
        await adminApi.createStudent(values);
        modal.success({
          title: '创建成功',
          content: `学生已创建，默认密码为手机号后6位`,
          okText: '确定',
        });
      }
    },
    onSubmit: () => actionRef.current?.reload(),
  });

  const handleDelete = (student: Student) => {
    modal.confirm({
      centered: true,
      title: '删除确认',
      content: `确定要删除学生「${student?.name || ''}」吗？`,
      okType: 'danger',
      onOk: async () => {
        await adminApi.deleteStudent(student.id);
        message.success('删除成功');
        actionRef.current?.reload();
      },
    });
  };

  return {
    actionRef,
    formProps,
    handleDelete,
  };
};

export const StudentListModel = createContainer(useContainer);
export const useStudentListModel = StudentListModel.useContainer;
