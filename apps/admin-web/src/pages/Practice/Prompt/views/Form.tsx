import { GRADES, SUBJECTS } from '@/constants/course';
import { PromptApi } from '@/pages/Prompt/api';
import { ModalForm, ProFormSelect } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { PracticeApi } from '../../api';
import { usePracticePromptModel } from '../models/page';

const GRADE_OPTIONS = Object.keys(GRADES).map((key) => ({
  label: GRADES[Number(key)],
  value: Number(key),
}));

export default function FormView() {
  const { modalOpen, editingId, formLoading, initialValues, handleClose, handleSubmit } = usePracticePromptModel();
  const { data: promptOptions = [] } = useRequest(async () => {
    const res = await PromptApi.listPrompts({ page: 1, size: 1000 });
    return (res?.data || []).map((p) => ({
      label: `${p.name} (${p.slug})`,
      value: p.slug,
    }));
  });

  const { data: practiceOptions = [] } = useRequest(async () => {
    const res = await PracticeApi.listPractices({ page: 1, size: 1000 });
    return (res?.data || []).map((p) => ({
      label: `${p.name} (${p.slug})`,
      value: p.slug,
    }));
  });

  return (
    <ModalForm<SavePracticePromptRequest>
      layout="horizontal"
      labelCol={{ span: 3 }}
      title={editingId ? '编辑练习提示词关联' : '新建练习提示词关联'}
      open={modalOpen}
      onOpenChange={(visible) => {
        if (!visible) handleClose();
      }}
      width={600}
      size="large"
      initialValues={initialValues}
      onFinish={handleSubmit}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      submitter={{
        searchConfig: {
          submitText: editingId ? '更新' : '创建',
        },
      }}
      loading={formLoading}
    >
      <ProFormSelect
        name="practice_slug"
        label="练习"
        rules={[{ required: true, message: '请选择练习' }]}
        options={practiceOptions}
        fieldProps={{
          showSearch: true,
          filterOption: (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
        }}
      />
      <ProFormSelect
        name="subject"
        label="科目"
        rules={[{ required: true, message: '请选择科目' }]}
        options={SUBJECTS.map((s) => ({ label: s, value: s }))}
      />
      <ProFormSelect
        name="grade"
        label="年级"
        rules={[{ required: true, message: '请选择年级' }]}
        options={GRADE_OPTIONS}
      />
      <ProFormSelect
        name="prompt_slug"
        label="提示词"
        rules={[{ required: true, message: '请选择提示词' }]}
        options={promptOptions}
        fieldProps={{
          showSearch: true,
          filterOption: (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
        }}
      />
    </ModalForm>
  );
}
