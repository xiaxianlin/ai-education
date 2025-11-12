/**
 * 登录页面
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLogin } from './hooks/useLogin';
import { validators } from '@/lib/utils/validators';

export function Login() {
  const {
    phone,
    password,
    loading,
    errors,
    setPhone,
    setPassword,
    clearError,
    validate,
    handleSubmit,
  } = useLogin();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-60px] h-96 w-96 rounded-full bg-pink-300/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-3xl" />
      </div>

      <Card className="relative z-10 w-full max-w-md border-2 border-white/60 bg-white/70 shadow-[0_25px_80px_-30px_rgba(79,70,229,0.6)] backdrop-blur-xl">
        <CardHeader className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white bg-gradient-to-br from-white via-blue-50 to-purple-50 shadow-lg">
            <img
              src={logo}
              alt="AI 学习助手 Logo"
              className="h-12 w-12 object-contain"
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-gray-800">
              欢迎回来！
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              登录你的 AI 学习空间，继续专属的练习旅程
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700"
              >
                手机号
              </label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearError('phone');
                }}
                onBlur={() => validate('phone', phone, validators.phone)}
                required
                disabled={loading}
                className={cn(
                  'h-12 rounded-xl border-2 border-gray-200 bg-white/80 text-base shadow-sm transition-all focus-visible:border-purple-400 focus-visible:ring-2 focus-visible:ring-purple-200/80',
                  errors.phone &&
                    'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40'
                )}
              />
              {errors.phone && (
                <div className="text-sm text-destructive">{errors.phone}</div>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                密码
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError('password');
                }}
                onBlur={() =>
                  validate('password', password, validators.password)
                }
                required
                disabled={loading}
                className={cn(
                  'h-12 rounded-xl border-2 border-gray-200 bg-white/80 text-base shadow-sm transition-all focus-visible:border-purple-400 focus-visible:ring-2 focus-visible:ring-purple-200/80',
                  errors.password &&
                    'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40'
                )}
              />
              {errors.password && (
                <div className="text-sm text-destructive">{errors.password}</div>
              )}
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-base font-semibold shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-offset-0"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500">
            忘记密码或无法登录？请联系班主任或管理员协助重置。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

