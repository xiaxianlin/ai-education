import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button, Spin, Empty } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { usePracticeConfigModel } from '../models/page';
import ConfigDrawer from './ConfigDrawer';
import { PRACTICE_TYPE_LABELS } from '@/constants/practice';

export default function MainView() {
  const {
    loading,
    practices,
    handleOpenConfig,
  } = usePracticeConfigModel();

  if (loading) {
    return (
      <PageContainer title="练习配置" header={{ breadcrumb: {} }}>
        <Spin spinning={loading} style={{ width: '100%', padding: '50px' }} />
      </PageContainer>
    );
  }

  if (practices.length === 0) {
    return (
      <PageContainer title="练习配置" header={{ breadcrumb: {} }}>
        <Empty description="暂无练习数据" />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="练习配置" header={{ breadcrumb: {} }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {practices.map((practice) => (
          <ProCard
            key={practice.id}
            title={practice.name}
            extra={
              <Button
                type="link"
                icon={<SettingOutlined />}
                onClick={() => handleOpenConfig(practice)}
              >
                配置
              </Button>
            }
            bordered
            hoverable
          >
            <div style={{ marginBottom: '8px' }}>
              <strong>标识：</strong>
              <span>{practice.slug}</span>
            </div>
            {practice.practice_type && (
              <div style={{ marginBottom: '8px' }}>
                <strong>练习类型：</strong>
                <span>{PRACTICE_TYPE_LABELS[practice.practice_type]}</span>
              </div>
            )}
            {practice.description && (
              <div style={{ marginBottom: '8px' }}>
                <strong>描述：</strong>
                <span>{practice.description}</span>
              </div>
            )}
            <div>
              <strong>类型：</strong>
              <span>{practice.type === 'system' ? '系统' : '自定义'}</span>
            </div>
          </ProCard>
        ))}
      </div>
      <ConfigDrawer />
    </PageContainer>
  );
}

