import { ProFormSelect } from '@ant-design/pro-components';
import { COGNITIVE_OPTIONS } from '../../constants';

export default function CognitiveConfigForm() {
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
    </>
  );
}
