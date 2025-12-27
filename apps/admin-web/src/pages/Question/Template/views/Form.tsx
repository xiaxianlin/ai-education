import { ModalForm, ProFormSelect, ProFormSwitch, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Collapse, Form, Input } from 'antd';
import { OUTPUT_SCHEMA_EXAMPLE, VARIABLES_EXAMPLE } from '../constants';
import { useQuestionTemplateModel } from '../models/page';

export default function FormView() {
  const { form, item, visible, onCancel, handleSubmit, questionTypes } = useQuestionTemplateModel();

  return (
    <ModalForm<QuestionTemplateCreateRequest>
      width={900}
      form={form}
      open={visible}
      title={item ? '编辑题目模板' : '新增题目模板'}
      onFinish={handleSubmit}
      modalProps={{ destroyOnClose: true, onCancel }}
      layout="horizontal"
      size="large"
      labelAlign="left"
      labelCol={{ span: 4 }}
      scrollToFirstError
    >
      <Collapse
        defaultActiveKey={['basic', 'prompt']}
        items={[
          {
            key: 'basic',
            label: '基本信息',
            children: (
              <>
                <ProFormText
                  name="name"
                  label="模板名称"
                  placeholder="请输入模板名称"
                  rules={[{ required: true, message: '请输入名称' }]}
                />
                <ProFormSelect
                  name="questionTypeId"
                  label="关联题型"
                  placeholder="请选择关联题型"
                  rules={[{ required: true, message: '请选择关联题型' }]}
                  options={questionTypes?.map((t) => ({ value: t.id, label: t.name }))}
                />
                <ProFormTextArea
                  name="description"
                  label="模板描述"
                  placeholder="模板描述（可选）"
                  fieldProps={{ rows: 2 }}
                />
              </>
            ),
          },
          {
            key: 'prompt',
            label: 'AI 提示词配置',
            children: (
              <>
                <ProFormTextArea
                  name="systemPrompt"
                  label="System Prompt"
                  placeholder="系统级提示词，定义 AI 的角色和全局规则"
                  fieldProps={{ rows: 6 }}
                />
                <ProFormTextArea
                  name="userPromptTemplate"
                  label="User Prompt"
                  placeholder="用户级提示词模板，可包含 {{variable}} 占位符"
                  fieldProps={{ rows: 8 }}
                />
              </>
            ),
          },
          {
            key: 'config',
            label: '变量与结构配置',
            children: (
              <>
                <Form.Item name="variables" label="变量定义">
                  <Input.TextArea
                    rows={6}
                    placeholder={`JSON 格式的变量定义，示例：\n${JSON.stringify(VARIABLES_EXAMPLE, null, 2)}`}
                  />
                </Form.Item>
                <Form.Item name="outputSchema" label="输出结构">
                  <Input.TextArea
                    rows={8}
                    placeholder={`JSON Schema 格式的输出要求，示例：\n${JSON.stringify(OUTPUT_SCHEMA_EXAMPLE, null, 2)}`}
                  />
                </Form.Item>
              </>
            ),
          },
          {
            key: 'other',
            label: '其他设置',
            children: (
              <>
                <ProFormSwitch name="isActive" label="启用状态" initialValue={true} />
              </>
            ),
          },
        ]}
      />
    </ModalForm>
  );
}
