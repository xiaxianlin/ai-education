import { useState } from 'react';
import { useParams } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Dropdown, Space } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

import { PageHeader } from '@/components/business';
import { useStudentActions } from './hooks/useStudentActions';
import { BasicInfoCard } from './views/BasicInfoCard';
import { TextbookSection } from './views/TextbookSection';
import { PracticeCard } from './views/PracticeCard';
import { UnitPracticeCard } from './views/UnitPracticeCard';
import { AssessmentCard } from './views/AssessmentCard';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student>();
  const [refreshStudent, setRefreshStudent] = useState<() => void>(() => {});

  const { menuItems } = useStudentActions(id, student, refreshStudent);

  return (
    <PageContainer
      title={<PageHeader title="学生详情" />}
      header={{
        breadcrumb: {},
        extra: [
          <Dropdown key="more" menu={{ items: menuItems }} trigger={['click']}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>,
        ],
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {id && (
          <BasicInfoCard id={id} onStudentChange={setStudent} onRefreshReady={setRefreshStudent} />
        )}

        {id && <TextbookSection id={id} />}

        {id && <PracticeCard id={id} />}

        {id && <UnitPracticeCard id={id} />}

        {id && <AssessmentCard id={id} />}
      </Space>
    </PageContainer>
  );
}
