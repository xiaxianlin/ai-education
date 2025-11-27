import { StudentApi } from '@/services/student';
import { ProForm } from '@ant-design/pro-components';
import { useParams, useNavigate } from '@umijs/max';
import { useRequest } from 'ahooks';
import { message, Modal } from 'antd';
import { useState } from 'react';
import { createContainer } from 'unstated-next';

const useContainer = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [editForm] = ProForm.useForm<StudentForm>();
  const [editFormVisible, setEditFormVisible] = useState(false);

  const { data, loading, refresh } = useRequest(() => StudentApi.getDetail(id!), {
    ready: !!id,
    refreshDeps: [id],
  });
  const { student, textbook } = data || {};
  const { runAsync: handleDelete, loading: deleting } = useRequest(() => StudentApi.delete(id!), {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      navigate('/student');
    },
  });

  const { runAsync: handleResetPassword, loading: resetting } = useRequest(
    () => StudentApi.resetPassword(id!),
    {
      manual: true,
      onSuccess: (password) => {
        Modal.success({
          title: '密码重置成功',
          content: `新密码：${password}，请妥善保管`,
          okText: '确定',
        });
      },
    },
  );

  const { runAsync: handleToggleStatus, loading: toggling } = useRequest(
    async (status: number) => StudentApi.update(id!, { status }),
    {
      manual: true,
      onSuccess: (_, [status]) => {
        message.success(status === 1 ? '启用成功' : '停用成功');
        refresh();
      },
    },
  );
  return {
    student,
    textbook,
    loading,
    deleting,
    resetting,
    toggling,
    refresh,
    handleDelete,
    handleResetPassword,
    handleToggleStatus,
    editForm,
    editFormVisible,
    setEditFormVisible,
  };
};

export const StudentDetailModel = createContainer(useContainer);
export const useStudentDetailModel = StudentDetailModel.useContainer;
