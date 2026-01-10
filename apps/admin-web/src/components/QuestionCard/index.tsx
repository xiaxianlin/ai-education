import { AudioPlayer } from '@/components';
import {
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  getResourceUrl,
  INTERACTION_TYPE_LABELS,
} from '@ai-education/shared-web';
import { Card, Typography } from 'antd';
import { memo } from 'react';
import { useQuestionResources } from '../../pages/Question/QuestionDetail/hooks/useQuestionResources';

const { Text } = Typography;

interface QuestionCardProps {
  question: Question;
}

/**
 * 获取难度对应的 Tailwind 背景色类名
 */
function getDifficultyBadgeClasses(difficulty: string): string {
  const color = DIFFICULTY_COLORS[difficulty as Difficulty] || 'default';
  const colorMap: Record<string, string> = {
    green: 'bg-green-50 text-green-600 border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    default: 'bg-gray-50 text-gray-600 border-gray-100',
  };
  return colorMap[color] || colorMap.default;
}

export const QuestionCard = memo(function QuestionCard({ question }: QuestionCardProps) {
  const { stemImageResources, stemAudioResources, getOptionResources } = useQuestionResources(question);
  const isComposite =
    (question.stem?.sub_questions?.length || 0) > 0 || (question.stem as any)?.subQuestions?.length > 0;

  // 获取题干内容（优先使用 rich_text）
  const stemContent = question.stem?.rich_text || question.stem?.text || '';
  const hasRichText = !!question.stem?.rich_text;

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
        {INTERACTION_TYPE_LABELS[question.question_type_code as keyof typeof INTERACTION_TYPE_LABELS] ||
          question.question_type_code}
      </span>
      <span className={`text-[10px] px-2 py-0.5 rounded border ${getDifficultyBadgeClasses(question.difficulty)}`}>
        {DIFFICULTY_LABELS[question.difficulty as Difficulty]}
      </span>
      {isComposite && (
        <span className="text-[10px] px-2 py-0.5 rounded border bg-red-50 text-red-500 border-red-100">复合题</span>
      )}
    </div>
  );

  return (
    <Card size="small" title={titleTags} className="rounded-xl border-gray-100" bordered={true}>
      <div className="flex flex-col gap-3">
        {/* 题干区域 */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-400">题干</div>
          <div className="text-base leading-relaxed text-gray-800">
            {hasRichText ? (
              <div dangerouslySetInnerHTML={{ __html: stemContent }} className="prose prose-sm max-w-none" />
            ) : (
              <div className="whitespace-pre-wrap">{stemContent || '-'}</div>
            )}
          </div>

          {/* 题干音频（向后兼容） */}
          {question.stem?.audio_url && (
            <div className="mt-2">
              <AudioPlayer src={getResourceUrl(question.stem.audio_url) ?? ''} />
            </div>
          )}

          {/* 题干资源 - 图片 */}
          {stemImageResources.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {stemImageResources.map((res, index) => (
                <div key={res.id || index} className="flex justify-start">
                  <img
                    src={getResourceUrl(res.url) || ''}
                    alt={res.alt || '题目图片'}
                    className="max-w-full h-auto max-h-[120px] object-contain rounded-lg border border-gray-100"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 题干资源 - 音频 */}
          {stemAudioResources.map((res, index) => (
            <div key={res.id || index} className="mt-2 text-xs">
              <AudioPlayer src={getResourceUrl(res.url) ?? ''} resourceContent={res.transcript} />
            </div>
          ))}

          {/* 题干资源 - 视频 */}
          {question.resources
            ?.filter(
              (r) => (r.resource_type || r.position) === 'stem' && (r.type === 'video' || r.type === 'animation'),
            )
            .map((res, index) => (
              <div key={res.id || index} className="mt-2">
                <video
                  src={getResourceUrl(res.url) || ''}
                  controls
                  className="max-w-full h-auto max-h-[180px] object-contain rounded-lg border border-gray-100"
                >
                  您的浏览器不支持视频播放。
                </video>
              </div>
            ))}
        </div>

        {/* 选项区域 */}
        {!!question.options?.length && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-400">选项</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {question.options.map((opt, idx) => {
                const optionLabel = String.fromCharCode(65 + idx);
                const optionResources = getOptionResources(opt.id);
                const optionImageResources = optionResources.filter((r) => r.type === 'image');
                const optionAudioResources = optionResources.filter((r) => r.type === 'audio');

                return (
                  <div key={opt.id || idx} className="p-2.5 bg-gray-50/50 rounded-lg border border-gray-100">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 w-5 h-5 flex items-center justify-center bg-blue-50 text-blue-500 rounded text-xs font-bold">
                          {optionLabel}
                        </span>
                        <Text className="text-sm leading-relaxed text-gray-700">{opt.text || '-'}</Text>
                      </div>

                      {/* 选项资源 - 图片（新结构） */}
                      {optionImageResources.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {optionImageResources.map((res) => (
                            <img
                              key={res.id}
                              src={getResourceUrl(res.url) || ''}
                              alt={res.alt || '选项图片'}
                              className="max-w-full h-auto max-h-[100px] object-contain rounded-lg shadow-sm border border-gray-200"
                            />
                          ))}
                        </div>
                      )}

                      {/* 选项资源 - 音频（新结构） */}
                      {optionAudioResources.map((res) => (
                        <div key={res.id} className="mt-2">
                          <AudioPlayer src={getResourceUrl(res.url) ?? ''} resourceContent={res.transcript} />
                        </div>
                      ))}

                      {/* 选项资源 - 向后兼容（旧字段） */}
                      {opt.image_url && (
                        <div className="mt-2">
                          <img
                            src={getResourceUrl(opt.image_url) || ''}
                            alt="选项图片"
                            className="max-w-full h-auto max-h-[100px] object-contain rounded-lg shadow-sm border border-gray-200"
                          />
                        </div>
                      )}
                      {opt.audio_url && (
                        <div className="mt-2">
                          <AudioPlayer src={getResourceUrl(opt.audio_url) ?? ''} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 答案区域 */}
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-gray-400">答案</div>
          <div className="rounded-lg p-2.5 bg-green-50/30 border border-green-100">
            <div className="flex items-center gap-1.5 mb-1 text-green-600">
              <span className="text-sm font-medium">正确答案</span>
            </div>
            <div className="text-sm text-green-700 font-medium">
              {question.answer?.correct_answers?.join(', ') || '-'}
            </div>
          </div>
        </div>

        {/* 知识点区域 */}
        {!!question.knowledge_points?.length && (
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-gray-400">知识点</div>
            <div className="flex flex-wrap gap-1.5">
              {question.knowledge_points.map((kp, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded border bg-blue-50/50 text-blue-500 border-blue-100"
                >
                  {kp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 解析区域 */}
        {question.explanation && (
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-gray-400">解析</div>
            <div className="rounded-lg p-2.5 bg-amber-50/30 border border-amber-100">
              <div className="text-xs text-amber-700 leading-relaxed">{question.explanation}</div>
            </div>
          </div>
        )}

        {/* 子题区域（复合题） */}
        {isComposite && question.stem?.sub_questions && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-400">子题</div>
            <div className="space-y-2">
              {question.stem.sub_questions.map((sub: Record<string, unknown>, idx: number) => {
                const subStem = sub.stem as Record<string, unknown> | undefined;
                const subHasRichText = !!subStem?.rich_text;
                const subContent = subStem?.rich_text || subStem?.text || '';

                return (
                  <div
                    key={(sub.id as string) || idx}
                    className="rounded-lg p-2.5 bg-gray-50/30 border border-gray-100"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-500 border border-blue-100 rounded text-[10px] font-bold">
                        第{idx + 1}题
                      </span>
                      {!!sub.interaction_type && (
                        <span className="text-[10px] px-2 py-0.5 rounded border bg-gray-50 text-gray-500 border-gray-100">
                          {INTERACTION_TYPE_LABELS[
                            sub.interaction_type as InteractionType as keyof typeof INTERACTION_TYPE_LABELS
                          ] || (sub.interaction_type as string)}
                        </span>
                      )}
                    </div>
                    <div className="mb-2">
                      {subHasRichText ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: String(subContent),
                          }}
                          className="prose prose-xs max-w-none text-gray-700"
                        />
                      ) : (
                        <div className="text-sm leading-relaxed text-gray-700">{String(subContent)}</div>
                      )}
                    </div>
                    {Array.isArray(sub.options) && (sub.options as Array<Record<string, unknown>>).length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mt-2">
                        {(sub.options as Array<Record<string, unknown>>).map(
                          (opt: Record<string, unknown>, optIdx: number) => (
                            <div
                              key={optIdx}
                              className="px-2 py-1 bg-white rounded border border-gray-100 text-xs text-gray-600"
                            >
                              <span className="font-bold mr-1">{String.fromCharCode(65 + optIdx)}.</span>
                              <span>{String((opt.text as string) || (opt.id as string) || '')}</span>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
});
