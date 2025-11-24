/**
 * 登录页面逻辑 Hook
 */
import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { authApi } from '@/services/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import { validators } from '@/lib/utils/validators';
import { ApiError } from '@/lib/types/api';
import { toast } from '@/components/ui/toast';

export function useLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken } = useAuthStore();
  const { errors, validate, clearError } = useFormValidation<{
    phone: string;
    password: string;
  }>();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate('phone', phone, validators.phone)) {
      return;
    }

    if (!validate('password', password, validators.password)) {
      return;
    }

    setLoading(true);

    try {
      const token = await authApi.login({
        phone: validators.sanitize(phone),
        password: validators.sanitize(password),
      });
      setToken(token);
      console.log('first', token)
      toast.success('登录成功！');
      navigate({ to: '/home' });
    } catch (err) {
      let errorMessage = '登录失败，请检查手机号和密码';
      if (err instanceof ApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      console.error('Login error:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [phone, password, validate, setToken, navigate]);

  return {
    phone,
    password,
    loading,
    errors,
    setPhone,
    setPassword,
    clearError,
    validate,
    handleSubmit,
  };
}

