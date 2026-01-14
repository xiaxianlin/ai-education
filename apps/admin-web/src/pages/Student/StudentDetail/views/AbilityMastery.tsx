import { GRADES, SUBJECTS } from '@ai-education/shared-web';
import { ProTable } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Card, Col, Empty, Progress, Row, Space, Statistic, Tag } from 'antd';
import { StudentApi } from '../../api';
import { useStudentDetailModel } from '../models/page';

// 掌握等级配置
const MASTERY_LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  unlearned: { label: '未掌握', color: 'error' },
  beginner: { label: '初步掌握', color: 'warning' },
  proficient: { label: '基本掌握', color: 'processing' },
  mastered: { label: '熟练掌握', color: 'success' },
};


export function AbilityMastery() {
  const { student } = useStudentDetailModel();

  // 获取能力掌握度列表
  const { data: masteryList, loading } = useRequest(() => StudentApi.getStudentMastery(student?.id || ''), {
    ready: !!student?.id,
  });

  // 获取能力掌握度概览
  const { data: summary } = useRequest(() => StudentApi.getStudentMasterySummary(student?.id || ''), {
    ready: !!student?.id,
  });

  const columns = [
    {
      title: '能力名称',
      dataIndex: 'ability_name',
      key: 'ability_name',
      width: 200,
    },
    {
      title: '科目',
      dataIndex: 'subject',
      key: 'subject',
      width: 80,
      render: (_: any, record: any) => (SUBJECTS as any)[record.subject] || record.subject,
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 80,
      render: (_: any, record: any) => GRADES[record.grade] || record.grade,
    },
    {
      title: '掌握度',
      dataIndex: 'mastery_score',
      key: 'mastery_score',
      width: 200,
      render: (_: any, record: any) => (
        <Progress
          percent={record.mastery_score}
          size="small"
          status={record.mastery_score >= 80 ? 'success' : record.mastery_score >= 60 ? 'normal' : 'exception'}
          format={(percent) => `${percent?.toFixed(1)}%`}
        />
      ),
    },
    {
      title: '等级',
      dataIndex: 'mastery_level',
      key: 'mastery_level',
      width: 100,
      render: (_: any, record: any) => {
        const config = MASTERY_LEVEL_CONFIG[record.mastery_level] || { label: record.mastery_level, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '练习次数',
      key: 'practice_count',
      width: 100,
      render: (_: any, record: any) => (
        <span>
          <span style={{ color: '#52c41a' }}>{record.correct_count}</span>
          {' / '}
          <span style={{ color: '#ff4d4f' }}>{record.wrong_count}</span>
        </span>
      ),
    },
  ];

  return (
    <Card title="能力分析" loading={loading}>
      {/* 概览统计 */}
      {summary && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic title="已练习能力" value={summary.total_abilities} suffix="个" />
          </Col>
          <Col span={6}>
            <Statistic
              title="平均掌握度"
              value={summary.avg_mastery_score}
              suffix="%"
              precision={1}
              valueStyle={{
                color: summary.avg_mastery_score >= 60 ? '#3f8600' : '#cf1322',
              }}
            />
          </Col>
          <Col span={12}>
            <Space size="large">
              {Object.entries(summary.level_distribution || {}).map(([level, count]) => {
                const config = MASTERY_LEVEL_CONFIG[level] || { label: level, color: 'default' };
                return (
                  <Tag key={level} color={config.color}>
                    {config.label}: {count}
                  </Tag>
                );
              })}
            </Space>
          </Col>
        </Row>
      )}

      {/* 能力列表 */}
      {masteryList && masteryList.length > 0 ? (
        <ProTable
          columns={columns}
          dataSource={masteryList}
          rowKey="id"
          search={false}
          toolBarRender={false}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      ) : (
        <Empty description="暂无能力掌握度数据" />
      )}
    </Card>
  );
}
