import { useRequest } from 'ahooks';
import { useNavigate } from 'react-router-dom';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { validPassword } from '@/utils/validation';
import { adminApi } from '@ai-education/shared-student';
import type { LoginRequest } from '@ai-education/shared-student';
import { getInitialState, setState } from '@/lib/initialState';
import styles from './index.less';
import { useEffect } from 'react';

export default function LoginPage() {
  const navigate = useNavigate();

  const { runAsync: login } = useRequest(adminApi.login.bind(adminApi), {
    manual: true,
    onSuccess: async (res) => {
      await getInitialState();
      navigate('/home', { replace: true });
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const state = await getInitialState();
        if (state.manager) {
          navigate('/home', { replace: true });
        }
      } catch (error) {
        // 未登录，继续显示登录页
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <LoginForm<LoginRequest>
          size="large"
          title="管理员登录"
          subTitle="请输入您的凭据以访问管理后台"
          onFinish={async (values) => {
            await login(values);
            return true;
          }}
        >
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className={'prefixIcon'} />,
            }}
            placeholder="请输入用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          />
          <ProFormText.Password
            name="password"
            placeholder="请输入密码"
            rules={[() => ({ validator: (_, value) => validPassword(value) })]}
            fieldProps={{
              size: 'large',
              visibilityToggle: false,
              prefix: <LockOutlined className={'prefixIcon'} />,
            }}
          />
        </LoginForm>
      </div>
    </div>
  );
}
