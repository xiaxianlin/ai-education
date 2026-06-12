import { DeleteButton } from '@/components';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  Modal,
  type BadgeVariant,
  type DataTableColumn,
} from '@/components/ui';
import { useState } from 'react';
import { formatDuration } from '../../PracticeList/utils';
import { usePracticeDetailModel } from '../models/page';

type AnswerModalData = {
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
};

function hasAnswer(answer?: PracticeAnswer): boolean {
  return !!(answer && answer.status !== 0);
}

function formatCorrectAnswer(correctAnswer: unknown, questionAnswer?: Answer): string {
  if (typeof correctAnswer === 'string') return correctAnswer;
  if (Array.isArray(correctAnswer)) return correctAnswer.join(', ');

  if (correctAnswer && typeof correctAnswer === 'object') {
    const answerData = correctAnswer as {
      value?: unknown;
      values?: unknown[];
      options?: Array<{ text?: string; id?: string }>;
    };
    if (answerData.options) {
      return answerData.options.map((option) => option.text || option.id || '').join(', ');
    }
    if (answerData.values) {
      return answerData.values.join(', ');
    }
    if (answerData.value !== undefined && answerData.value !== null) {
      return String(answerData.value);
    }
  }

  if (questionAnswer?.correct_value !== undefined) {
    return String(questionAnswer.correct_value);
  }

  return '-';
}

function formatExplanation(analysis: unknown, defaultExplanation?: string): string {
  if (typeof analysis === 'string') return analysis;
  if (analysis && typeof analysis === 'object') {
    const analysisData = analysis as { explanation?: string; analysis?: string };
    return analysisData.explanation || analysisData.analysis || defaultExplanation || '-';
  }
  return defaultExplanation || '-';
}

function getResourceBadge(question: Question) {
  const resource = question.content?.resource;
  if (!resource) {
    return <span className="text-muted-foreground">-</span>;
  }
  const generated = !!resource.url?.trim();
  return <Badge variant={generated ? 'success' : 'destructive'}>{generated ? '已生成' : '未生成'}</Badge>;
}

export function QuestionList() {
  const { session, questions, answersMap, navigate, handleViewQuestion, handleResetAnswer } = usePracticeDetailModel();
  const [answerModal, setAnswerModal] = useState<AnswerModalData | null>(null);

  if (!session) {
    return null;
  }

  const resultBadgeVariant = (answer?: PracticeAnswer): BadgeVariant => {
    if (!answer || answer.status === 0) return 'outline';
    return answer.status === 1 ? 'success' : 'destructive';
  };

  const columns: DataTableColumn<Question>[] = [
    {
      key: 'index',
      title: '序号',
      width: '70px',
      render: (_, index) => index + 1,
    },
    {
      key: 'question_type',
      title: '题型',
      width: '140px',
      render: (record) => record.question_type?.name || record.question_type_code,
    },
    {
      key: 'content',
      title: '题目内容',
      render: (record) => {
        const stem = record.content?.stem || '';
        return <div className="max-w-[500px] truncate">{stem}</div>;
      },
    },
    {
      key: 'resource',
      title: '素材',
      width: '100px',
      render: (record) => getResourceBadge(record),
    },
    {
      key: 'answered',
      title: '是否作答',
      width: '110px',
      render: (record) => {
        const answer = answersMap[record.id];
        const answerExists = hasAnswer(answer);
        const openAnswer = () => {
          const studentAnswer = answer?.text_answer || '未作答';
          const correctAnswer = answer?.correct_answer ?? record.answer?.correct_value;
          setAnswerModal({
            studentAnswer,
            correctAnswer: formatCorrectAnswer(correctAnswer, record.answer),
            explanation: formatExplanation(answer?.analysis, record.explanation),
          });
        };

        return answerExists ? (
          <button type="button" onClick={openAnswer}>
            <Badge variant="success">已作答</Badge>
          </button>
        ) : (
          <Badge variant="outline">未作答</Badge>
        );
      },
    },
    {
      key: 'result',
      title: '答题结果',
      width: '100px',
      render: (record) => {
        const answer = answersMap[record.id];
        if (!answer || answer.status === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        return <Badge variant={resultBadgeVariant(answer)}>{answer.status === 1 ? '正确' : '错误'}</Badge>;
      },
    },
    {
      key: 'time_spent',
      title: '答题耗时',
      width: '110px',
      render: (record) => {
        const answer = answersMap[record.id];
        return answer?.time_spent ? formatDuration(answer.time_spent) : <span className="text-muted-foreground">-</span>;
      },
    },
    {
      key: 'actions',
      title: '操作',
      width: '160px',
      render: (record) => {
        const answer = answersMap[record.id];
        const answerExists = hasAnswer(answer);
        return (
          <div className="flex justify-start gap-2">
            <Button variant="link" size="xs" onClick={() => navigate(`/question/detail/${record.id}`)}>
              详情
            </Button>
            <Button variant="link" size="xs" onClick={() => handleViewQuestion(record)}>
              预览
            </Button>
            <DeleteButton
              title="重置答案确认"
              description="确定要重置该题目的答案记录吗？此操作将清空该题的答题数据，无法恢复。"
              buttonText="重置"
              onConfirm={() => handleResetAnswer(record.id)}
              buttonProps={{ disabled: !answerExists, size: 'xs' }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>题目列表（共 {session.question_count} 题）</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={questions} rowKey="id" />
        </CardContent>
      </Card>

      <Modal open={!!answerModal} title="查看答案" onClose={() => setAnswerModal(null)}>
        {answerModal ? (
          <div className="space-y-4 text-sm">
            <div>
              <div className="mb-2 font-medium text-foreground">学生答案：</div>
              <div>{answerModal.studentAnswer}</div>
            </div>
            <div>
              <div className="mb-2 font-medium text-foreground">正确答案：</div>
              <Badge variant="success">{answerModal.correctAnswer}</Badge>
            </div>
            {answerModal.explanation && answerModal.explanation !== '-' ? (
              <div>
                <div className="mb-2 font-medium text-foreground">解析：</div>
                <div>{answerModal.explanation}</div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
