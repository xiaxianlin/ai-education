import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { LoginFormModel, useLogin } from './hooks/useLogin';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { validPassword } from '@/utils/validation';
import styles from './index.less';

export default function LoginPage() {
  const { login } = useLogin();
  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <LoginForm<LoginFormModel>
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
