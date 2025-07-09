import "./index.scss";
import { PropsWithChildren } from "react";
import { View } from "@tarojs/components";
import { Navbar, SafeArea } from "@taroify/core";

interface SimplePageProps {
  title: string;
}

export default function SimplePage({
  title,
  children,
}: PropsWithChildren<SimplePageProps>) {
  return (
    <View className="page">
      <SafeArea position="top" nativeSafeTop />
      <Navbar title={title} />
      {children}
    </View>
  );
}
