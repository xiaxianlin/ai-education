import { DetailCard } from '@/components';
import { GRADES } from '@ai-education/shared-web';

import { useTextbookDetailModel } from '../models/page';

export const BasicInfo = () => {
  const { textbook } = useTextbookDetailModel();
  const info = (textbook as any)?.grade !== undefined ? GRADES[(textbook as any).grade] : undefined;
  const items = [
    { label: '科目', value: (textbook as any)?.subject },
    { label: '版本', value: (textbook as any)?.version },
    { label: '年级', value: info },
    { label: '学期', value: (textbook as any)?.semester },
  ];

  return (
    <DetailCard title="基本信息">
      <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-muted-foreground">{item.label}:</span>
            <span className="min-w-0 truncate font-medium text-foreground" title={String(item.value || '-')}>
              {item.value || '-'}
            </span>
          </div>
        ))}
      </div>
    </DetailCard>
  );
};
