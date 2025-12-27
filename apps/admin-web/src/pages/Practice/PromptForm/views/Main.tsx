import { SCENE_TYPE_OPTIONS, STAGE_OPTIONS } from '@ai-education/shared-web';
import {
  PageContainer,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Card, Collapse, Flex, Form, Input } from 'antd';
import { usePromptFormModel } from '../models/page';

export default function MainView() {
  const {
    form,
    isEdit,
    navigate,
    subjects,
    selectedStages,
    availableGrades,
    specialtyOptions,
    practiceOptions,
    fetchingDetails,
    submitting,
    handleStagesChange,
    handleSubjectChange,
    handleSubmit,
  } = usePromptFormModel();

  return (
    <PageContainer
      title={isEdit ? '编辑提示词配置' : '新建提示词配置'}
      header={{
        onBack: () => navigate('/practice/prompt'),
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
            defaultActiveKey={['basic', 'scope', 'relation', 'config']}
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <>
                    <ProFormText
                      name="name"
                      label="名称"
                      placeholder="配置名称"
                      rules={[{ required: true, message: '请输入名称' }]}
                    />
                    <ProFormText
                      name="code"
                      label="编码"
                      placeholder="唯一编码，如 math_grade1_addition"
                      rules={
                        isEdit
                          ? []
                          : [
                              {
                                pattern: /^[a-z][a-z0-9_]*$/,
                                message: '编码格式：小写字母开头，只能包含小写字母、数字、下划线',
                              },
                            ]
                      }
                      disabled={isEdit}
                    />
                    <ProFormTextArea name="description" label="描述" placeholder="配置描述" fieldProps={{ rows: 2 }} />
                  </>
                ),
              },
              {
                key: 'scene',
                label: '场景分类',
                children: (
                  <>
                    <ProFormSelect
                      name="scene_type"
                      label="场景类型"
                      placeholder="请选择场景类型"
                      options={SCENE_TYPE_OPTIONS}
                    />
                    <ProFormSelect
                      name="specialty_type"
                      label="专项类型"
                      placeholder="请选择专项类型"
                      options={specialtyOptions}
                      disabled={!specialtyOptions.length}
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
                      fieldProps={{
                        onChange: handleSubjectChange,
                      }}
                    />
                    <ProFormSelect
                      name="stages"
                      label="学段"
                      mode="multiple"
                      placeholder="请选择适用学段"
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
                      options={availableGrades.map((g) => ({
                        value: g,
                        label: `${g}年级`,
                      }))}
                      disabled={selectedStages.length === 0}
                    />
                    <ProFormSelect
                      name="semesters"
                      label="学期"
                      mode="multiple"
                      placeholder="请选择适用学期"
                      options={[
                        { label: '上学期', value: '上' },
                        { label: '下学期', value: '下' },
                      ]}
                    />
                  </>
                ),
              },
              {
                key: 'relation',
                label: '关联配置',
                children: (
                  <ProFormSelect
                    name="practice_id"
                    label="关联练习"
                    placeholder="请选择关联的练习"
                    options={practiceOptions}
                    fieldProps={{
                      showSearch: true,
                      filterOption: (input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                    }}
                  />
                ),
              },
              {
                key: 'config',
                label: '高级配置',
                children: (
                  <>
                    <Form.Item
                      name="question_type_configs"
                      label="题型配置"
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
                        placeholder='[{"question_type_code": "single_choice", "count": 5, "difficulty": "easy"}]'
                      />
                    </Form.Item>
                    <Form.Item
                      name="difficulty_config"
                      label="难度配置"
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
                        rows={3}
                        placeholder='{"level": "basic", "distribution": {"easy": 6, "medium": 3, "hard": 1}}'
                      />
                    </Form.Item>
                    <Form.Item
                      name="question_count_config"
                      label="题量配置"
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
                      <Input.TextArea rows={3} placeholder='{"total": 10, "time_limit_minutes": 15}' />
                    </Form.Item>
                    <Form.Item
                      name="template_variables"
                      label="模板变量"
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
                        placeholder='[{"key": "topic", "name": "主题", "type": "input", "required": true}]'
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
                    <ProFormDigit name="sort_order" label="排序" placeholder="排序值" initialValue={0} min={0} />
                    <ProFormSwitch name="is_active" label="启用状态" initialValue={true} />
                  </>
                ),
              },
            ]}
          />
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Flex justify="center" gap={16}>
              <Button size="large" onClick={() => navigate('/practice/prompt')}>
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
