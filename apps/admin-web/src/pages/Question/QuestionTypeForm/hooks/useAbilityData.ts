import { useRequest } from 'ahooks';
import { useMemo } from 'react';
import { AbilityApi } from '../../../Ability/api';

/**
 * 能力数据管理 Hook
 * 使用新的 getBySubject 接口获取能力数据，并根据 domainCode 和 grades 过滤原子能力
 */
export function useAbilityData(subject?: string, domainCode?: string, grades?: number[]) {
  // 使用 useRequest 调用新接口
  const { data, loading, error } = useRequest(() => AbilityApi.getBySubject(subject!), {
    refreshDeps: [subject],
    ready: !!subject,
  });

  const domains = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.map((d) => ({ label: d.name, value: d.code }));
  }, [data]);

  // 根据 domainCode 和 grades 过滤原子能力
  const atomics = useMemo(() => {
    if (!data || !domainCode || !grades || grades.length === 0) {
      return [];
    }

    // 找到对应的能力域
    const domain = data.find((d) => d.code === domainCode);
    if (!domain || !domain.atomics) {
      return [];
    }

    // 过滤出匹配的年级的原子能力
    return domain.atomics
      .filter((atomic) => grades.includes(atomic.grade))
      .map((a) => ({ label: a.name, value: a.code }));
  }, [data, domainCode, grades]);

  return { domains, atomics, loading, error };
}
