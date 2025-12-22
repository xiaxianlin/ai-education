import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer, ProForm, ProFormSelect, ProFormTextArea, ProFormText } from '@ant-design/pro-components';
import { QuestionApi } from '../api';
import { TextbookApi } from '@/pages/Textbook/api';
import { useConfigs } from '@/hooks';
import { useRequest } from 'ahooks';
import { message, Button, Card, Flex, Row, Col } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import { GRADES } from '@/constants/course';

// 资源类型选项
const resourceTypeOptions = {
  image: '图片',
  audio: '音频',
  '': '无',
};

export default function QuestionFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { subjectEnum, gradeEnum, questionTypeEnum, difficultyLevelEmun, question_types } = useConfigs();
  const [form] = ProForm.useForm<UpdateQuestionRequest>();

  // 获取表单实时字段值
  const selectedSubject = ProForm.useWatch('subject', form);
  const selectedGrade = ProForm.useWatch('grade', form);
  const selectedType = ProForm.useWatch('type', form);
  const selectedTextbookId = ProForm.useWatch('textbook_id', form);

  // 根据选择的科目、年级和题型动态获取子类型选项
  const subtypeOptions = useMemo(() => {
    if (!selectedSubject || !selectedGrade || !selectedType || !question_types) return {};
    const gradeData = question_types[selectedSubject]?.[Number(selectedGrade)];
    if (!gradeData) return {};
    const subtypes = gradeData[selectedType] || [];
    return subtypes.reduce((prev: Record<string, string>, curr: string) => ({ ...prev, [curr]: curr }), {});
  }, [selectedSubject, selectedGrade, selectedType, question_types]);

  // 获取所有教材列表
  const { data: textbookOptions } = useRequest(async () => {
    const res = await TextbookApi.searchTextbooks();
    return res.reduce((prev: Record<number, string>, curr) => {
      const gradeInfo = GRADES[curr.grade];
      const label = `${curr.subject} - ${curr.version} - ${gradeInfo || curr.grade}年级 - ${curr.semester}`;
      prev[curr.id] = label;
      return prev;
    }, {});
  });

  // 根据选择的教材ID获取单元列表
  const { data: unitOptions } = useRequest(
    async () => {
      if (!selectedTextbookId) return [];
      const units = await TextbookApi.getTextbookUnits(Number(selectedTextbookId));
      return units.reduce((prev: Record<number, string>, curr) => {
        prev[curr.id] = curr.name;
        return prev;
      }, {});
    },
    {
      ready: !!selectedTextbookId,
      refreshDeps: [selectedTextbookId],
    },
  );

  // 获取详情（编辑状态）
  const { data: question, loading } = useRequest(() => QuestionApi.getQuestion(id!), {
    ready: isEdit,
    onError: () => {
      message.error('加载详情失败');
      navigate(-1);
    },
  });

  const { runAsync: handleSubmit, loading: submitting } = useRequest(
    async (values: UpdateQuestionRequest) => {
      const submitData = {
        ...values,
        grade: Number(values.grade),
        textbook_id: values.textbook_id ? Number(values.textbook_id) : undefined,
        unit_id: values.unit_id ? Number(values.unit_id) : undefined,
      };
      if (isEdit) {
        await QuestionApi.updateQuestion(id!, submitData);
        message.success('更新成功');
      } else {
        await QuestionApi.createQuestion(submitData);
        message.success('创建成功');
      }
    },
    {
      manual: true,
      onSuccess: () => {
        navigate(-1);
      },
    },
  );

  useEffect(() => {
    if (question && isEdit) {
      form.setFieldsValue({
        ...question,
        grade: String(question.grade),
        textbook_id: question.textbook_id ? String(question.textbook_id) : undefined,
        unit_id: question.unit_id ? String(question.unit_id) : undefined,
      } as any);
    }
  }, [question, isEdit, form]);

  if (loading && isEdit) {
    return <PageContainer loading={loading} />;
  }

  return (
    <PageContainer
      title={
        <Flex align="center" gap={8}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ padding: 0, height: 'auto' }}
          />
          <span>{isEdit ? '编辑题目' : '新建题目'}</span>
        </Flex>
      }
    >
      <ProForm<UpdateQuestionRequest>
        form={form}
        submitter={{
          render: (props) => (
            <Flex justify="end" gap={12} style={{ marginTop: 24 }}>
              <Button onClick={() => navigate(-1)}>取消</Button>
              <Button type="primary" loading={submitting} onClick={() => props.form?.submit?.()}>
                确定
              </Button>
            </Flex>
          ),
        }}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Row gutter={24}>
          <Col span={24}>
            <Card title="基础信息" variant="borderless" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <ProFormSelect
                    name="subject"
                    label="科目"
                    valueEnum={subjectEnum}
                    rules={[{ required: true, message: '请选择科目' }]}
                  />
                </Col>
                <Col span={6}>
                  <ProFormSelect
                    name="grade"
                    label="年级"
                    valueEnum={gradeEnum}
                    rules={[{ required: true, message: '请选择年级' }]}
                  />
                </Col>
                <Col span={6}>
                  <ProFormSelect
                    name="type"
                    label="题型"
                    valueEnum={questionTypeEnum}
                    rules={[{ required: true, message: '请选择题型' }]}
                    fieldProps={{
                      onChange: () => form.setFieldsValue({ subtype: undefined }),
                    }}
                  />
                </Col>
                <Col span={6}>
                  <ProFormSelect name="subtype" label="子题型" valueEnum={subtypeOptions} />
                </Col>
                <Col span={6}>
                  <ProFormSelect name="difficulty" label="难度" valueEnum={difficultyLevelEmun} />
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="内容与资源" variant="borderless" style={{ marginBottom: 24 }}>
              <ProFormTextArea
                name="content"
                label="题目内容"
                placeholder="请输入题目内容"
                fieldProps={{ rows: 4 }}
                rules={[{ required: true, message: '请输入题目内容' }]}
              />
              <ProFormTextArea
                name="options"
                label="选项"
                placeholder="请输入选项（每行一个选项，或输入 JSON 数组格式）"
                fieldProps={{ rows: 3 }}
              />
              <ProFormTextArea
                name="answer"
                label="正确答案"
                placeholder="请输入正确答案"
                fieldProps={{ rows: 2 }}
                rules={[{ required: true, message: '请输入正确答案' }]}
              />
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={8}>
                  <ProFormSelect name="resource_type" label="资源类型" valueEnum={resourceTypeOptions} allowClear />
                </Col>
                <Col span={16}>
                  <ProFormText name="resource" label="资源路径" placeholder="请输入图片或音频地址" />
                </Col>
                <Col span={24}>
                  <ProFormTextArea
                    name="resource_content"
                    label="资源文本"
                    placeholder="请输入资源内容（如录音原文）"
                    fieldProps={{ rows: 3 }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="关联背景" variant="borderless">
              <Row gutter={16}>
                <Col span={8}>
                  <ProFormSelect
                    name="textbook_id"
                    label="所属教材"
                    valueEnum={textbookOptions}
                    fieldProps={{
                      onChange: () => form.setFieldsValue({ unit_id: undefined }),
                    }}
                  />
                </Col>
                <Col span={8}>
                  <ProFormSelect
                    name="unit_id"
                    label="所属单元"
                    valueEnum={unitOptions}
                    disabled={!selectedTextbookId}
                  />
                </Col>
                <Col span={8}>
                  <ProFormText name="knowledge" label="关联知识点" placeholder="请输入知识点名称" />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </ProForm>
    </PageContainer>
  );
}
