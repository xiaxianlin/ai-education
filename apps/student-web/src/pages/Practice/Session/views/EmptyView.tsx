/**
 * 异常视图 - 会话不存在或数据异常
 */
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function EmptyView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 flex items-center justify-center p-4">
      <Card className="border-2 border-destructive/20 shadow-xl bg-card rounded-3xl max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          {/* 错误图标 */}
          <div className="flex items-center justify-center">
            <div className="p-4 rounded-full bg-destructive/10">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>

          {/* 错误信息 */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">当前练习失踪了～</h2>
            <p className="text-sm text-muted-foreground">请稍后重试</p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)} className="flex-1 h-11 rounded-xl">
              返回
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
