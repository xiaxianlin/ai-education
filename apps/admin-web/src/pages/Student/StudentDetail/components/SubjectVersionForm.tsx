import { SUBJECTS } from '@ai-education/shared-web';
import { ModalForm, ProForm, ProFormSelect } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { message } from 'antd';
import { useEffect } from 'react';
import { StudentApi } from '../../api';
import { useConfigs } from '@/hooks/useConfigs';

interface SubjectVersionFormProps {
  studentId: string;
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function SubjectVersionForm({ studentId, open, onCancel, onSuccess }: SubjectVersionFormProps) {
  const { textbook_versions } = useConfigs();
  const [form] = ProForm.useForm<Record<string, string>>();

  const { data: currentSubjectVersions, refresh: refreshCurrent } = useRequest(
    () => StudentApi.getStudentTextbooks(studentId),
    {
      ready: !!studentId && open,
    },
  );

  // 初始化表单值
  useEffect(() => {
    if (open && currentSubjectVersions) {
      const initialValues: Record<string, string> = {};
      SUBJECTS.forEach((subject) => {
        const existing = currentSubjectVersions.find((sv) => sv.subject === subject);
        initialValues[subject] = existing?.version || '';
      });
      form.setFieldsValue(initialValues);
    }
  }, [open, currentSubjectVersions, form]);

  const { runAsync: handleSetSubjectVersions } = useRequest(
    (subjectVersions: Array<{ subject: string; version: string }>) =>
      StudentApi.setStudentSubjectVersions(studentId, subjectVersions),
    {
      manual: true,
      ready: !!studentId,
      onSuccess: () => {
        message.success('设置成功');
        refreshCurrent();
        onSuccess?.();
      },
    },
  );

  const handleFinish = (values: Record<string, string>) => {
    const subjectVersions = SUBJECTS.map((subject) => ({
      subject,
      version: values[subject] || '',
    }));
    handleSetSubjectVersions(subjectVersions);
  };

  const versionOptions = textbook_versions?.map((version) => ({
    label: version,
    value: version,
  })) || [];

  return (
    <ModalForm<Record<string, string>>
      size="large"
      width={600}
      form={form}
      open={open}
      title="设置科目版本"
      layout="horizontal"
      onFinish={handleFinish}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          form.resetFields();
          onCancel();
        },
      }}
    >
      <div style={{ paddingTop: '16px' }} />
      {SUBJECTS.map((subject) => (
        <ProFormSelect
          key={subject}
          name={subject}
          label={subject}
          placeholder="请选择版本（可清除）"
          allowClear
          options={versionOptions}
        />
      ))}
    </ModalForm>
  );
}
