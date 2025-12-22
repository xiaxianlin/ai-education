import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import { useTextbookDetailModel } from '../models/page';
import { StatusTag } from '@/components';
import { GRADES } from '@/constants/course';

export const BasicInfo = () => {
  const { textbook } = useTextbookDetailModel();
  const info = (textbook as any)?.grade !== undefined ? GRADES[(textbook as any).grade] : undefined;
  return (
    <ProCard>
      <ProDescriptions column={3} title="基本信息">
        <ProDescriptions.Item label="科目">{(textbook as any)?.subject || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="版本">{(textbook as any)?.version || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="年级">{info || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="学期">{(textbook as any)?.semester || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="文件">{(textbook as any)?.file || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="索引ID">{(textbook as any)?.index_file_id || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="单元解析">
          <StatusTag status={!!(textbook as any)?.is_parsed} trueText="已解析" falseText="未解析" />
        </ProDescriptions.Item>
      </ProDescriptions>
    </ProCard>
  );
};
