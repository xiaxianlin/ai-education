import { useState, FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authApi } from "@/services/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFormValidation } from "@/shared/hooks/useFormValidation";
import { validators } from "@/shared/utils/validators";
import { ApiError } from "@/shared/types/api";

export function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken } = useAuthStore();
  const { errors, validate, clearError } = useFormValidation<{
    phone: string;
    password: string;
  }>();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // 验证手机号
    if (!validate('phone', phone, validators.phone)) {
      return;
    }

    // 验证密码
    if (!validate('password', password, validators.password)) {
      return;
    }

    setLoading(true);

    try {
      const token = await authApi.login({ 
        phone: validators.sanitize(phone), 
        password: validators.sanitize(password) 
      });
      setToken(token);
      // 使用 navigate 而不是 window.location，保持 SPA 体验
      navigate({ to: '/home' });
    } catch (err) {
      let errorMessage = "登录失败，请检查手机号和密码";
      if (err instanceof ApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      // 显示错误（可以通过 toast 或其他方式）
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

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
                className={errors.phone ? "border-destructive" : ""}
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
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <div className="text-sm text-destructive">{errors.password}</div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
