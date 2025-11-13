import { useRequest } from 'ahooks';

import { StudentApi } from '@/services/student';

export function useUnitPractice(id?: string) {
  const {
    data,
    loading,
    refresh,
  } = useRequest(() => StudentApi.getUnitPractices(id!, 30), {
    ready: !!id,
  });

  return {
    unitPractices: data?.data || [],
    loading,
    refresh,
  };
}

