import {
  ModalForm,
  ProFormRate,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea
} from '@ant-design/pro-components';
import { Form } from 'antd';
import { useEffect } from 'react';

import type { CreateAbilityRequest, UpdateAbilityRequest } from '../api';
import { useAbilityModel } from '../models/page';

export default function AbilityFormView() {
  const { formVisible, formItem, handleFormCancel, handleFormSubmit, subject, selectedGrade } = useAbilityModel();
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

  return (
    <ModalForm<CreateAbilityRequest | UpdateAbilityRequest>
      width={600}
      form={form}
      open={formVisible}
      title={formItem ? '更新能力' : '新增能力'}
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
        name="code"
        label="能力标识"
        placeholder="请输入能力标识（如：pinyin_reading）"
        rules={[{ required: true, message: '请输入能力标识' }]}
        disabled={!!formItem}
      />
      <ProFormText
        name="name"
        label="能力名称"
        placeholder="请输入能力名称"
        rules={[{ required: true, message: '请输入能力名称' }]}
      />
      <ProFormRate
        name="difficulty"
        label="难度"
        initialValue={1}
        count={5}
        rules={[{ required: true, message: '请选择难度' }]}
        fieldProps={{ size: 'large', allowHalf: false }}
      />
      <ProFormTextArea name="description" label="能力说明" placeholder="请输入能力说明" fieldProps={{ rows: 4 }} />
      {formItem && (
        <ProFormSwitch
          name="is_active"
          label="启用状态"
          initialValue={formItem.is_active === 1}
          transform={(value) => ({ is_active: value ? 1 : 0 })}
        />
      )}
    </ModalForm>
  );
}
