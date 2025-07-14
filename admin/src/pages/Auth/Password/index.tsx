import React from 'react';
import { history, useModel } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Form, Input, message } from 'antd';
import { validPassword } from '@/utils/validation';
import { AuthApi } from '@/services/auth';
import { useRequest } from 'ahooks';

export default function MoidfyPasswordPage() {
  const { initialState } = useModel('@@initialState');

  const { runAsync } = useRequest(AuthApi.modifyPassword, {
    manual: true,
    ready: !!initialState?.manager?.id,
    onSuccess: () => {
      message.success('修改成功');
      localStorage.removeItem('token');
      history.replace('/login');
    },
  });

  return (
    <PageContainer ghost header={{ title: '修改密码' }}>
      <Card style={{ width: 420 }}>
        <Form
          className="pt-[20px]"
          size="large"
          labelCol={{ span: 5 }}
          labelAlign="left"
          autoComplete="off"
          onFinish={async (values) => {
            await runAsync(values);
            return true;
          }}
        >
          <Form.Item<ModifyPasswordForm>
            label="旧密码"
            name="old_password"
            rules={[() => ({ validator: (_, value) => validPassword(value) })]}
          >
            <Input.Password placeholder="请输入旧密码" />
          </Form.Item>
          <Form.Item<ModifyPasswordForm>
            label="新密码"
            name="new_password"
            rules={[() => ({ validator: (_, value) => validPassword(value) })]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
              修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </PageContainer>
  );
}
