import { PageContainer, ProTable } from '@ant-design/pro-components';
import { TextbookForm } from '@/components/view';
import { useTextbookListModel } from '../models/page';
import { useColumns } from '../hooks/useColumns';
import { Button } from 'antd';
import { TextbookApi } from '@/services/textbook';

export default function MainView() {
  const { actionRef, formRes } = useTextbookListModel();
  const columns = useColumns();
  return (
    <PageContainer
      header={{
        breadcrumb: {},
        title: '教材管理',
        extra: [
          <Button type="primary" onClick={() => formRes.showForm()}>
            新增教材
          </Button>,
        ],
      }}
    >
      <ProTable<Textbook>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        columns={columns}
        scroll={{ x: 'max-content' }}
        toolbar={{
          settings: [],
          actions: [],
        }}
        request={async () => {
          const data = await TextbookApi.search();
          return {
            data: data.data || [],
            success: true,
            total: data.total,
          };
        }}
      />
      <TextbookForm {...formRes} />
    </PageContainer>
  );
}
