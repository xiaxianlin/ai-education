import { ModalForm, ProFormSelect } from '@ant-design/pro-components';

import { useTeacherBookListModel } from '../models/page';
import { useConfigs } from '@/hooks';

export default function FormView() {
  const { semesters, textbook_versions, subjectEnum, gradeEnum } = useConfigs();
  const {
    formProps: { form, visible, item, onCancel, handleSubmit },
  } = useTeacherBookListModel();

  return (
    <ModalForm<SaveTeacherBookRequest>
      width={600}
      form={form}
      open={visible}
      title={item ? '更新教师用书' : '新增教师用书'}
      onFinish={handleSubmit}
      modalProps={{ destroyOnClose: true, onCancel }}
      layout="horizontal"
      size="large"
      labelAlign="left"
      labelCol={{ span: 3 }}
    >
      <div className="pt-3" />
      <ProFormSelect name="subject" label="科目" placeholder="请选择科目" rules={[{ required: true }]} valueEnum={subjectEnum} />
      <ProFormSelect
        name="version"
        label="版本"
        placeholder="请选择版本"
        rules={[{ required: true }]}
        valueEnum={textbook_versions?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {})}
      />
      <ProFormSelect name="grade" label="年级" placeholder="请选择年级" rules={[{ required: true }]} valueEnum={gradeEnum} />
      <ProFormSelect
        name="semester"
        label="学期"
        placeholder="请选择学期"
        rules={[{ required: true }]}
        valueEnum={semesters?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {})}
      />
    </ModalForm>
  );
}


