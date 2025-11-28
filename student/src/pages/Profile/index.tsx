/**
 * 个人信息页面
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/business/Header";
import { TrendingUp } from "lucide-react";
import { LoadingSpinner } from "@/components/business/LoadingSpinner";
import { useProfile } from "./hooks/useProfile";

export default function Profile() {
  const { loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-12 flex items-center justify-center">
        <LoadingSpinner size="lg" text="正在加载..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 数据统计 */}
        <Card className="border-2 border-primary/20 shadow-lg rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">我的成绩</h2>
            </div>
          </CardContent>
        </Card>

        {/* 功能卡片 */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-accent/20 rounded-3xl bg-card">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors shadow-sm">
                    <div className="text-5xl">🏆</div>
                  </div>
                </div>
                <p className="text-xl font-bold text-foreground">我的成就</p>
                <p className="text-sm text-muted-foreground">查看学习成就</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-primary/20 rounded-3xl bg-card">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shadow-sm">
                    <div className="text-5xl">📊</div>
                  </div>
                </div>
                <p className="text-xl font-bold text-foreground">评测报告</p>
                <p className="text-sm text-muted-foreground">查看能力评测</p>
              </div>
            </CardContent>
          </Card>

          <Link to="/settings" className="block">
            <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-muted rounded-3xl bg-card">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors shadow-sm">
                      <div className="text-5xl">⚙️</div>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-foreground">教材设置</p>
                  <p className="text-sm text-muted-foreground">选择学习教材</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
