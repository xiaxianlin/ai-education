import { useConfigs } from '@/hooks';
import { gradeToStage } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
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
    QuestionApi.listAllQuestionTypes().then(setQuestionTypes);
  }, []);

  // 编辑模式：加载题目数据
  useEffect(() => {
    if (id) {
      setLoading(true);
      QuestionApi.getQuestion(id)
        .then((question) => {
          // 转换数据格式
          form.setFieldsValue({
            subject: question.subject,
            grade: question.grade,
            questionTypeId: question.question_type_id,
            stemText: question.stem.text,
            stemRichText: question.stem.rich_text,
            options: question.options,
            subQuestions: question.stem.sub_questions,
            difficulty: question.difficulty,
            cognitiveLevel: question.cognitive_level,
            explanation: question.explanation,
            knowledgePoints: question.knowledge_points,
          });
          setIsComposite((question.stem.sub_questions?.length || 0) > 0);

          // 设置选中的题型
          const type = questionTypes.find((t) => t.id === question.question_type_id);
          setSelectedType(type);
        })
        .finally(() => setLoading(false));
    }
  }, [id, questionTypes, form]);

  // 题型变化时更新交互类型
  const handleTypeChange = (typeId: number) => {
    const type = questionTypes.find((t) => t.id === typeId);
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
      const stage = gradeToStage(grade);

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
          correctAnswers,
          scoring: { fullScore: 10 },
        };
      }

      const data: QuestionCreateRequest = {
        question_type_id: values.questionTypeId as number,
        question_type_code: selectedType?.code || '',
        subject: values.subject as string,
        grade,
        stage: stage as Stage,
        stem: {
          text: values.stemText as string,
          rich_text: values.stemRichText as string,
          sub_questions: isComposite ? (values.subQuestions as Array<Record<string, unknown>>) : undefined,
        },
        options: isComposite ? undefined : (values.options as QuestionOption[]),
        answer: answer as any as Answer,
        difficulty: values.difficulty as Difficulty,
        cognitive_level: values.cognitiveLevel as CognitiveLevel,
        explanation: values.explanation as string,
        knowledge_points: values.knowledgePoints as string[],
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
    if (grade && !t.grades.includes(grade)) return false;
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

