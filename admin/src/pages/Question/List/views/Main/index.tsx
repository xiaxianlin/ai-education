import { Button, Table, Typography } from 'antd';
import type { TableProps } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useQuestionListModel } from '../../models/page';
import { fmtTime } from '@/utils/time';
import DetailView from '../Detail';
type ColumnsType<T extends object = object> = TableProps<T>['columns'];

export default function MainView() {
  const {
    state: { page, total, questions, listLoading },
    setPage,
    showDetail,
  } = useQuestionListModel();
  const columns: ColumnsType<Question> = [
    {
      title: '题目',
      dataIndex: 'question',
      render: (text) => <Typography.Paragraph ellipsis={{ rows: 2 }}>{text}</Typography.Paragraph>,
    },
    {
      title: '上传时间',
      dataIndex: 'create_time',
      width: 150,
      render: (time) => fmtTime(time),
    },
    {
      title: '操作',
      dataIndex: 'id',
      render: (id) => (
        <Button type="link" onClick={() => showDetail(id)}>
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <PageContainer ghost header={{ title: '我的题库', breadcrumb: {} }}>
      <Table<Question>
        bordered
        rowKey="id"
        columns={columns}
        loading={listLoading}
        dataSource={questions}
        pagination={{ current: page, pageSize: 10, total, onChange: (page) => setPage(page) }}
      />
      <DetailView />
    </PageContainer>
  );
}
