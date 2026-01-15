import { PracticeType } from '@ai-education/shared-web';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useQuestionTypeModel } from '../models/page';

export function QuestionTypeFormModal() {
  const { form, visible, type, item, abilityOptions, onCancel, handleSubmit } = useQuestionTypeModel();

  const prefix = item ? '编辑' : '新增';
  const title = `${prefix} ${type === PracticeType.UNIT_PRACTICE ? '单元练习' : '能力练习'}`;

  return (
    <ModalForm
      width={600}
      form={form}
      open={visible}
      title={title}
      onFinish={handleSubmit}
      modalProps={{ destroyOnClose: true, onCancel }}
      labelCol={{ span: 3 }}
    >
      <ProFormText
        name="name"
        label="名称"
        placeholder="题型名称，如 看图选拼音"
        rules={[{ required: true, message: '请输入名称' }]}
      />
      <ProFormText
        name="code"
        label="编码"
        placeholder="唯一标识，如 pinyin_choice"
        disabled={!!item}
        rules={[
          {
            required: true,
            message: '请输入编码',
          },
          {
            pattern: /^[a-z][a-z0-9_]*$/,
            message: '编码格式：小写字母开头，只能包含小写字母、数字、下划线',
          },
        ]}
      />
      {type === PracticeType.ABILITY_PRACTICE && (
        <ProFormSelect
          name="ability_code"
          label="能力"
          placeholder="请选择能力"
          options={abilityOptions}
          rules={[{ required: true, message: '请选择能力' }]}
        />
      )}
      <ProFormTextArea name="description" label="描述" placeholder="题型描述（可选）" fieldProps={{ rows: 3 }} />
    </ModalForm>
  );
}
