import { useState } from 'react';
import { useParams, history } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Dropdown, Space } from 'antd';
import { ArrowLeftOutlined, MoreOutlined } from '@ant-design/icons';

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
      style={{ padding: '24px 0' }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => history.back()}
            style={{ padding: 0, height: 'auto' }}
          />
          <span>学生详情</span>
        </div>
      }
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
