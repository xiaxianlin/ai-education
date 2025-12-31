import { useMemo } from 'react';

/**
 * 题目资源处理 Hook
 * 分离题干资源和选项资源，并提供向后兼容处理
 */
export function useQuestionResources(question: Question | undefined) {
  return useMemo(() => {
    if (!question?.resources) {
      return {
        stemResources: [],
        stemImageResources: [],
        stemAudioResources: [],
        getOptionResources: () => [] as QuestionResource[],
      };
    }

    // 分离题干资源和选项资源（向后兼容：优先使用 resource_type，降级到 position）
    const stemResources =
      question.resources.filter(
        (r) =>
          (r.resource_type || r.position) === 'stem' ||
          (r.resource_type || r.position) === 'background',
      ) || [];

    const stemImageResources = stemResources.filter((r) => r.type === 'image');
    const stemAudioResources = stemResources.filter((r) => r.type === 'audio');

    // 为每个选项匹配资源
    const getOptionResources = (optionId: string) => {
      return (
        question.resources?.filter(
          (r) =>
            (r.resource_type === 'option' || r.position === 'option') &&
            (r.option_id === optionId || (!r.option_id && !r.resource_type)), // 向后兼容：旧数据可能只有 position，没有 resource_type 和 option_id
        ) || []
      );
    };

    return {
      stemResources,
      stemImageResources,
      stemAudioResources,
      getOptionResources,
    };
  }, [question]);
}

