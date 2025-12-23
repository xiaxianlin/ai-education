import { ModalForm, ProForm, ProFormSelect } from '@ant-design/pro-components';
import { StudentApi } from '../../api';
import { useRequest } from 'ahooks';
import { message } from 'antd';

interface AddPracticeFormProps {
  studentId: string;
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function AddPracticeForm({ studentId, open, onCancel, onSuccess }: AddPracticeFormProps) {
  const [form] = ProForm.useForm<{ practiceIds: number[] }>();

  const { data: unusedPractices, refresh: refreshUnusedPractices } = useRequest(
    () => StudentApi.getStudentUnusedPractices(studentId),
    {
      ready: !!studentId && open,
    },
  );

  const { runAsync: handleAddPractice } = useRequest(
    (practiceIds: number[]) => StudentApi.addStudentPractice(studentId, practiceIds),
    {
      manual: true,
      ready: !!studentId,
      onSuccess: () => {
        message.success('关联成功');
        refreshUnusedPractices();
        form.resetFields();
        onSuccess?.();
      },
    },
  );

  return (
    <ModalForm<{ practiceIds: number[] }>
      size="large"
      width={600}
      form={form}
      open={open}
      title="批量添加练习"
      layout="horizontal"
      onFinish={(values) => handleAddPractice(values.practiceIds)}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          form.resetFields();
          onCancel();
        },
      }}
    >
      <div style={{ paddingTop: '16px' }} />
      <ProFormSelect
        showSearch
        mode="multiple"
        name="practiceIds"
        label="练习"
        placeholder="请选择练习（可多选）"
        rules={[{ required: true, message: '请至少选择一个练习' }]}
        options={unusedPractices?.map((practice) => ({
          label: `${practice.name} (${practice.type})`,
          value: practice.id,
        }))}
      />
    </ModalForm>
  );
}

