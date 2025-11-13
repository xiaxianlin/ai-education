import { useMemo } from 'react';
import { history } from '@umijs/max';
import { useRequest } from 'ahooks';
import { message, Modal } from 'antd';
import type { MenuProps } from 'antd';

import { StudentApi } from '@/services/student';

export function useStudentActions(
  id?: string,
  student?: Student,
  refreshStudent?: () => void,
) {
  const {
    runAsync: handleDelete,
    loading: deleting,
  } = useRequest(async () => StudentApi.delete(id!), {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      history.push('/student');
    },
    onError: () => {
      message.error('删除失败');
    },
  });

  const {
    runAsync: handleResetPassword,
    loading: resetting,
  } = useRequest(async () => StudentApi.resetPassword(id!), {
    manual: true,
    onSuccess: (password) => {
      Modal.success({
        title: '密码重置成功',
        content: `新密码：${password}，请妥善保管`,
        okText: '确定',
      });
    },
    onError: () => {
      message.error('重置失败');
    },
  });

  const {
    runAsync: handleToggleStatus,
    loading: toggling,
  } = useRequest(async (status: number) => StudentApi.update(id!, { status }), {
    manual: true,
    onSuccess: (_, [status]) => {
      message.success(status === 1 ? '启用成功' : '停用成功');
      refreshStudent?.();
    },
    onError: () => {
      message.error('操作失败');
    },
  });

  const menuItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'delete',
        label: '删除',
        danger: true,
        disabled: deleting,
        onClick: () => {
          if (!student) return;
          Modal.confirm({
            centered: true,
            title: '删除确认',
            content: `确定要删除学生「${student.name}」吗？此操作不可恢复。`,
            okType: 'danger',
            onOk: () => handleDelete(),
          });
        },
      },
      {
        key: 'status',
        label: student?.status === 1 ? '停用' : '启用',
        disabled: toggling,
        onClick: () => {
          const newStatus = student?.status === 1 ? 0 : 1;
          Modal.confirm({
            centered: true,
            title: '状态变更',
            content: `确定要${newStatus === 1 ? '启用' : '停用'}该学生吗？`,
            onOk: () => handleToggleStatus(newStatus),
          });
        },
      },
      {
        key: 'reset',
        label: '重置密码',
        disabled: resetting,
        onClick: () => {
          Modal.confirm({
            centered: true,
            title: '重置密码',
            content: '确定要重置该学生的密码吗？重置后系统将生成新密码。',
            onOk: () => handleResetPassword(),
          });
        },
      },
    ],
    [deleting, student, toggling, resetting, handleDelete, handleToggleStatus, handleResetPassword],
  );

  return {
    menuItems,
    handleDelete,
    deleting,
    handleResetPassword,
    resetting,
    handleToggleStatus,
    toggling,
  };
}

