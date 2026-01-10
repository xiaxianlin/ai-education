import { EditOutlined } from '@ant-design/icons';
import { ProDescriptions } from '@ant-design/pro-components';
import { Button, Card, Empty, Tag } from 'antd';
import { SubjectVersionForm } from '../components/SubjectVersionForm';
import { useStudentDetailModel } from '../models/page';

export function TextbookList() {
  const { student, textbookService, addTextbookVisible, setAddTextbookVisible } = useStudentDetailModel();

  const { data, refresh } = textbookService;

  return (
    <>
      <Card
        title="教材信息"
        extra={
          <Button type="primary" icon={<EditOutlined />} onClick={() => setAddTextbookVisible(true)}>
            编辑
          </Button>
        }
      >
        {data && data.length > 0 ? (
          <ProDescriptions column={3} bordered>
            {data.map((item: { subject: string; version: string }, index: number) => (
              <ProDescriptions.Item key={`${item.subject}-${index}`} label={item.subject}>
                <Tag color="blue" className="tag-large">{item.version}</Tag>
              </ProDescriptions.Item>
            ))}
          </ProDescriptions>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span style={{ color: '#bfbfbf', fontSize: '14px' }}>暂无教材信息</span>}
            style={{ padding: '40px 0' }}
          />
        )}
      </Card>
      <SubjectVersionForm
        studentId={student?.id || ''}
        open={addTextbookVisible}
        onCancel={() => setAddTextbookVisible(false)}
        onSuccess={() => {
          refresh();
          setAddTextbookVisible(false);
        }}
      />
    </>
  );
}
