import { AudioPlayer } from '@/components';
import { getResourceUrl, QuestionResource } from '@ai-education/shared-web';
import { memo } from 'react';

interface QuestionStemProps {
  stem: Question['stem'];
  stemImageResources: QuestionResource[];
  stemAudioResources: QuestionResource[];
  resources?: Question['resources'];
}

export const QuestionStem = memo(function QuestionStem({
  stem,
  stemImageResources,
  stemAudioResources,
  resources,
}: QuestionStemProps) {
  const stemContent = stem?.rich_text || stem?.text || '';
  const hasRichText = !!stem?.rich_text;

  return (
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
      {stem?.audio_url && (
        <div className="mt-2">
          <AudioPlayer src={getResourceUrl(stem.audio_url) ?? ''} />
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
      {resources
        ?.filter((r) => (r.resource_type || r.position) === 'stem' && (r.type === 'video' || r.type === 'animation'))
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
  );
});
