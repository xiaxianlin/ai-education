import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { useInitialStateModel } from '@/models/initialState';
import { validPassword } from '@/utils/validation';
import { useRequest } from 'ahooks';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '../api';

export default function MoidfyPasswordPage() {
  const navigate = useNavigate();
  const { clearState, manager } = useInitialStateModel();
  const [values, setValues] = useState<ModifyPasswordRequest>({});
  const [error, setError] = useState('');

  const { runAsync, loading } = useRequest(AuthApi.modifyPassword, {
    manual: true,
    ready: !!manager?.id,
    onSuccess: () => {
      toast.success('修改成功，请重新登录');
      apiClient.removeToken();
      clearState();
      navigate('/login', { replace: true });
    },
    onError: (err: any) => {
      setError(err?.message || '修改失败');
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      await validPassword(values.origin || '');
      await validPassword(values.password || '');
      await runAsync(values);
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err?.message || '修改失败');
    }
  };

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">修改密码</h1>
        <p className="mt-1 text-sm text-muted-foreground">修改成功后将自动退出登录。</p>
      </header>

      <section className="max-w-md rounded-lg border bg-background p-6 shadow-sm">
        <form className="space-y-5" autoComplete="off" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">旧密码</span>
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
              type="password"
              value={values.origin || ''}
              placeholder="请输入旧密码"
              onChange={(event) => setValues((prev) => ({ ...prev, origin: event.target.value }))}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">新密码</span>
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
              type="password"
              value={values.password || ''}
              placeholder="请输入新密码"
              onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>

          {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '修改中...' : '修改'}
          </button>
        </form>
      </section>
    </main>
  );
}
