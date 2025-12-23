import { ModalForm, ProForm, ProFormSelect } from '@ant-design/pro-components';
import { StudentApi } from '../../api';
import { useRequest } from 'ahooks';
import { message } from 'antd';
import { GRADES } from '@/constants/course';

interface AddTextbookFormProps {
  studentId: string;
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function AddTextbookForm({ studentId, open, onCancel, onSuccess }: AddTextbookFormProps) {
  const [form] = ProForm.useForm<{ textbookIds: number[] }>();

  const { data: unusedTextbooks, refresh: refreshUnusedTextbooks } = useRequest(
    () => StudentApi.getStudentUnusedTextbooks(studentId),
    {
      ready: !!studentId && open,
    },
  );

  const { runAsync: handleAddTextbook } = useRequest(
    (textbookIds: number[]) => StudentApi.addStudentTextbook(studentId, textbookIds),
    {
      manual: true,
      ready: !!studentId,
      onSuccess: () => {
        message.success('添加成功');
        refreshUnusedTextbooks();
        form.resetFields();
        onSuccess?.();
      },
    },
  );

  return (
    <ModalForm<{ textbookIds: number[] }>
      size="large"
      width={600}
      form={form}
      open={open}
      title="批量添加教材"
      layout="horizontal"
      onFinish={(values) => handleAddTextbook(values.textbookIds)}
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
        name="textbookIds"
        label="教材"
        placeholder="请选择教材（可多选）"
        rules={[{ required: true, message: '请至少选择一个教材' }]}
        options={unusedTextbooks?.map((textbook) => ({
          label: `${textbook.subject} | ${textbook.version} | ${GRADES[textbook.grade]} | ${textbook.semester}`,
          value: textbook.id,
        }))}
      />
    </ModalForm>
  );
}

