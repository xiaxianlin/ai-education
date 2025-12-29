import { ABILITY_TYPE_OPTIONS, COGNITIVE_LEVEL_LABELS, CognitiveLevel } from '@ai-education/shared-web';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ProForm, ProFormDigit, ProFormSelect } from '@ant-design/pro-components';
import { Button, Form } from 'antd';

interface AbilityConfigFormProps {
  name: string;
}

const COGNITIVE_LEVEL_OPTIONS = Object.values(CognitiveLevel).map((level) => ({
  label: COGNITIVE_LEVEL_LABELS[level],
  value: level,
}));

// 能力类型选项（按科目分类）

export default function AbilityConfigForm({ name }: AbilityConfigFormProps) {
  const form = Form.useFormInstance();
  const subject = Form.useWatch('subject', form);

  // 根据科目获取能力类型选项
  const abilityTypeOptions = subject ? ABILITY_TYPE_OPTIONS[subject] || [] : [];

  return (
    <Form.Item name={name} noStyle>
      <ProFormSelect
        labelAlign="left"
        labelCol={{ span: 4 }}
        name={[name, 'cognitive_levels']}
        label="认知层次"
        mode="multiple"
        placeholder="请选择认知层次"
        options={COGNITIVE_LEVEL_OPTIONS}
      />
      <Form.Item labelAlign="left" labelCol={{ span: 4 }} label="能力分布" tooltip="配置各能力类型的题目数量">
        <Form.List name={[name, 'distribution']}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name: fieldName }) => (
                <ProForm.Group key={key}>
                  <ProFormSelect
                    width={200}
                    name={[fieldName, 'key']}
                    placeholder={subject ? '请选择能力类型' : '请先选择科目'}
                    options={abilityTypeOptions}
                    disabled={!subject}
                    rules={[{ required: true, message: '请选择能力类型' }]}
                  />
                  <ProFormDigit
                    name={[fieldName, 'value']}
                    placeholder="数量"
                    fieldProps={{ min: 0, precision: 0 }}
                    rules={[
                      { required: true, message: '请输入数量' },
                      { type: 'number', min: 0, message: '数量必须大于等于0' },
                    ]}
                  />
                  <Button danger icon={<DeleteOutlined />} onClick={() => remove(fieldName)} />
                </ProForm.Group>
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
