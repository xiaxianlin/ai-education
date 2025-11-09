import React from 'react';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { QuestionApi } from '@/services/question';
import { fmtTime } from '@/utils/time';
import { GRADES } from '@/constants/course';
import { Link } from '@umijs/max';
import { useConfigs } from '@/hooks';
import { Space, Button, Popconfirm, message } from 'antd';
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
          const res = await QuestionApi.search({
            ...params,
            page: params.current || 1,
            size: params.pageSize || 10,
            keywords: params.content,
          });
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
