import { useRequest } from 'ahooks';
import { useMemo } from 'react';
import { AbilityApi } from '../../../Ability/api';

/**
 * 能力数据管理 Hook
 * 使用新的 getBySubject 接口获取能力数据，并根据 domainCode 和 grades 过滤原子能力
 */
export function useAbilityData(
  subject?: string,
  domainCode?: string,
  grades?: number[]
) {
  // 使用 useRequest 调用新接口
  const { data: abilityData, loading, error } = useRequest(
    async () => {
      if (!subject) {
        return null;
      }
      return AbilityApi.getBySubject(subject);
    },
    {
      refreshDeps: [subject],
      ready: !!subject,
    }
  );

  // 扁平化能力域列表（从 AbilityDomainWithAtomics 中提取 AbilityDomain）
  const domains = useMemo(() => {
    if (!abilityData) {
      return [];
    }
    return abilityData.map((domain): AbilityDomain => ({
      id: domain.id,
      subject: domain.subject,
      code: domain.code,
      name: domain.name,
      description: domain.description,
      sort_order: domain.sort_order,
      is_active: domain.is_active,
      create_time: domain.create_time,
      update_time: domain.update_time,
    }));
  }, [abilityData]);

  // 根据 domainCode 和 grades 过滤原子能力
  const atomics = useMemo(() => {
    if (!abilityData || !domainCode || !grades || grades.length === 0) {
      return [];
    }

    // 找到对应的能力域
    const domain = abilityData.find((d) => d.code === domainCode);
    if (!domain) {
      return [];
    }

    // 过滤出匹配的年级的原子能力
    return domain.atomics.filter((atomic) => grades.includes(atomic.grade));
  }, [abilityData, domainCode, grades]);

  return {
    domains,
    atomics,
    loading,
    error,
  };
}
