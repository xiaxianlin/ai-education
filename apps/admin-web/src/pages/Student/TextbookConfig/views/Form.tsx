import { Button, Field, Modal, Select } from '@/components/ui';
import { TextbookApi } from '@/pages/Textbook/api';
import { useRequest } from 'ahooks';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTextbookConfigModel } from '../models/page';

export default function FormView() {
  const {
    subject,
    grade,
    formProps: { visible, item, onCancel, handleSubmit },
  } = useTextbookConfigModel();
  const [textbookId, setTextbookId] = useState('');
  const [error, setError] = useState('');

  const { data: textbooks, loading: textbooksLoading } = useRequest(
    () => TextbookApi.searchTextbooks({ subject, grade }),
    {
      ready: visible && !!subject && !!grade,
      refreshDeps: [subject, grade, visible],
    },
  );

  const textbookOptions = useMemo(() => {
    return (textbooks || []).map((textbook) => ({
      label: `${textbook.version} - ${textbook.semester}`,
      value: String(textbook.id),
    }));
  }, [textbooks]);

  useEffect(() => {
    if (visible) {
      setTextbookId(String((item as any)?.textbook_id || (item as any)?.textbook?.id || ''));
      setError('');
    }
  }, [item, visible]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!subject || !grade) {
      setError('请先在上方选择学科和年级');
      return;
    }
    if (!textbookId) {
      setError('请选择教材');
      return;
    }

    try {
      await handleSubmit({ textbook_id: Number(textbookId) } as SaveStudentTextbookConfigRequest);
    } catch (err: any) {
      setError(err?.message || '提交失败');
    }
  };

  if (!visible) return null;

  return (
    <Modal
      open={visible}
      title={item ? '更新教材配置' : '新增教材配置'}
      description="根据当前学科和年级选择学生使用的教材。"
      onClose={onCancel}
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit" form="student-textbook-config-form">
            保存
          </Button>
        </>
      }
    >
        <form id="student-textbook-config-form" className="space-y-5" onSubmit={onSubmit}>
          <Field label="教材" required>
            <Select
              value={textbookId}
              disabled={!subject || !grade || textbooksLoading}
              onChange={(event) => setTextbookId(event.target.value)}
            >
              <option value="">{subject && grade ? '请选择教材' : '请先在上方选择学科和年级'}</option>
              {textbookOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
        </form>
    </Modal>
  );
}
