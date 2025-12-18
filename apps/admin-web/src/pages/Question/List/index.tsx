import React from 'react';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { adminApi } from '@/lib/api';
import { GRADES } from '@/constants/course';
import { useConfigs, useDelete } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { Space, Button, message, Flex } from 'antd';
import { DeleteButton } from '@/components';
import { renderResourceTypeTag, renderResourceStatusTag } from '@/utils/tag';
import { PlusOutlined } from '@ant-design/icons';

const RESOURCE_TYPE_ENUM = {
  image: { text: '图片' },
  audio: { text: '音频' },
};

export default function QuestionListPage() {
  const navigate = useNavigate();
  const { subjectEnum, gradeEnum } = useConfigs();
  const actionRef = React.useRef<any>();

  // 删除题目
  const { handleDelete } = useDelete(adminApi.deleteQuestion, {
    onSuccess: () => actionRef.current?.reload(),
  });

  const questionColumns: ProColumns<Question>[] = [
    {
      title: '题目',
      dataIndex: 'content',
      minWidth: 300,
    },
    {
      title: '题型',
      dataIndex: 'type',
      minWidth: 70,
      renderText: (type, record) => `${type}（${record.subtype}）`,
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
        renderResourceStatusTag(Boolean(record.resource && record.resource.trim()), record.resource_type || undefined),
    },
    {
      title: '操作',
      key: 'option',
      fixed: 'right',
      hideInSearch: true,
      width: 140,
      render: (_, record) => (
        <Flex align="center">
          <Button type="link" onClick={() => navigate(`/question/detail/${record.id}`)}>
            详情
          </Button>
          <Button type="link" onClick={() => navigate(`/question/edit/${record.id}`)}>
            编辑
          </Button>
          <DeleteButton
            title="确定要删除这道题目吗？"
            onConfirm={() => handleDelete(String(record.id))}
            buttonProps={{ type: 'link' }}
          />
        </Flex>
      ),
    },
  ];

  const buildSearchParams = React.useCallback((params: any): SearchQuestionRequest => {
    const searchParams: SearchQuestionRequest = {
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
      (searchParams as any).resource_type = params.resource_type;
    }
    return searchParams;
  }, []);

  return (
    <PageContainer title="题目管理" header={{ breadcrumb: {} }}>
      <ProTable<Question>
        actionRef={actionRef}
        bordered
        cardBordered
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
        headerTitle={[
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/question/create')}>
            新建题目
          </Button>,
        ]}
        search={{ labelWidth: 'auto', defaultFormItemsNumber: 6 }}
      />
    </PageContainer>
  );
}
