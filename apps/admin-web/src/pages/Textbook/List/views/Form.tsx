import { TextbookVersionSelect } from '@/components';
import { Button, Field, Modal, Select } from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { useConfigs } from '@/hooks';
import { FormEvent, useEffect, useState } from 'react';

import { useTextbookListModel } from '../models/page';

export default function FormView() {
  const { semesters } = useConfigs();
  const {
    subject,
    grade,
    formProps: { visible, item, loading, onCancel, handleSubmit },
  } = useTextbookListModel();
  const [version, setVersion] = useState('');
  const [semester, setSemester] = useState('');

  useEffect(() => {
    if (!visible) return;
    setVersion(item?.version || '');
    setSemester(item?.semester || '');
  }, [item, visible]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!version || !semester) {
      toast.error('请完整填写教材信息');
      return;
    }
    handleSubmit({ subject, grade, version, semester });
  };

  return (
    <Modal
      open={visible}
      title={item ? '更新教材' : '新增教材'}
      description={`当前学科：${subject}`}
      onClose={onCancel}
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button loading={loading} type="submit" form="textbook-form">
            保存
          </Button>
        </>
      }
    >
      <form id="textbook-form" className="grid gap-4" onSubmit={onSubmit}>
        <TextbookVersionSelect subject={subject} value={version} onChange={setVersion} />
        <Field label="学期" required>
          <Select value={semester} onChange={(event) => setSemester(event.target.value)}>
            <option value="">请选择学期</option>
            {semesters.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
      </form>
    </Modal>
  );
}
