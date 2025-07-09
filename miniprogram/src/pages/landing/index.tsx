import { View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import "./index.scss";
import { Loading } from "@taroify/core";
import { http } from "@/services/api";

export default function Landing() {
  useLoad(async () => {
    const res = await http.get("/check");
    Taro.redirectTo({
      url: res?.ok ? "/pages/home/index" : "/pages/login/index",
    });
  });

  return (
    <View className="landing">
      <Loading
        size={50}
        type="spinner"
        direction="vertical"
        className="custom-color"
      >
        登录中...
      </Loading>
    </View>
  );
}
