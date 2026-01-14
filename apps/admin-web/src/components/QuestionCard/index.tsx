import { Card } from 'antd';
import { memo } from 'react';
import { useQuestionResources } from '../../pages/Question/QuestionDetail/hooks/useQuestionResources';
import { QuestionAnswer, QuestionExplanation, QuestionOptions, QuestionStem, QuestionSubQuestions } from './components';

interface QuestionCardProps {
  question: Question;
}

export const QuestionCard = memo(function QuestionCard({ question }: QuestionCardProps) {
  const { stemImageResources, stemAudioResources, getOptionResources } = useQuestionResources(question);

  // 从 content 字段获取数据
  const content = question.content || {};
  const subQuestions = content.sub_questions || [];
  const isComposite = subQuestions.length > 0;

  // 构建标签（使用 Tailwind 类名的 Badge 样式）
  const titleTags = (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] px-2 py-0.5 rounded border bg-blue-50 text-blue-500 border-blue-100">
        {question.subject}
      </span>
      <span className="text-[10px] px-2 py-0.5 rounded border bg-green-50 text-green-500 border-green-100">
        {question.grade}年级
      </span>
      <span className="text-[10px] px-2 py-0.5 rounded border bg-purple-50 text-purple-500 border-purple-100">
        {question.question_type_code}
      </span>
      {question.ability_code && (
        <span className="text-[10px] px-2 py-0.5 rounded border bg-cyan-50 text-cyan-500 border-cyan-100">
          {question.ability_code}
        </span>
      )}
      {isComposite && (
        <span className="text-[10px] px-2 py-0.5 rounded border bg-red-50 text-red-500 border-red-100">复合题</span>
      )}
      {/* TODO: difficulty 字段已删除 */}
    </div>
  );

  return (
    <Card size="small" title={titleTags} className="rounded-xl border-gray-100" bordered={true}>
      <div className="flex flex-col gap-3">
        <QuestionStem
          stem={content.stem}
          stemImageResources={stemImageResources}
          stemAudioResources={stemAudioResources}
          resources={undefined}
        />

        <QuestionOptions options={content.options} getOptionResources={getOptionResources} />

        {!isComposite && <QuestionAnswer answer={question.answer} />}

        {isComposite && subQuestions.length > 0 && <QuestionSubQuestions subQuestions={subQuestions} />}

        {/* TODO: knowledge_points 字段已删除 */}
        {/* <QuestionKnowledgePoints knowledgePoints={question.knowledge_points} /> */}

        <QuestionExplanation explanation={question.explanation} />
      </div>
    </Card>
  );
});
