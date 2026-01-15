import { GRADES } from '@ai-education/shared-web';
import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import { Drawer, Flex, Tag } from 'antd';
import { useQuestionListModel } from '../models/page';

export function DetailView() {
  const { currentQuestion, closeDetail } = useQuestionListModel();

  const content = (currentQuestion?.content || {}) as Record<string, any>;
  const stem = content.stem || '';
  const stemText = typeof stem === 'string' ? stem : (stem as any)?.text || '';
  const gradeInfo = currentQuestion?.grade ? GRADES[currentQuestion.grade] : undefined;

  return (
    <Drawer
      title="题目详情"
      placement="right"
      width={720}
      open={!!currentQuestion}
      onClose={closeDetail}
      destroyOnHidden
    >
      {currentQuestion && (
        <Flex vertical gap={16}>
          <ProCard title="基本信息">
            <ProDescriptions column={2}>
              <ProDescriptions.Item label="题目ID">{currentQuestion.id}</ProDescriptions.Item>
              <ProDescriptions.Item label="科目">
                <Tag color="blue">{currentQuestion.subject}</Tag>
              </ProDescriptions.Item>
              <ProDescriptions.Item label="年级">{gradeInfo || '-'}</ProDescriptions.Item>
              <ProDescriptions.Item label="题型编码">{currentQuestion.question_type_code}</ProDescriptions.Item>
              {currentQuestion.ability_code && (
                <ProDescriptions.Item label="能力代码">
                  <Tag color="cyan">{currentQuestion.ability_code}</Tag>
                </ProDescriptions.Item>
              )}
              <ProDescriptions.Item label="创建时间">
                {currentQuestion.create_time ? new Date(currentQuestion.create_time * 1000).toLocaleString() : '-'}
              </ProDescriptions.Item>
            </ProDescriptions>
          </ProCard>

          <ProCard title="题干内容">
            <div style={{ fontSize: '16px', lineHeight: '1.6' }}>{stemText || '-'}</div>
          </ProCard>

          <ProCard title="答案与解析">
            <ProDescriptions column={1}>
              <ProDescriptions.Item label="答案">
                <pre style={{ margin: 0 }}>{JSON.stringify(currentQuestion.answer, null, 2)}</pre>
              </ProDescriptions.Item>
              <ProDescriptions.Item label="解析">{currentQuestion.explanation || '无解析'}</ProDescriptions.Item>
            </ProDescriptions>
          </ProCard>

          <ProCard title="原始数据">
            <pre
              style={{
                padding: '16px',
                backgroundColor: '#fafafa',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                lineHeight: '1.5',
                margin: 0,
              }}
            >
              {JSON.stringify(currentQuestion, null, 2)}
            </pre>
          </ProCard>
        </Flex>
      )}
    </Drawer>
  );
}
