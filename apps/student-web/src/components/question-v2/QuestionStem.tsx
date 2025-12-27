/**
 * 题干渲染组件
 */
import { cn } from '@/lib/utils';
import AudioPlayer from '@/components/biz/AudioPlayer';
import type { Stem, QuestionResource } from '@ai-education/shared-web';

interface QuestionStemProps {
  stem: Stem;
  resources?: QuestionResource[];
  className?: string;
}

export function QuestionStem({ stem, resources, className }: QuestionStemProps) {
  // 找到题干位置的资源
  const stemResources = resources?.filter((r) => r.position === 'stem') || [];

  return (
    <div className={cn('space-y-4', className)}>
      {/* 音频朗读 */}
      {stem.audioUrl && (
        <div className="flex items-center gap-2">
          <AudioPlayer src={stem.audioUrl} />
          <span className="text-sm text-muted-foreground">点击播放题目朗读</span>
        </div>
      )}

      {/* 题干文本 */}
      <div className="text-lg leading-relaxed">
        {stem.richText ? (
          <div
            dangerouslySetInnerHTML={{ __html: stem.richText }}
            className="prose prose-lg max-w-none"
          />
        ) : (
          <p className="whitespace-pre-wrap">{stem.text}</p>
        )}
      </div>

      {/* 高亮词汇 */}
      {stem.highlightWords && stem.highlightWords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stem.highlightWords.map((word, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium"
            >
              {word}
            </span>
          ))}
        </div>
      )}

      {/* 题干资源（图片、视频等） */}
      {stemResources.length > 0 && (
        <div className="flex flex-wrap gap-4 justify-center">
          {stemResources.map((resource) => (
            <div key={resource.id} className="rounded-xl overflow-hidden shadow-md">
              {resource.type === 'image' && (
                <img
                  src={resource.url}
                  alt={resource.alt || '题目图片'}
                  className="max-h-64 object-contain"
                  style={resource.size ? { width: resource.size.width, height: resource.size.height } : undefined}
                />
              )}
              {resource.type === 'audio' && (
                <AudioPlayer src={resource.url} />
              )}
              {resource.type === 'video' && (
                <video
                  src={resource.url}
                  controls
                  className="max-h-64"
                  style={resource.size ? { width: resource.size.width, height: resource.size.height } : undefined}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* 提示信息 */}
      {stem.hints && stem.hints.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-700 mb-2">💡 提示</p>
          <ul className="text-sm text-blue-600 space-y-1">
            {stem.hints.map((hint, idx) => (
              <li key={idx}>• {hint}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

