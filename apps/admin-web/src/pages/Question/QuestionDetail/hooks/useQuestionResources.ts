import { useMemo } from 'react';

/**
 * 题目资源处理 Hook
 * 从 content 字段中提取资源，支持新结构和向后兼容
 */
export function useQuestionResources(question: Question | undefined) {
  return useMemo(() => {
    if (!question) {
      return {
        stemResources: [],
        stemImageResources: [],
        stemAudioResources: [],
        getOptionResources: () => [] as QuestionResource[],
      };
    }

    const content = question.content || {};
    const stemResource = content.resource;
    const options = content.options || [];

    // 题干资源（单个）
    const stemResources: QuestionResource[] = stemResource ? [stemResource] : [];
    const stemImageResources = stemResources.filter((r) => r.type === 'image');
    const stemAudioResources = stemResources.filter((r) => r.type === 'audio');

    // 为每个选项匹配资源（从选项的 resource 字段获取）
    // 为每个选项匹配资源
    const getOptionResources = (optionId: string) => {
      const option = options.find((opt) => opt.id === optionId);
      const resources: QuestionResource[] = [];
      if (option?.image_url) {
        resources.push({
          id: `${optionId}_img`,
          type: 'image',
          url: option.image_url,
          position: 'option',
        });
      }
      if (option?.audio_url) {
        resources.push({
          id: `${optionId}_aud`,
          type: 'audio',
          url: option.audio_url,
          position: 'option',
        });
      }
      return resources;
    };

    return {
      stemResources,
      stemImageResources,
      stemAudioResources,
      getOptionResources,
    };
  }, [question]);
}
