import React from 'react';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { QuestionApi } from '@/services/question';
import { fmtTime } from '@/utils/time';
import { GRADES } from '@/constants/course';
import { Link } from '@umijs/max';
import { useConfigs } from '@/hooks';
import { Space, Button, Popconfirm, message, Tag } from 'antd';
import { useRequest } from 'ahooks';

const RESOURCE_TYPE_ENUM = {
  image: { text: '图片' },
  audio: { text: '音频' },
};

const RESOURCE_STATUS_ENUM = {
  true: { text: '已生成' },
  false: { text: '未生成' },
};

export default function QuestionListPage() {
  const { questionTypeEmun, subjectEnum, gradeEnum } = useConfigs();
  const [activeTab, setActiveTab] = React.useState<'question' | 'resource'>('question');
  const actionRef = React.useRef<any>();
  const resourceActionRef = React.useRef<any>();
  const [generateLoadingId, setGenerateLoadingId] = React.useState<string | null>(null);

  // 删除题目
  const { runAsync: handleDelete } = useRequest(
    async (id: string) => {
      await QuestionApi.delete(id);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('删除成功');
        actionRef.current?.reload();
      },
      onError: (error: any) => {
        message.error(error?.message || '删除失败');
      },
    },
  );

  const renderResourceTypeTag = React.useCallback((resourceType?: string) => {
    if (!resourceType) {
      return <Tag>无</Tag>;
    }
    if (resourceType === 'image') {
      return <Tag color="blue">图片</Tag>;
    }
    if (resourceType === 'audio') {
      return <Tag color="green">音频</Tag>;
    }
    return <Tag>{resourceType}</Tag>;
  }, []);

  const renderResourceStatusTag = React.useCallback((record: Question) => {
    if (!record.resource_type) {
      return <Tag>-</Tag>;
    }
    const isGenerated = record.resource && record.resource.trim() !== '';
    return (
      <Tag color={isGenerated ? 'success' : 'warning'}>{isGenerated ? '已生成' : '未生成'}</Tag>
    );
  }, []);

  const handleGenerateResource = async (record: Question) => {
    if (!record.resource_type) {
      message.warning('该题目未配置资源类型');
      return;
    }

    try {
      setGenerateLoadingId(String(record.id));
      if (record.resource_type === 'image') {
        await QuestionApi.generateImage(String(record.id));
      } else if (record.resource_type === 'audio') {
        await QuestionApi.generateAudio(String(record.id));
      } else {
        message.warning(`暂不支持生成 ${record.resource_type} 资源`);
        return;
      }
      message.success('资源生成任务已提交');
      resourceActionRef.current?.reload();
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error?.message || '资源生成失败');
    } finally {
      setGenerateLoadingId(null);
    }
  };

  const questionColumns: ProColumns<Question>[] = [
    {
      title: '题目',
      dataIndex: 'content',
      minWidth: 300,
    },
    {
      title: '类型',
      dataIndex: 'type',
      minWidth: 70,
      valueType: 'select',
      valueEnum: questionTypeEmun,
      renderText: (type, record) => {
        if (record.subtype) {
          return `${type}（${record.subtype}）`;
        }
        return type;
      },
    },
    {
      title: '学科',
      dataIndex: 'subject',
      minWidth: 70,
      valueType: 'select',
      valueEnum: subjectEnum,
    },
    {
      title: '阶段',
      dataIndex: 'grade',
      hideInSearch: true,
      minWidth: 70,
      renderText: (grade) => GRADES[grade].stage,
    },
    {
      title: '年级',
      dataIndex: 'grade',
      minWidth: 70,
      valueType: 'select',
      valueEnum: gradeEnum,
      renderText: (grade) => GRADES[grade].grade,
    },
    {
      title: '难度',
      minWidth: 60,
      dataIndex: 'difficulty',
      hideInSearch: true,
    },
    {
      title: '资源类型',
      dataIndex: 'resource_type',
      minWidth: 90,
      valueType: 'select',
      valueEnum: {
        ...RESOURCE_TYPE_ENUM,
        '': { text: '无' },
      },
      render: (_, record) => renderResourceTypeTag(record.resource_type),
    },
    {
      title: '资源状态',
      dataIndex: 'resource_generated',
      minWidth: 90,
      valueType: 'select',
      valueEnum: RESOURCE_STATUS_ENUM,
      render: (_, record) => renderResourceStatusTag(record),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      hideInSearch: true,
      minWidth: 170,
      renderText: (time) => fmtTime(time),
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      hideInSearch: true,
      minWidth: 170,
      renderText: (time) => fmtTime(time),
    },
    {
      title: '操作',
      key: 'option',
      fixed: 'right',
      hideInSearch: true,
      width: 180,
      render: (_, record) => (
        <Space>
          <Link className="umi-link" key="detail" to={`/question/detail/${record.id}`}>
            详情
          </Link>
          <Link className="umi-link" key="edit" to={`/question/edit/${record.id}`}>
            编辑
          </Link>
          <Popconfirm
            title="确定要删除这道题目吗？"
            description="删除后无法恢复，请谨慎操作。"
            onConfirm={() => handleDelete(String(record.id))}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const resourceColumns: ProColumns<Question>[] = [
    {
      title: '题目',
      dataIndex: 'content',
      minWidth: 300,
    },
    {
      title: '资源类型',
      dataIndex: 'resource_type',
      minWidth: 90,
      valueType: 'select',
      valueEnum: RESOURCE_TYPE_ENUM,
      render: (_, record) => renderResourceTypeTag(record.resource_type),
    },
    {
      title: '生成状态',
      dataIndex: 'resource_generated',
      minWidth: 90,
      valueType: 'select',
      valueEnum: RESOURCE_STATUS_ENUM,
      render: (_, record) => renderResourceStatusTag(record),
    },
    {
      title: '资源路径',
      dataIndex: 'resource',
      hideInSearch: true,
      ellipsis: true,
      render: (_, record) => record.resource || '-',
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      hideInSearch: true,
      minWidth: 170,
      renderText: (time) => fmtTime(time),
    },
    {
      title: '操作',
      key: 'option',
      fixed: 'right',
      hideInSearch: true,
      width: 200,
      render: (_, record) => {
        const isSupported = record.resource_type === 'image' || record.resource_type === 'audio';
        const isGenerating = generateLoadingId === String(record.id);
        return (
          <Space>
            <Button
              type="link"
              size="small"
              onClick={() => handleGenerateResource(record)}
              loading={isGenerating}
              disabled={!isSupported}
            >
              生成
            </Button>
            <Link className="umi-link" to={`/question/detail/${record.id}`}>
              详情
            </Link>
          </Space>
        );
      },
    },
  ];

  const buildSearchParams = React.useCallback((params: any): QuestionSearchParams => {
    console.log(params);
    const searchParams: QuestionSearchParams = {
      page: params.current || 1,
      size: params.pageSize || 10,
      keywords: params.content,
    };

    if (params.type !== undefined) {
      searchParams.type = params.type;
    }
    if (params.subject !== undefined) {
      searchParams.subject = params.subject;
    }
    if (params.grade !== undefined) {
      searchParams.grade = params.grade;
    }
    if (params.resource_type !== undefined) {
      searchParams.resource_type = params.resource_type;
    }
    if (params.resource_generated !== undefined && params.resource_generated !== null) {
      if (typeof params.resource_generated === 'string') {
        searchParams.resource_generated = params.resource_generated === 'true';
      } else {
        searchParams.resource_generated = Boolean(params.resource_generated);
      }
    }
    return searchParams;
  }, []);

  return (
    <PageContainer
      title="题目管理"
      header={{ breadcrumb: {} }}
      className="simple-list-page"
      tabList={[
        { key: 'question', tab: '题目列表' },
        { key: 'resource', tab: '资源列表' },
      ]}
      tabActiveKey={activeTab}
      onTabChange={(key) => setActiveTab(key as 'question' | 'resource')}
    >
      {activeTab === 'question' ? (
        <ProTable<Question>
          bordered
          actionRef={actionRef}
          rowKey="id"
          columns={questionColumns}
          request={async (params) => {
            const searchParams = buildSearchParams(params);
            const res = await QuestionApi.search(searchParams);
            return {
              data: res?.data || [],
              total: res?.total || 0,
              success: true,
            };
          }}
          search={{ labelWidth: 'auto', defaultFormItemsNumber: 8 }}
          options={false}
          toolbar={{ settings: [] }}
          scroll={{ x: 'max-content' }}
        />
      ) : (
        <ProTable<Question>
          bordered
          actionRef={resourceActionRef}
          rowKey="id"
          columns={resourceColumns}
          request={async (params) => {
            const searchParams = buildSearchParams(params);
            const res = await QuestionApi.searchResource(searchParams);
            return {
              data: res?.data || [],
              total: res?.total || 0,
              success: true,
            };
          }}
          search={{ labelWidth: 'auto', defaultFormItemsNumber: 3 }}
          options={false}
          toolbar={{ settings: [] }}
          scroll={{ x: 'max-content' }}
        />
      )}
    </PageContainer>
  );
}
