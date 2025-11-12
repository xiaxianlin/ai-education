/**
 * 登录页面
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">学生登录</CardTitle>
          <CardDescription className="text-center">
            请输入您的手机号和密码
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                手机号
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearError('phone');
                }}
                onBlur={() => validate('phone', phone, validators.phone)}
                required
                disabled={loading}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <div className="text-sm text-destructive">{errors.phone}</div>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                密码
              </label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError('password');
                }}
                onBlur={() => validate('password', password, validators.password)}
                required
                disabled={loading}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <div className="text-sm text-destructive">{errors.password}</div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

