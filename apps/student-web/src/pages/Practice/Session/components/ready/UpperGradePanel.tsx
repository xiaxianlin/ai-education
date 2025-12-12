import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UpperGradePanelProps {
  title: string;
  total: number;
  onBegin: () => void;
}

export function UpperGradePanel({ title, total, onBegin }: UpperGradePanelProps) {
  const navigate = useNavigate();
  const estimateMinutes = Math.max(5, Math.ceil(total * 0.5));

  return (
    <>
      <div className="bg-card rounded-3xl p-5 md:p-8 shadow-xl border-2 border-primary/20 flex flex-col md:flex-row items-center gap-6 md:gap-8 mt-1">
        {/* 左侧信息 */}
        <div className="flex-1 text-center md:text-left space-y-3 md:space-y-4">
          <div className="inline-flex items-center justify-center md:justify-start gap-2 px-3 py-1 rounded-full bg-sky-100 text-xs md:text-sm text-sky-700">
            <span className="text-base md:text-lg">🎯</span>
            <span>巩固练习</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title} 即将开始</h2>

          <p className="text-sm md:text-base text-muted-foreground">
            本次练习共有 <span className="font-semibold text-primary">{total}</span> 题，预计用时{" "}
            <span className="font-semibold text-primary">{estimateMinutes}</span>{" "}
            分钟。建议一次做完，如果中途有事也可以下次继续。
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs md:text-sm text-emerald-700">
              ✅ 做完可以查看知识点掌握情况
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs md:text-sm text-amber-700">
              ⭐ 错题会进入错题本
            </span>
          </div>
        </div>

        {/* 右侧插画区域 */}
        <div className="w-full md:w-56 lg:w-64 flex justify-center">
          <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-3xl bg-gradient-to-br from-sky-100 to-amber-100 shadow-inner flex flex-col items-center justify-center">
            <div className="text-5xl md:text-6xl mb-2">🧠</div>
            <p className="text-xs md:text-sm font-medium text-sky-800">动动大脑，检查看看学得怎么样</p>
          </div>
        </div>
      </div>

      <div className="mt-1 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          onClick={onBegin}
          size="lg"
          className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg font-semibold text-lg"
        >
          开始练习 🚀
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          className="sm:w-40 h-14 rounded-2xl bg-white/80 text-sm md:text-base"
        >
          我想再看看
        </Button>
      </div>
    </>
  );
}
