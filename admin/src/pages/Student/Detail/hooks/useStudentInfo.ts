import { useEffect, useState } from 'react';
import { history } from '@umijs/max';
import { ProForm } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { message } from 'antd';

import { StudentApi } from '@/services/student';

export function useStudentInfo(id?: string) {
  const [editForm] = ProForm.useForm<StudentUpdateForm>();
  const [editFormVisible, setEditFormVisible] = useState(false);

  const {
    data: student,
    loading,
    refresh: refreshStudent,
  } = useRequest(() => StudentApi.getDetail(id!), {
    ready: !!id,
    refreshDeps: [id],
    onError: () => {
      message.error('加载学生失败');
      history.back();
    },
  });

  useEffect(() => {
    if (student) {
      editForm.setFieldsValue({
        name: student.name,
        phone: student.phone,
      });
    }
  }, [student, editForm]);

  const {
    runAsync: handleEditSubmit,
    loading: editing,
  } = useRequest(async (values: StudentUpdateForm) => StudentApi.update(id!, values), {
    manual: true,
    onSuccess: () => {
      message.success('更新成功');
      setEditFormVisible(false);
      editForm.resetFields();
      refreshStudent();
    },
    onError: () => {
      message.error('更新失败');
    },
  });

  const handleEdit = () => {
    if (student) {
      editForm.setFieldsValue({
        name: student.name,
        phone: student.phone,
      });
      setEditFormVisible(true);
    }
  };

  return {
    student,
    loading,
    refreshStudent,
    editForm,
    editFormVisible,
    setEditFormVisible,
    handleEditSubmit,
    editing,
    handleEdit,
  };
}
