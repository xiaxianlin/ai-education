import { AudioPlayer } from '@/components';
import { getResourceUrl, QuestionResource } from '@ai-education/shared-web';
import { Typography } from 'antd';
import { memo } from 'react';

const { Text } = Typography;

interface QuestionOptionsProps {
  options: Question['options'];
  getOptionResources: (optionId: string) => QuestionResource[];
}

export const QuestionOptions = memo(function QuestionOptions({ options, getOptionResources }: QuestionOptionsProps) {
  if (!options?.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-400">选项</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {options.map((opt, idx) => {
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
  );
});
