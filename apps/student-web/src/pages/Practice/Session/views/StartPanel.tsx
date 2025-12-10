/**
 * 开始练习面板
 * 直接从 store 读取数据并派发动作
 * 根据年级展示不同风格的开始界面，并展示当前步骤提示
 */
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSessionStore, useTotalQuestions } from "../stores/session-store";
import { useProfileStore } from "@/stores/profile-store";
import { PracticeSteps } from "../components/common/PracticeSteps";

const getPracticeTypeName = (sessionType?: PracticeType): string => {
  if (!sessionType) return "练习";
  switch (sessionType) {
    case "daily_practice":
      return "每日练习";
    case "unit_practice":
      return "单元练习";
    case "assessment":
      return "能力评测";
    default:
      return "练习";
  }
};

export const StartPanel = memo(() => {
  const navigate = useNavigate();
  const session = useSessionStore((state) => state.session);
  const beginPractice = useSessionStore((state) => state.beginPractice);
  const totalQuestions = useTotalQuestions();
  const student = useProfileStore((state) => state.student);

  const practiceType = getPracticeTypeName(session?.session_type);

  const grade = student?.grade as number | string | undefined;
  const isLowerGrade =
    typeof grade === "number"
      ? grade <= 2
      : typeof grade === "string"
      ? Number(grade) <= 2
      : true;

  const handleBack = () => {
    navigate(-1);
  };

  const handleBegin = async () => {
    try {
      await beginPractice();
      toast.success("练习已开始！");
    } catch (error) {
      console.error("Failed to begin practice:", error);
      const errorMessage =
        error instanceof Error ? error.message : "开始练习失败";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50">
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 flex flex-col gap-4">
        {/* 顶部：返回 + 步骤提示 */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={handleBack}
            className="h-11 rounded-full px-4 pl-3 flex items-center gap-1.5 bg-white/90 backdrop-blur shadow-sm text-xs md:text-sm text-muted-foreground hover:text-foreground shrink-0"
          >
            ←
            <span>返回</span>
          </Button>

          <PracticeSteps current={1} />
        </div>

        {/* 根据年级切换不同风格面板 */}
        {isLowerGrade ? (
          <LowerGradePanel
            practiceType={practiceType}
            totalQuestions={totalQuestions}
            onBegin={handleBegin}
          />
        ) : (
          <UpperGradePanel
            practiceType={practiceType}
            totalQuestions={totalQuestions}
            onBegin={handleBegin}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
});

StartPanel.displayName = "StartPanel";

interface BasePanelProps {
  practiceType: string;
  totalQuestions: number;
  onBegin: () => void;
}

const LowerGradePanel = ({
  practiceType,
  totalQuestions,
  onBegin,
}: BasePanelProps) => {
  const estimateMinutes = Math.max(5, Math.ceil(totalQuestions * 0.5));

  return (
    <>
      <div className="bg-card rounded-3xl p-6 md:p-8 shadow-xl border-2 border-primary/20 flex flex-col items-center gap-4 text-center mt-1">
        <div className="text-6xl mb-2">🐻</div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {practiceType} 要开始啦！
        </h2>
        <p className="text-base text-muted-foreground">
          一共有{" "}
          <span className="font-semibold text-primary">{totalQuestions}</span>{" "}
          道小题，大约{" "}
          <span className="font-semibold text-primary">{estimateMinutes}</span>{" "}
          分钟就能做完。
        </p>
        <p className="text-sm text-muted-foreground">
          坐好身体，准备好小脑瓜，我们一起慢慢做，不着急～
        </p>

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
      </div>
    </>
  );
};

interface UpperPanelProps extends BasePanelProps {
  onBack: () => void;
}

const UpperGradePanel = ({
  practiceType,
  totalQuestions,
  onBegin,
  onBack,
}: UpperPanelProps) => {
  const estimateMinutes = Math.max(5, Math.ceil(totalQuestions * 0.5));

  return (
    <>
      <div className="bg-card rounded-3xl p-5 md:p-8 shadow-xl border-2 border-primary/20 flex flex-col md:flex-row items-center gap-6 md:gap-8 mt-1">
        {/* 左侧信息 */}
        <div className="flex-1 text-center md:text-left space-y-3 md:space-y-4">
          <div className="inline-flex items-center justify-center md:justify-start gap-2 px-3 py-1 rounded-full bg-sky-100 text-xs md:text-sm text-sky-700">
            <span className="text-base md:text-lg">🎯</span>
            <span>巩固练习</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {practiceType} 即将开始
          </h2>

          <p className="text-sm md:text-base text-muted-foreground">
            本次练习共有{" "}
            <span className="font-semibold text-primary">
              {totalQuestions}
            </span>{" "}
            题，预计用时{" "}
            <span className="font-semibold text-primary">
              {estimateMinutes}
            </span>{" "}
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
            <p className="text-xs md:text-sm font-medium text-sky-800">
              动动大脑，检查看看学得怎么样
            </p>
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
          onClick={onBack}
          className="sm:w-40 h-14 rounded-2xl bg-white/80 text-sm md:text-base"
        >
          我想再看看
        </Button>
      </div>
    </>
  );
};

