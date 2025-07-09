import React, { FC } from 'react';
import { useRequest } from 'ahooks';
import { Button, message, Popconfirm } from 'antd';
import { deleteAccount } from '@/services/account';
import { useModel } from '@umijs/max';

export const DeleteButton: FC<{ record: Account; onChange?: () => void }> = ({ record, onChange }) => {
  const { runAsync, loading } = useRequest(deleteAccount, {
    manual: true,
    ready: !!record.id,
    onSuccess: (res) => {
      if (!res.ok) return;
      message.success('删除成功');
      onChange?.();
    },
  });

  return (
    <Popconfirm
      okText="确定"
      title="确认提示"
      cancelText="取消"
      description="确认要删除账号吗"
      onConfirm={() => runAsync(record.id)}
    >
      <Button type="link" size="small" loading={loading} className="p-0">
        删除
      </Button>
    </Popconfirm>
  );
};
