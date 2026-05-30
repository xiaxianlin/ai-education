import { DetailCard } from '@/components';
import { DescriptionList } from '@/components/ui';
import { GRADES } from '@ai-education/shared-web';

import { useTeacherBookDetailModel } from '../models/page';

export const BasicInfo = () => {
  const { teacherBook } = useTeacherBookDetailModel();
  const info = teacherBook?.grade !== undefined ? GRADES[teacherBook.grade] : undefined;

  return (
    <DetailCard title="基本信息">
      <DescriptionList
        items={[
          { label: '科目', value: (teacherBook as any)?.subject },
          { label: '版本', value: (teacherBook as any)?.version },
          { label: '年级', value: info },
          { label: '学期', value: (teacherBook as any)?.semester },
          { label: '文件', value: (teacherBook as any)?.file },
          { label: '索引ID', value: (teacherBook as any)?.index_file_id },
        ]}
      />
    </DetailCard>
  );
};
