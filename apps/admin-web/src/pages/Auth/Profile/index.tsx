import { ManagerTypeText } from '@/constants/manager';
import { toast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api';
import { useInitialStateModel } from '@/models/initialState';
import { validPassword } from '@/utils/validation';
import { useRequest } from 'ahooks';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '../api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { clearState, manager } = useInitialStateModel();
  const [values, setValues] = useState<ModifyPasswordRequest & { confirm?: string }>({});
  const [error, setError] = useState('');

  const { runAsync: modifyPassword, loading: modifying } = useRequest(AuthApi.modifyPassword, {
    manual: true,
    ready: !!manager?.id,
    onSuccess: () => {
      toast.success('密码修改成功，请重新登录');
      apiClient.removeToken();
      clearState();
      navigate('/login', { replace: true });
    },
    onError: (err: any) => {
      setError(err?.message || '密码修改失败');
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (values.password !== values.confirm) {
      setError('两次输入的密码不一致');
      return;
    }

    try {
      await validPassword(values.origin || '');
      await validPassword(values.password || '');
      await modifyPassword({ origin: values.origin, password: values.password });
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err?.message || '密码修改失败');
    }
  };

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">个人中心</h1>
        <p className="mt-1 text-sm text-muted-foreground">查看账号信息并维护登录密码。</p>
      </header>

      <div className="grid max-w-5xl gap-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-lg border bg-background p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-foreground">账号信息</h2>
            <p className="mt-1 text-sm text-muted-foreground">当前登录管理员账号</p>
          </div>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-muted-foreground">账号名称</dt>
              <dd className="mt-1 text-lg font-medium text-foreground">{manager?.username || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">账号角色</dt>
              <dd className="mt-2">
                <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                  {manager?.type !== undefined ? ManagerTypeText[manager.type] : '-'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">当前状态</dt>
              <dd className="mt-2">
                <span className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  正常
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border bg-background p-6 shadow-sm">
          <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4">
            <div className="font-medium text-amber-900">安全设置</div>
            <p className="mt-1 text-sm text-amber-700">
              为了保障您的账户安全，建议定期修改登录密码。修改成功后，系统将自动登出，请使用新密码重新登录。
            </p>
          </div>

          <form className="max-w-md space-y-5" autoComplete="off" onSubmit={handleSubmit}>
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

            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">确认新密码</span>
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
                type="password"
                value={values.confirm || ''}
                placeholder="请再次输入新密码"
                onChange={(event) => setValues((prev) => ({ ...prev, confirm: event.target.value }))}
              />
            </label>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={modifying}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {modifying ? '修改中...' : '立即修改'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
