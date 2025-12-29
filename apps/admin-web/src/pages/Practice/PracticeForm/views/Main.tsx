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
import { usePracticeFormModel } from '../models/page';

const TYPE_OPTIONS = [
  { label: '系统', value: 'system' },
  { label: '自定义', value: 'custom' },
];

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
            defaultActiveKey={['basic', 'scope', 'config']}
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
                      rules={
                        isEdit
                          ? []
                          : [
                              { required: true, message: '请输入标识' },
                              {
                                pattern: /^[a-z][a-z0-9_]*$/,
                                message: '标识格式：小写字母开头，只能包含小写字母、数字、下划线',
                              },
                            ]
                      }
                      disabled={isEdit}
                    />
                    <ProFormSelect
                      name="type"
                      label="类型"
                      placeholder="请选择类型"
                      rules={[{ required: true, message: '请选择类型' }]}
                      options={TYPE_OPTIONS}
                      disabled={isEdit}
                    />
                    <ProFormSelect
                      name="scene_type"
                      label="场景类型"
                      placeholder="请选择场景类型"
                      options={SCENE_TYPE_OPTIONS}
                    />
                    <ProFormText name="icon" label="图标" placeholder="图标 emoji 或 URL" />
                    <ProFormTextArea name="description" label="描述" placeholder="练习描述" fieldProps={{ rows: 2 }} />
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
                      options={subjects?.map((s: string) => ({ value: s, label: s }))}
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
                    <ProFormTextArea
                      name="prompt"
                      label="提示词模板"
                      placeholder="请输入提示词模板内容"
                      fieldProps={{ rows: 8 }}
                    />
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
