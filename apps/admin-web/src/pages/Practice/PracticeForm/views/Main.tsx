import { getSpecialtyOptions, STAGE_OPTIONS } from '@ai-education/shared-web';
import { PageContainer, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Button, Card, Collapse, Flex, Form, Input } from 'antd';
import { usePracticeFormModel } from '../models/page';

export default function MainView() {
  const {
    form,
    isEdit,
    navigate,
    subjects,
    availableGrades,
    fetchingDetails,
    submitting,
    handleStagesChange,
    handleSubmit,
  } = usePracticeFormModel();

  return (
    <PageContainer
      title={isEdit ? '编辑练习' : '新建练习'}
      header={{
        onBack: () => navigate('/practice'),
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
            defaultActiveKey={['basic', 'prompt']}
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <>
                    <ProFormText
                      name="name"
                      label="名称"
                      placeholder="练习名称"
                      rules={[{ required: true, message: '请输入名称' }]}
                    />
                    <ProFormText
                      name="slug"
                      label="标识"
                      placeholder="唯一标识，如 daily_practice"
                      rules={[
                        { required: true, message: '请输入标识' },
                        {
                          pattern: /^[a-z][a-z0-9_]*$/,
                          message: '标识格式：小写字母开头，只能包含小写字母、数字、下划线',
                        },
                      ]}
                    />
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
                      options={STAGE_OPTIONS}
                      fieldProps={{ onChange: handleStagesChange }}
                      rules={[{ required: true, message: '请选择学段' }]}
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
                      rules={[{ required: true, message: '请选择年级' }]}
                    />
                    <ProFormSelect
                      name="specialty_type"
                      label="专项类型"
                      placeholder="请先选择科目，再选择专项类型"
                      options={form.getFieldValue('subject') ? getSpecialtyOptions(form.getFieldValue('subject')) : []}
                    />
                    <ProFormText
                      name="icon"
                      label="图标"
                      placeholder="图标 emoji 或 URL"
                      rules={[{ required: true, message: '请输入图标' }]}
                    />
                    <ProFormTextArea
                      name="description"
                      label="描述"
                      placeholder="练习描述"
                      fieldProps={{ rows: 2 }}
                      rules={[{ required: true, message: '请输入描述' }]}
                    />
                  </>
                ),
              },
              {
                key: 'prompt',
                label: '提示词',
                children: (
                  <>
                    <ProFormTextArea
                      name="prompt"
                      label="提示词模板"
                      placeholder="请输入提示词模板内容"
                      fieldProps={{ rows: 26 }}
                      rules={[{ required: true, message: '请输入提示词模板内容' }]}
                    />
                  </>
                ),
              },
              {
                key: 'config',
                label: '配置',
                children: (
                  <>
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
                      <Input.TextArea
                        rows={3}
                        placeholder='{"total": 10, "per_group": 5, "max_groups": 3, "time_limit_minutes": 15}'
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
                        placeholder='{"level": "basic", "target_accuracy": 0.8, "distribution": {"easy": 6, "medium": 3, "hard": 1}}'
                      />
                    </Form.Item>
                    <Form.Item
                      name="ability_config"
                      label="能力配置"
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
                      <Input.TextArea rows={3} placeholder='{"cognitive_levels": ["remember", "understand"]}' />
                    </Form.Item>
                    <Form.Item
                      name="feedback_config"
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
                        rows={3}
                        placeholder='{"instant_feedback": true, "show_explanation": true, "gamification": {"enable_points": true}}'
                      />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Flex justify="center" gap={16}>
              <Button size="large" onClick={() => navigate('/practice')}>
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
