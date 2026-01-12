import { TextbookApi } from '@/pages/Textbook/api';
import { ModalForm, ProFormSelect } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { useMemo } from 'react';
import { useTextbookConfigModel } from '../models/page';

export default function FormView() {
  const {
    subject,
    grade,
    formProps: { form, visible, item, onCancel, handleSubmit },
  } = useTextbookConfigModel();

  // 根据学科和年级查询可选教材列表
  const { data: textbooks, loading: textbooksLoading } = useRequest(
    () => TextbookApi.searchTextbooks({ subject, grade }),
    {
      ready: visible && !!subject && !!grade,
      refreshDeps: [subject, grade, visible],
    },
  );

  // 将教材列表转换为选项
  const textbookOptions = useMemo(() => {
    if (!textbooks || textbooks.length === 0) {
      return {};
    }
    return textbooks.reduce(
      (prev, textbook) => {
        const label = `${textbook.version} - ${textbook.semester}`;
        return { ...prev, [textbook.id]: label };
      },
      {} as Record<number, string>,
    );
  }, [textbooks]);

  return (
    <ModalForm<SaveStudentTextbookConfigRequest>
      width={600}
      form={form}
      open={visible}
      title={item ? '更新教材配置' : '新增教材配置'}
      onFinish={handleSubmit}
      modalProps={{ destroyOnClose: true, onCancel }}
      layout="horizontal"
      size="large"
      labelAlign="left"
      labelCol={{ span: 4 }}
    >
      <div className="pt-3" />
      <ProFormSelect
        name="textbook_id"
        label="教材"
        placeholder={subject && grade ? '请选择教材' : '请先在上方选择学科和年级'}
        rules={[{ required: true, message: '请选择教材' }]}
        valueEnum={textbookOptions}
        fieldProps={{
          loading: textbooksLoading,
          disabled: !subject || !grade || textbooksLoading,
        }}
      />
    </ModalForm>
  );
}
