import React from 'react';
import { PageContainer, ProColumns } from '@ant-design/pro-components';
import { adminApi } from '@/lib/api';
import { GRADES } from '@/constants/course';
import { Link } from 'react-router-dom';
import { useConfigs, useDelete } from '@/hooks';
import { Space, Button, message } from 'antd';
import { CommonTable, DeleteButton } from '@/components/business';
import { renderResourceTypeTag, renderResourceStatusTag } from '@/utils/tag';

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
  const { handleDelete } = useDelete(adminApi.deleteQuestion, {
    onSuccess: () => actionRef.current?.reload(),
  });

  const handleGenerateResource = async (record: Question) => {
    if (!record.resource_type) {
      message.warning('该题目未配置资源类型');
      return;
    }

    try {
      setGenerateLoadingId(String(record.id));
      if (record.resource_type === 'image') {
        await adminApi.generateQuestionImage(String(record.id));
      } else if (record.resource_type === 'audio') {
        await adminApi.generateQuestionAudio(String(record.id));
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
      title: '题目ID',
      dataIndex: 'id',
      minWidth: 100,
      valueType: 'digit',
      renderText: (id) => id,
    },
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
      renderText: (grade) => GRADES[grade],
    },
    {
      title: '年级',
      dataIndex: 'grade',
      minWidth: 70,
      valueType: 'select',
      valueEnum: gradeEnum,
      renderText: (grade) => GRADES[grade],
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
      render: (_, record) => renderResourceTypeTag(record.resource_type || undefined),
    },
    {
      title: '资源状态',
      dataIndex: 'resource_generated',
      minWidth: 90,
      hideInSearch: true,
      render: (_, record) =>
        renderResourceStatusTag(
          Boolean(record.resource && record.resource.trim()),
          record.resource_type || undefined,
        ),
    },
    {
      title: '操作',
      key: 'option',
      fixed: 'right',
      hideInSearch: true,
      width: 140,
      render: (_, record) => (
        <Space>
          <Link className="umi-link" key="detail" to={`/question/detail/${record.id}`}>
            详情
          </Link>
          <Link className="umi-link" key="edit" to={`/question/edit/${record.id}`}>
            编辑
          </Link>
          <DeleteButton
            title="确定要删除这道题目吗？"
            onConfirm={() => handleDelete(String(record.id))}
          />
        </Space>
      ),
    },
  ];

  const resourceColumns: ProColumns<Question>[] = [
    {
      title: '题目ID',
      dataIndex: 'id',
      minWidth: 100,
      valueType: 'digit',
      renderText: (id) => id,
    },
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
      render: (_, record) => renderResourceTypeTag(record.resource_type || undefined),
    },
    {
      title: '生成状态',
      dataIndex: 'resource_generated',
      minWidth: 90,
      valueType: 'select',
      valueEnum: RESOURCE_STATUS_ENUM,
      render: (_, record) =>
        renderResourceStatusTag(
          Boolean(record.resource && record.resource.trim()),
          record.resource_type || undefined,
        ),
    },
    {
      title: '资源路径',
      dataIndex: 'resource',
      hideInSearch: true,
      ellipsis: true,
      render: (_, record) => record.resource || '-',
    },
    {
      title: '操作',
      key: 'option',
      fixed: 'right',
      hideInSearch: true,
      width: 120,
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

  const buildSearchParams = React.useCallback((params: any): SearchQuestionRequest => {
    const searchParams: SearchQuestionRequest = {
      page: params.current || 1,
      size: params.pageSize || 10,
      keywords: params.content,
    };

    if (params.id !== undefined && params.id !== null && params.id !== '') {
      searchParams.question_id = Number(params.id);
    }

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
      (searchParams as any).resource_type = params.resource_type;
    }
    if (params.resource_generated !== undefined && params.resource_generated !== null) {
      // resource_generated is not part of SearchQuestionRequest interface
      // This will be handled separately if needed
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
        <CommonTable<Question>
          actionRef={actionRef}
          rowKey="id"
          columns={questionColumns}
          request={async (params) => {
            const searchParams = buildSearchParams(params);
            const res = await adminApi.searchQuestions(searchParams);
            return {
              data: res?.data || [],
              total: res?.total || 0,
              success: true,
            };
          }}
          search={{ labelWidth: 'auto', defaultFormItemsNumber: 6 }}
        />
      ) : (
        <CommonTable<Question>
          actionRef={resourceActionRef}
          rowKey="id"
          columns={resourceColumns}
          request={async (params) => {
            const searchParams = buildSearchParams(params);
            const res = await adminApi.searchResourceQuestions(searchParams);
            return {
              data: res?.data || [],
              total: res?.total || 0,
              success: true,
            };
          }}
          search={{ labelWidth: 'auto', defaultFormItemsNumber: 3 }}
        />
      )}
    </PageContainer>
  );
}
