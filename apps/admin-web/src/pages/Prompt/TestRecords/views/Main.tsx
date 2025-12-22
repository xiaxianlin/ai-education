import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Tag, Button, Typography } from 'antd';
import { usePromptTestRecordsModel } from '../models/page';
import { DeleteButton } from '@/components';
import { PromptApi } from '../../api';
import { createTimeColumn, createActionColumn } from '@/hooks';
import RecordDetailDrawer from '../components/RecordDetailDrawer';

const { Text } = Typography;

const STATUS_MAP = {
  pending: { text: '待测试', color: 'default' },
  testing: { text: '测试中', color: 'processing' },
  success: { text: '成功', color: 'success' },
  failed: { text: '失败', color: 'error' },
};

const GENERATION_TYPE_MAP = {
  text: { text: '文本', color: 'blue' },
  image: { text: '图片', color: 'green' },
  audio: { text: '语音', color: 'orange' },
  video: { text: '视频', color: 'purple' },
};

export default function MainView() {
  const navigate = useNavigate();
  const { actionRef, handleDelete } = usePromptTestRecordsModel();
  const [detailDrawer, setDetailDrawer] = useState<{
    open: boolean;
    record?: PromptTestRecord;
  }>({ open: false });

  const columns = useMemo<ProColumns<PromptTestRecord>[]>(
    () => [
      {
        title: '记录ID',
        dataIndex: 'id',
        width: 80,
        hideInSearch: true,
      },
      {
        title: '提示词ID',
        dataIndex: 'prompt_id',
        width: 100,
        renderText: (promptId: number) => (
          <Button size="small" type="link" onClick={() => navigate(`/prompt/versions?prompt_id=${promptId}`)}>
            {promptId}
          </Button>
        ),
      },
      {
        title: '版本ID',
        dataIndex: 'version_id',
        width: 100,
        renderText: (versionId: number) => (
          <Button size="small" type="link" onClick={() => navigate(`/prompt/detail?version_id=${versionId}`)}>
            {versionId}
          </Button>
        ),
      },
      {
        title: '生成类型',
        dataIndex: 'generation_type',
        width: 100,
        valueType: 'select',
        valueEnum: {
          text: { text: '文本' },
          image: { text: '图片' },
          audio: { text: '语音' },
          video: { text: '视频' },
        },
        render: (_, record) => {
          const type = record.generation_type || 'text';
          const typeInfo = GENERATION_TYPE_MAP[type as keyof typeof GENERATION_TYPE_MAP] || GENERATION_TYPE_MAP.text;
          return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
        },
      },
      {
        title: '模型',
        dataIndex: 'model_name',
        width: 150,
        renderText: (modelName: string, record: PromptTestRecord) => (
          <span>
            {record.model_provider && <Text type="secondary">{record.model_provider}/</Text>}
            {modelName || '-'}
          </span>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        valueType: 'select',
        hideInSearch: true,
        valueEnum: {
          0: { text: '待测试' },
          1: { text: '测试中' },
          2: { text: '成功' },
          3: { text: '失败' },
        },
        render: (_, record) => {
          const statusInfo = STATUS_MAP[record.status] || STATUS_MAP.pending;
          return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
        },
      },
      {
        title: '耗时(ms)',
        dataIndex: 'latency_ms',
        width: 100,
        hideInSearch: true,
        renderText: (latency: number | undefined) => (latency !== undefined ? `${latency}ms` : '-'),
      },
      {
        title: 'Tokens',
        dataIndex: ['response_snapshot', 'usage', 'total_tokens'],
        width: 100,
        hideInSearch: true,
        renderText: (tokens: number | undefined) => tokens ?? '-',
      },
      {
        title: '错误信息',
        dataIndex: 'error',
        width: 200,
        hideInSearch: true,
        ellipsis: true,
        renderText: (error: string | undefined) => error || '-',
      },
      createTimeColumn<PromptTestRecord>('测试时间', 'create_time', { width: 180 }),
      createActionColumn<PromptTestRecord>(
        (record) => (
          <>
            <Button size="small" type="link" onClick={() => setDetailDrawer({ open: true, record })}>
              详情
            </Button>
            <DeleteButton onConfirm={() => handleDelete(record.id)} />
          </>
        ),
        { width: 100 },
      ),
    ],
    [navigate, handleDelete],
  );

  return (
    <PageContainer title="测试记录" header={{ breadcrumb: {} }}>
      <ProTable<PromptTestRecord>
        bordered
        cardBordered
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{
          labelWidth: 'auto',
          layout: 'inline',
          defaultCollapsed: true,
          defaultColsNumber: 6,
        }}
        request={async ({ current, pageSize, ...rest }) => {
          const res = await PromptApi.listPromptTestRecords({ page: current || 1, size: pageSize || 10, ...rest });
          return { data: res?.data || [], success: true, total: res?.total || 0 };
        }}
        toolbar={{ settings: [] }}
        headerTitle={<div />}
      />

      <RecordDetailDrawer
        open={detailDrawer.open}
        record={detailDrawer.record}
        onClose={() => setDetailDrawer({ open: false })}
      />
    </PageContainer>
  );
}
