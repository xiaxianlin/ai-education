import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LowerGradePanelProps {
  title: string;
  total: number;
  onBegin: () => void;
}

export function LowerGradeReadyPanel({ title, total, onBegin }: LowerGradePanelProps) {
  const navigate = useNavigate();
  const estimateMinutes = Math.max(5, Math.ceil(total * 0.5));

  return (
    <>
      <div className="bg-card rounded-3xl p-6 md:p-8 shadow-xl border-2 border-primary/20 flex flex-col items-center gap-4 text-center mt-1">
        <div className="text-6xl mb-2">🐻</div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title} 要开始啦！</h2>
        <p className="text-base text-muted-foreground">
          一共有 <span className="font-semibold text-primary">{total}</span> 道小题，大约{" "}
          <span className="font-semibold text-primary">{estimateMinutes}</span> 分钟就能做完。
        </p>
        <p className="text-sm text-muted-foreground">坐好身体，准备好小脑瓜，我们一起慢慢做，不着急～</p>

        <div className="flex flex-wrap justify-center gap-2 mt-1">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
            ✅ 做完会有小表扬
          </span>
          <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700">
            🐻 小熊老师陪你
          </span>
        </div>
      </div>

      <div className="mt-1 flex flex-col gap-3">
        <Button
          onClick={onBegin}
          size="lg"
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg font-semibold text-lg"
        >
          开始练习 🚀
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          className="w-full h-14 rounded-2xl bg-white/80 text-sm md:text-base"
        >
          我想再看看
        </Button>
      </div>
    </>
  );
}
