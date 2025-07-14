import { history } from '@umijs/max';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { AvatarDropdown } from './components';
import logo from '@/assets/logo.png';
import { message } from 'antd';
import { AuthApi } from './services/auth';

export async function getInitialState(): Promise<InitialState> {
  try {
    const manager = await AuthApi.check();
    return { manager };
  } catch (e) {
    history.push('/login');
  }
  return {};
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    logo,
    title: 'AI 教育',
    layout: 'mix',
    theme: 'dark',
    contentWidth: 'Fixed',
    fixedHeader: true,
    fixSiderbar: true,
    colorWeak: false,
    menu: {
      defaultOpenAll: true,
    },
    avatarProps: {
      title: initialState?.manager?.username,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
  };
};

export const request: RequestConfig<ApiData<any>> = {
  timeout: 10000,
  baseURL: '/api/admin',
  requestInterceptors: [
    (url, options) => {
      const token = localStorage.getItem('token');
      if (token && options.headers) {
        options.headers['x-access-token'] = token;
      }
      return { url, options };
    },
  ],
  responseInterceptors: [
    (response) => {
      const { data = {} as any } = response;
      if (data.status === 401) {
        history.push('/login');
      } else if (data.status === 499) {
        history.push('/password');
      } else if (data.status !== 0) {
        message.error(data.message || '网络异常');
      }
      return response;
    },
  ],
};
