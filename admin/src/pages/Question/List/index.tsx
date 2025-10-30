import React from 'react';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { QuestionApi } from '@/services/question';
import { fmtTime } from '@/utils/time';
import { GRADES } from '@/constants/course';
import { Link } from '@umijs/max';
import { useConfigs } from '@/hooks';
import { Space } from 'antd';

export default function QuestionListPage() {
  const { questionTypeEmun, subjectEnum, gradeEnum, difficultyLevelEmun } = useConfigs();
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
      width: 100,
      render: (_, record) => (
        <Space>
          <Link className="umi-link" key="edit" to={`/question/detail/${record.id}`}>
            详情
          </Link>
          <Link className="umi-link" key="edit" to={`/question/edit/${record.id}`}>
            编辑
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="题目管理" header={{ breadcrumb: {} }} className="simple-list-page">
      <ProTable<Question>
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = await QuestionApi.search({
            page: params.page || 1,
            size: params.pageSize || 10,
            ...params,
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
