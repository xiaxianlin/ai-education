import { ModalForm, ProFormDigit, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Form } from 'antd';
import { useEffect } from 'react';

import type { CreateAbilityAtomicRequest, UpdateAbilityAtomicRequest } from '../../api';
import { useAbilityDetailModel } from '../models/page';

export default function AtomicFormView() {
  const { formVisible, formItem, selectedGrade, handleFormCancel, handleFormSubmit } = useAbilityDetailModel();
  const [form] = Form.useForm();

  useEffect(() => {
    if (formVisible) {
      if (formItem) {
        form.setFieldsValue(formItem);
      } else {
        form.resetFields();
      }
    }
  }, [formVisible, formItem, form]);

  if (selectedGrade === null) return null;

  return (
    <ModalForm<CreateAbilityAtomicRequest | UpdateAbilityAtomicRequest>
      width={600}
      form={form}
      open={formVisible}
      title={formItem ? '更新原子能力' : '新增原子能力'}
      onFinish={async (values) => {
        await handleFormSubmit(values);
        form.resetFields();
      }}
      modalProps={{ destroyOnClose: true, onCancel: handleFormCancel }}
      layout="horizontal"
      size="large"
      labelAlign="left"
      labelCol={{ span: 4 }}
    >
      <div className="pt-3" />
      <ProFormText
        name="name"
        label="名称"
        placeholder="请输入名称"
        rules={[{ required: true, message: '请输入能力名称' }]}
      />
      <ProFormText
        name="code"
        label="标识"
        placeholder="请输入标识"
        rules={[{ required: true, message: '请输入标识' }]}
      />
      <ProFormDigit
        name="difficulty"
        label="难度"
        placeholder="请输入难度（1-5）"
        initialValue={1}
        min={1}
        max={5}
        rules={[
          { required: true, message: '请输入难度' },
          { type: 'number', min: 1, max: 5, message: '难度范围为1-5' },
        ]}
      />
      <ProFormTextArea name="description" label="描述" placeholder="请输入描述" fieldProps={{ rows: 4 }} />
    </ModalForm>
  );
}
