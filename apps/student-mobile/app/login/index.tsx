import client from "@/src/api/client";
import { validators } from "@/src/lib/validators";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { Stack as ExpoStack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Lock, Phone } from "lucide-react-native";
import React, { useState } from "react";
import { Image, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, Spinner, Text, Theme, View, XStack, YStack } from "tamagui";

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [phone, setPhone] = useState("15068114669");
  const [password, setPassword] = useState("3Mbu&4T95Mqs*iBm");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});

  const handleLogin = async () => {
    const phoneError = validators.phone(phone);
    const passwordError = validators.password(password);

    if (phoneError || passwordError) {
      setErrors({ phone: phoneError || undefined, password: passwordError || undefined });
      return;
    }

    setLoading(true);
    try {
      const { data } = await client.post("/auth/login", {
        phone: validators.sanitize(phone),
        password: validators.sanitize(password),
      });

      const token = typeof data === "string" ? data : data.token;
      setAuth(token, {});
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login error:", error);
      setErrors({ phone: "登录失败，请检查账号密码" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Theme name="light">
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <StatusBar style="dark" />
        <ExpoStack.Screen options={{ headerShown: false }} />

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View flex={1} px="$6" justifyContent="center">
            {/* Background Decorative Circles */}
            <View
              position="absolute"
              top={-100}
              left={-50}
              width={300}
              height={300}
              borderRadius={1000}
              backgroundColor="$blue5"
              opacity={0.5}
            />
            <View
              position="absolute"
              bottom={-150}
              right={-100}
              width={400}
              height={400}
              borderRadius={1000}
              backgroundColor="$purple5"
              opacity={0.5}
            />

            <YStack ai="center" mb="$8">
              <View
                width={96}
                height={96}
                bg="white"
                borderColor="$gray5"
                borderWidth={1}
                borderRadius="$8"
                ai="center"
                jc="center"
                shadowColor="$black"
                shadowOpacity={0.05}
                shadowRadius={5}
                shadowOffset={{ width: 0, height: 2 }}
                mb="$6"
                overflow="hidden"
              >
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 80, height: 80 }}
                  resizeMode="contain"
                />
              </View>
              <Text fontSize="$8" fontWeight="bold" color="$gray12" mb="$2">
                欢迎回来
              </Text>
              <Text color="$gray10" textAlign="center">
                登录你的 AI 学习空间，继续专属的练习旅程
              </Text>
            </YStack>

            <YStack space="$4">
              <YStack>
                <XStack
                  ai="center"
                  h="$5"
                  bg="$gray3"
                  borderColor={errors.phone ? "$red9" : "$gray5"}
                  borderWidth={1}
                  borderRadius="$4"
                  px="$4"
                  animation="quick"
                >
                  <Phone size={20} color={errors.phone ? "#ef4444" : "#6b7280"} />
                  <Input
                    flex={1}
                    unstyled
                    ml="$3"
                    fontSize="$5"
                    color="$gray12"
                    placeholder="请输入手机号"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    editable={!loading}
                    placeholderTextColor="#9ca3af"
                  />
                </XStack>
                {errors.phone && (
                  <Text color="$red9" fontSize="$2" mt="$1" ml="$1">
                    {errors.phone}
                  </Text>
                )}
              </YStack>

              <YStack>
                <XStack
                  ai="center"
                  h="$5"
                  bg="$gray3"
                  borderColor={errors.password ? "$red9" : "$gray5"}
                  borderWidth={1}
                  borderRadius="$4"
                  px="$4"
                  animation="quick"
                >
                  <Lock size={20} color={errors.password ? "#ef4444" : "#6b7280"} />
                  <Input
                    flex={1}
                    unstyled
                    ml="$3"
                    fontSize="$5"
                    color="$gray12"
                    placeholder="请输入密码"
                    secureTextEntry
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    editable={!loading}
                    placeholderTextColor="#9ca3af"
                  />
                </XStack>
                {errors.password && (
                  <Text color="$red9" fontSize="$2" mt="$1" ml="$1">
                    {errors.password}
                  </Text>
                )}
              </YStack>

              <Button
                mt="$4"
                bc="$blue10"
                bg="$blue10"
                size="$5"
                borderRadius="$4"
                onPress={handleLogin}
                disabled={loading}
                opacity={loading ? 0.7 : 1}
                pressStyle={{ scale: 0.97 }}
                icon={loading ? <Spinner color="white" /> : undefined}
                color="white"
                fontWeight="bold"
                fontSize="$5"
              >
                {loading ? "" : "登录"}
              </Button>

              <Text textAlign="center" color="$gray8" fontSize="$2" mt="$6" px="$4">
                忘记密码或无法登录？请联系班主任或管理员协助重置。
              </Text>
            </YStack>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Theme>
  );
}
