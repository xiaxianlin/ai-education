import { Button, Field, Input, Modal, Select } from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { useConfigs } from '@/hooks';
import { GRADES } from '@ai-education/shared-web';
import { FormEvent, useEffect, useState } from 'react';

import { useTextbookListModel } from '../models/page';

export default function FormView() {
  const { semesters, subjects } = useConfigs();
  const {
    subject,
    grade,
    formProps: { visible, item, loading, onCancel, handleSubmit },
  } = useTextbookListModel();
  const [formSubject, setFormSubject] = useState('');
  const [formGrade, setFormGrade] = useState<number | undefined>();
  const [version, setVersion] = useState('');
  const [semester, setSemester] = useState('');
  const gradeOptions = Object.keys(GRADES).map((key) => Number(key));

  useEffect(() => {
    if (!visible) return;
    setFormSubject(item?.subject || subject || '');
    setFormGrade(item?.grade || grade);
    setVersion(item?.version || '');
    setSemester(item?.semester || '');
  }, [grade, item, subject, visible]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formSubject || !formGrade || !version || !semester) {
      toast.error('请完整填写教材信息');
      return;
    }
    handleSubmit({ subject: formSubject, grade: formGrade, version, semester });
  };

  return (
    <Modal
      open={visible}
      title={item ? '更新教材' : '新增教材'}
      description="手工录入教材基础信息。"
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
        <Field label="学科" required>
          <Select value={formSubject} onChange={(event) => setFormSubject(event.target.value)}>
            <option value="">请选择学科</option>
            {subjects.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="年级" required>
          <Select value={formGrade ?? ''} onChange={(event) => setFormGrade(event.target.value ? Number(event.target.value) : undefined)}>
            <option value="">请选择年级</option>
            {gradeOptions.map((item) => (
              <option key={item} value={item}>
                {GRADES[item]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="教材版本" required>
          <Input value={version} placeholder="请输入教材版本" onChange={(event) => setVersion(event.target.value)} />
        </Field>
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
