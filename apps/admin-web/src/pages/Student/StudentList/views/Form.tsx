import { Button, Field, Input, Modal, Select } from '@/components/ui';
import { GRADES } from '@ai-education/shared-web';
import { FormEvent, useEffect, useState } from 'react';
import { useStudentListModel } from '../models/page';

const emptyValues: SaveStudentRequest = {
  name: '',
  phone: '',
  grade: Number(Object.keys(GRADES)[0] || 1),
};

export default function FormView() {
  const {
    formProps: { visible, item, onCancel, handleSubmit },
  } = useStudentListModel();
  const [values, setValues] = useState<SaveStudentRequest>(emptyValues);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setValues({
        name: item?.name || '',
        phone: item?.phone || '',
        grade: item?.grade || emptyValues.grade,
        status: item?.status,
      });
      setError('');
    }
  }, [item, visible]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!values.name.trim()) {
      setError('请输入姓名');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(values.phone)) {
      setError('请输入正确的手机号');
      return;
    }
    if (!values.grade) {
      setError('请选择年级');
      return;
    }

    try {
      await handleSubmit(values);
    } catch (err: any) {
      setError(err?.message || '提交失败');
    }
  };

  if (!visible) return null;

  return (
    <Modal
      open={visible}
      title={item ? '更新学生' : '新增学生'}
      description="手机号将用于学生登录账号。"
      onClose={onCancel}
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit" form="student-list-form">
            保存
          </Button>
        </>
      }
    >
        <form id="student-list-form" className="space-y-5" onSubmit={onSubmit}>
          <Field label="姓名" required>
            <Input
              maxLength={50}
              value={values.name}
              placeholder="请输入姓名"
              onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
            />
          </Field>

          <Field label="手机号" required>
            <Input
              maxLength={11}
              value={values.phone}
              placeholder="请输入手机号"
              onChange={(event) => setValues((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </Field>

          <Field label="年级" required>
            <Select
              value={values.grade}
              onChange={(event) => setValues((prev) => ({ ...prev, grade: Number(event.target.value) }))}
            >
              {Object.keys(GRADES).map((grade) => (
                <option key={grade} value={Number(grade)}>
                  {GRADES[Number(grade)]}
                </option>
              ))}
            </Select>
          </Field>

          {item && (
            <Field label="状态">
              <Select
                value={values.status ?? 1}
                onChange={(event) => setValues((prev) => ({ ...prev, status: Number(event.target.value) }))}
              >
                <option value={1}>启用</option>
                <option value={0}>禁用</option>
              </Select>
            </Field>
          )}

          {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
        </form>
    </Modal>
  );
}
