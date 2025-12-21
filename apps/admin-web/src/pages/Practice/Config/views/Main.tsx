import { PageContainer } from '@ant-design/pro-components';
import { Card, Spin, Empty, Tag, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { usePracticeConfigModel } from '../models/page';
import ConfigModal from './ConfigModal';

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
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '24px',
        padding: '24px 0'
      }}>
        {practices.map((practice) => {
          const defaultConfig = practice.config?.default || {};
          const generateCount = defaultConfig.generate_count || 15;
          const recallCount = defaultConfig.recall_count || 0;
          
          return (
            <Card
              key={practice.id}
              hoverable
              style={{
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{
                padding: '24px',
              }}
              actions={[
                <div
                  key="config"
                  onClick={() => handleOpenConfig(practice)}
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    color: '#1890ff',
                    fontWeight: 500,
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f7ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <SettingOutlined style={{ marginRight: '4px' }} />
                  配置
                </div>
              ]}
            >
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '18px', 
                    fontWeight: 600,
                    color: '#262626'
                  }}>
                    {practice.name}
                  </h3>
                  <Tag color={practice.type === 'system' ? 'blue' : 'green'}>
                    {practice.type === 'system' ? '系统' : '自定义'}
                  </Tag>
                </div>
                <div style={{ 
                  fontSize: '13px', 
                  color: '#8c8c8c',
                  marginTop: '4px'
                }}>
                  {practice.slug}
                </div>
              </div>
              
              {practice.description && (
                <div style={{ 
                  marginBottom: '16px',
                  fontSize: '14px',
                  color: '#595959',
                  lineHeight: '1.6'
                }}>
                  {practice.description}
                </div>
              )}
              
              <div style={{
                padding: '16px',
                background: '#f5f5f5',
                borderRadius: '8px',
                marginTop: '16px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: '#8c8c8c', fontSize: '13px' }}>生成题目数</span>
                  <span style={{ 
                    color: '#262626', 
                    fontSize: '16px', 
                    fontWeight: 600 
                  }}>
                    {generateCount}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between'
                }}>
                  <span style={{ color: '#8c8c8c', fontSize: '13px' }}>召回题目数</span>
                  <span style={{ 
                    color: '#262626', 
                    fontSize: '16px', 
                    fontWeight: 600 
                  }}>
                    {recallCount}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <ConfigModal />
    </PageContainer>
  );
}

