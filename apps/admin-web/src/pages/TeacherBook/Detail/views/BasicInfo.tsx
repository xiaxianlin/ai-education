import { GRADES } from '@ai-education/shared-web';
import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import { useTeacherBookDetailModel } from '../models/page';
;

export const BasicInfo = () => {
  const { teacherBook } = useTeacherBookDetailModel();
  const info = teacherBook?.grade !== undefined ? GRADES[teacherBook.grade] : undefined;
  return (
    <ProCard>
      <ProDescriptions column={3} title="基本信息">
        <ProDescriptions.Item label="科目">{(teacherBook as any)?.subject || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="版本">{(teacherBook as any)?.version || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="年级">{info || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="学期">{(teacherBook as any)?.semester || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="文件">{(teacherBook as any)?.file || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="索引ID">{(teacherBook as any)?.index_file_id || '-'}</ProDescriptions.Item>
      </ProDescriptions>
    </ProCard>
  );
};
