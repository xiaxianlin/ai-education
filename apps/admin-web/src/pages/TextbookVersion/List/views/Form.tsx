import { Button, Field, Input, Modal } from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { FormEvent, useEffect, useState } from 'react';

import { useTextbookVersionListModel } from '../models/page';

export default function FormView() {
  const {
    subject,
    formProps: { visible, item, loading, onCancel, handleSubmit },
  } = useTextbookVersionListModel();
  const [name, setName] = useState('');
  const [revisionYear, setRevisionYear] = useState(2023);

  useEffect(() => {
    if (!visible) return;
    setName(item?.name || '');
    setRevisionYear(item?.revision_year || 2023);
  }, [item, visible]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || revisionYear < 2000 || revisionYear > 2100) {
      toast.error('请填写版本名称，并确保年份在 2000-2100 之间');
      return;
    }
    handleSubmit({ subject, name, revision_year: revisionYear });
  };

  return (
    <Modal
      open={visible}
      title={item ? '更新教材版本' : '新增教材版本'}
      onClose={onCancel}
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button loading={loading} type="submit" form="textbook-version-form">
            保存
          </Button>
        </>
      }
    >
      <form id="textbook-version-form" className="grid gap-4" onSubmit={onSubmit}>
        <Field label="版本名称" required>
          <Input
            placeholder="请输入版本名称，如：人教版"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label="修订年份" required>
          <Input
            max={2100}
            min={2000}
            placeholder="请输入修订年份，如：2023"
            type="number"
            value={revisionYear}
            onChange={(event) => setRevisionYear(Number(event.target.value))}
          />
        </Field>
      </form>
    </Modal>
  );
}
