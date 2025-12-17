import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ProLayout } from '@ant-design/pro-components';
import {
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  ReadOutlined,
  QuestionCircleOutlined,
  GithubOutlined,
  FunnelPlotOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
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
    name: '人员',
    key: 'people',
    icon: <UserOutlined />,
    children: [
      { path: '/manager', name: '账号管理' },
      { path: '/student', name: '学生管理' },
    ],
  },

  {
    name: '题目',
    key: 'question',
    icon: <QuestionCircleOutlined />,
    children: [
      { path: '/question', name: '题目管理' },
      { path: '/question_type', name: '类型管理' },
    ],
  },

  {
    key: 'textbook',
    name: '教材',
    icon: <BookOutlined />,
    children: [
      { path: '/textbook', name: '学生教材管理' },
      { path: '/teacher_book', name: '教师用书管理' },
    ],
  },
  {
    key: 'prompt',
    name: '提示词',
    icon: <FileTextOutlined />,
    children: [
      { path: '/prompt/list', name: '提示词列表' },
      { path: '/prompt/test/records', name: '测试记录' },
    ],
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
      menu={{ defaultOpenAll: true, type: 'sub', autoClose: false }}
      menuDataRender={menuDataRender}
      location={location}
      onMenuHeaderClick={() => navigate('/home')}
      menuItemRender={(item, dom) => <div onClick={() => navigate(item.path || '/')}>{dom}</div>}
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
