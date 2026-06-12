# P1-22 ~ P1-26 移动端开发计划

> P1-22 移动端登录 | P1-23 移动端能力练习 | P1-24 移动端答题界面 | P1-25 移动端练习记录 | P1-26 移动端个人中心
> **优先级**: P1-P2 | **预估工期**: 10天 | **前置依赖**: 无（复用 server-go 接口）

---

## 现状分析

移动端 (`apps/student-mobile/`) 已搭建基础框架：
- Expo 54 + React Native + Tamagui + Zustand + React Query
- Tab 导航: 首页 / 练习 / 记录 / 个人中心
- 登录页骨架 (`login/index.tsx`)
- 练习会话页和结果页骨架 (`practice/[sessionId].tsx`, `practice/result/[sessionId].tsx`)

---

## P1-22 移动端登录 (1天)

### 实现方案

**文件**: `apps/student-mobile/app/login/index.tsx`

```tsx
import { useState } from 'react';
import { router } from 'expo-router';
import { YStack, Input, Button, Text, H1 } from 'tamagui';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../src/lib/api';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: (creds: { username: string; password: string }) =>
      apiClient.post('/api/student/login', creds),
    onSuccess: (data) => {
      // 存储 token
      useAuthStore.getState().setToken(data.token);
      useAuthStore.getState().setUser(data.user);
      router.replace('/(tabs)');
    },
  });

  return (
    <YStack f={1} jc="center" ai="center" p="$4" bg="$background">
      <H1 mb="$6">AI 练习</H1>
      <YStack w="100%" gap="$3" maxWidth={400}>
        <Input placeholder="用户名" value={username} onChangeText={setUsername} />
        <Input placeholder="密码" value={password} onChangeText={setPassword} secureTextEntry />
        <Button 
          theme="primary" 
          onPress={() => loginMutation.mutate({ username, password })}
          disabled={loginMutation.isPending}
        >
          登录
        </Button>
      </YStack>
    </YStack>
  );
}
```

**文件**: `apps/student-mobile/src/stores/auth.ts`（新建）

```typescript
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

/** 当前登录用户信息，字段与后端 Student 结构体保持一致 */
interface User {
  id: string;
  name: string;
  phone: string;
  grade: number | null;
  semester: string | null;
  subject: string | null;
  status: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setToken: (token) => {
    SecureStore.setItemAsync('_token_', token);
    set({ token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    SecureStore.deleteItemAsync('_token_');
    set({ token: null, user: null });
  },
}));
```

---

## P1-23 移动端能力练习 (3天)

### 实现方案

**文件**: `apps/student-mobile/app/(tabs)/practice.tsx`

```tsx
import { ScrollView, YStack, Text, XStack, Card } from 'tamagui';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { apiClient } from '../../src/lib/api';

export default function PracticeScreen() {
  const { data: abilities } = useQuery({
    queryKey: ['abilities'],
    queryFn: () => apiClient.get('/api/student/ability/atomics'),
  });

  const { data: mastery } = useQuery({
    queryKey: ['mastery'],
    queryFn: () => apiClient.get('/api/student/mastery/list'),
  });

  const handlePractice = async (abilityCode: string) => {
    const result = await apiClient.post('/api/student/practice/create', {
      type: 'ability',
      ability_code: abilityCode,
      question_count: 10,
    });
    router.push(`/practice/${result.id}`);
  };

  return (
    <ScrollView>
      <YStack p="$4" gap="$3">
        <Text fontSize="$6" fontWeight="bold">选择练习</Text>
        {abilities?.map(ability => {
          const m = mastery?.find(m => m.ability_code === ability.code);
          const isWeak = m && m.correct_rate < 60;
          return (
            <Card key={ability.code} pressStyle={{ scale: 0.98 }}
                  onPress={() => handlePractice(ability.code)}>
              <YStack p="$3">
                <XStack jc="space-between">
                  <Text fontWeight="600">{ability.name}</Text>
                  {isWeak && <Text color="$orange10" fontSize="$2">薄弱项</Text>}
                </XStack>
                {m && (
                  <XStack mt="$2" gap="$2" ai="center">
                    <Text fontSize="$2" color="$gray10">正确率 {m.correct_rate}%</Text>
                    <Text fontSize="$2" color="$gray10">· 练习{m.practice_count}次</Text>
                  </XStack>
                )}
              </YStack>
            </Card>
          );
        })}
      </YStack>
    </ScrollView>
  );
}
```

---

## P1-24 移动端答题界面 (3天)

### 实现方案

**文件**: `apps/student-mobile/app/practice/[sessionId].tsx`

