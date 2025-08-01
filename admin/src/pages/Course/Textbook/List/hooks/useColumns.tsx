import { ProColumns } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Button, Switch, Tag } from 'antd';
import { useTextbookListModel } from '../models/page';
import { useMemo } from 'react';
import { fmtTime } from '@/utils/time';
import { useCourseModel } from '@/models/course';
import { GRADES, STAGES } from '@/constants/course';

export const useColumns = () => {
  const { versions, subjects } = useCourseModel();
  const {
    formRes: { showForm },
    updateStatus,
  } = useTextbookListModel();

  const columns = useMemo<ProColumns<Textbook>[]>(
    () => [
      {
        title: '科目',
        dataIndex: 'subject',
        valueType: 'select',
        valueEnum: subjects?.reduce((prev, curr) => ({ ...prev, [curr.name]: curr.name }), {}),
      },
      {
        title: '版本',
        dataIndex: 'version',
        valueType: 'select',
        valueEnum: versions?.reduce((prev, curr) => ({ ...prev, [curr.name]: curr.name }), {}),
      },
      {
        title: '阶段',
        dataIndex: 'stage',
        valueType: 'select',
        valueEnum: STAGES.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}),
      },
      {
        title: '年级',
        dataIndex: 'grade',
        valueType: 'select',
        valueEnum: GRADES['小学'].reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}),
      },
      { title: '学期', dataIndex: 'semester', hideInSearch: true },
      {
        title: '文件上传',
        dataIndex: 'name',
        hideInSearch: true,
        render: (_, record) =>
          record.file ? <Tag color="success">已上传</Tag> : <Tag>未上传</Tag>,
      },
      {
        title: '单元解析',
        dataIndex: 'is_parsed',
        hideInSearch: true,
        render: (is_parsed) => (is_parsed ? <Tag color="success">已解析</Tag> : <Tag>未解析</Tag>),
      },
      {
        title: '状态',
        dataIndex: 'status',
        hideInSearch: true,
        render: (_, record) => (
          <Switch
            checked={!!record.status}
            checkedChildren="启用"
            unCheckedChildren="停用"
            onChange={() => updateStatus(record)}
          />
        ),
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
        width: 120,
        render: (_, record) => [
          <Link key="detail" to={`/course/textbook/detail/${record.id}`}>
            <Button size="small" type="link">
              详情
            </Button>
          </Link>,
          <Button size="small" key="edit" type="link" onClick={() => showForm(record)}>
            编辑
          </Button>,
        ],
      },
    ],
    [showForm, updateStatus],
  );

  return columns;
};
