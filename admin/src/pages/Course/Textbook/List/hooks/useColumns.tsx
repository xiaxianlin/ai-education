import { ProColumns } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Button, Tag } from 'antd';
import { useTextbookListModel } from '../models/page';
import { useMemo } from 'react';
import { fmtTime } from '@/utils/time';
import { StatusTag } from '@/components/ui';

export const useColumns = () => {
  const {
    formRes: { showForm },
    updateStatus,
  } = useTextbookListModel();

  const columns = useMemo<ProColumns<Textbook>[]>(
    () => [
      { title: '科目', dataIndex: 'subject' },
      { title: '版本', dataIndex: 'version' },
      { title: '阶段', dataIndex: 'stage' },
      { title: '年级', dataIndex: 'grade' },
      { title: '学期', dataIndex: 'semester' },
      {
        title: '文件上传',
        dataIndex: 'name',
        render: (_, record) =>
          record.name ? <Tag color="success">已上传</Tag> : <Tag>未上传</Tag>,
      },
      {
        title: '单元解析',
        dataIndex: 'is_parsed',
        render: (is_parsed) => (is_parsed ? <Tag color="success">已解析</Tag> : <Tag>未解析</Tag>),
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (status) => <StatusTag status={!!status} />,
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        hideInSearch: true,
        renderText: (time) => fmtTime(time),
      },
      {
        title: '更新时间',
        dataIndex: 'update_time',
        hideInSearch: true,
        renderText: (time) => fmtTime(time),
      },
      {
        title: '操作',
        valueType: 'option',
        fixed: 'right',
        render: (_, record) => [
          <Link key="detail" to={`/course/textbook/detail/${record.id}`}>
            <Button size="small" type="link">
              详情
            </Button>
          </Link>,
          <Button size="small" key="edit" type="link" onClick={() => showForm(record)}>
            编辑
          </Button>,
          <Button size="small" key="edit" type="link" onClick={() => updateStatus(record)}>
            {record.status ? '停用' : '启用'}
          </Button>,
        ],
      },
    ],
    [showForm, updateStatus],
  );

  return columns;
};
