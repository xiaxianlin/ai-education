import {
    GRADES, SPECIALTY_TYPE_LABELS,
    STAGE_LABELS,
    SpecialtyType,
    Stage
} from '@ai-education/shared-web';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Descriptions, Empty, Flex, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { usePracticeDetailModel } from '../models/page';
;

// 参数配置 Table 列定义（用于显示 dict 类型的 parameter_config）
const parameterConfigColumns: ColumnsType<{ key: string; value: any }> = [
  {
    title: '参数键',
    dataIndex: 'key',
    key: 'key',
    width: 150,
  },
  {
    title: '参数值',
    dataIndex: 'value',
    key: 'value',
    render: (value: any) => {
      if (value === undefined || value === null) return '-';
      if (typeof value === 'object') {
        return <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(value, null, 2)}</pre>;
      }
      return String(value);
    },
  },
];

export default function MainView() {
  const {
    detail,
    loading,
    handleEdit,
    handleBack,
    handleConfigParams,
  } = usePracticeDetailModel();

  // 渲染题量配置
  const renderQuestionCountConfig = (config?: QuestionCountConfig) => {
    if (!config) return '-';
    const items = [];
    if (config.total) items.push(`总题量: ${config.total}`);
    if (config.per_group) items.push(`每组: ${config.per_group}`);
    if (config.max_groups) items.push(`最大组数: ${config.max_groups}`);
    if (config.time_limit_minutes) items.push(`时间限制: ${config.time_limit_minutes}分钟`);
    return items.length ? items.join('，') : '-';
  };

  // 渲染难度配置
  const renderDifficultyConfig = (config?: DifficultyConfig) => {
    if (!config) return '-';
    const items = [];
    if (config.level) items.push(`难度等级: ${config.level}`);
    if (config.target_accuracy) items.push(`目标正确率: ${Math.round(config.target_accuracy * 100)}%`);
    if (config.distribution) {
      const dist = config.distribution;
      const distStr = [
        dist.easy && `简单${dist.easy}`,
        dist.medium && `中等${dist.medium}`,
        dist.hard && `困难${dist.hard}`,
      ]
        .filter(Boolean)
        .join('/');
      if (distStr) items.push(`分布: ${distStr}`);
    }
    return items.length ? items.join('，') : '-';
  };

  // 渲染能力配置
  const renderAbilityConfig = (config?: AbilityConfig) => {
    if (!config) return '-';
    const items = [];
    if (config.cognitive_levels?.length) {
      items.push(`认知层次: ${config.cognitive_levels.join(', ')}`);
    }
    if (config.distribution) {
      const distStr = Object.entries(config.distribution)
        .map(([k, v]) => `${k}:${v}`)
        .join(', ');
      items.push(`分布: ${distStr}`);
    }
    return items.length ? items.join('；') : '-';
  };

  // 渲染反馈配置
  const renderFeedbackConfig = (config?: PracticeFeedbackConfig) => {
    if (!config) return '-';
    const items = [];
    if (config.instant_feedback !== undefined) {
      items.push(`即时反馈: ${config.instant_feedback ? '是' : '否'}`);
    }
    if (config.show_explanation !== undefined) {
      items.push(`显示解析: ${config.show_explanation ? '是' : '否'}`);
    }
    if (config.gamification) {
      const g = config.gamification;
      const gItems = [];
      if (g.enable_points) gItems.push('积分');
      if (g.enable_badges) gItems.push('徽章');
      if (g.enable_progress) gItems.push('进度');
      if (gItems.length) items.push(`游戏化: ${gItems.join('/')}`);
    }
    return items.length ? items.join('，') : '-';
  };

  return (
    <PageContainer
      title="练习详情"
      header={{
        onBack: handleBack,
        breadcrumb: {},
      }}
      extra={
        <Space>
          <Button onClick={handleConfigParams}>参数配置</Button>
          <Button type="primary" onClick={handleEdit}>
            编辑
          </Button>
        </Space>
      }
    >
      <Card loading={loading}>
        {detail && (
          <Flex vertical gap={24}>
            {/* 基本信息 */}
            <Card title="基本信息" size="small">
              <Descriptions column={2}>
                <Descriptions.Item label="名称">{detail.name}</Descriptions.Item>
                <Descriptions.Item label="标识">{detail.slug}</Descriptions.Item>
                <Descriptions.Item label="专项类型">
                  {detail.specialty_type ? (
                    <Tag>{SPECIALTY_TYPE_LABELS[detail.specialty_type as SpecialtyType]}</Tag>
                  ) : (
                    '-'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="图标">{detail.icon || '-'}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={detail.is_active ? 'green' : 'default'}>{detail.is_active ? '启用' : '禁用'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {detail.create_time ? new Date(detail.create_time * 1000).toLocaleString() : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {detail.update_time ? new Date(detail.update_time * 1000).toLocaleString() : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="描述" span={2}>
                  {detail.description || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 适用范围 */}
            <Card title="适用范围" size="small">
              <Descriptions column={2}>
                <Descriptions.Item label="科目">{detail.subject || '-'}</Descriptions.Item>
                <Descriptions.Item label="学段">
                  {detail.stages?.length ? (
                    <Flex gap={4} wrap>
                      {detail.stages.map((s) => (
                        <Tag key={s}>{STAGE_LABELS[s as Stage] || s}</Tag>
                      ))}
                    </Flex>
                  ) : (
                    '-'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="年级">
                  {detail.grades?.length ? (
                    <Flex gap={4} wrap>
                      {detail.grades.map((g) => (
                        <Tag key={g}>{GRADES[g] || `${g}年级`}</Tag>
                      ))}
                    </Flex>
                  ) : (
                    '-'
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 配置信息 */}
            <Card title="配置信息" size="small">
              <Descriptions column={1}>
                <Descriptions.Item label="题量配置">
                  {renderQuestionCountConfig(detail.question_count_config)}
                </Descriptions.Item>
                <Descriptions.Item label="难度配置">
                  {renderDifficultyConfig(detail.difficulty_config)}
                </Descriptions.Item>
                <Descriptions.Item label="能力配置">{renderAbilityConfig(detail.ability_config)}</Descriptions.Item>
                <Descriptions.Item label="反馈配置">{renderFeedbackConfig(detail.feedback_config)}</Descriptions.Item>
                <Descriptions.Item label="提示词模板" span={1}>
                  {detail.prompt ? (
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, maxHeight: '300px', overflow: 'auto' }}>
                      {detail.prompt}
                    </pre>
                  ) : (
                    '-'
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 参数配置 */}
            <Card
              title="参数配置"
              size="small"
              extra={
                <Button size="small" onClick={handleConfigParams}>
                  配置参数
                </Button>
              }
            >
              {detail.parameter_config && Object.keys(detail.parameter_config).length > 0 ? (
                <Table
                  dataSource={Object.entries(detail.parameter_config).map(([key, value]) => ({ key, value }))}
                  columns={parameterConfigColumns}
                  rowKey="key"
                  size="small"
                  pagination={false}
                />
              ) : (
                <Empty description="暂无参数配置" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>

          </Flex>
        )}
      </Card>
    </PageContainer>
  );
}
