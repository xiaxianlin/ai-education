import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useEffect, useState } from 'react';

import { AbilityApi } from '../../api';
import { useAtomicListModel } from '../models/page';
import type {
  CreateAbilityAtomicRequest,
  UpdateAbilityAtomicRequest,
} from '../../api';

export default function FormView() {
  const {
    subject,
    grade,
    formProps: { form, visible, item, onCancel, handleSubmit },
  } = useAtomicListModel();

  const [domains, setDomains] = useState<AbilityDomain[]>([]);

  // 加载能力域列表
  useEffect(() => {
    if (subject) {
      AbilityApi.searchDomains({ subject }).then(setDomains);
    } else {
      setDomains([]);
    }
  }, [subject, visible]);

  return (
    <ModalForm<CreateAbilityAtomicRequest | UpdateAbilityAtomicRequest>
      width={600}
      form={form}
      open={visible}
      title={item ? '更新原子能力' : '新增原子能力'}
      onFinish={handleSubmit}
      modalProps={{ destroyOnClose: true, onCancel }}
      layout="horizontal"
      size="large"
      labelAlign="left"
      labelCol={{ span: 4 }}
    >
      <div className="pt-3" />
      {!item && (
        <>
          <ProFormSelect
            name="domain_code"
            label="能力域"
            placeholder="请选择能力域"
            rules={[{ required: true, message: '请选择能力域' }]}
            options={domains.map((d) => ({ label: d.name, value: d.code }))}
          />
          <ProFormText
            name="code"
            label="能力代码"
            placeholder="请输入能力代码"
            rules={[{ required: true, message: '请输入能力代码' }]}
          />
        </>
      )}
      <ProFormText
        name="name"
        label="能力名称"
        placeholder="请输入能力名称"
        rules={[{ required: true, message: '请输入能力名称' }]}
      />
      <ProFormTextArea
        name="description"
        label="描述"
        placeholder="请输入能力描述"
        fieldProps={{ rows: 4 }}
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
