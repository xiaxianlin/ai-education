import { DIFFICULTY_LABELS } from '@ai-education/shared-web';
import { Card, Tag } from 'antd';

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const stemText = question.stem?.text || '';
  const answerText = question.answer?.correct_answers?.join(', ') || '-';

  return (
    <Card
      size="small"
      style={{ height: '100%' }}
      title={
        <div className="flex gap-2 flex-wrap">
          <Tag color="blue">{question.subject}</Tag>
          <Tag color="green">{question.grade}年级</Tag>
          <Tag color="orange">{DIFFICULTY_LABELS[question.difficulty as Difficulty]}</Tag>
        </div>
      }
    >
      <div className="space-y-3">
        {/* 题干 */}
        <div>
          <div className="text-sm font-medium text-gray-600 mb-1">题干</div>
          <div className="text-sm">{stemText || '-'}</div>
        </div>

        {/* 选项 */}
        {question.options && question.options.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">选项</div>
            <div className="space-y-1">
              {question.options.map((opt, idx) => (
                <div key={opt.id || idx} className="text-sm">
                  <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {opt.text}
                  {opt.is_correct && (
                    <Tag color="success" size="small" className="ml-2">
                      正确
                    </Tag>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 答案 */}
        <div>
          <div className="text-sm font-medium text-gray-600 mb-1">答案</div>
          <Tag color="blue">{answerText}</Tag>
        </div>

        {/* 知识点 */}
        {question.knowledge_points && question.knowledge_points.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">知识点</div>
            <div className="flex gap-1 flex-wrap">
              {question.knowledge_points.map((kp, idx) => (
                <Tag key={idx} size="small">
                  {kp}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

