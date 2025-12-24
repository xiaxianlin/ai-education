import { Card, CardContent } from "@/components/ui";

export const RecordEmpty = ({ title }: { title?: string }) => {
  return (
    <Card className="border-2 border-accent/50 bg-accent/10">
      <CardContent className="py-10 px-6 text-center space-y-3">
        <div className="text-5xl">📝</div>
        <p className="text-xl font-bold text-foreground">暂无记录</p>
        <p className="text-sm text-muted-foreground">还没有{title}记录</p>
      </CardContent>
    </Card>
  );
};
