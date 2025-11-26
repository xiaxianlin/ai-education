/**
 * 登录页面
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { validators } from "@/lib/validators";
import { useState } from "react";
import { useRequest } from "ahooks";
import { AuthApi } from "@/services/auth";
import { useAuthStore } from "@/stores/AuthStore";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "@/components/ui/toast";

export function Login() {
  const navigate = useNavigate();
  const { setToken } = useAuthStore();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const { errors, validate, clearError } = useFormValidation<LoginParams>();

  const { loading, run: login } = useRequest(AuthApi.login, {
    manual: true,
    onSuccess: (res) => {
      setToken(res);
      toast.success("登录成功！");
      navigate({ to: "/home" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate("phone", phone, validators.phone)) {
      return;
    }
    if (!validate("password", password, validators.password)) {
      return;
    }
    login({
      phone: validators.sanitize(phone),
      password: validators.sanitize(password),
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-60px] h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <Card className="relative z-10 w-full max-w-md border-border bg-card/80 shadow-xl backdrop-blur-xl">
        <CardHeader className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
            <img
              src={logo}
              alt="AI 学习助手 Logo"
              className="h-12 w-12 object-contain"
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-foreground">
              欢迎回来！
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              登录你的 AI 学习空间，继续专属的练习旅程
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-foreground"
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
                  clearError("phone");
                }}
                onBlur={() => validate("phone", phone, validators.phone)}
                required
                disabled={loading}
                className={cn(
                  "h-12 rounded-xl border-input bg-background text-base shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-ring",
                  errors.phone &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.phone && (
                <div className="text-sm text-destructive">{errors.phone}</div>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
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
                  clearError("password");
                }}
                onBlur={() =>
                  validate("password", password, validators.password)
                }
                required
                disabled={loading}
                className={cn(
                  "h-12 rounded-xl border-input bg-background text-base shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-ring",
                  errors.password &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.password && (
                <div className="text-sm text-destructive">
                  {errors.password}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-primary text-primary-foreground text-base font-semibold shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            忘记密码或无法登录？请联系班主任或管理员协助重置。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
