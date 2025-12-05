/**
 * 登录页面
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import React, { useState } from 'react';
import { View, ScrollView, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validators } from '@/lib/validators';
import { studentApi } from '@ai-education/shared-frontend';
import { useAuthStore } from '@/stores/auth-store';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useApi } from '@/hooks/useApi';
import Toast from 'react-native-toast-message';

export function LoginScreen() {
  const navigation = useNavigation();
  const { setToken } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const { errors, validate, clearError } = useFormValidation<LoginParams>();

  const { loading, run: login } = useApi(
    async (params: { phone: string; password: string }) => {
      const token = await studentApi.login(params);
      return token;
    },
    {
      manual: true,
      onSuccess: async (res) => {
        await setToken(res);
        Toast.show({
          type: 'success',
          text1: '登录成功！',
        });
        navigation.navigate('Main' as never);
      },
    }
  );

  const handleSubmit = () => {
    if (!validate('phone', phone, validators.phone)) {
      return;
    }
    if (!validate('password', password, validators.password)) {
      return;
    }
    login({
      phone: validators.sanitize(phone),
      password: validators.sanitize(password),
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerClassName="flex-grow items-center justify-center bg-background px-4 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <Card className="w-full max-w-md border-border bg-card/80 shadow-xl">
          <CardHeader className="space-y-6 items-center">
            <View className="h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
              <Text className="text-2xl">📚</Text>
            </View>
            <View className="space-y-2 items-center">
              <CardTitle className="text-3xl font-bold text-foreground">
                欢迎回来！
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground text-center">
                登录你的 AI 学习空间，继续专属的练习旅程
              </CardDescription>
            </View>
          </CardHeader>

          <CardContent className="space-y-6">
            <View className="space-y-5">
              <Input
                label="手机号"
                placeholder="请输入手机号"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  clearError('phone');
                }}
                onBlur={() => validate('phone', phone, validators.phone)}
                keyboardType="phone-pad"
                editable={!loading}
                error={errors.phone}
              />

              <Input
                label="密码"
                placeholder="请输入密码"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError('password');
                }}
                onBlur={() => validate('password', password, validators.password)}
                secureTextEntry
                editable={!loading}
                error={errors.password}
              />

              <Button
                onPress={handleSubmit}
                disabled={loading}
                className="h-12 w-full rounded-xl"
                loading={loading}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </View>

            <Text className="text-center text-sm text-muted-foreground">
              忘记密码或无法登录？请联系班主任或管理员协助重置。
            </Text>
          </CardContent>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

