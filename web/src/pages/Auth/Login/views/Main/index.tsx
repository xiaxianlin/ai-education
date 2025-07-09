import logo from '@/assets/logo.png';
import AuthLayout from '@/layouts/AuthLayout';
import { LoginForm } from '@ant-design/pro-components';
import { Tabs, TabsProps } from 'antd';
import AccountLogin from '../../components/AccountLogin';
import OtherLogin from '../../components/OtherLogin';
import PhoneLogin from '../../components/PhoneLogin';
import { LoginFormModel, LoginType, useLoginModel } from '../../models/page';

export default function MainView() {
  const { type, login, setType } = useLoginModel();
  const items: TabsProps['items'] = [
    { key: LoginType.Account, label: '账号密码登录' },
    { key: LoginType.Phone, label: '手机号登录' },
  ];
  return (
    <AuthLayout>
      <LoginForm<LoginFormModel>
        logo={logo}
        size="large"
        title="观澜智科"
        subTitle="您身边最好用的 AI 服务"
        actions={<OtherLogin />}
        onFinish={async (values) => {
          await login(values);
        }}
      >
        <Tabs centered items={items} activeKey={type} onChange={(key) => setType(key as LoginType)} />
        {type === LoginType.Account && <AccountLogin />}
        {type === LoginType.Phone && <PhoneLogin />}
      </LoginForm>
    </AuthLayout>
  );
}
