import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UpperGradePanelProps {
  title: string;
  total: number;
  onBegin: () => void;
}

export function UpperGradeReadyPanel({ title, total, onBegin }: UpperGradePanelProps) {
  const navigate = useNavigate();
  const estimateMinutes = Math.max(5, Math.ceil(total * 0.5));

  return (
    <>
      <div className="bg-card rounded-3xl p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 flex flex-col md:flex-row items-center gap-8 md:gap-10 lg:gap-12 relative overflow-hidden">
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        {/* 左侧信息 */}
        <div className="flex-1 text-center md:text-left space-y-4 md:space-y-5 relative z-10">
          <div className="inline-flex items-center justify-center md:justify-start gap-2 px-4 py-1.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-xs md:text-sm font-medium text-sky-700 dark:text-sky-300 shadow-sm">
            <span className="text-base md:text-lg">🎯</span>
            <span>巩固练习</span>
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            {title} 即将开始
          </h2>

          <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed">
            本次练习共有 <span className="font-bold text-primary text-base md:text-lg lg:text-xl">{total}</span> 题，预计用时{" "}
            <span className="font-bold text-primary text-base md:text-lg lg:text-xl">{estimateMinutes}</span>{" "}
            分钟。建议一次做完，如果中途有事也可以下次继续。
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
            <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-4 py-1.5 text-xs md:text-sm font-medium text-emerald-700 dark:text-emerald-300 shadow-sm transition-all hover:scale-105">
              ✅ 做完可以查看知识点掌握情况
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-4 py-1.5 text-xs md:text-sm font-medium text-amber-700 dark:text-amber-300 shadow-sm transition-all hover:scale-105">
              ⭐ 错题会进入错题本
            </span>
          </div>
        </div>

        {/* 右侧插画区域 */}
        <div className="w-full md:w-56 lg:w-64 flex justify-center relative z-10">
          <div 
            className="relative w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-3xl bg-gradient-to-br from-sky-100 via-sky-50 to-amber-100 dark:from-sky-900/30 dark:via-sky-800/20 dark:to-amber-900/30 shadow-inner flex flex-col items-center justify-center border border-primary/10"
            style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
          >
            <div 
              className="text-5xl md:text-6xl lg:text-7xl mb-3"
              style={{ animation: 'gentle-bounce 2.5s ease-in-out infinite' }}
            >
              🧠
            </div>
            <p className="text-xs md:text-sm font-medium text-sky-800 dark:text-sky-200 px-2 text-center">
              动动大脑，检查看看学得怎么样
            </p>
          </div>
        </div>
      </div>

      {/* 按钮区域 */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Button
          onClick={onBegin}
          size="lg"
          className="flex-1 h-14 md:h-16 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-lg hover:shadow-xl font-semibold text-base md:text-lg transition-all duration-200 transform"
        >
          开始练习 🚀
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          className="sm:w-40 md:w-48 h-12 md:h-14 rounded-2xl bg-white/90 dark:bg-card/80 border-2 hover:bg-white dark:hover:bg-card text-sm md:text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95"
        >
          我想再看看
        </Button>
      </div>
    </>
  );
}
