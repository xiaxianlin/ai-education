import React from 'react';
import { toast } from '@/components/ui/toast';
import { useRequest } from 'ahooks';
import { TEACHER_MANAGER_TYPE } from '@/constants/manager';
import { AuthApi } from '../../api';

export interface ManagerFormViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionRef: React.MutableRefObject<any>;
}

export function ManagerFormView(props: ManagerFormViewProps) {
  const { open, onOpenChange, actionRef } = props;
  const [username, setUsername] = React.useState('');
  const [error, setError] = React.useState('');

  const { runAsync: add } = useRequest((values: any) => AuthApi.createManager(values), {
    manual: true,
    onSuccess: (passwd: any) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-foreground">添加老师账号</h2>
          <p className="mt-1 text-sm text-muted-foreground">系统会生成初始密码，请在创建成功后保存。</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">老师账号</span>
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
              maxLength={50}
              value={username}
              placeholder="请输入老师账号"
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              onClick={() => onOpenChange(false)}
            >
              取消
            </button>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
