import { useConfigs } from '@/hooks';
import { Form, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subjects } = useConfigs();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [selectedType, setSelectedType] = useState<QuestionType>();
  const [isComposite, setIsComposite] = useState(false);

  const isEdit = Boolean(id);

  // 加载题型列表
  useEffect(() => {
    QuestionApi.searchQuestionTypes({ page: 1, size: 1000 }).then((res) => {
      setQuestionTypes(res?.data || []);
    });
  }, []);

  // 编辑模式：加载题目数据
  useEffect(() => {
    if (id) {
      setLoading(true);
      QuestionApi.getQuestion(id)
        .then((question) => {
          // 从 content 字段提取数据
          const content = question.content || {};
          const stem = content.stem || '';
          const stemText = typeof stem === 'string' ? stem : (stem as Stem)?.text || '';
          const stemRichText = typeof stem === 'object' ? (stem as Stem)?.rich_text : undefined;

          // 转换数据格式
          form.setFieldsValue({
            subject: question.subject,
            grade: question.grade,
            questionTypeCode: question.question_type_code,
            abilityCode: question.ability_code,
            stemText,
            stemRichText,
            options: content.options,
            subQuestions: content.sub_questions,
            explanation: question.explanation,
          });
          setIsComposite((content.sub_questions?.length || 0) > 0);

          // 设置选中的题型
          const type = questionTypes.find((t) => t.code === question.question_type_code);
          setSelectedType(type);
        })
        .finally(() => setLoading(false));
    }
  }, [id, questionTypes, form]);

  // 题型变化时更新题型编码
  const handleTypeChange = (typeCode: string) => {
    const type = questionTypes.find((t) => t.code === typeCode);
    setSelectedType(type);
    if (type) {
      form.setFieldValue('questionTypeCode', type.code);
    }
  };

  // 提交表单
  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      const grade = values.grade as number;

      // 构建答案
      let answer: Record<string, unknown>;
      if (isComposite) {
        answer = {
          type: 'composite',
          scoring: {
            fullScore: (values.subQuestions as Array<Record<string, unknown>>)?.reduce(
              (sum, sub) =>
                sum + (((sub.answer as Record<string, unknown>)?.scoring as Record<string, number>)?.fullScore || 5),
              0,
            ),
            partialStrategy: 'sum',
          },
        };
      } else {
        const correctAnswers = (values.options as Array<{ id: string; isCorrect: boolean }>)
          ?.filter((o) => o.isCorrect)
          .map((o) => o.id);
        answer = {
          type: 'exact',
          correct_answers: correctAnswers,
          scoring: { full_score: 10 },
        };
      }

      // 构建 content 结构
      const content: QuestionCreateRequest['content'] = {
        stem: values.stemRichText
          ? {
              text: values.stemText as string,
              rich_text: values.stemRichText as string,
            }
          : (values.stemText as string),
        options: isComposite ? undefined : (values.options as QuestionOption[]),
        sub_questions: isComposite ? (values.subQuestions as Array<Record<string, unknown>>) : undefined,
      };

      const data: QuestionCreateRequest = {
        question_type_code: (values.questionTypeCode as string) || selectedType?.code || '',
        subject: values.subject as string,
        grade,
        ability_code: values.abilityCode as string | undefined,
        content,
        answer: answer as any as Answer,
        explanation: values.explanation as string,
      };

      if (isEdit && id) {
        await QuestionApi.updateQuestion(id, data);
        message.success('更新成功');
      } else {
        await QuestionApi.createQuestion(data);
        message.success('创建成功');
      }
      navigate('/question');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 根据科目和年级筛选题型
  const subject = Form.useWatch('subject', form);
  const grade = Form.useWatch('grade', form);
  const filteredTypes = questionTypes.filter((t) => {
    if (subject && t.subject !== subject) return false;
    // 根据 grade_band 筛选：Low(1-3), Mid(4-6), High(7-12)
    if (grade) {
      const gradeBand = grade <= 3 ? 'Low' : grade <= 6 ? 'Mid' : 'High';
      if (t.grade_band && t.grade_band !== gradeBand) return false;
    }
    return true;
  });

  return {
    form,
    isEdit,
    id,
    navigate,
    subjects,
    loading,
    questionTypes,
    selectedType,
    isComposite,
    setIsComposite,
    filteredTypes,
    handleTypeChange,
    handleSubmit,
  };
};

export const QuestionFormModel = createContainer(useContainer);
export const useQuestionFormModel = QuestionFormModel.useContainer;
