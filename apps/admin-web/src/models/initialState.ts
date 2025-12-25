import { CommonApi } from '@/lib/api';
import { useLocalStorageState, useMemoizedFn, useRequest } from 'ahooks';
import { createContainer } from 'unstated-next';

const useInitialStateContainer = () => {
  const [subject, setSubject] = useLocalStorageState('suject_cache', { defaultValue: '英语' });
  const [grade, setGrade] = useLocalStorageState('grade_cache', { defaultValue: 1 });

  const { data, loading, refresh, mutate } = useRequest<InitialState, any>(async () => {
    const [manager, configs] = await Promise.all([CommonApi.check(), CommonApi.getConfigs()]);
    return { manager, configs };
  });

  const clearState = useMemoizedFn(() => {
    mutate({});
  });

  const state = data || {};

  return { ...state, loading, refresh, clearState, subject, grade, setSubject, setGrade };
};

export const InitialStateModel = createContainer(useInitialStateContainer);
export const useInitialStateModel = InitialStateModel.useContainer;
