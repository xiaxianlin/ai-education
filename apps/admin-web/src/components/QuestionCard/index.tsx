import { AudioPlayer } from '@/components';
import {
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  getResourceUrl,
  INTERACTION_TYPE_LABELS,
} from '@ai-education/shared-web';
import { Card, Tag, Typography } from 'antd';
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
    green: 'bg-green-100 text-green-700 border-green-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200',
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
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs px-2.5 py-1 rounded-full border bg-blue-100 text-blue-700 border-blue-200">
        {question.subject}
      </span>
      <span className="text-xs px-2.5 py-1 rounded-full border bg-green-100 text-green-700 border-green-200">
        {question.grade}年级
      </span>
      <span className="text-xs px-2.5 py-1 rounded-full border bg-purple-100 text-purple-700 border-purple-200">
        {INTERACTION_TYPE_LABELS[question.question_type_code as keyof typeof INTERACTION_TYPE_LABELS] ||
          question.question_type_code}
      </span>
      <span className={`text-xs px-2.5 py-1 rounded-full border ${getDifficultyBadgeClasses(question.difficulty)}`}>
        {DIFFICULTY_LABELS[question.difficulty as Difficulty]}
      </span>
      {isComposite && (
        <span className="text-xs px-2.5 py-1 rounded-full border bg-red-100 text-red-700 border-red-200">复合题</span>
      )}
    </div>
  );

  return (
    <Card title={titleTags} className="rounded-2xl shadow-sm hover:shadow-md transition-shadow" bordered={false}>
      <div className="flex flex-col gap-4">
        {/* 题干区域 */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-600 mb-2">题干</div>
          <div className="text-lg leading-relaxed text-gray-900 font-medium">
            {hasRichText ? (
              <div dangerouslySetInnerHTML={{ __html: stemContent }} className="prose prose-lg max-w-none" />
            ) : (
              <div className="whitespace-pre-wrap">{stemContent || '-'}</div>
            )}
          </div>

          {/* 题干音频（向后兼容） */}
          {question.stem?.audio_url && (
            <div className="mt-3">
              <AudioPlayer src={getResourceUrl(question.stem.audio_url) ?? ''} />
            </div>
          )}

          {/* 题干资源 - 图片 */}
          {stemImageResources.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {stemImageResources.map((res, index) => (
                <div key={res.id || index} className="flex justify-start">
                  <img
                    src={getResourceUrl(res.url) || ''}
                    alt={res.alt || '题目图片'}
                    className="max-w-full h-auto max-h-[150px] object-contain rounded-xl shadow-lg border-2 border-gray-200"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 题干资源 - 音频 */}
          {stemAudioResources.map((res, index) => (
            <div key={res.id || index} className="mt-3">
              <AudioPlayer src={getResourceUrl(res.url) ?? ''} resourceContent={res.transcript} />
            </div>
          ))}

          {/* 题干资源 - 视频 */}
          {question.resources
            ?.filter(
              (r) => (r.resource_type || r.position) === 'stem' && (r.type === 'video' || r.type === 'animation'),
            )
            .map((res, index) => (
              <div key={res.id || index} className="mt-3">
                <video
                  src={getResourceUrl(res.url) || ''}
                  controls
                  className="max-w-full h-auto max-h-[200px] object-contain rounded-xl shadow-lg border-2 border-gray-200"
                >
                  您的浏览器不支持视频播放。
                </video>
              </div>
            ))}
        </div>

        {/* 选项区域 */}
        {!!question.options?.length && (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-600 mb-2">选项</div>
            <div className="flex flex-wrap gap-3">
              {question.options.map((opt, idx) => {
                const optionLabel = String.fromCharCode(65 + idx);
                const optionResources = getOptionResources(opt.id);
                const optionImageResources = optionResources.filter((r) => r.type === 'image');
                const optionAudioResources = optionResources.filter((r) => r.type === 'audio');

                return (
                  <div
                    key={opt.id || idx}
                    className="flex-1  p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-500 text-white rounded-lg font-semibold text-sm min-w-[32px] text-center">
                          {optionLabel}
                        </span>
                      </div>
                      <Text className="text-base leading-relaxed word-break break-word">{opt.text || '-'}</Text>

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
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-600 mb-2">答案</div>
          <div className="rounded-xl p-4 bg-green-50 border-2 border-green-300 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">✓</span>
              <span className="text-sm font-semibold text-green-700">正确答案</span>
            </div>
            <div className="text-base text-green-800 leading-relaxed">
              {question.answer?.correct_answers?.join(', ') || '-'}
            </div>
          </div>
        </div>

        {/* 知识点区域 */}
        {!!question.knowledge_points?.length && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-600 mb-2">知识点</div>
            <div className="rounded-xl p-4 bg-blue-50 border-2 border-blue-200 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {question.knowledge_points.map((kp, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-full border bg-purple-100 text-purple-700 border-purple-200"
                  >
                    {kp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 解析区域 */}
        {question.explanation && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-600 mb-2">解析</div>
            <div className="rounded-xl p-4 bg-amber-50 border-2 border-amber-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💡</span>
                <span className="text-sm font-semibold text-amber-700">题目解析</span>
              </div>
              <div className="text-sm text-gray-900 leading-relaxed">{question.explanation}</div>
            </div>
          </div>
        )}

        {/* 子题区域（复合题） */}
        {isComposite && question.stem?.sub_questions && (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-600 mb-2">子题</div>
            <div className="space-y-3">
              {question.stem.sub_questions.map((sub: Record<string, unknown>, idx: number) => {
                const subStem = sub.stem as Record<string, unknown> | undefined;
                const subHasRichText = !!subStem?.rich_text;
                const subContent = subStem?.rich_text || subStem?.text || '';

                return (
                  <div
                    key={(sub.id as string) || idx}
                    className="rounded-xl p-4 bg-gray-50 border-2 border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-500 text-white rounded-lg font-semibold text-sm">
                        第{idx + 1}题
                      </span>
                      {!!sub.interaction_type && (
                        <Tag className="m-0">
                          {INTERACTION_TYPE_LABELS[
                            sub.interaction_type as InteractionType as keyof typeof INTERACTION_TYPE_LABELS
                          ] || (sub.interaction_type as string)}
                        </Tag>
                      )}
                    </div>
                    <div className="mb-3">
                      {subHasRichText ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: String(subContent),
                          }}
                          className="prose prose-sm max-w-none"
                        />
                      ) : (
                        <div className="text-base leading-relaxed">{String(subContent)}</div>
                      )}
                    </div>
                    {Array.isArray(sub.options) && (sub.options as Array<Record<string, unknown>>).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(sub.options as Array<Record<string, unknown>>).map(
                          (opt: Record<string, unknown>, optIdx: number) => (
                            <div
                              key={optIdx}
                              className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-sm"
                            >
                              <span className="font-semibold mr-1">{String.fromCharCode(65 + optIdx)}.</span>
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