核心答题页面，支持多种题型渲染：

```tsx
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { YStack, XStack, Text, Button, Card, Input, ScrollView } from 'tamagui';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../src/lib/api';

export default function PracticeSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const { data: session } = useQuery({
    queryKey: ['practice', sessionId],
    queryFn: () => apiClient.get(`/api/student/practice/${sessionId}`),
    refetchInterval: (query) => {
      return query.state.data?.generate_status === 0 ? 2000 : false;
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: (params: any) => apiClient.post('/api/student/practice/answer', params),
  });

  const completeMutation = useMutation({
    mutationFn: () => apiClient.post(`/api/student/practice/${sessionId}/complete`),
    onSuccess: () => router.replace(`/practice/result/${sessionId}`),
  });

  if (!session || session.generate_status === 0) {
    return <LoadingView />;
  }

  const questions = session.answers?.map(a => a.question) ?? [];
  const current = questions[currentIndex];

  return (
    <YStack f={1} bg="$background">
      {/* 顶部进度条 */}
      <Progress count={questions.length} current={currentIndex} />

      {/* 题目内容 */}
      <ScrollView f={1} p="$4">
        <QuestionRenderer 
          question={current} 
          answer={answers[current?.id]}
          onAnswer={(ans) => {
            setAnswers(prev => ({ ...prev, [current.id]: ans }));
            submitAnswerMutation.mutate({
              practice_id: sessionId,
              question_id: current.id,
              answer: ans,
            });
          }}
        />
      </ScrollView>

      {/* 底部导航 */}
      <XStack p="$4" gap="$3" jc="space-between">
        <Button disabled={currentIndex === 0} onPress={() => setCurrentIndex(i => i - 1)}>
          上一题
        </Button>
        {currentIndex < questions.length - 1 ? (
          <Button theme="primary" onPress={() => setCurrentIndex(i => i + 1)}>下一题</Button>
        ) : (
          <Button theme="active" onPress={() => completeMutation.mutate()}>完成练习</Button>
        )}
      </XStack>
    </YStack>
  );
}
```

**题型渲染组件**: `apps/student-mobile/src/components/QuestionRenderer.tsx`（新建）

按 `question.type` 分发渲染：choice → 选择题组件, judge → 判断题组件, input → 填空题组件。

---

## P1-25 移动端练习记录 (2天)

**文件**: `apps/student-mobile/app/(tabs)/records.tsx`

```tsx
export default function RecordsScreen() {
  const { data } = useQuery({
    queryKey: ['practice-records'],
    queryFn: () => apiClient.get('/api/student/practice/records', { page: 1, size: 20 }),
  });

  return (
    <ScrollView>
      <YStack p="$4" gap="$3">
        <Text fontSize="$6" fontWeight="bold">练习记录</Text>
        {data?.items?.map(record => (
          <RecordCard key={record.id} record={record} 
            onPress={() => router.push(`/practice/result/${record.id}`)} />
        ))}
      </YStack>
    </ScrollView>
  );
}
```

---

## P1-26 移动端个人中心 (1天)

**文件**: `apps/student-mobile/app/(tabs)/profile.tsx`

```tsx
export default function ProfileScreen() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/api/student/profile'),
  });
  const auth = useAuthStore();

  return (
    <YStack f={1} p="$4" gap="$4">
      <Card p="$4">
        <Text fontSize="$5" fontWeight="bold">{profile?.name}</Text>
        <Text color="$gray10" mt="$1">{profile?.grade}年级 · {profile?.subject}</Text>
      </Card>
      
      <Card p="$4">
        <Text fontWeight="600" mb="$2">学习统计</Text>
        <XStack gap="$4">
          <YStack ai="center">
            <Text fontSize="$5" fontWeight="bold">{profile?.practice_count ?? 0}</Text>
            <Text fontSize="$2" color="$gray10">完成练习</Text>
          </YStack>
          <YStack ai="center">
            <Text fontSize="$5" fontWeight="bold">{profile?.avg_score ?? 0}%</Text>
            <Text fontSize="$2" color="$gray10">平均正确率</Text>
          </YStack>
        </XStack>
      </Card>

      <Button onPress={auth.logout}>退出登录</Button>
    </YStack>
  );
}
```

---

## 验收标准

1. 移动端可正常登录，token 持久化到 SecureStore
2. 练习 Tab 展示能力点列表，点击可创建并进入答题
3. 答题界面支持选择题、判断题、填空题
4. 完成练习后跳转结果页
5. 记录 Tab 展示历史练习
6. 个人中心展示基本信息和统计
