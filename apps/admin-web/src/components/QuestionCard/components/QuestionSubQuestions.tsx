import { AudioPlayer } from '@/components';
import { getResourceUrl, INTERACTION_TYPE_LABELS, QuestionResource } from '@ai-education/shared-web';
import { memo } from 'react';

interface QuestionSubQuestionsProps {
  subQuestions?: any[];
}

export const QuestionSubQuestions = memo(function QuestionSubQuestions({ subQuestions }: QuestionSubQuestionsProps) {
  if (!subQuestions || subQuestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-400">子题</div>
      <div className="space-y-2">
        {subQuestions.map((sub: any, idx) => {
          const subContent = typeof sub.stem === 'string' ? sub.stem : sub.stem?.rich_text || sub.stem?.text || '';
          const subResources = Array.isArray(sub.resources || sub.resource)
            ? ((sub.resources || (sub.resource ? [sub.resource] : [])) as QuestionResource[])
            : [];
          const subAnswer = sub.answer;
          const correctAnswers = Array.isArray(subAnswer?.correct_answers)
            ? (subAnswer.correct_answers as string[]).join(', ')
            : String(subAnswer?.correct_answers || '-');
          const subHasRichText = subResources.length > 0;

          return (
            <div key={sub.id || idx} className="rounded-lg p-2.5 bg-gray-50/30 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-500 border border-blue-100 rounded text-[10px] font-bold">
                  第{sub.order ?? idx + 1}题
                </span>
                {sub.interaction_type && (
                  <span className="text-[10px] px-2 py-0.5 rounded border bg-gray-50 text-gray-500 border-gray-100">
                    {INTERACTION_TYPE_LABELS[sub.interaction_type as keyof typeof INTERACTION_TYPE_LABELS] ||
                      sub.interaction_type}
                  </span>
                )}
              </div>

              {/* 子题题干 */}
              <div className="mb-2">
                {subHasRichText ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: subContent }}
                    className="prose prose-xs max-w-none text-gray-700"
                  />
                ) : (
                  <div className="text-sm leading-relaxed text-gray-700">{subContent || '-'}</div>
                )}
              </div>

              {/* 子题资源 */}
              {subResources.length > 0 && (
                <div className="mb-2 space-y-2">
                  {subResources.map((res) => {
                    if (res.type === 'image') {
                      return (
                        <div key={res.id} className="flex justify-start">
                          <img
                            src={getResourceUrl(res.url) || ''}
                            alt={(res.alt as string) || '子题图片'}
                            className="max-w-full h-auto max-h-[100px] object-contain rounded-lg border border-gray-100"
                          />
                        </div>
                      );
                    }
                    if (res.type === 'audio') {
                      return (
                        <div key={res.id} className="text-xs">
                          <AudioPlayer src={getResourceUrl(res.url) ?? ''} resourceContent={res.transcript as string} />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}

              {/* 子题选项 */}
              {sub.options && sub.options.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mt-2 mb-2">
                  {sub.options.map((opt: any, optIdx: number) => (
                    <div
                      key={optIdx}
                      className="px-2 py-1 bg-white rounded border border-gray-100 text-xs text-gray-600"
                    >
                      <span className="font-bold mr-1">{String.fromCharCode(65 + optIdx)}.</span>
                      <span>{String((opt.text as string) || (opt.id as string) || '')}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 子题答案 */}
              <div className="mt-2 mb-2">
                <div className="text-xs font-medium text-gray-400 mb-1">答案</div>
                <div className="rounded px-2 py-1 bg-green-50/50 border border-green-100 text-xs text-green-700 font-medium">
                  {correctAnswers}
                </div>
              </div>

              {/* 子题解析 */}
              {sub.explanation && (
                <div className="mt-2">
                  <div className="text-xs font-medium text-gray-400 mb-1">解析</div>
                  <div className="rounded px-2 py-1 bg-amber-50/30 border border-amber-100 text-xs text-amber-700 leading-relaxed">
                    {sub.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
