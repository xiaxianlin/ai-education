import { PageContainer, ProSkeleton } from '@ant-design/pro-components';
import { Card } from 'antd';

import { PageHeader } from '@/components';
import { useMemo, useState } from 'react';
import { useStudentDetailModel } from '../models/page';
import { BasicInfo } from './BasicInfo';
import { PracticeList } from './PracticeList';
import { TextbookList } from './TextbookList';

export function Main() {
  const { loading } = useStudentDetailModel();
  const [activeTab, setActiveTab] = useState('basic');

  const content = useMemo(() => {
    switch (activeTab) {
      case 'basic':
        return <BasicInfo />;
      case 'textbook':
        return <TextbookList />;
      case 'practice':
        return <PracticeList />;
    }
  }, [activeTab]);

  if (loading) {
    return <ProSkeleton type="descriptions" />;
  }

  return (
    <PageContainer title={<PageHeader title="学生详情" />}>
      <Card
        tabList={[
          { key: 'basic', label: '基本信息' },
          { key: 'textbook', label: '教材管理' },
          { key: 'practice', label: '练习管理' },
        ]}
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
      >
        {content}
      </Card>
    </PageContainer>
  );
}
