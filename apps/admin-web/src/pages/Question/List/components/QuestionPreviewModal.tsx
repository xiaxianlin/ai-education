import { DIFFICULTY_LABELS, INTERACTION_TYPE_LABELS, isCompositeQuestion } from '@ai-education/shared-web';
import { Modal, Tag } from 'antd';
import React from 'react';

interface QuestionPreviewModalProps {
  question?: Question;
  open: boolean;
  onClose: () => void;
}

export const QuestionPreviewModal: React.FC<QuestionPreviewModalProps> = ({ question, open, onClose }) => {
  if (!question) return null;

  const isComposite = isCompositeQuestion(question);

  return (
    <Modal title="题目预览" open={open} onCancel={onClose} footer={null} width={800}>
      <div className="space-y-4">
        {/* 基本信息 */}
        <div className="flex gap-2 flex-wrap">
          <Tag color="blue">{question.subject}</Tag>
          <Tag color="green">{question.grade}年级</Tag>
          <Tag color="purple">
            {INTERACTION_TYPE_LABELS[question.question_type_code as keyof typeof INTERACTION_TYPE_LABELS] ||
              question.question_type_code}
          </Tag>
          <Tag color="orange">{DIFFICULTY_LABELS[question.difficulty as Difficulty]}</Tag>
          {isComposite && <Tag color="red">复合题</Tag>}
        </div>

        {/* 题干 */}
        <div className="bg-gray-50 p-4 rounded">
          <div className="font-medium mb-2">题干</div>
          <div
            dangerouslySetInnerHTML={{
              __html: question.stem.rich_text || question.stem.text,
            }}
          />
        </div>

        {/* 选项 */}
        {question.options && question.options.length > 0 && (
          <div>
            <div className="font-medium mb-2">选项</div>
            <div className="space-y-2">
              {question.options.map((opt, idx) => (
                <div
                  key={opt.id}
                  className={`p-2 rounded border ${opt.is_correct ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {opt.text}
                  {opt.is_correct && (
                    <Tag color="success" className="ml-2">
                      正确答案
                    </Tag>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 子题（复合题） */}
        {isComposite && question.stem.sub_questions && (
          <div>
            <div className="font-medium mb-2">子题</div>
            <div className="space-y-4">
              {question.stem.sub_questions.map((sub: Record<string, unknown>, idx: number) => (
                <div key={sub.id as string} className="border rounded p-3">
                  <div className="font-medium text-gray-600 mb-2">
                    第 {idx + 1} 小题
                    <Tag className="ml-2">
                      {INTERACTION_TYPE_LABELS[
                        sub.interaction_type as InteractionType as keyof typeof INTERACTION_TYPE_LABELS
                      ] || (sub.interaction_type as string)}
                    </Tag>
                  </div>
                  <div className="mb-2">{String((sub.stem as Record<string, unknown>)?.text || '')}</div>
                  {Array.isArray(sub.options) && (sub.options as Array<Record<string, unknown>>).length > 0 && (
                    <div className="pl-4">
                      {(sub.options as Array<Record<string, unknown>>).map(
                        (opt: Record<string, unknown>, optIdx: number) => (
                          <div key={optIdx} className="text-sm">
                            {String.fromCharCode(65 + optIdx)}.{' '}
                            {String((opt.text as string) || (opt.id as string) || '')}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 解析 */}
        {question.explanation && (
          <div className="bg-blue-50 p-4 rounded">
            <div className="font-medium mb-2">解析</div>
            <div>{question.explanation}</div>
          </div>
        )}
      </div>
    </Modal>
  );
};

