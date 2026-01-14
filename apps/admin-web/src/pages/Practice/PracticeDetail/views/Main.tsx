import { QuestionCard } from '@/components';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, SyncOutlined } from '@ant-design/icons';
import { FooterToolbar, PageContainer, ProSkeleton } from '@ant-design/pro-components';
import { Button, Empty, Flex, List, Modal, Space } from 'antd';
import { usePracticeDetailModel } from '../models/page';
import { BasicInfo } from './BasicInfo';
import { Progress } from './Progress';
import { QuestionList } from './QuestionList';
import { Report } from './Report';

export default function MainView() {
  const {
    navigate,
    loading,
    error,
    session,
    selectedQuestion,
    handleCloseQuestion,
    ungeneratedQuestions,
    hasUngeneratedQuestions,
    isModalOpen,
    setIsModalOpen,
    generationResults,
    handleOpenGenerationModal,
    handleStartGeneration,
    isGenerating,
    handleResetPractice,
  } = usePracticeDetailModel();

  if (loading) {
    return (
      <PageContainer title="练习详情" header={{ onBack: () => navigate(-1) }}>
        <ProSkeleton type="descriptions" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="练习详情" header={{ onBack: () => navigate(-1) }}>
        <Empty
          description={
            <div>
              <div style={{ marginBottom: 8 }}>加载失败</div>
              <div style={{ fontSize: '12px', color: '#999' }}>{error?.message || '请检查网络连接或稍后重试'}</div>
            </div>
          }
        >
          <Button type="primary" onClick={() => navigate(-1)}>
            返回上一页
          </Button>
        </Empty>
      </PageContainer>
    );
  }

  if (!session) {
    return (
      <PageContainer title="练习详情" header={{ onBack: () => navigate(-1) }}>
        <Empty description="练习详情不存在">
          <Button type="primary" onClick={() => navigate(-1)}>
            返回上一页
          </Button>
        </Empty>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="练习详情" header={{ onBack: () => navigate(-1) }}>
      <Space vertical style={{ width: '100%' }} size="large">
        <BasicInfo />
        <Progress />
        <Report />
        <QuestionList />

        <Modal
          title="题目预览"
          open={!!selectedQuestion}
          onCancel={handleCloseQuestion}
          footer={null}
          width={800}
          destroyOnClose
        >
          {selectedQuestion && <QuestionCard question={selectedQuestion} />}
        </Modal>

        <Modal
          title="生成素材"
          open={isModalOpen}
          onCancel={() => !isGenerating && setIsModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalOpen(false)} disabled={isGenerating}>
              关闭
            </Button>,
            <Button
              key="start"
              type="primary"
              onClick={handleStartGeneration}
              loading={isGenerating}
              disabled={isGenerating}
            >
              开始生成
            </Button>,
          ]}
          width={600}
          destroyOnClose
        >
          <List
            dataSource={ungeneratedQuestions}
            renderItem={(item) => {
              const status = generationResults[item.id];
              let icon = <SyncOutlined style={{ color: '#999' }} />;
              let statusText = '等待中';
              if (status === 'generating') {
                icon = <LoadingOutlined style={{ color: '#1890ff' }} />;
                statusText = '生成中...';
              } else if (status === 'success') {
                icon = <CheckCircleOutlined style={{ color: '#52c41a' }} />;
                statusText = '成功';
              } else if (status === 'error') {
                icon = <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
                statusText = '失败';
              }
              return (
                <List.Item
                  extra={
                    <Space>
                      {icon} {statusText}
                    </Space>
                  }
                >
                  <List.Item.Meta
                    title={item.id}
                    description={
                      typeof item.content?.stem === "string"
                        ? item.content.stem
                        : (item.content?.stem as Stem)?.text || ""
                    }
                  />
                </List.Item>
              );
            }}
          />
        </Modal>
      </Space>

      <FooterToolbar className="page-footer">
        <Flex justify="center" gap={16}>
          <Button
            key="generate"
            size="large"
            type="primary"
            disabled={!hasUngeneratedQuestions || isGenerating}
            loading={isGenerating}
            onClick={handleOpenGenerationModal}
          >
            {hasUngeneratedQuestions ? '生成素材' : '素材已全部生成'}
          </Button>
          <Button key="reset" size="large" danger onClick={handleResetPractice}>
            重置练习
          </Button>
        </Flex>
      </FooterToolbar>
    </PageContainer>
  );
}
