import React from 'react';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { QuestionApi } from '@/services/question';
import { fmtTime } from '@/utils/time';
import { GRADES } from '@/constants/course';
import { Link } from '@umijs/max';
import { useConfigs } from '@/hooks';
import { Space, Button, Popconfirm, message, Tag } from 'antd';
import { useRequest } from 'ahooks';

export default function QuestionListPage() {
  const { questionTypeEmun, subjectEnum, gradeEnum, difficultyLevelEmun } = useConfigs();
  const actionRef = React.useRef<any>();

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
    }
  );

  const columns: ProColumns<Question>[] = [
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
        image: { text: '图片' },
        audio: { text: '音频' },
        '': { text: '无' },
      },
      render: (resourceType: string) => {
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
      },
    },
    {
      title: '资源状态',
      dataIndex: 'resource_generated',
      minWidth: 90,
      valueType: 'select',
      valueEnum: {
        true: { text: '已生成' },
        false: { text: '未生成' },
      },
      render: (_, record: Question) => {
        if (!record.resource_type) {
          return <Tag>-</Tag>;
        }
        const isGenerated = record.resource && record.resource.trim() !== '';
        return (
          <Tag color={isGenerated ? 'success' : 'warning'}>
            {isGenerated ? '已生成' : '未生成'}
          </Tag>
        );
      },
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

  return (
    <PageContainer title="题目管理" header={{ breadcrumb: {} }} className="simple-list-page">
      <ProTable<Question>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          // 处理筛选参数
          const searchParams: QuestionSearchParams = {
            ...params,
            page: params.current || 1,
            size: params.pageSize || 10,
            keywords: params.content,
          };
          
          // 处理 resource_type：保留空字符串用于筛选"无资源类型"
          if (params.resource_type !== undefined) {
            searchParams.resource_type = params.resource_type;
          }
          
          // 处理 resource_generated：字符串转为布尔值
          if (params.resource_generated !== undefined && params.resource_generated !== null) {
            if (typeof params.resource_generated === 'string') {
              searchParams.resource_generated = params.resource_generated === 'true';
            } else {
              searchParams.resource_generated = Boolean(params.resource_generated);
            }
          }
          
          const res = await QuestionApi.search(searchParams);
          return {
            data: res?.data || [],
            total: res?.total || 0,
            success: true,
          };
        }}
        search={{ labelWidth: 'auto', defaultFormItemsNumber: 4 }}
        options={false}
        toolbar={{ settings: [] }}
        scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 10 }}
      />
    </PageContainer>
  );
}
