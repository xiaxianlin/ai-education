import { PageContainer } from '@ant-design/pro-components';
import ReactJson from '@uiw/react-json-view';
import { Button, Card, Descriptions, Tag } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuestionTemplateDetailModel } from '../models/page';

export default function MainView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { item, loading, questionType } = useQuestionTemplateDetailModel();

  return (
    <PageContainer
      title="题目模板详情"
      header={{
        onBack: () => navigate('/question_template'),
        extra: (
          <Button type="primary" onClick={() => navigate(`/question_template/form/${id}`)}>
            编辑
          </Button>
        ),
      }}
    >
      <Card loading={loading}>
        <Descriptions title="基本信息" bordered column={2}>
          <Descriptions.Item label="模板名称">{item?.name}</Descriptions.Item>
          <Descriptions.Item label="关联题型">{questionType?.name || item?.question_type_id}</Descriptions.Item>
          <Descriptions.Item label="状态">
            {item?.is_active ? <Tag color="success">启用</Tag> : <Tag color="default">禁用</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{item?.create_time}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{item?.update_time}</Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>
            {item?.description || '-'}
          </Descriptions.Item>
        </Descriptions>

        <Descriptions title="AI 提示词配置" bordered column={1} style={{ marginTop: 24 }}>
          <Descriptions.Item label="System Prompt">
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{item?.system_prompt || '-'}</pre>
          </Descriptions.Item>
          <Descriptions.Item label="User Prompt Template">
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{item?.user_prompt_template || '-'}</pre>
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 24 }}>
          <Descriptions title="变量与结构配置" bordered column={1}>
            <Descriptions.Item label="变量定义">
              {item?.variables ? <ReactJson value={item.variables} displayDataTypes={false} collapsed={1} /> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="输出结构">
              {item?.output_schema ? (
                <ReactJson value={item.output_schema} displayDataTypes={false} collapsed={1} />
              ) : (
                '-'
              )}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Card>
    </PageContainer>
  );
}

