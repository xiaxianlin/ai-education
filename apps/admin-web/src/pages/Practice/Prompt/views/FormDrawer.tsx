import { useEffect, useState } from 'react';
import { ProForm, ProFormSelect } from '@ant-design/pro-components';
import { Drawer } from 'antd';
import { usePracticePromptModel } from '../models/page';
import { PromptApi } from '@/pages/Prompt/api';
import { GRADES, SUBJECTS } from '@/constants/course';

const PRACTICE_TYPE_OPTIONS = [
  { label: '日常练习', value: 'daily_practice' },
  { label: '单元练习', value: 'unit_practice' },
  { label: '综合评估', value: 'assessment' },
];

const GRADE_OPTIONS = Object.keys(GRADES).map((key) => ({
  label: GRADES[Number(key)],
  value: Number(key),
}));

export default function FormDrawerView() {
  const {
    drawerOpen,
    editingId,
    formLoading,
    initialValues,
    handleClose,
    handleSubmit,
  } = usePracticePromptModel();
  const [promptOptions, setPromptOptions] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    // 加载提示词列表
    PromptApi.listPrompts({ page: 1, size: 1000 }).then((res) => {
      setPromptOptions(
        (res?.data || []).map((p) => ({
          label: `${p.name} (${p.slug})`,
          value: p.id,
        }))
      );
    });
  }, []);

  return (
    <Drawer
      title={editingId ? '编辑练习提示词关联' : '新建练习提示词关联'}
      open={drawerOpen}
      onClose={handleClose}
      width={600}
      destroyOnClose
    >
      <ProForm<SavePracticePromptRequest>
        loading={formLoading}
        initialValues={initialValues}
        onFinish={handleSubmit}
        submitter={{
          searchConfig: {
            submitText: editingId ? '更新' : '创建',
          },
        }}
      >
        <ProFormSelect
          name="practice_type"
          label="练习类型"
          rules={[{ required: true, message: '请选择练习类型' }]}
          options={PRACTICE_TYPE_OPTIONS}
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
          name="prompt_id"
          label="提示词"
          rules={[{ required: true, message: '请选择提示词' }]}
          options={promptOptions}
          fieldProps={{
            showSearch: true,
            filterOption: (input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
          }}
        />
      </ProForm>
    </Drawer>
  );
}

