import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";
import { Empty, Navbar, SafeArea, Button, Toast } from "@taroify/core";
import "./index.scss";
import { http } from "@/services/api";

export default function Login() {
  const handleLogin = async () => {
    try {
      Taro.showLoading({ title: "登录中...", mask: true });
      const { code } = await Taro.login();
      const res = await http.post(`/login`, { code });
      if (res?.ok) {
        await Taro.setStorage({ key: "ACCESS_TOKEN", data: res.data });
        Taro.redirectTo({ url: "/pages/home/index" });
      } else {
        Toast.fail(res?.message || "请求失败");
      }
    } catch (error) {
      console.error(error);
      Toast.fail("网络异常");
    } finally {
      Taro.hideLoading();
    }
  };
  return (
    <View className="login">
      <SafeArea position="top" nativeSafeTop />
      <Navbar title="登录" />
      <View className="login-content">
        <Empty>
          <Empty.Image />
          <Empty.Description>你还未登录，请先登录</Empty.Description>
          <Button
            className="bottom-button"
            color="primary"
            size="large"
            onClick={handleLogin}
          >
            立即登录
          </Button>
        </Empty>
      </View>
    </View>
  );
}
