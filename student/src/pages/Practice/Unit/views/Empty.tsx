import { Card, CardContent } from "@/components/ui/card";
export const Empty = () => {
  return (
    <Card className="border-2 border-accent/50 bg-accent/10 shadow-lg rounded-3xl">
      <CardContent className="py-10 px-6 text-center space-y-3">
        <div className="text-5xl">📖</div>
        <p className="text-xl font-bold text-foreground">还没有选教材呢</p>
        <p className="text-sm text-muted-foreground">
          去设置里选择你的学习教材，系统就能为你生成单元练习啦～
        </p>
      </CardContent>
    </Card>
  );
};
