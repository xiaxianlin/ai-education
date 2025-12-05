import { Card, CardContent } from "@/components/ui/card";
export const Header = () => {
  return (
    <Card className="border-2 border-primary/20 shadow-lg rounded-3xl bg-card overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <div className="text-4xl">📚</div>单元练习
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            选择你想要练习的单元，AI 将根据该单元内容为你生成专属练习题。
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
