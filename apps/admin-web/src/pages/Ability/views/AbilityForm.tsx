import { ModalForm, ProFormRate, ProFormSwitch, ProFormText, ProFormTextArea } from '@ant-design/pro-components';

import type { CreateAbilityRequest, UpdateAbilityRequest } from '../api';
import { useAbilityModel } from '../models/page';

export default function AbilityFormView() {
  const { formProps } = useAbilityModel();

  return (
    <ModalForm<CreateAbilityRequest | UpdateAbilityRequest>
      width={600}
      form={formProps.form}
      open={formProps.visible}
      title={formProps.item ? '更新能力' : '新增能力'}
      onFinish={formProps.handleSubmit}
      modalProps={{ destroyOnClose: true, onCancel: formProps.onCancel }}
      layout="horizontal"
      size="large"
      labelAlign="left"
      labelCol={{ span: 4 }}
    >
      <div className="pt-3" />
      <ProFormText
        name="name"
        label="能力名称"
        placeholder="请输入能力名称"
        rules={[{ required: true, message: '请输入能力名称' }]}
      />
      <ProFormText
        name="code"
        label="能力标识"
        placeholder="请输入能力标识（如：pinyin_reading）"
        rules={[{ required: true, message: '请输入能力标识' }]}
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
      {formProps.item && (
        <ProFormSwitch
          name="is_active"
          label="启用状态"
          initialValue={formProps.item.is_active === 1}
          transform={(value) => ({ is_active: value ? 1 : 0 })}
        />
      )}
    </ModalForm>
  );
}
