import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Popconfirm, Tag } from 'antd';
import { useMemo } from 'react';

import { createActionColumn, useDelete } from '@/hooks';
import { formatDateTime } from '@ai-education/shared-web';
import { TextbookVersionApi } from '../../api';
import { useTextbookVersionListModel } from '../models/page';

export default function TableView() {
  const {
    actionRef,
    subject,
    formProps: { showForm },
  } = useTextbookVersionListModel();

  const { handleDelete } = useDelete(TextbookVersionApi.deleteTextbookVersion, {
    onSuccess: () => actionRef.current?.reload(),
  });

  const { handleDelete: handleDisable } = useDelete(TextbookVersionApi.disableTextbookVersion, {
    onSuccess: () => actionRef.current?.reload(),
    successMessage: '停用成功',
  });

  const { handleDelete: handleEnable } = useDelete(TextbookVersionApi.enableTextbookVersion, {
    onSuccess: () => actionRef.current?.reload(),
    successMessage: '启用成功',
  });

  const columns = useMemo<ProColumns<TextbookVersion>[]>(
    () => [
      { title: '版本名称', dataIndex: 'name', width: 150 },
      { title: '修订年份', dataIndex: 'revision_year', width: 120 },
      {
        title: '是否启用',
        dataIndex: 'is_enabled',
        width: 100,
        render: (is_enabled) => (is_enabled ? <Tag color="success">启用</Tag> : <Tag>停用</Tag>),
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        width: 180,
        renderText: (time) => formatDateTime(time),
      },
      {
        title: '更新时间',
        dataIndex: 'update_time',
        width: 180,
        renderText: (time) => formatDateTime(time),
      },
      createActionColumn<TextbookVersion>(
        (record) => (
          <>
            <Button size="small" key="edit" type="link" onClick={() => showForm(record)}>
              编辑
            </Button>
            {record.is_enabled ? (
              <Popconfirm title="确定要停用该版本吗？" onConfirm={() => handleDisable(record.id)}>
                <Button size="small" key="disable" type="link" danger>
                  停用
                </Button>
              </Popconfirm>
            ) : (
              <Button size="small" key="enable" type="link" onClick={() => handleEnable(record.id)}>
                启用
              </Button>
            )}
            <Popconfirm
              title="确定要删除该版本吗？"
              description="删除前会检查是否被使用，使用的版本无法删除"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button size="small" key="delete" type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </>
        ),
        { width: 200 },
      ),
    ],
    [showForm, handleDelete, handleDisable, handleEnable],
  );

  return (
    <ProTable<TextbookVersion>
      bordered
      cardBordered
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      search={false}
      headerTitle={
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => showForm()}>
          新增教材版本
        </Button>
      }
      request={async () => {
        const data = await TextbookVersionApi.searchTextbookVersions({ subject });
        return { data, success: true, total: data.length };
      }}
      pagination={false}
    />
  );
}
