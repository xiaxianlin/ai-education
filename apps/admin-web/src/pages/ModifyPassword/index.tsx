import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Form, Input, message } from 'antd';
import { validPassword } from '@/utils/validation';
import { adminApi, apiClient } from '@/lib/api';
import { useRequest } from 'ahooks';
import { useInitialStateModel } from '@/models/initialState';

export default function MoidfyPasswordPage() {
  const navigate = useNavigate();
  const { clearState, manager } = useInitialStateModel();

  const { runAsync } = useRequest(adminApi.modifyPassword, {
    manual: true,
    ready: !!manager?.id,
    onSuccess: () => {
      message.success('修改成功');
      apiClient.removeToken();
      clearState();
      navigate('/login', { replace: true });
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
