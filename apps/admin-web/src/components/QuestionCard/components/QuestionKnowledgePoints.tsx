import { memo } from 'react';

interface QuestionKnowledgePointsProps {
  knowledgePoints: Question['knowledge_points'];
}

export const QuestionKnowledgePoints = memo(function QuestionKnowledgePoints({
  knowledgePoints,
}: QuestionKnowledgePointsProps) {
  if (!knowledgePoints?.length) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-gray-400">知识点</div>
      <div className="flex flex-wrap gap-1.5">
        {knowledgePoints.map((kp, idx) => (
          <span
            key={idx}
            className="text-[10px] px-2 py-0.5 rounded border bg-blue-50/50 text-blue-500 border-blue-100"
          >
            {kp}
          </span>
        ))}
      </div>
    </div>
  );
});
