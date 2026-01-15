import { FooterToolbar, PageContainer } from '@ant-design/pro-components';
import { Button, Card, Collapse, Flex } from 'antd';
import { useParams } from 'react-router-dom';
import { useQuestionTypeDetailModel } from '../models/page';
import { BaseDetail } from './BaseDetail';
import { ConfigDetail } from './ConfigDetail';
import { PromptDetail } from './PromptDetail';

export default function MainView() {
  const { id } = useParams<{ id: string }>();
  const { item, loading, navigate, deleting, handleDelete, handleGenerate } = useQuestionTypeDetailModel();

  // 根据 category 判断 type
  const getTypeFromCategory = (category?: string) => {
    if (category === 'unit_practice') return 'unit';
    if (category === 'ability_practice') return 'ability';
    return 'unit'; // 默认值
  };

  const handleEdit = () => {
    if (!item || !id) return;
    const type = getTypeFromCategory(item.category);
    navigate(`/question_type/${type}/form?id=${id}`);
  };

  return (
    <PageContainer
      title="题型详情"
      header={{
        onBack: () => navigate('/question_type'),
        breadcrumb: {},
      }}
    >
      <Card loading={loading}>
        {item && (
          <Collapse
            activeKey={['basic', 'prompt', 'config']}
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: <BaseDetail item={item} />,
              },
              {
                key: 'prompt',
                label: '提示词',
                children: <PromptDetail prompt={item.prompt} />,
              },
              {
                key: 'config',
                label: '配置信息',
                children: <ConfigDetail item={item} />,
              },
            ]}
          />
        )}
      </Card>
      <FooterToolbar className="page-footer">
        <Flex justify="center" gap={16}>
          <Button size="large" onClick={() => navigate('/question_type')}>
            返回
          </Button>
          <Button size="large" type="primary" onClick={handleGenerate} disabled={!item?.code}>
            生成
          </Button>
          <Button size="large" type="primary" onClick={handleEdit}>
            编辑
          </Button>
          <Button size="large" danger loading={deleting} onClick={handleDelete}>
            删除
          </Button>
        </Flex>
      </FooterToolbar>
    </PageContainer>
  );
}
