import { JsonEditor } from '@/components/JsonEditor';
import { Button, Field, Modal, Textarea } from '@/components/ui';
import { useEffect, useState } from 'react';
import { useQuestionListModel } from '../models/page';

export function QuestionFormModal() {
  const { item, visible, loading, onCancel, handleSubmit } = useQuestionListModel();
  const [explanation, setExplanation] = useState('');
  const [contentRaw, setContentRaw] = useState('');
  const [answerRaw, setAnswerRaw] = useState('');

  useEffect(() => {
    if (!visible || !item) return;
    setExplanation(item.explanation || '');
    setContentRaw(JSON.stringify(item.content, null, 2));
    setAnswerRaw(JSON.stringify(item.answer, null, 2));
  }, [visible, item]);

  return (
    <Modal
      open={visible}
      title="编辑题目"
      onClose={onCancel}
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            取消
          </Button>
          <Button
            loading={loading}
            onClick={() =>
              handleSubmit({
                explanation,
                content_raw: contentRaw,
                answer_raw: answerRaw,
              })
            }
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="题目解析">
          <Textarea
            placeholder="输入解析"
            value={explanation}
            onChange={(event) => setExplanation(event.target.value)}
          />
        </Field>
        <Field label="题目内容" required>
          <JsonEditor value={contentRaw} onChange={setContentRaw} height="350px" />
        </Field>
        <Field label="答案配置" required>
          <JsonEditor value={answerRaw} onChange={setAnswerRaw} height="250px" />
        </Field>
      </div>
    </Modal>
  );
}
