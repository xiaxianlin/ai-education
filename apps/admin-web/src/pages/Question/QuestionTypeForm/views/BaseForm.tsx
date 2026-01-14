import { ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Col, Row } from 'antd';
import { useQuestionTypeFormModel } from '../models/page';

export function BaseForm() {
  const { subjects } = useQuestionTypeFormModel();

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
                pattern: /^[a-z][a-z0-9_]*$/,
                message: '编码格式：小写字母开头，只能包含小写字母、数字、下划线',
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
            name="subject"
            label="科目"
            placeholder="请选择科目"
            rules={[{ required: true, message: '请选择科目' }]}
            options={subjects?.map((s: string) => ({ value: s, label: s }))}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <ProFormSelect
            name="category"
            label="题型分类"
            placeholder="请选择题型分类"
            rules={[{ required: true, message: '请选择题型分类' }]}
            options={[
              { value: 'ability_practice', label: '能力练习' },
              { value: 'unit_practice', label: '单元练习' },
            ]}
          />
        </Col>
        <Col span={8}>
          <ProFormSelect
            name="gradeBand"
            label="学段"
            placeholder="请选择学段（可选）"
            options={[
              { value: 'Low', label: '低年级 (1-3)' },
              { value: 'Mid', label: '中年级 (4-6)' },
              { value: 'High', label: '高年级 (7-12)' },
            ]}
          />
        </Col>
        <Col span={8}>
          <ProFormText
            name="abilityCode"
            label="能力代码"
            placeholder="关联能力代码（可选）"
          />
        </Col>
      </Row>

      <ProFormTextArea
        name="description"
        label="描述"
        placeholder="题型描述（可选）"
        fieldProps={{ rows: 2 }}
      />
    </>
  );
}
