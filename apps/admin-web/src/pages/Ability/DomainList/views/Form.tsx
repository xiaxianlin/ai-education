import { ModalForm, ProFormText, ProFormTextArea, ProFormDigit } from '@ant-design/pro-components';

import { useDomainListModel } from '../models/page';
import type {
  CreateAbilityDomainRequest,
  UpdateAbilityDomainRequest,
} from '../../api';

export default function FormView() {
  const {
    formProps: { form, visible, item, onCancel, handleSubmit },
  } = useDomainListModel();

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
      {!item && (
        <ProFormText
          name="code"
          label="能力域代码"
          placeholder="请输入能力域代码"
          rules={[{ required: true, message: '请输入能力域代码' }]}
        />
      )}
      <ProFormText
        name="name"
        label="能力域名称"
        placeholder="请输入能力域名称"
        rules={[{ required: true, message: '请输入能力域名称' }]}
      />
      <ProFormTextArea
        name="description"
        label="描述"
        placeholder="请输入能力域描述"
        fieldProps={{ rows: 4 }}
      />
      <ProFormDigit
        name="sort_order"
        label="排序"
        placeholder="请输入排序值"
        initialValue={0}
        min={0}
      />
    </ModalForm>
  );
}
