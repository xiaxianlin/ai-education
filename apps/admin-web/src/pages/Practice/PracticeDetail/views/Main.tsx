import { QuestionCard } from '@/components';
import { createActionColumn } from '@/hooks';
import { formatDateTime, GRADES } from '@ai-education/shared-web';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, SyncOutlined } from '@ant-design/icons';
import {
  FooterToolbar,
  PageContainer,
  ProColumns,
  ProDescriptions,
  ProSkeleton,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Card, Col, Empty, Flex, List, Modal, Row, Space, Statistic, Tag } from 'antd';
import { useMemo } from 'react';
import {
  formatDuration,
  GENERATE_STATUS_CONFIG,
  PRACTICE_STATUS_CONFIG,
  PRACTICE_TYPE_CONFIG,
} from '../../PracticeList/utils';
import { usePracticeDetailModel } from '../models/page';

export default function MainView() {
  const {
    navigate,
    loading,
    error,
    session,
    questions,
    answersMap,
    report,
    selectedQuestion,
    handleViewQuestion,
    handleCloseQuestion,
    ungeneratedQuestions,
    hasUngeneratedQuestions,
    isModalOpen,
    setIsModalOpen,
    generationResults,
    handleOpenGenerationModal,
    handleStartGeneration,
    isGenerating,
  } = usePracticeDetailModel();

  const columns = useMemo<ProColumns<Question>[]>(
    () => [
      {
        title: '序号',
        dataIndex: 'index',
        width: 60,
        render: (_, __, index) => index + 1,
      },
      {
        title: '题目ID',
        dataIndex: 'id',
        width: 280,
        render: (id: any) => (
          <Button type="link" size="small" style={{ padding: 0 }} onClick={() => navigate(`/question/detail/${id}`)}>
            {id}
          </Button>
        ),
      },
      {
        title: '题型',
        dataIndex: 'question_type_code',
        width: 120,
      },
      {
        title: '题目内容',
        dataIndex: ['stem', 'text'],
        width: 300,
        ellipsis: true,
      },
      {
        title: '难度',
        dataIndex: 'difficulty',
        width: 80,
      },
      {
        title: '素材',
        width: 100,
        render: (_, record) => {
          const hasResource = record.resources && record.resources.length > 0;
          if (!hasResource) {
            return <span>-</span>;
          }
          const resourcesWithUrl = record.resources!.filter((r) => r.url && r.url.trim() !== '');
          const totalCount = record.resources!.length;
          const urlCount = resourcesWithUrl.length;

          if (urlCount === 0) {
            return <Tag color="red">未生成</Tag>;
          }
          if (urlCount < totalCount) {
            return <Tag color="orange">生成不足</Tag>;
          }
          return <Tag color="green">已生成</Tag>;
        },
      },
      {
        title: '是否作答',
        dataIndex: 'id',
        width: 100,
        render: (questionId: any) => {
          const answer = answersMap[questionId];
          return (
            <Tag color={answer?.status !== 0 ? 'success' : 'default'}>{answer?.status !== 0 ? '已作答' : '未作答'}</Tag>
          );
        },
      },
      {
        title: '答题结果',
        dataIndex: 'id',
        width: 100,
        render: (questionId: any) => {
          const answer = answersMap[questionId];
          if (!answer || answer.status === 0) {
            return <span style={{ color: '#999' }}>-</span>;
          }
          const isCorrect = answer.status === 1;
          return <Tag color={isCorrect ? 'success' : 'error'}>{isCorrect ? '正确' : '错误'}</Tag>;
        },
      },
      {
        title: '答题耗时',
        dataIndex: 'id',
        width: 100,
        render: (questionId: any) => {
          const answer = answersMap[questionId];
          if (!answer || !answer.time_spent) {
            return <span style={{ color: '#999' }}>-</span>;
          }
          return formatDuration(answer.time_spent);
        },
      },
      createActionColumn<Question>(
        (record) => (
          <Button type="link" size="small" onClick={() => handleViewQuestion(record)}>
            预览
          </Button>
        ),
        { width: 80 },
      ),
    ],
    [answersMap, handleViewQuestion],
  );

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

  const statusConfig = PRACTICE_STATUS_CONFIG[session.status as PracticeStatus];
  const typeConfig = PRACTICE_TYPE_CONFIG[session.practice_type];
  const generateConfig = GENERATE_STATUS_CONFIG[session.generate_status as PracticeGenerateStatus];

  return (
    <PageContainer title="练习详情" header={{ onBack: () => navigate(-1) }}>
      <Space vertical style={{ width: '100%' }} size="large">
        <Card title="基本信息">
          <ProDescriptions column={3}>
            <ProDescriptions.Item label="练习ID" copyable>
              {session.id}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="练习类型">
              <Tag color={typeConfig?.color || 'default'}>{typeConfig?.label || session.practice_type}</Tag>
            </ProDescriptions.Item>
            <ProDescriptions.Item label="状态">
              <Tag color={statusConfig?.color || 'default'}>{statusConfig?.label || '未知'}</Tag>
            </ProDescriptions.Item>
            <ProDescriptions.Item label="生成状态">
              <Tag color={generateConfig?.color || 'default'}>{generateConfig?.label || '未知'}</Tag>
            </ProDescriptions.Item>
            <ProDescriptions.Item label="学生">
              {session.student ? (
                <Button type="link" size="small" onClick={() => navigate(`/student/detail/${session.student_id}`)}>
                  {session.student.name}
                </Button>
              ) : (
                session.student_id
              )}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="科目">{session.subject || '-'}</ProDescriptions.Item>
            <ProDescriptions.Item label="年级">{session.grade ? GRADES[session.grade] : '-'}</ProDescriptions.Item>
            {session.ability_code && (
              <ProDescriptions.Item label="能力代码">{session.ability_code}</ProDescriptions.Item>
            )}
            {session.unit_id && <ProDescriptions.Item label="单元ID">{session.unit_id}</ProDescriptions.Item>}
            <ProDescriptions.Item label="开始时间">
              {session.start_time ? formatDateTime(session.start_time) : '-'}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="结束时间">
              {session.end_time ? formatDateTime(session.end_time) : '-'}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="创建时间">{formatDateTime(session.create_time)}</ProDescriptions.Item>
          </ProDescriptions>
        </Card>

        <Card title="练习进度">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="总题数" value={session.question_count} suffix="题" />
            </Col>
            <Col span={6}>
              <Statistic title="已完成" value={session.answer_count} suffix="题" />
            </Col>
            <Col span={6}>
              <Statistic title="正确" value={session.correct_count} suffix="题" valueStyle={{ color: '#52c41a' }} />
            </Col>
            <Col span={6}>
              <Statistic
                title="错误"
                value={session.answer_count - session.correct_count}
                suffix="题"
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
          </Row>
        </Card>

        {report && (
          <Card title="练习报告">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="综合得分" value={report.overall_score} precision={1} suffix="分" />
              </Col>
              <Col span={6}>
                <Statistic title="能力水平" value={report.ability_level || '-'} />
              </Col>
              <Col span={6}>
                <Statistic title="置信度" value={report.confidence} precision={2} />
              </Col>
              <Col span={6}>
                <Statistic title="总耗时" value={formatDuration(report.total_time)} />
              </Col>
            </Row>
          </Card>
        )}

        <Card title={`题目列表（共 ${session.question_count} 题）`} className="simple-table-card">
          <ProTable<Question>
            rowKey="id"
            columns={columns}
            search={false}
            pagination={false}
            dataSource={questions}
            loading={loading}
            options={false}
            toolbar={{ actions: [] }}
            scroll={{ x: 'max-content' }}
          />
        </Card>

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
                  <List.Item.Meta title={item.id} description={item.stem?.text} />
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
        </Flex>
      </FooterToolbar>
    </PageContainer>
  );
}
