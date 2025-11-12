import { Card } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import type { AssessmentNextQuestion } from '@/services/practice';

interface AssessmentProgressProps {
  questionData: AssessmentNextQuestion;
}

export function AssessmentProgress({ questionData }: AssessmentProgressProps) {
  const { progress, current_ability, confidence } = questionData;
  const progressPercentage = (progress.current / progress.max) * 100;
  const abilityPercentage = ((current_ability + 3) / 6) * 100;
  const confidencePercentage = confidence * 100;

  return (
    <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            第 {progress.current} 题 ({progress.min}-{progress.max} 题)
          </span>
          <span className="text-gray-600">{progressPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">能力值</span>
              <span className="text-gray-600">{current_ability.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full"
                style={{ width: `${abilityPercentage}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">置信度</span>
              <span className="text-gray-600">{confidencePercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-purple-500 h-1.5 rounded-full"
                style={{ width: `${confidencePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

