import { Badge, Card, CardContent, CardHeader, CardTitle, DescriptionList, Modal } from '@/components/ui';
import { GRADES } from '@ai-education/shared-web';
import { useQuestionListModel } from '../models/page';

export function DetailView() {
  const { currentQuestion, closeDetail } = useQuestionListModel();

  const content = (currentQuestion?.content || {}) as Record<string, any>;
  const stem = content.stem || '';
  const stemText = typeof stem === 'string' ? stem : String(stem || '');
  const gradeInfo = currentQuestion?.grade ? GRADES[currentQuestion.grade] : undefined;

  return (
    <Modal title="题目详情" open={!!currentQuestion} onClose={closeDetail}>
      {currentQuestion ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent>
              <DescriptionList
                items={[
                  { label: '题目ID', value: <span className="break-all">{currentQuestion.id}</span> },
                  { label: '科目', value: <Badge>{currentQuestion.subject}</Badge> },
                  { label: '年级', value: gradeInfo || '-' },
                  { label: '题型编码', value: currentQuestion.question_type_code },
                  {
                    label: '能力代码',
                    value: currentQuestion.ability_code ? <Badge variant="outline">{currentQuestion.ability_code}</Badge> : '-',
                  },
                  {
                    label: '创建时间',
                    value: currentQuestion.create_time ? new Date(currentQuestion.create_time * 1000).toLocaleString() : '-',
                  },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>题干内容</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base leading-7 text-foreground">{stemText || '-'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>答案与解析</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <div className="mb-2 font-medium text-foreground">答案</div>
                <pre className="overflow-auto rounded-md bg-muted p-3 text-xs text-foreground">
                  {JSON.stringify(currentQuestion.answer, null, 2)}
                </pre>
              </div>
              <div>
                <div className="mb-2 font-medium text-foreground">解析</div>
                <div className="text-foreground">{currentQuestion.explanation || '无解析'}</div>
              </div>
            </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>原始数据</CardTitle>
            </CardHeader>
            <CardContent>
            <pre className="m-0 max-h-80 overflow-auto rounded-md bg-muted p-4 text-xs leading-6 text-foreground">
              {JSON.stringify(currentQuestion, null, 2)}
            </pre>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </Modal>
  );
}
