import { ProFormSelect } from '@ant-design/pro-components';
import { ABILITY_TYPE_OPTIONS } from '@ai-education/shared-web';
import { Form } from 'antd';
import { COGNITIVE_OPTIONS } from '../../constants';

export default function CognitiveConfigForm() {
  const form = Form.useFormInstance();
  const subject = Form.useWatch('subject', form);

  // 根据科目获取能力维度选项
  const abilityTypeOptions = subject ? ABILITY_TYPE_OPTIONS[subject] || [] : [];

  return (
    <>
      <ProFormSelect
        labelCol={{ span: 4 }}
        name="cognitiveLevels"
        label="认知层次"
        mode="multiple"
        placeholder="请选择认知层次"
        options={COGNITIVE_OPTIONS}
      />
      <ProFormSelect
        labelCol={{ span: 4 }}
        name="abilityDimensions"
        label="能力维度"
        mode="multiple"
        placeholder={subject ? '请选择能力维度' : '请先选择科目'}
        options={abilityTypeOptions}
        disabled={!subject}
        tooltip={!subject ? '请先在基本信息中选择科目' : undefined}
      />
    </>
  );
}
