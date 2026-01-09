import logo from '@/assets/logo.png';
import { apiClient } from '@/lib/api';
import { useInitialStateModel } from '@/models/initialState';
import {
  ApartmentOutlined,
  BookOutlined,
  ClusterOutlined,
  DashboardOutlined,
  LogoutOutlined,
  ProfileOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ProLayout } from '@ant-design/pro-components';
import { Dropdown, Spin } from 'antd';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
const routes = {
  path: '/',
  children: [
    {
      path: '/home',
      name: '首页',
      isExact: true,
      icon: <DashboardOutlined />,
    },

    {
      name: '系统',
      key: 'system',
      icon: <ClusterOutlined />,
      children: [{ path: '/manager', name: '管理员管理' }],
    },
    {
      name: '学生',
      key: 'student',
      icon: <UserOutlined />,
      children: [{ path: '/student', name: '学生管理' }],
    },
    {
      key: 'textbook',
      name: '知识库',
      icon: <BookOutlined />,
      children: [
        { path: '/textbook', name: '教材管理' },
        { path: '/teacher_book', name: '教辅管理' },
      ],
    },
    {
      name: '学习',
      key: 'learning',
      icon: <QuestionCircleOutlined />,
      children: [
        { path: '/question_type', name: '题型管理' },
        { path: '/question', name: '题目管理' },
      ],
    },
    {
      name: '能力',
      key: 'ability',
      icon: <ApartmentOutlined />,
      children: [
        { path: '/ability/domain', name: '能力域管理' },
        { path: '/ability/atomic', name: '原子能力管理' },
      ],
    },
  ],
};

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, manager, clearState } = useInitialStateModel();
  const [pathname, setPathname] = useState(location.pathname);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <ProLayout
      className="admin-layout"
      logo={logo}
      title="AI 教育"
      layout="mix"
      fixSiderbar
      fixedHeader
      route={routes}
      location={location}
      menu={{ defaultOpenAll: true, ignoreFlatMenu: true }}
      menuProps={{ selectedKeys: [pathname] }}
      menuItemRender={(item, dom) => {
        return (
          <div
            onClick={() => {
              navigate(item.path || '/');
              setPathname(item.path || '/');
            }}
          >
            {dom}
          </div>
        );
      }}
      avatarProps={{
        // src: <UserOutlined />,
        src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
        title: manager?.username,
        size: 'large',
        render: (_, dom) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'profile',
                  icon: <ProfileOutlined />,
                  label: '个人中心',
                  onClick: () => navigate('/profile'),
                },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: () => {
                    apiClient.removeToken();
                    clearState();
                    navigate('/login', { replace: true });
                  },
                },
              ],
            }}
          >
            {dom}
          </Dropdown>
        ),
      }}
    >
      <Outlet />
    </ProLayout>
  );
}
