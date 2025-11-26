import { useRequest } from "ahooks";
import { useNavigate } from "@tanstack/react-router";
import { PracticeApi } from "@/services/practice";
import { PracticeCard } from "../components/PracticeCard";

export const DailyPracticeCard = () => {
  const navigate = useNavigate();

  const { data: session } = useRequest(() => PracticeApi.getDailyPractice());

  const { loading: creating, run: handleCreate } = useRequest(
    () => PracticeApi.createDailyPractice(),
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
      icon="�"
      session={session}
      creating={creating}
      onCreate={handleCreate}
      onStart={handleStart}
    />
  );
};
