import { apiClient } from '@/lib/api';
import { validPassword } from '@/utils/validation';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '../api';
import './index.less';

export default function LoginPage() {
  const navigate = useNavigate();

  const { runAsync: login } = useRequest((data) => AuthApi.login(data), {
    manual: true,
    onSuccess: async (res) => {
      apiClient.setToken(res);
      navigate('/home', { replace: true });
    },
  });

  return (
    <div className="layout">
      <div className="container">
        <LoginForm<LoginRequest>
          size="large"
          title="管理员登录"
          subTitle="请输入您的凭据以访问管理后台"
          initialValues={{
            username: 'xiaxianlin',
            password: 'Xiaxl.901208',
          }}
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
