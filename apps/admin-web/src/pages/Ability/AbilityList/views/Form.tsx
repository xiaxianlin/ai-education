import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';

import type { CreateAbilityDomainRequest, UpdateAbilityDomainRequest } from '../../api';
import { useAbilityListModel } from '../models/page';

export default function FormView() {
  const {
    formProps: { form, visible, item, onCancel, handleSubmit },
  } = useAbilityListModel();

  return (
    <ModalForm<CreateAbilityDomainRequest | UpdateAbilityDomainRequest>
      width={600}
      form={form}
      open={visible}
      title={item ? '更新能力域' : '新增能力域'}
      onFinish={handleSubmit}
      modalProps={{ destroyOnClose: true, onCancel }}
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
        rules={[{ required: true, message: '请输入名称' }]}
      />
      <ProFormText
        name="code"
        label="标识"
        placeholder="请输入标识"
        rules={[{ required: true, message: '请输入标识' }]}
      />
      <ProFormTextArea name="description" label="描述" placeholder="请输入能力域描述" fieldProps={{ rows: 4 }} />
    </ModalForm>
  );
}
