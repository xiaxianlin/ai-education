import { GRADES } from '@/constants/course';
import {
  SCENE_TYPE_LABELS,
  SPECIALTY_TYPE_LABELS,
  STAGE_LABELS,
  SceneType,
  SpecialtyType,
  Stage,
} from '@ai-education/shared-web';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Descriptions, Flex, Tag } from 'antd';
import { usePromptDetailModel } from '../models/page';

export default function MainView() {
  const { detail, loading, handleEdit, handleBack } = usePromptDetailModel();

  return (
    <PageContainer
      title="提示词配置详情"
      header={{
        onBack: handleBack,
        breadcrumb: {},
      }}
      extra={
        <Button type="primary" onClick={handleEdit}>
          编辑
        </Button>
      }
    >
      <Card loading={loading}>
        {detail && (
          <Flex vertical gap={24}>
            <Card title="基本信息" size="small">
              <Descriptions column={2}>
                <Descriptions.Item label="名称">{detail.name || '-'}</Descriptions.Item>
                <Descriptions.Item label="编码">{detail.code || '-'}</Descriptions.Item>
                <Descriptions.Item label="场景类型">
                  {detail.scene_type ? SCENE_TYPE_LABELS[detail.scene_type as SceneType] : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="专项类型">
                  {detail.specialty_type ? SPECIALTY_TYPE_LABELS[detail.specialty_type as SpecialtyType] : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={detail.is_active ? 'green' : 'default'}>{detail.is_active ? '启用' : '禁用'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="排序">{detail.sort_order ?? 0}</Descriptions.Item>
                <Descriptions.Item label="描述" span={2}>
                  {detail.description || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

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
                <Descriptions.Item label="学期">
                  {detail.semesters?.length ? (
                    <Flex gap={4} wrap>
                      {detail.semesters.map((s) => (
                        <Tag key={s}>{s}学期</Tag>
                      ))}
                    </Flex>
                  ) : (
                    '-'
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="关联信息" size="small">
              <Descriptions column={2}>
                <Descriptions.Item label="关联练习">
                  {detail.practice?.name || detail.practice_slug || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="关联提示词">
                  {detail.prompt?.name || detail.prompt_slug || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {(detail.question_type_configs ||
              detail.difficulty_config ||
              detail.question_count_config ||
              detail.template_variables) && (
              <Card title="配置信息" size="small">
                <Descriptions column={1}>
                  {detail.question_type_configs && detail.question_type_configs.length > 0 && (
                    <Descriptions.Item label="题型配置">
                      <pre style={{ margin: 0, fontSize: 12, background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                        {JSON.stringify(detail.question_type_configs, null, 2)}
                      </pre>
                    </Descriptions.Item>
                  )}
                  {detail.difficulty_config && (
                    <Descriptions.Item label="难度配置">
                      <pre style={{ margin: 0, fontSize: 12, background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                        {JSON.stringify(detail.difficulty_config, null, 2)}
                      </pre>
                    </Descriptions.Item>
                  )}
                  {detail.question_count_config && (
                    <Descriptions.Item label="题量配置">
                      <pre style={{ margin: 0, fontSize: 12, background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                        {JSON.stringify(detail.question_count_config, null, 2)}
                      </pre>
                    </Descriptions.Item>
                  )}
                  {detail.template_variables && detail.template_variables.length > 0 && (
                    <Descriptions.Item label="模板变量">
                      <pre style={{ margin: 0, fontSize: 12, background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                        {JSON.stringify(detail.template_variables, null, 2)}
                      </pre>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}
          </Flex>
        )}
      </Card>
    </PageContainer>
  );
}
