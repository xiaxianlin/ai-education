import { adminApi } from '@ai-education/shared-frontend';

export interface InitialState {
  manager?: any;
  configs?: any;
}

let initialState: InitialState = {};

export async function getInitialState(): Promise<InitialState> {
  try {
    const [manager, configs] = await Promise.all([adminApi.check(), adminApi.getConfigs()]);
    initialState = { manager, configs };
    return initialState;
  } catch (e) {
    // 如果获取失败，返回空对象
    initialState = {};
    return initialState;
  }
}

export function getState(): InitialState {
  return initialState;
}

export function setState(state: Partial<InitialState>) {
  initialState = { ...initialState, ...state };
}

export function clearState() {
  initialState = {};
}

