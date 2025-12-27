import {
  PageContainer,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Card, Collapse, Flex, Form, Input } from 'antd';
import {
  ANSWER_OPTIONS,
  COGNITIVE_OPTIONS,
  FEEDBACK_CONFIG_EXAMPLE,
  INTERACTION_OPTIONS,
  RESOURCE_OPTIONS,
  STAGE_OPTIONS,
} from '../../constants';
import { useQuestionTypeFormModel } from '../models/page';

export default function MainView() {
  const {
    form,
    isEdit,
    navigate,
    subjects,
    selectedStages,
    availableGrades,
    fetchingDetails,
    submitting,
    handleStagesChange,
    handleSubmit,
  } = useQuestionTypeFormModel();

  return (
    <PageContainer
      title={isEdit ? '编辑题型' : '新增题型'}
      header={{
        onBack: () => navigate('/question_type'),
        breadcrumb: {},
      }}
    >
      <Card loading={fetchingDetails}>
        <Form
          form={form}
          layout="horizontal"
          size="large"
          labelAlign="left"
          labelCol={{ span: 4 }}
          onFinish={handleSubmit}
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
                      disabled={isEdit}
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
                    <Form.Item
                      name="interactionConfig"
                      label="交互配置"
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            try {
                              JSON.parse(value);
                              return Promise.resolve();
                            } catch (e) {
                              return Promise.reject('请输入有效的 JSON');
                            }
                          },
                        },
                      ]}
                    >
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
                    <Form.Item
                      name="resourceConfig"
                      label="资源配置"
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            try {
                              JSON.parse(value);
                              return Promise.resolve();
                            } catch (e) {
                              return Promise.reject('请输入有效的 JSON');
                            }
                          },
                        },
                      ]}
                    >
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
                    <Form.Item
                      name="answerConfig"
                      label="答案配置"
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            try {
                              JSON.parse(value);
                              return Promise.resolve();
                            } catch (e) {
                              return Promise.reject('请输入有效的 JSON');
                            }
                          },
                        },
                      ]}
                    >
                      <Input.TextArea rows={3} placeholder="JSON 格式的答案配置（可选）" />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'feedback',
                label: '反馈配置',
                children: (
                  <Form.Item
                    name="feedbackConfig"
                    label="反馈配置"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          try {
                            JSON.parse(value);
                            return Promise.resolve();
                          } catch (e) {
                            return Promise.reject('请输入有效的 JSON');
                          }
                        },
                      },
                    ]}
                  >
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
                    <ProFormSelect
                      name="abilityDimensions"
                      label="能力维度"
                      mode="tags"
                      placeholder="输入能力维度标签"
                    />
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
                    <ProFormSwitch name="isActive" label="启用状态" initialValue={true} />
                  </>
                ),
              },
            ]}
          />
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Flex justify="center" gap={16}>
              <Button size="large" onClick={() => navigate('/question_type')}>
                取消
              </Button>
              <Button type="primary" size="large" htmlType="submit" loading={submitting}>
                提交
              </Button>
            </Flex>
          </div>
        </Form>
      </Card>
    </PageContainer>
  );
}

