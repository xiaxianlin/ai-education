import { useRequest } from "ahooks";
import { useNavigate } from "react-router-dom";
import { practiceService } from "@/services/practice";
import { PracticeCard } from "@/components/business/PracticeCard";

export const AssessmentCard = () => {
  const navigate = useNavigate();

  const { data: session } = useRequest(() => practiceService.getAssessment());

  const { loading: creating, run: handleCreate } = useRequest(
    () => practiceService.createPractice("assessment"),
    { manual: true }
  );

  const handleStart = () => {
    if (session?.id) {
      navigate(`/practice/${session.id}`);
    }
  };

  return (
    <PracticeCard
      title="能力评测"
      description="让AI帮你找到学习的方向！✨"
      createButtonText="创建评测"
      icon="🎯"
      session={session}
      creating={creating}
      onCreate={handleCreate}
      onStart={handleStart}
    />
  );
};
