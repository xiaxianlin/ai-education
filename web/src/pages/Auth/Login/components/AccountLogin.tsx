import { validPassword } from '@/utils/validation';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { ProFormText } from '@ant-design/pro-components';

export default function AccountLogin() {
  return (
    <>
      <ProFormText
        name="account"
        fieldProps={{
          size: 'large',
          prefix: <UserOutlined className={'prefixIcon'} />,
        }}
        placeholder="请输入手机号或用户名"
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
    </>
  );
}
