import { CommonApi } from '@/lib/api';
import { useLocalStorageState, useMemoizedFn, useRequest } from 'ahooks';
import { createContainer } from 'unstated-next';

const SUBJECT_CACHE_KEY = 'subject_cache';
const LEGACY_SUBJECT_CACHE_KEY = 'suject_cache';

function getInitialSubject() {
  return localStorage.getItem(SUBJECT_CACHE_KEY) || localStorage.getItem(LEGACY_SUBJECT_CACHE_KEY) || '英语';
}

const useInitialStateContainer = () => {
  const [subject, setSubject] = useLocalStorageState(SUBJECT_CACHE_KEY, { defaultValue: getInitialSubject });
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
