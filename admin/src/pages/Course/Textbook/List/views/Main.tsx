import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useTextbookListModel } from '../models/page';
import { useColumns } from '../hooks/useColumns';
import { Button } from 'antd';
import { TextbookApi } from '@/services/textbook';
import { TextbookForm } from '../../Components/TextbookForm';

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
        columns={columns}
        search={{
          labelWidth: 'auto',
          layout: 'inline',
          defaultColsNumber: 3,
          defaultCollapsed: false,
        }}
        scroll={{ x: 'max-content' }}
        toolbar={{
          actions: [],
        }}
        request={async ({ pageSize, current, ...filter }) => {
          const data = await TextbookApi.search({
            current_page: current,
            page_size: pageSize,
            ...filter,
          });
          return {
            data: data.data || [],
            success: true,
            total: data.total,
          };
        }}
        pagination={{ pageSize: 10 }}
      />
      <TextbookForm {...formRes} />
    </PageContainer>
  );
}
