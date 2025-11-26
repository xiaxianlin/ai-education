import { useRequest } from "ahooks";
import { useNavigate } from "@tanstack/react-router";
import { practiceService } from "@/services/practice";
import { PracticeCard } from "@/components/business/PracticeCard";

export const DailyPracticeCard = () => {
  const navigate = useNavigate();

  const { data: session } = useRequest(() => practiceService.getDailyPractice());

  const { loading: creating, run: handleCreate } = useRequest(
    () => practiceService.createPractice("daily_practice"),
    { manual: true }
  );

  const handleStart = () => {
    if (session?.id) {
      navigate({ to: `/practice/${session.id}` });
    }
  };

  return (
    <PracticeCard
      title="每日练习"
      description="今天还没有生成练习，快来开始吧！✨"
      createButtonText="生成练习"
      icon="📝"
      session={session}
      creating={creating}
      onCreate={handleCreate}
      onStart={handleStart}
    />
  );
};
