import { INTERACTION_TYPE_LABELS } from '@ai-education/shared-web';
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Collapse, Divider, Form, Input, Select, Space } from 'antd';
import { useQuestionFormModel } from '../models/page';

const { TextArea } = Input;

// 选项编辑器
const OptionEditor: React.FC<{
  value?: Array<{ id: string; text: string; isCorrect: boolean }>;
  onChange?: (value: Array<{ id: string; text: string; isCorrect: boolean }>) => void;
  interactionType?: InteractionType;
}> = ({ value = [], onChange, interactionType }) => {
  const isMultiChoice = interactionType === 'multi_choice';

  const addOption = () => {
    const newOption = {
      id: `opt_${Date.now()}`,
      text: '',
      isCorrect: false,
    };
    onChange?.([...value, newOption]);
  };

  const updateOption = (index: number, field: string, fieldValue: string | boolean) => {
    const newOptions = [...value];
    if (field === 'isCorrect' && !isMultiChoice) {
      // 单选：取消其他选项的正确状态
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index && fieldValue === true;
      });
    } else {
      (newOptions[index] as Record<string, unknown>)[field] = fieldValue;
    }
    onChange?.(newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = value.filter((_, i) => i !== index);
    onChange?.(newOptions);
  };

  const moveOption = (index: number, direction: 'up' | 'down') => {
    const newOptions = [...value];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOptions.length) return;
    [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
    onChange?.(newOptions);
  };

  return (
    <div className="space-y-2">
      {value.map((opt, idx) => (
        <div key={opt.id} className="flex items-center gap-2">
          <span className="font-medium w-6">{String.fromCharCode(65 + idx)}.</span>
          <Input
            value={opt.text}
            onChange={(e) => updateOption(idx, 'text', e.target.value)}
            placeholder="选项内容"
            className="flex-1"
          />
          <Button
            type={opt.isCorrect ? 'primary' : 'default'}
            size="small"
            onClick={() => updateOption(idx, 'isCorrect', !opt.isCorrect)}
          >
            {opt.isCorrect ? '✓ 正确' : '设为正确'}
          </Button>
          <Button size="small" icon={<ArrowUpOutlined />} disabled={idx === 0} onClick={() => moveOption(idx, 'up')} />
          <Button
            size="small"
            icon={<ArrowDownOutlined />}
            disabled={idx === value.length - 1}
            onClick={() => moveOption(idx, 'down')}
          />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeOption(idx)} />
        </div>
      ))}
      <Button type="dashed" onClick={addOption} icon={<PlusOutlined />} block>
        添加选项
      </Button>
    </div>
  );
};

