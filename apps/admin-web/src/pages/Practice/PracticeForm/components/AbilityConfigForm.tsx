import { COGNITIVE_LEVEL_LABELS, CognitiveLevel } from '@ai-education/shared-web';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { ProFormDigit, ProFormSelect } from '@ant-design/pro-components';
import { Button, Form, Space } from 'antd';

interface AbilityConfigFormProps {
  name: string;
}

const COGNITIVE_LEVEL_OPTIONS = Object.values(CognitiveLevel).map((level) => ({
  label: COGNITIVE_LEVEL_LABELS[level],
  value: level,
}));

// 能力类型选项（按科目分类）
const ABILITY_TYPE_OPTIONS: Record<string, Array<{ label: string; value: string }>> = {
  语文: [
    { label: '拼音能力', value: 'phonetic' },
    { label: '识字写字', value: 'character' },
    { label: '词语积累', value: 'vocabulary' },
    { label: '句子运用', value: 'sentence' },
    { label: '阅读理解', value: 'reading' },
    { label: '书面表达', value: 'writing' },
    { label: '口语表达', value: 'speaking' },
  ],
  数学: [
    { label: '数感', value: 'number_sense' },
    { label: '运算能力', value: 'calculation' },
    { label: '空间观念', value: 'spatial' },
    { label: '数据分析', value: 'data' },
    { label: '推理能力', value: 'reasoning' },
    { label: '模型思想', value: 'modeling' },
    { label: '应用意识', value: 'application' },
  ],
  英语: [
    { label: '听力理解', value: 'listening' },
    { label: '口语表达', value: 'speaking' },
    { label: '阅读理解', value: 'reading' },
    { label: '书面表达', value: 'writing' },
    { label: '词汇知识', value: 'vocabulary' },
    { label: '语法知识', value: 'grammar' },
  ],
};

export default function AbilityConfigForm({ name }: AbilityConfigFormProps) {
  const form = Form.useFormInstance();
  const subject = Form.useWatch('subject', form);

  // 根据科目获取能力类型选项
  const abilityTypeOptions = subject ? ABILITY_TYPE_OPTIONS[subject] || [] : [];

  return (
    <Form.Item name={name} noStyle>
      <ProFormSelect
        name={[name, 'cognitive_levels']}
        label="认知层次"
        mode="multiple"
        placeholder="请选择认知层次"
        options={COGNITIVE_LEVEL_OPTIONS}
      />
      <Form.Item label="能力分布" tooltip="配置各能力类型的题目数量">
        <Form.List name={[name, 'distribution']}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name: fieldName, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[fieldName, 'key']}
                    rules={[{ required: true, message: '请选择能力类型' }]}
                    style={{ marginBottom: 0, width: 200 }}
                  >
                    <ProFormSelect
                      placeholder={subject ? '请选择能力类型' : '请先选择科目'}
                      options={abilityTypeOptions}
                      disabled={!subject}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[fieldName, 'value']}
                    rules={[
                      { required: true, message: '请输入数量' },
                      { type: 'number', min: 0, message: '数量必须大于等于0' },
                    ]}
                    style={{ marginBottom: 0, width: 200 }}
                  >
                    <ProFormDigit placeholder="数量" fieldProps={{ min: 0, precision: 0 }} />
                  </Form.Item>
                  <MinusCircleOutlined
                    onClick={() => remove(fieldName)}
                    style={{ color: '#ff4d4f', cursor: 'pointer' }}
                  />
                </Space>
              ))}
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginTop: 8 }}
                  disabled={!subject}
                >
                  添加能力类型
                </Button>
              </Form.Item>
              {!subject && (
                <div style={{ color: '#999', fontSize: '12px', marginTop: 4 }}>请先选择科目以配置能力类型</div>
              )}
            </>
          )}
        </Form.List>
      </Form.Item>
    </Form.Item>
  );
}
