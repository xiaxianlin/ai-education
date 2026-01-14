import { useRequest } from 'ahooks';
import { useMemo } from 'react';
import { AbilityApi } from '../../../Ability/api';

/**
 * 能力数据管理 Hook
 * 根据学科和年级获取能力列表
 */
export function useAbilityData(subject?: string, grades?: number[]) {
  // 获取该学科下所有年级的能力数据
  const { data, loading, error } = useRequest(() => AbilityApi.getBySubject(subject!), {
    refreshDeps: [subject],
    ready: !!subject,
  });

  // 根据选中的年级过滤能力
  const atomics = useMemo(() => {
    if (!data || !grades || grades.length === 0) {
      return [];
    }

    // 从所有年级的能力中筛选出匹配的能力
    const allAbilities: Ability[] = [];
    grades.forEach((grade) => {
      const gradeKey = `grade_${grade}`;
      const gradeAbilities = data[gradeKey] || [];
      allAbilities.push(...gradeAbilities);
    });

    // 去重并转换为选项格式
    const uniqueAbilities = Array.from(
      new Map(allAbilities.map((a) => [a.code, a])).values()
    );

    return uniqueAbilities.map((a) => ({ label: `${a.name} (${a.grade}年级)`, value: a.code }));
  }, [data, grades]);

  return { atomics, loading, error };
}
