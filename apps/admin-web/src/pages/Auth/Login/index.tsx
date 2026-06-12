import { apiClient } from '@/lib/api';
import { validPassword } from '@/utils/validation';
import { useRequest } from 'ahooks';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '../api';
import './index.less';

export default function LoginPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<LoginRequest>({
    username: 'xiaxianlin',
    password: 'Xiaxl.901208',
  });
  const [error, setError] = useState('');

  const { runAsync: login, loading } = useRequest((data: LoginRequest) => AuthApi.login(data), {
    manual: true,
    onSuccess: async (res) => {
      apiClient.setToken(res);
      navigate('/home', { replace: true });
    },
    onError: (err: any) => {
      setError(err?.message || '登录失败，请检查账号和密码');
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!values.username?.trim()) {
      setError('请输入用户名');
      return;
    }

    try {
      await validPassword(values.password || '');
      await login(values);
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err?.message || '登录失败');
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="mb-8">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            AI
          </div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">管理员登录</h1>
          <p className="mt-2 text-sm text-muted-foreground">请输入您的凭据以访问管理后台</p>
        </div>

        <form className="space-y-5" autoComplete="off" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">用户名</span>
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
              value={values.username || ''}
              placeholder="请输入用户名"
              onChange={(event) => setValues((prev) => ({ ...prev, username: event.target.value }))}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">密码</span>
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
              type="password"
              value={values.password || ''}
              placeholder="请输入密码"
              onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>

          {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </section>
    </main>
  );
}
