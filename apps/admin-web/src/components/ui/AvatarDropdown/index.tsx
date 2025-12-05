import { EditOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import React, { PropsWithChildren } from 'react';
import { createStyles } from 'antd-style';
import { Dropdown } from 'antd';
import { clearState } from '@/lib/initialState';

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
  const navigate = useNavigate();
  
  return (
    <Dropdown
      overlayClassName={styles.dropdown}
      menu={{
        selectedKeys: [],
        onClick: (e) => {
          switch (e.key) {
            case 'logout':
              localStorage.removeItem('token');
              clearState();
              navigate('/login', { replace: true });
              break;
            case 'password':
              navigate('/password');
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
