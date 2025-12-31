import { DIFFICULTY_LABELS, GRADES } from '@ai-education/shared-web';
import { ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Col, Row } from 'antd';
import { STAGE_OPTIONS } from '../../constants';
import { useQuestionTypeFormModel } from '../models/page';

export function BaseForm() {
  const { subjects, availableGrades, handleStagesChange } = useQuestionTypeFormModel();

  return (
    <>
      <Row gutter={16}>
        <Col span={8}>
          <ProFormText
            required
            name="code"
            label="编码"
            placeholder="唯一标识，如 pinyin_choice"
            rules={[
              {
                pattern: /^[A-Z][A-Z0-9_]*$/,
                message: '编码格式：大写字母开头，只能包含大写字母、数字、下划线',
              },
            ]}
          />
        </Col>
        <Col span={8}>
          <ProFormText
            name="name"
            label="名称"
            placeholder="题型名称，如 看图选拼音"
            rules={[{ required: true, message: '请输入名称' }]}
          />
        </Col>
        <Col span={8}>
          <ProFormSelect
            name="difficulty"
            label="难度"
            placeholder="请选择难度"
            options={Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            rules={[{ required: true, message: '请选择难度' }]}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <ProFormSelect
            name="subject"
            label="科目"
            placeholder="请选择科目"
            rules={[{ required: true, message: '请选择科目' }]}
            options={subjects?.map((s: string) => ({ value: s, label: s }))}
          />
        </Col>
        <Col span={8}>
          <ProFormSelect
            name="stages"
            label="学段"
            mode="multiple"
            placeholder="请选择适用学段"
            rules={[{ required: true, message: '请选择学段' }]}
            options={STAGE_OPTIONS}
            fieldProps={{
              onChange: handleStagesChange,
            }}
          />
        </Col>
        <Col span={8}>
          <ProFormSelect
            name="grades"
            label="年级"
            mode="multiple"
            placeholder="请选择适用年级"
            rules={[{ required: true, message: '请选择年级' }]}
            options={availableGrades.map((g) => ({
              value: g,
              label: GRADES[g],
            }))}
            disabled={availableGrades.length === 0}
          />
        </Col>
      </Row>

      <ProFormTextArea
        name="description"
        label="描述"
        placeholder="题型描述（可选）"
        fieldProps={{ rows: 2 }}
        rules={[{ required: true, message: '请输入描述' }]}
      />
    </>
  );
}
