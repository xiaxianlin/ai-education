import { useConfigs } from '@/hooks';
import { STAGE_GRADES } from '@ai-education/shared-web';
import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Collapse, Form, Input } from 'antd';
import { useEffect, useState } from 'react';
import {
  ANSWER_OPTIONS,
  COGNITIVE_OPTIONS,
  FEEDBACK_CONFIG_EXAMPLE,
  INTERACTION_OPTIONS,
  RESOURCE_OPTIONS,
  STAGE_OPTIONS,
} from '../constants';
import { useQuestionTypeModel } from '../models/page';

export default function FormView() {
  const { subjects } = useConfigs();
  const { form, item, visible, onCancel, handleSubmit } = useQuestionTypeModel();
  const [selectedStages, setSelectedStages] = useState<Stage[]>([]);

  // 监听学段变化，自动计算可选年级
  const availableGrades = selectedStages.flatMap((stage) => STAGE_GRADES[stage] || []);

  useEffect(() => {
    if (item) {
      setSelectedStages(item.stages || []);
    } else {
      setSelectedStages([]);
    }
  }, [item]);

  const handleStagesChange = (stages: Stage[]) => {
    setSelectedStages(stages);
    // 清空不在范围内的年级
    const currentGrades = form.getFieldValue('grades') || [];
    const validGrades = currentGrades.filter((g: number) => stages.some((stage) => STAGE_GRADES[stage]?.includes(g)));
    form.setFieldValue('grades', validGrades);
  };

  return (
    <ModalForm<QuestionTypeCreateRequest>
      width={800}
      form={form}
      open={visible}
      title={item ? '编辑题型' : '新增题型'}
      onFinish={handleSubmit}
      modalProps={{ destroyOnClose: true, onCancel }}
      layout="horizontal"
      size="large"
      labelAlign="left"
      labelCol={{ span: 4 }}
      scrollToFirstError
    >
      <Collapse
        defaultActiveKey={['basic', 'scope', 'interaction', 'answer']}
        items={[
          {
            key: 'basic',
            label: '基本信息',
            children: (
              <>
                <ProFormText
                  name="code"
                  label="编码"
                  placeholder="唯一标识，如 pinyin_choice"
                  rules={[
                    { required: true, message: '请输入编码' },
                    {
                      pattern: /^[a-z][a-z0-9_]*$/,
                      message: '编码格式：小写字母开头，只能包含小写字母、数字、下划线',
                    },
                  ]}
                  disabled={!!item}
                />
                <ProFormText
                  name="name"
                  label="名称"
                  placeholder="题型名称，如 看图选拼音"
                  rules={[{ required: true, message: '请输入名称' }]}
                />
                <ProFormTextArea
                  name="description"
                  label="描述"
                  placeholder="题型描述（可选）"
                  fieldProps={{ rows: 2 }}
                />
              </>
            ),
          },
          {
            key: 'scope',
            label: '适用范围',
            children: (
              <>
                <ProFormSelect
                  name="subject"
                  label="科目"
                  placeholder="请选择科目"
                  rules={[{ required: true, message: '请选择科目' }]}
                  options={subjects?.map((s: string) => ({ value: s, label: s }))}
                />
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
                <ProFormSelect
                  name="grades"
                  label="年级"
                  mode="multiple"
                  placeholder="请选择适用年级"
                  rules={[{ required: true, message: '请选择年级' }]}
                  options={availableGrades.map((g) => ({
                    value: g,
                    label: `${g}年级`,
                  }))}
                  disabled={selectedStages.length === 0}
                />
              </>
            ),
          },
          {
            key: 'interaction',
            label: '交互配置',
            children: (
              <>
                <ProFormSelect
                  name="interactionType"
                  label="交互类型"
                  placeholder="请选择交互类型"
                  rules={[{ required: true, message: '请选择交互类型' }]}
                  options={INTERACTION_OPTIONS}
                />
                <Form.Item name="interactionConfig" label="交互配置">
                  <Input.TextArea rows={3} placeholder="JSON 格式的交互配置（可选）" />
                </Form.Item>
              </>
            ),
          },
          {
            key: 'resource',
            label: '资源配置',
            children: (
              <>
                <ProFormSelect
                  name="resourceType"
                  label="资源类型"
                  placeholder="请选择资源类型"
                  options={RESOURCE_OPTIONS}
                  initialValue="none"
                />
                <Form.Item name="resourceConfig" label="资源配置">
                  <Input.TextArea rows={3} placeholder="JSON 格式的资源配置（可选）" />
                </Form.Item>
              </>
            ),
          },
          {
            key: 'answer',
            label: '答案配置',
            children: (
              <>
                <ProFormSelect
                  name="answerType"
                  label="答案类型"
                  placeholder="请选择答案类型"
                  rules={[{ required: true, message: '请选择答案类型' }]}
                  options={ANSWER_OPTIONS}
                />
                <Form.Item name="answerConfig" label="答案配置">
                  <Input.TextArea rows={3} placeholder="JSON 格式的答案配置（可选）" />
                </Form.Item>
              </>
            ),
          },
          {
            key: 'feedback',
            label: '反馈配置',
            children: (
              <Form.Item name="feedbackConfig" label="反馈配置">
                <Input.TextArea
                  rows={4}
                  placeholder={`JSON 格式的反馈配置，示例：\n${JSON.stringify(FEEDBACK_CONFIG_EXAMPLE, null, 2)}`}
                />
              </Form.Item>
            ),
          },
          {
            key: 'cognitive',
            label: '认知配置',
            children: (
              <>
                <ProFormSelect
                  name="cognitiveLevels"
                  label="认知层次"
                  mode="multiple"
                  placeholder="请选择认知层次"
                  options={COGNITIVE_OPTIONS}
                />
                <ProFormSelect name="abilityDimensions" label="能力维度" mode="tags" placeholder="输入能力维度标签" />
              </>
            ),
          },
          {
            key: 'ai',
            label: 'AI 配置',
            children: (
              <ProFormTextArea
                name="aiPrompt"
                label="AI 指令"
                placeholder="用于生成该题型题目的 AI 指令"
                fieldProps={{ rows: 6 }}
              />
            ),
          },
          {
            key: 'other',
            label: '其他设置',
            children: (
              <>
                <ProFormDigit name="sortOrder" label="排序" placeholder="排序值" initialValue={0} min={0} />
                {item && <ProFormSwitch name="isActive" label="启用状态" initialValue={true} />}
              </>
            ),
          },
        ]}
      />
    </ModalForm>
  );
}
