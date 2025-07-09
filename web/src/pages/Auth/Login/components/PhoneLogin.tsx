import { LockOutlined, MobileOutlined } from '@ant-design/icons';
import { ProFormCaptcha, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useLoginModel } from '../models/page';

export default function PhoneLogin() {
  const { send } = useLoginModel();
  return (
    <>
      <ProFormText
        name="account"
        placeholder="手机号"
        fieldProps={{ prefix: <MobileOutlined /> }}
        rules={[
          { required: true, message: '请输入手机号！' },
          { pattern: /^1\d{10}$/, message: '手机号格式错误！' },
        ]}
      />
      <ProFormCaptcha
        name="code"
        phoneName="account"
        placeholder="请输入验证码"
        fieldProps={{ prefix: <LockOutlined /> }}
        rules={[{ required: true, message: '请输入验证码！' }]}
        onGetCaptcha={async (phone) => {
          await send(phone);
        }}
      />
    </>
  );
}
