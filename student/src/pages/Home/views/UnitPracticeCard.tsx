import { useRequest } from "ahooks";
import { useNavigate } from "@tanstack/react-router";
import { PracticeApi } from "@/services/practice";
import { PracticeCard } from "../components/PracticeCard";

export const UnitPracticeCard = () => {
  const navigate = useNavigate();

  const { data: session } = useRequest(() => PracticeApi.getUnitPractice());

  const handleCreate = () => {
    navigate({ to: "/unit-practice" });
  };

  const handleStart = () => {
    if (session?.id) {
      navigate({ to: `/practice/${session.id}` });
    }
  };

  return (
    <PracticeCard
      title="单元练习"
      description="选择单元开始练习，巩固知识点！✨"
      createButtonText="选择单元"
      icon="📚"
      session={session}
      onCreate={handleCreate}
      onStart={handleStart}
    />
  );
};
