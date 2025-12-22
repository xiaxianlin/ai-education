import { ModalForm, ProFormText, ProFormTextArea, ProFormSelect, ProFormSwitch } from '@ant-design/pro-components';
import { usePracticeConfigModel } from '../models/page';
import { useEffect } from 'react';

const VALUE_TYPE_OPTIONS = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '对象', value: 'object' },
  { label: '数组', value: 'array' },
];

const PARAM_TYPE_OPTIONS = [
  { label: '内置参数', value: 'system' },
  { label: '输入参数', value: 'input' },
];

export function FormView() {
  const { form, visible, parameter, saveParameter, hideDrawerForm } = usePracticeConfigModel();

  // When parameter changes, convert object/array values to JSON strings for display
  useEffect(() => {
    if (parameter && visible) {
      const formValues = { ...parameter };
      // If value is an object or array, stringify it for the textarea
      if (formValues.value && (formValues.value_type === 'object' || formValues.value_type === 'array')) {
        if (typeof formValues.value !== 'string') {
          formValues.value = JSON.stringify(formValues.value, null, 2);
        }
      }
      form.setFieldsValue(formValues);
    }
  }, [parameter, visible, form]);

  const handleFinish = async (values: PracticeParameter) => {
    // Convert value back to appropriate type before saving
    const processedValues = { ...values };

    if (processedValues.value_type === 'object' || processedValues.value_type === 'array') {
      // If it's a string, try to parse it
      if (typeof processedValues.value === 'string' && processedValues.value.trim()) {
        try {
          processedValues.value = JSON.parse(processedValues.value);
        } catch (e) {
          // If parsing fails, keep it as string (validation should catch this)
        }
      }
    }

    saveParameter(processedValues);
  };

  return (
    <ModalForm<PracticeParameter>
      width={700}
      form={form}
      open={visible}
      title={parameter ? '编辑参数' : '添加参数'}
      onFinish={handleFinish}
      modalProps={{
        destroyOnClose: true,
        onCancel: hideDrawerForm,
      }}
      layout="horizontal"
      size="large"
      labelAlign="left"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
    >
      <div className="pt-3" />
      <ProFormText
        name="key"
        label="参数标识"
        rules={[
          { required: true, message: '请输入参数标识' },
          { pattern: /^[a-z0-9_]+$/, message: '参数标识只能包含小写字母、数字和下划线' },
        ]}
        placeholder="例如：generate_count"
      />
      <ProFormSelect
        name="type"
        label="参数类型"
        rules={[{ required: true, message: '请选择参数类型' }]}
        options={PARAM_TYPE_OPTIONS}
      />
      <ProFormSwitch name="required" label="是否必填" />
      <ProFormSelect
        name="value_type"
        label="值类型"
        rules={[{ required: true, message: '请选择值类型' }]}
        options={VALUE_TYPE_OPTIONS}
      />
      <ProFormTextArea
        name="value"
        label="参数值"
        placeholder="请输入参数值，如果类型为对象或数组，请输入 JSON 格式"
        fieldProps={{ rows: 4 }}
      />
      <ProFormTextArea name="description" label="参数描述" fieldProps={{ rows: 3 }} placeholder="请输入参数描述" />
    </ModalForm>
  );
}