// 子题编辑器
const SubQuestionEditor: React.FC<{
  value?: Array<Record<string, unknown>>;
  onChange?: (value: Array<Record<string, unknown>>) => void;
}> = ({ value = [], onChange }) => {
  const addSubQuestion = () => {
    const newSub = {
      id: `sub_${Date.now()}`,
      order: value.length + 1,
      stem: { text: '' },
      interactionType: 'single_choice',
      options: [],
      answer: { type: 'exact', correctAnswers: [], scoring: { fullScore: 5 } },
    };
    onChange?.([...value, newSub]);
  };

  const updateSubQuestion = (index: number, field: string, fieldValue: unknown) => {
    const newSubs = [...value];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (newSubs[index][parent] as Record<string, unknown>)[child] = fieldValue;
    } else {
      newSubs[index][field] = fieldValue;
    }
    onChange?.(newSubs);
  };

  const removeSubQuestion = (index: number) => {
    const newSubs = value.filter((_, i) => i !== index);
    // 重新排序
    newSubs.forEach((sub, i) => {
      sub.order = i + 1;
    });
    onChange?.(newSubs);
  };

  return (
    <div className="space-y-4">
      {value.map((sub, idx) => (
        <Card
          key={sub.id as string}
          size="small"
          title={`第 ${idx + 1} 小题`}
          extra={
            <Button danger size="small" icon={<DeleteOutlined />} onClick={() => removeSubQuestion(idx)}>
              删除
            </Button>
          }
        >
          <Form.Item label="题干">
            <TextArea
              value={(sub.stem as Record<string, string>)?.text || ''}
              onChange={(e) => updateSubQuestion(idx, 'stem.text', e.target.value)}
              rows={2}
              placeholder="子题题干"
            />
          </Form.Item>
          <Form.Item label="交互类型">
            <Select
              value={sub.interactionType as string}
              onChange={(v) => updateSubQuestion(idx, 'interactionType', v)}
              options={Object.entries(INTERACTION_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item label="选项">
            <OptionEditor
              value={sub.options as Array<{ id: string; text: string; isCorrect: boolean }>}
              onChange={(v) => updateSubQuestion(idx, 'options', v)}
              interactionType={sub.interactionType as InteractionType}
            />
          </Form.Item>
          <Form.Item label="分值">
            <Input
              type="number"
              value={((sub.answer as Record<string, unknown>)?.scoring as Record<string, number>)?.fullScore || 5}
              onChange={(e) => {
                const answer = { ...(sub.answer as Record<string, unknown>) };
                answer.scoring = {
                  ...(answer.scoring as Record<string, number>),
                  fullScore: Number(e.target.value),
                };
                updateSubQuestion(idx, 'answer', answer);
              }}
              style={{ width: 100 }}
              min={1}
            />
          </Form.Item>
        </Card>
      ))}
      <Button type="dashed" onClick={addSubQuestion} icon={<PlusOutlined />} block>
        添加子题
      </Button>
    </div>
  );
};

export default function MainView() {
  const {
    form,
    isEdit,
    navigate,
    subjects,
    loading,
    selectedType,
    isComposite,
    setIsComposite,
    filteredTypes,
    handleTypeChange,
    handleSubmit,
  } = useQuestionFormModel();

  return (
    <PageContainer
      title={isEdit ? '编辑题目' : '新建题目'}
      header={{ breadcrumb: {} }}
      onBack={() => navigate('/question')}
    >
      <Card loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            options: [
              { id: 'A', text: '', isCorrect: false },
              { id: 'B', text: '', isCorrect: false },
              { id: 'C', text: '', isCorrect: false },
              { id: 'D', text: '', isCorrect: false },
            ],
          }}
        >
          <Collapse
            defaultActiveKey={['basic', 'content', 'answer']}
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <Space direction="vertical" className="w-full" size="middle">
                    <Space size="large">
                      <Form.Item name="subject" label="科目" rules={[{ required: true }]}>
                        <Select
                          placeholder="选择科目"
                          style={{ width: 120 }}
                          options={subjects?.map((s: string) => ({
                            value: s,
                            label: s,
                          }))}
                        />
                      </Form.Item>
                      <Form.Item name="grade" label="年级" rules={[{ required: true }]}>
                        <Select
                          placeholder="选择年级"
                          style={{ width: 120 }}
                          options={Array.from({ length: 12 }, (_, i) => ({
                            value: i + 1,
                            label: `${i + 1}年级`,
                          }))}
                        />
                      </Form.Item>
                      <Form.Item name="questionTypeCode" label="题型" rules={[{ required: true }]}>
                        <Select
                          placeholder="选择题型"
                          style={{ width: 200 }}
                          onChange={handleTypeChange}
                          options={filteredTypes.map((t) => ({
                            value: t.code,
                            label: t.name,
                          }))}
                          showSearch
                          optionFilterProp="label"
                        />
                      </Form.Item>
                      <Form.Item name="abilityCode" label="能力代码">
                        <Input placeholder="能力代码（可选）" style={{ width: 200 }} />
                      </Form.Item>
                    </Space>
                    <Space size="large">{/* TODO: difficulty, cognitiveLevel, knowledgePoints 字段已删除 */}</Space>
                  </Space>
                ),
              },
              {
                key: 'content',
                label: '题目内容',
                children: (
                  <>
                    <Form.Item
                      name="stemText"
                      label="题干（纯文本）"
                      rules={[{ required: true, message: '请输入题干' }]}
                    >
                      <TextArea rows={3} placeholder="输入题干内容" />
                    </Form.Item>
                    <Form.Item name="stemRichText" label="题干（富文本，可选）">
                      <TextArea rows={3} placeholder="HTML 格式的富文本题干（可选）" />
                    </Form.Item>

                    <Divider />

                    <div className="mb-4">
                      <Button type={isComposite ? 'primary' : 'default'} onClick={() => setIsComposite(!isComposite)}>
                        {isComposite ? '✓ 复合题模式' : '切换为复合题'}
                      </Button>
                      <span className="ml-2 text-gray-500">复合题包含多个子题，每个子题可以有不同的交互类型</span>
                    </div>

                    {isComposite ? (
                      <Form.Item name="subQuestions" label="子题列表">
                        <SubQuestionEditor />
                      </Form.Item>
                    ) : (
                      <Form.Item
                        name="options"
                        label="选项"
                        rules={[
                          {
                            validator: (_, value) => {
                              if (
                                selectedType?.media_context?.types?.includes('single_choice') ||
                                selectedType?.media_context?.types?.includes('multi_choice')
                              ) {
                                if (!value || value.length < 2) {
                                  return Promise.reject('至少需要2个选项');
                                }
                                const hasCorrect = value.some((o: { is_correct: boolean }) => o.is_correct);
                                if (!hasCorrect) {
                                  return Promise.reject('请设置正确答案');
                                }
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <OptionEditor interactionType={selectedType?.media_context?.types?.[0] as InteractionType} />
                      </Form.Item>
                    )}
                  </>
                ),
              },
              {
                key: 'answer',
                label: '解析与知识点',
                children: (
                  <>
                    <Form.Item name="explanation" label="题目解析">
                      <TextArea rows={4} placeholder="输入题目解析" />
                    </Form.Item>
                    {/* TODO: knowledgePoints 字段已删除 */}
                  </>
                ),
              },
            ]}
          />

          <div className="mt-6 flex justify-end gap-4">
            <Button onClick={() => navigate('/question')}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? '更新' : '创建'}
            </Button>
          </div>
        </Form>
      </Card>
    </PageContainer>
  );
}
