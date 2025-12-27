import { Button } from "@/components/ui";

interface LowerGradePanelProps {
  title: string;
  total: number;
  onBegin: () => void;
}

export function LowerGradeReadyPanel({ title, total, onBegin }: LowerGradePanelProps) {
  const estimateMinutes = Math.max(5, Math.ceil(total * 0.5));

  return (
    <>
      <div className="bg-card rounded-3xl p-8 md:p-10 lg:p-12 shadow-2xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 flex flex-col items-center gap-6 text-center relative overflow-hidden">
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          {/* 小熊图标 - 添加浮动动画 */}
          <div
            className="text-6xl md:text-7xl mb-4 inline-block"
            style={{ animation: "float 3s ease-in-out infinite" }}
          >
            🐻
          </div>

          {/* 标题 */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
            {title} 要开始啦！
          </h2>

          {/* 题目信息 */}
          <p className="text-base md:text-lg text-muted-foreground mb-2 leading-relaxed">
            一共有 <span className="font-bold text-primary text-lg md:text-xl">{total}</span> 道小题，大约{" "}
            <span className="font-bold text-primary text-lg md:text-xl">{estimateMinutes}</span> 分钟就能做完。
          </p>

          {/* 鼓励文字 */}
          <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed">
            坐好身体，准备好小脑瓜，我们一起慢慢做，不着急～
          </p>

          {/* 标签区域 */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-xs md:text-sm font-medium text-emerald-700 shadow-sm transition-all hover:scale-105">
              ✅ 做完会有小表扬
            </span>
            <span className="inline-flex items-center rounded-full bg-sky-100 px-4 py-1.5 text-xs md:text-sm font-medium text-sky-700 shadow-sm transition-all hover:scale-105">
              🐻 小熊老师陪你
            </span>
          </div>
        </div>
      </div>

      {/* 按钮区域 */}
      <div className="flex flex-col gap-4 w-full">
        <Button
          onClick={onBegin}
          size="lg"
          className="w-full h-14 md:h-16 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-lg hover:shadow-xl font-semibold text-base md:text-lg transition-all duration-200 transform"
        >
          开始练习 🚀
        </Button>
      </div>
    </>
  );
}
