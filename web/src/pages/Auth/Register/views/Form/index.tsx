import { ProForm, ProFormCaptcha, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Button, Flex } from 'antd';
import { validPassword } from '@/utils/validation';
import { LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import { RegisterFormModel, useRegisterModel } from '../../models/page';
import { useRef } from 'react';
export default function FormView() {
  const { send, regsiter } = useRegisterModel();
  const formRef = useRef<ProFormInstance>();
  return (
    <ProForm<RegisterFormModel>
      size="large"
      formRef={formRef}
      onFinish={async (values) => {
        await regsiter(values);
      }}
      submitter={{
        render: () => {
          return (
            <Flex justify="space-between" align="center">
              <Button
                style={{ width: 120 }}
                type="primary"
                onClick={() => {
                  formRef.current?.submit();
                }}
              >
                注册
              </Button>
              <Link to="/login">使用已有帐户登录</Link>
            </Flex>
          );
        },
      }}
    >
      <ProFormText
        name="username"
        placeholder="请输入用户名"
        fieldProps={{ prefix: <UserOutlined /> }}
        rules={[
          { required: true, message: '请输入用户名!' },
          { min: 8, message: '用户名不小于 8 位' },
          { pattern: /^\w+$/, message: '用户名只能包含字母、数字和下划线' },
        ]}
      />
      <ProFormText.Password
        name="password"
        placeholder="请输入密码"
        fieldProps={{ prefix: <LockOutlined /> }}
        rules={[() => ({ validator: (_, value) => validPassword(value) })]}
      />
      <ProFormText
        name="phone"
        placeholder="请输入手机号"
        fieldProps={{ prefix: <MobileOutlined /> }}
        rules={[
          { required: true, message: '请输入手机号！' },
          { pattern: /^1\d{10}$/, message: '手机号格式错误！' },
        ]}
      />
      <ProFormCaptcha
        name="code"
        phoneName="phone"
        placeholder="请输入验证码"
        fieldProps={{ prefix: <LockOutlined /> }}
        rules={[{ required: true, message: '请输入验证码！' }]}
        onGetCaptcha={async (phone) => {
          await send(phone);
        }}
      />
    </ProForm>
  );
}
