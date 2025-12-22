import { useMemoizedFn, useRequest } from 'ahooks';
import { createContainer } from 'unstated-next';
import { CommonApi } from '@/lib/api';

const useInitialStateContainer = () => {
  const { data, loading, refresh, mutate } = useRequest<InitialState, any>(async () => {
    const [manager, configs] = await Promise.all([CommonApi.check(), CommonApi.getConfigs()]);
    return { manager, configs };
  });

  const clearState = useMemoizedFn(() => {
    mutate({});
  });

  const state = data || {};

  return { ...state, loading, refresh, clearState };
};

export const InitialStateModel = createContainer(useInitialStateContainer);
export const useInitialStateModel = InitialStateModel.useContainer;
