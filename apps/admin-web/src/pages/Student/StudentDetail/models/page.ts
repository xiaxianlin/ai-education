import { StudentApi } from '../../api';
import { ProForm } from '@ant-design/pro-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { message, Modal } from 'antd';
import { useState } from 'react';
import { createContainer } from 'unstated-next';

const useContainer = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [editForm] = ProForm.useForm<SaveStudentRequest>();
  const [editFormVisible, setEditFormVisible] = useState(false);

  const {
    data: student,
    error,
    refresh,
  } = useRequest(() => StudentApi.getStudent(id!), {
    ready: !!id,
    refreshDeps: [id],
  });

  const { runAsync: handleDelete, loading: deleting } = useRequest(() => StudentApi.deleteStudent(id!), {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      navigate('/student');
    },
  });

  const { runAsync: handleResetPassword, loading: resetting } = useRequest(() => StudentApi.resetStudentPassword(id!), {
    manual: true,
    onSuccess: (password) => {
      Modal.success({
        title: '密码重置成功',
        content: `新密码：${password}，请妥善保管`,
        okText: '确定',
      });
    },
  });

  return {
    student,
    loading: !student && !error,
    deleting,
    resetting,
    refresh,
    handleDelete,
    handleResetPassword,
    editForm,
    editFormVisible,
    setEditFormVisible,
  };
};

export const StudentDetailModel = createContainer(useContainer);
export const useStudentDetailModel = StudentDetailModel.useContainer;
