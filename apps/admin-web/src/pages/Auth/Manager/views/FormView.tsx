import { Button, Field, Input, Modal, Select, type TableActionRef } from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { SUBJECTS } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
import React from 'react';
import { AuthApi } from '../../api';

export interface ManagerFormViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionRef: React.MutableRefObject<TableActionRef | undefined>;
}

export function ManagerFormView(props: ManagerFormViewProps) {
  const { open, onOpenChange, actionRef } = props;
  const [formData, setFormData] = React.useState<CreateTeacherRequest>({
    account: '',
    password: '',
    name: '',
    phone: '',
    subject: SUBJECTS[0] || '',
    school: '',
    status: 1,
  });
  const [error, setError] = React.useState('');

  const { runAsync: add, loading } = useRequest((values: CreateTeacherRequest) => AuthApi.createTeacher(values), {
    manual: true,
    onSuccess: (result: PasswordResponse | Teacher) => {
      onOpenChange(false);
      actionRef.current?.reload();
      const password = result && 'password' in result ? result.password : formData.password;
      toast.success(password ? `添加成功，请保存好密码：${password}` : '添加成功');
    },
    onError: (error: any) => {
      setError(error?.message || '添加失败');
    },
  });

  React.useEffect(() => {
    if (open) {
      setFormData({
        account: '',
        password: '',
        name: '',
        phone: '',
        subject: SUBJECTS[0] || '',
        school: '',
        status: 1,
      });
      setError('');
    }
  }, [open]);

  const updateField = (key: keyof CreateTeacherRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!formData.account.trim()) {
      setError('请输入教师账号');
      return;
    }
    if (!formData.name.trim()) {
      setError('请输入教师姓名');
      return;
    }
    if (!formData.phone.trim()) {
      setError('请输入手机号');
      return;
    }
    if (!formData.subject.trim()) {
      setError('请选择学科');
      return;
    }
    if (!formData.school.trim()) {
      setError('请输入学校');
      return;
    }
    await add({
      account: formData.account.trim(),
      password: formData.password?.trim() || undefined,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      subject: formData.subject,
      school: formData.school.trim(),
      status: formData.status,
    });
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      title="添加教师"
      description="密码可不填；后端可按接口策略生成初始密码。"
      onClose={() => onOpenChange(false)}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="submit" form="manager-form" loading={loading}>
            添加
          </Button>
        </>
      }
    >
      <form id="manager-form" className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
        <Field label="教师账号" required error={error}>
          <Input
            maxLength={50}
            value={formData.account}
            placeholder="请输入教师账号"
            onChange={(event) => updateField('account', event.target.value)}
          />
        </Field>
        <Field label="密码">
          <Input
            maxLength={50}
            type="password"
            value={formData.password}
            placeholder="可选"
            onChange={(event) => updateField('password', event.target.value)}
          />
        </Field>
        <Field label="姓名" required>
          <Input maxLength={30} value={formData.name} placeholder="请输入姓名" onChange={(event) => updateField('name', event.target.value)} />
        </Field>
        <Field label="手机号" required>
          <Input maxLength={20} value={formData.phone} placeholder="请输入手机号" onChange={(event) => updateField('phone', event.target.value)} />
        </Field>
        <Field label="学科" required>
          <Select value={formData.subject} onChange={(event) => updateField('subject', event.target.value)}>
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="学校" required>
          <Input maxLength={80} value={formData.school} placeholder="请输入学校" onChange={(event) => updateField('school', event.target.value)} />
        </Field>
        <Field label="状态" required>
          <Select value={String(formData.status)} onChange={(event) => updateField('status', Number(event.target.value))}>
            <option value="1">启用</option>
            <option value="0">停用</option>
          </Select>
        </Field>
      </form>
    </Modal>
  );
}
