import { DetailCard, StatusTag } from '@/components';
import { DescriptionList } from '@/components/ui';
import { GRADES } from '@ai-education/shared-web';

import { useTextbookDetailModel } from '../models/page';

export const BasicInfo = () => {
  const { textbook } = useTextbookDetailModel();
  const info = (textbook as any)?.grade !== undefined ? GRADES[(textbook as any).grade] : undefined;

  return (
    <DetailCard
      title="基本信息"
      extra={<StatusTag status={!!(textbook as any)?.is_parsed} trueText="已解析" falseText="未解析" />}
    >
      <DescriptionList
        items={[
          { label: '科目', value: (textbook as any)?.subject },
          { label: '版本', value: (textbook as any)?.version },
          { label: '年级', value: info },
          { label: '学期', value: (textbook as any)?.semester },
          { label: '文件', value: (textbook as any)?.file },
          { label: '索引ID', value: (textbook as any)?.index_file_id },
        ]}
      />
    </DetailCard>
  );
};
