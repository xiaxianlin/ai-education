import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ProLayout } from '@ant-design/pro-components';
import { DashboardOutlined, UserOutlined, BookOutlined, ReadOutlined, QuestionCircleOutlined, GithubOutlined } from '@ant-design/icons';
import { AvatarDropdown } from '@/components/ui';
import logo from '@/assets/logo.png';
import type { MenuDataItem } from '@ant-design/pro-components';
import { useInitialStateModel } from '@/models/initialState';

const menuDataRender = (): MenuDataItem[] => [
  {
    path: '/home',
    name: '首页',
    icon: <DashboardOutlined />,
  },
  {
    path: '/manager',
    name: '账号管理',
    icon: <UserOutlined />,
  },
  {
    path: '/textbook',
    name: '教材管理',
    icon: <BookOutlined />,
  },
  {
    path: '/teacher_book',
    name: '教师用书管理',
    icon: <ReadOutlined />,
  },
  {
    path: '/question',
    name: '题目管理',
    icon: <QuestionCircleOutlined />,
  },
  {
    path: '/student',
    name: '学生管理',
    icon: <GithubOutlined />,
  },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { manager } = useInitialStateModel();

  return (
    <ProLayout
      logo={logo}
      title="AI 教育"
      layout="mix"
      contentWidth="Fixed"
      fixedHeader
      fixSiderbar
      menuDataRender={menuDataRender}
      location={location}
      onMenuHeaderClick={() => navigate('/home')}
      menuItemRender={(item, dom) => (
        <div onClick={() => navigate(item.path || '/')}>{dom}</div>
      )}
      avatarProps={{
        title: manager?.username,
        render: (_, avatarChildren) => {
          return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
        },
      }}
    >
      <Outlet />
    </ProLayout>
  );
}

