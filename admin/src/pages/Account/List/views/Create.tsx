import { Form, Input, Modal, Select } from 'antd';
import { useAccountListModel } from '../models/page';
import { useMemo } from 'react';
import { ACCOUNT_TYPE_MAP, AccountType } from '../../constants';

export function CreateForm() {
  const {
    form,
    state: { visible },
    hide,
    submit,
  } = useAccountListModel();

  const options = useMemo(() => {
    return Object.keys(ACCOUNT_TYPE_MAP)
      .filter((key) => key !== '0')
      .map((key) => ({
        value: Number(key),
        label: ACCOUNT_TYPE_MAP[key as unknown as AccountType],
      }));
  }, []);

  return (
    <Modal
      title="创建账号"
      maskClosable={false}
      open={visible}
      okButtonProps={{ size: 'large', style: { width: 100 } }}
      cancelButtonProps={{ size: 'large', style: { width: 100 } }}
      onOk={submit}
      onCancel={hide}
    >
      <Form
        className="pt-[20px]"
        size="large"
        name="basic"
        form={form}
        labelCol={{ span: 4 }}
        initialValues={{ type: AccountType.Manager }}
        autoComplete="off"
      >
        <Form.Item<AccountForm> label="账号" name="username" rules={[{ required: true }]}>
          <Input placeholder="请输入账号" />
        </Form.Item>
        <Form.Item<AccountForm> label="类型" name="type" rules={[{ required: true }]}>
          <Select options={options} placeholder="请选择类型" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
