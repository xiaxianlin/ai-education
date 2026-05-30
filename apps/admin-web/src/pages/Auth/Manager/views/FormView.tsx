import { Button, Field, Input, Modal, type TableActionRef } from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { TEACHER_MANAGER_TYPE } from '@/constants/manager';
import { useRequest } from 'ahooks';
import React from 'react';
import { AuthApi } from '../../api';

export interface ManagerFormViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionRef: React.MutableRefObject<TableActionRef | undefined>;
}

export function ManagerFormView(props: ManagerFormViewProps) {
  const { open, onOpenChange, actionRef } = props;
  const [username, setUsername] = React.useState('');
  const [error, setError] = React.useState('');

  const { runAsync: add, loading } = useRequest((values: CreateManagerRequest) => AuthApi.createManager(values), {
    manual: true,
    onSuccess: (passwd: PasswordResponse) => {
      onOpenChange(false);
      actionRef.current?.reload();
      toast.success(`添加成功，请保存好密码：${passwd.password}`);
    },
    onError: (error: any) => {
      setError(error?.message || '添加失败');
    },
  });

  React.useEffect(() => {
    if (open) {
      setUsername('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('请输入老师账号');
      return;
    }
    await add({ username: username.trim(), type: TEACHER_MANAGER_TYPE });
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      title="添加老师账号"
      description="系统会生成初始密码，请在创建成功后保存。"
      onClose={() => onOpenChange(false)}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="submit" form="manager-form" loading={loading}>
            添加
          </Button>
        </>
      }
    >
      <form id="manager-form" className="space-y-5" onSubmit={handleSubmit}>
        <Field label="老师账号" required error={error}>
          <Input maxLength={50} value={username} placeholder="请输入老师账号" onChange={(event) => setUsername(event.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}
