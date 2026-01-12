import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { DragSortTable, ProColumns } from '@ant-design/pro-components';
import { Button, message, Space, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createActionColumn, useDelete } from '@/hooks';
import { AbilityApi } from '../../api';
import { useAbilityListModel } from '../models/page';

export default function TableView() {
  const {
    actionRef,
    subject,
    formProps: { showForm },
  } = useAbilityListModel();

  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);

  const { handleDelete } = useDelete(AbilityApi.deleteDomain, {
    onSuccess: () => actionRef.current?.reload(),
  });

  // 导出能力域数据
  const handleExport = async () => {
    try {
      setExporting(true);
      message.loading({ content: '正在导出能力域数据...', key: 'export', duration: 0 });

      const blob = await AbilityApi.exportDomainsBySubject(subject);

      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `ability-domains-${subject}-${timestamp}.json`;

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 释放 URL 对象
      URL.revokeObjectURL(url);

      message.destroy('export');
      message.success('能力域数据导出成功');
    } catch (error) {
      message.destroy('export');
      message.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<ProColumns<AbilityDomain>[]>(
    () => [
      {
        title: '排序',
        dataIndex: 'sort_order',
        width: 60,
        className: 'drag-visible',
      },
      {
        title: '能力域',
        dataIndex: 'name',
        width: 120,
        className: 'drag-visible',
        render: (text, record) => (
          <Button type="link" onClick={() => navigate(`/ability/detail/${record.id}`)}>
            {text}
          </Button>
        ),
      },
      { title: '标识', dataIndex: 'code', width: 150 },
      {
        title: '描述',
        dataIndex: 'description',
        ellipsis: true,
        width: 300,
      },
      {
        title: '状态',
        dataIndex: 'is_active',
        width: 100,
        render: (is_active) => (is_active === 1 ? <Tag color="success">启用</Tag> : <Tag color="default">禁用</Tag>),
      },
      createActionColumn<AbilityDomain>(
        (record) => (
          <>
            <Button size="small" key="edit" type="link" onClick={() => showForm(record)}>
              编辑
            </Button>
            <Button size="small" key="delete" type="link" danger onClick={() => handleDelete(record.id)}>
              删除
            </Button>
          </>
        ),
        { width: 180 },
      ),
    ],
    [showForm, handleDelete, navigate],
  );

  const handleDragSortEnd = async (_beforeIndex: number, _afterIndex: number, newDataSource: AbilityDomain[]) => {
    // 更新排序值
    const items = newDataSource.map((item, index) => ({
      id: item.id,
      sort_order: index,
    }));

    try {
      await AbilityApi.batchUpdateDomainSortOrder({ items });
      message.success('排序更新成功');
      // 刷新列表以确保数据同步
      actionRef.current?.reload();
    } catch (error) {
      message.error('排序更新失败');
      console.error('排序更新失败:', error);
      // 恢复原数据
      actionRef.current?.reload();
    }
  };

  return (
    <DragSortTable<AbilityDomain>
      bordered
      cardBordered
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      search={false}
      dragSortKey="sort_order"
      onDragSortEnd={handleDragSortEnd}
      headerTitle={
        <Space>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => showForm()}>
            新增能力域
          </Button>
          <Button
            size="large"
            icon={<DownloadOutlined />}
            loading={exporting}
            onClick={handleExport}
          >
            导出
          </Button>
        </Space>
      }
      request={async () => {
        const data = await AbilityApi.searchDomains({ subject });
        return { data, success: true, total: data.length };
      }}
      pagination={false}
    />
  );
}
