import { EditOutlined, LogoutOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import React, { PropsWithChildren } from 'react';
import { createStyles } from 'antd-style';
import { Dropdown } from 'antd';

const useStyles = createStyles(({ token }) => {
  return {
    dropdown: {
      [`@media screen and (max-width: ${token.screenXS}px)`]: {
        width: '100%',
      },
    },
  };
});

export function AvatarDropdown({ children }: PropsWithChildren) {
  const { styles } = useStyles();
  return (
    <Dropdown
      overlayClassName={styles.dropdown}
      menu={{
        selectedKeys: [],
        onClick: (e) => {
          switch (e.key) {
            case 'logout':
              localStorage.removeItem('token');
              history.replace('/login');
              break;
            case 'password':
              history.push('/password');
              break;
          }
        },
        items: [
          { key: 'password', icon: <EditOutlined />, label: '修改密码' },
          { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
        ],
      }}
    >
      {children}
    </Dropdown>
  );
}
