import { ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Card, Col, Row } from 'antd';
import { useQuestionTypeFormModel } from '../models/page';

export function AbilityForm() {
  const { subjects } = useQuestionTypeFormModel();

  return (
    <>
      {/* 基本信息 */}
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
            placeholder="请选择科目（可选）"
            options={subjects?.map((s: string) => ({ value: s, label: s }))}
          />
        </Col>
      </Row>
      <Row gutter={16}>
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

      {/* 配置信息 */}
      <div className="grid grid-cols-1 gap-4" style={{ marginTop: 24 }}>
        <Card title="媒体配置 (media_context)">
          <ProFormTextArea
            name="mediaContext"
            label="媒体配置 JSON"
            placeholder='{"types": ["text", "image"], "configs": {}}'
            fieldProps={{ rows: 6 }}
            extra="定义支持的媒体类型(文本/图片/音视频)及其配置"
          />
        </Card>
        <Card title="脚手架配置 (scaffolding_config)">
          <ProFormTextArea
            name="scaffoldingConfig"
            label="脚手架配置 JSON"
            placeholder='{"mode": "single", "hints": [], "templates": []}'
            fieldProps={{ rows: 6 }}
            extra="定义脚手架模式(单/多选)与交互工具(提示/模板)"
          />
        </Card>
        <Card title="评估配置 (evaluation_config)">
          <ProFormTextArea
            name="evaluationConfig"
            label="评估配置 JSON"
            placeholder='{"mode": "auto_match", "correct_answer": null, "rubrics": []}'
            fieldProps={{ rows: 6 }}
            extra="聚合评估模式(auto_match/ai_analysis)、正确答案参考及评分量表"
          />
        </Card>
      </div>

      {/* AI 生成指令 */}
      <div style={{ marginTop: 24 }}>
        <ProFormTextArea
          name="prompt"
          label="AI 生成指令"
          placeholder="用于生成该题型题目的 AI 指令"
          fieldProps={{ rows: 26 }}
        />
      </div>
    </>
  );
}
