import {
  ANSWER_TYPE_LABELS,
  INTERACTION_TYPE_LABELS,
  RESOURCE_TYPE_LABELS,
  STAGE_LABELS,
} from '@ai-education/shared-web';
import { PageContainer } from '@ant-design/pro-components';
import ReactJson from '@uiw/react-json-view';
import { Button, Card, Descriptions, Space, Tag } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuestionTypeDetailModel } from '../models/page';

export default function MainView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { item, loading } = useQuestionTypeDetailModel();

  return (
    <PageContainer
      title="题型详情"
      header={{
        onBack: () => navigate('/question_type'),
        extra: (
          <Button type="primary" onClick={() => navigate(`/question_type/form/${id}`)}>
            编辑
          </Button>
        ),
      }}
    >
      <Card loading={loading}>
        <Descriptions title="基本信息" bordered column={2}>
          <Descriptions.Item label="编码">{item?.code}</Descriptions.Item>
          <Descriptions.Item label="名称">{item?.name}</Descriptions.Item>
          <Descriptions.Item label="科目">
            <Tag color="blue">{item?.subject}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            {item?.is_active ? <Tag color="success">启用</Tag> : <Tag color="error">禁用</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>
            {item?.description || '-'}
          </Descriptions.Item>
        </Descriptions>

        <Descriptions title="适用范围" bordered column={2} style={{ marginTop: 24 }}>
          <Descriptions.Item label="适用学段">
            <Space size={4} wrap>
              {item?.stages.map((s) => (
                <Tag key={s} color="green">
                  {STAGE_LABELS[s as keyof typeof STAGE_LABELS] || s}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="适用年级">{item?.grades.join(', ') || '-'}</Descriptions.Item>
        </Descriptions>

        <Descriptions title="交互与资源配置" bordered column={2} style={{ marginTop: 24 }}>
          <Descriptions.Item label="交互类型">
            <Tag color="purple">
              {INTERACTION_TYPE_LABELS[item?.interaction_type as keyof typeof INTERACTION_TYPE_LABELS] ||
                item?.interaction_type}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="资源类型">
            <Tag>
              {RESOURCE_TYPE_LABELS[item?.resource_type as keyof typeof RESOURCE_TYPE_LABELS] || item?.resource_type}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="交互配置" span={2}>
            {item?.interaction_config ? (
              <ReactJson value={item.interaction_config} displayDataTypes={false} collapsed={1} />
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="资源配置" span={2}>
            {item?.resource_config ? (
              <ReactJson value={item.resource_config} displayDataTypes={false} collapsed={1} />
            ) : (
              '-'
            )}
          </Descriptions.Item>
        </Descriptions>

        <Descriptions title="答案与反馈配置" bordered column={2} style={{ marginTop: 24 }}>
          <Descriptions.Item label="答案类型">
            <Tag color="orange">
              {ANSWER_TYPE_LABELS[item?.answer_type as keyof typeof ANSWER_TYPE_LABELS] || item?.answer_type}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="答案配置" span={2}>
            {item?.answer_config ? <ReactJson value={item.answer_config} displayDataTypes={false} collapsed={1} /> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="反馈配置" span={2}>
            {item?.feedback_config ? (
              <ReactJson value={item.feedback_config} displayDataTypes={false} collapsed={1} />
            ) : (
              '-'
            )}
          </Descriptions.Item>
        </Descriptions>

        <Descriptions title="AI 配置" bordered column={1} style={{ marginTop: 24 }}>
          <Descriptions.Item label="AI 指令">
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{item?.ai_prompt || '-'}</pre>
          </Descriptions.Item>
        </Descriptions>

        <Descriptions title="认知与能力" bordered column={2} style={{ marginTop: 24 }}>
          <Descriptions.Item label="认知层次">{item?.cognitive_levels?.join(', ') || '-'}</Descriptions.Item>
          <Descriptions.Item label="能力维度">{item?.ability_dimensions?.join(', ') || '-'}</Descriptions.Item>
        </Descriptions>

        <Descriptions title="其他设置" bordered column={2} style={{ marginTop: 24 }}>
          <Descriptions.Item label="排序">{item?.sort_order}</Descriptions.Item>
          <Descriptions.Item label="最后更新">{item?.update_time}</Descriptions.Item>
        </Descriptions>
      </Card>
    </PageContainer>
  );
}

