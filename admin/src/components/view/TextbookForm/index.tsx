import React, { FC, useMemo } from 'react';
import { Form, FormInstance, message } from 'antd';
import { ModalForm, ProFormSelect } from '@ant-design/pro-components';
import { GRADES, SEMETERS, STAGES } from '@/utils/constants';
import { useRequest } from 'ahooks';
import { TextbookApi } from '@/services/textbook';

interface TextbookFormProps {
  editId?: number;
  visible?: boolean;
  form: FormInstance<TextbookFormModel>;
  onSubmit?: () => void;
  onCancel?: () => void;
}
export const TextbookForm: FC<TextbookFormProps> = ({
  form,
  editId,
  visible,
  onSubmit,
  onCancel,
}) => {
  const { data: versions } = useRequest(TextbookApi.getVersions);
  const { data: subjects } = useRequest(TextbookApi.getSubjects);
  const { runAsync: handleSubmit } = useRequest(
    async (values: TextbookFormModel) => {
      if (editId) {
        await TextbookApi.update(editId, values);
      } else {
        await TextbookApi.create(values);
      }
    },
    {
      manual: true,
      onSuccess: () => {
        message.success(editId ? '更新成功' : '新增成功');
        onCancel?.();
        onSubmit?.();
      },
    },
  );

  const stage = Form.useWatch('stage', form);
  const grades = useMemo(() => (stage ? GRADES[stage] : []), [stage]);

  return (
    <ModalForm<TextbookFormModel>
      width={450}
      form={form}
      open={visible}
      title={editId ? '更新教材' : '新增教材'}
      onFinish={handleSubmit}
      modalProps={{ destroyOnClose: true, onCancel }}
      layout="horizontal"
      size="large"
      labelAlign="left"
      labelCol={{ span: 4 }}
    >
      <div className="pt-3" />
      <ProFormSelect
        name="subject"
        label="科目"
        placeholder="请选择科目"
        rules={[{ required: true }]}
        valueEnum={subjects?.reduce((prev, curr) => ({ ...prev, [curr.name]: curr.name }), {})}
      />
      <ProFormSelect
        name="version"
        label="版本"
        placeholder="请选择版本"
        rules={[{ required: true }]}
        valueEnum={versions?.reduce((prev, curr) => ({ ...prev, [curr.name]: curr.name }), {})}
      />
      <ProFormSelect
        name="stage"
        label="阶段"
        placeholder="请选择阶段"
        rules={[{ required: true }]}
        valueEnum={STAGES?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {})}
      />
      <ProFormSelect
        name="grade"
        label="年级"
        placeholder="请选择年级"
        rules={[{ required: true }]}
        valueEnum={grades?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {})}
      />
      <ProFormSelect
        name="semester"
        label="学期"
        placeholder="请选择学期"
        rules={[{ required: true }]}
        valueEnum={SEMETERS?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {})}
      />
    </ModalForm>
  );
};
