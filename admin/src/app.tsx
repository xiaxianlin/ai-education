import { type RunTimeLayoutConfig, history } from '@umijs/max';
import { api } from './utils/api';
import { AvatarDropdown } from './components';
import logo from '@/assets/logo.png';

export async function getInitialState(): Promise<InitialState> {
  try {
    const res = await api.get<Account>('/check');
    return { user: res.data };
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
      title: initialState?.user?.username,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
  };
};
