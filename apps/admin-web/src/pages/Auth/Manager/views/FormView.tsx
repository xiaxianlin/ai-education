import React from 'react';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { message, Modal } from 'antd';
import { useRequest } from 'ahooks';
import { ManagerTypeText } from '@/constants/manager';
import { AuthApi } from '../../api';

export interface ManagerFormViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionRef: React.MutableRefObject<any>;
}

export function ManagerFormView(props: ManagerFormViewProps) {
  const { open, onOpenChange, actionRef } = props;

  const { runAsync: add } = useRequest((values: any) => AuthApi.createManager(values), {
    manual: true,
    onSuccess: (passwd: any) => {
      onOpenChange(false);
      actionRef.current?.reload();
      Modal.success({
        title: '添加成功',
        content: `请保存好密码：${passwd.password}`,
      });
    },
    onError: (error: any) => {
      message.error(error?.message || '添加失败');
    },
  });

  return (
    <ModalForm<any>
      width={500}
      open={open}
      title="添加账号"
      onFinish={async (values) => {
        try {
          await add(values);
          return true;
        } catch {
          return false;
        }
      }}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          onOpenChange(false);
        },
      }}
      layout="horizontal"
      size="large"
      labelAlign="left"
      labelCol={{ span: 4 }}
      initialValues={{ type: 1 }}
    >
      <div className="pt-3" />
      <ProFormText
        name="username"
        label="账号"
        placeholder="请输入账号"
        rules={[{ required: true, message: '请输入账号' }]}
        fieldProps={{ maxLength: 50 }}
      />
      <ProFormSelect
        name="type"
        label="类型"
        placeholder="请选择类型"
        rules={[{ required: true, message: '请选择类型' }]}
        options={Object.entries(ManagerTypeText).map(([key, text]) => ({
          label: text,
          value: Number(key),
        }))}
      />
    </ModalForm>
  );
}
