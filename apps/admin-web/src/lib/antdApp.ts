import { App } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';

let antdMessageApi: MessageInstance | null = null;

export function setAntdMessageApi(api: MessageInstance) {
  antdMessageApi = api;
}

export function getAntdMessageApi() {
  return antdMessageApi;
}

export function useAntdApp() {
  return App.useApp();
}


