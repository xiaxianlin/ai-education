import { Button, Field, Input, Modal, Select } from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { GRADES } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
import { FormEvent, useEffect, useState } from 'react';
import { StudentApi } from '../../api';
import { useStudentDetailModel } from '../models/page';

const emptyValues: SaveStudentRequest = {
  name: '',
  phone: '',
  grade: Number(Object.keys(GRADES)[0] || 1),
  status: 1,
};

export function BasicInfoForm() {
  const { student, editFormVisible, refresh, setEditFormVisible } = useStudentDetailModel();
  const [values, setValues] = useState<SaveStudentRequest>(emptyValues);
  const [error, setError] = useState('');

  const { runAsync: handleEditSubmit, loading: editing } = useRequest(
    async (nextValues: SaveStudentRequest) => StudentApi.updateStudent((student as any)?.id || '', nextValues),
    {
      manual: true,
      onSuccess: () => {
        toast.success('更新成功');
        setEditFormVisible(false);
        refresh();
      },
      onError: (err: any) => {
        setError(err?.message || '更新失败');
      },
    },
  );

  useEffect(() => {
    if (editFormVisible && student) {
      setValues({
        name: (student as any).name || '',
        phone: (student as any).phone || '',
        grade: (student as any).grade || emptyValues.grade,
        status: (student as any).status ?? 1,
      });
      setError('');
    }
  }, [editFormVisible, student]);

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
    await handleEditSubmit(values);
  };

  return (
    <Modal
      open={editFormVisible}
      title="编辑学生"
      description="更新学生基础资料和账号状态。"
      onClose={() => setEditFormVisible(false)}
      footer={
        <>
          <Button variant="outline" onClick={() => setEditFormVisible(false)}>
            取消
          </Button>
          <Button type="submit" form="student-basic-info-form" loading={editing}>
            保存
          </Button>
        </>
      }
    >
      <form id="student-basic-info-form" className="grid gap-4" onSubmit={onSubmit}>
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
        <Field label="状态">
          <Select
            value={values.status ?? 1}
            onChange={(event) => setValues((prev) => ({ ...prev, status: Number(event.target.value) }))}
          >
            <option value={1}>启用</option>
            <option value={0}>禁用</option>
          </Select>
        </Field>
        {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
      </form>
    </Modal>
  );
}
