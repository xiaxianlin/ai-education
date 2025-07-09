import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Form, Input } from 'antd';
import React from 'react';
import { usePasswordModel } from '../models/page';
import { validPassword } from '@/utils/validation';

export default function ModifyForm() {
  const { modify } = usePasswordModel();
  return (
    <PageContainer ghost header={{ title: '修改密码' }}>
      <Card style={{ width: 420 }}>
        <Form
          className="pt-[20px]"
          size="large"
          labelCol={{ span: 5 }}
          labelAlign="left"
          autoComplete="off"
          onFinish={modify}
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
