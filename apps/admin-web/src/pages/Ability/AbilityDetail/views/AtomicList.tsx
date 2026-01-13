import { GRADES } from '@ai-education/shared-web';
import { DownloadOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { DragSortTable, ProColumns } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Button, Card, message, Modal, Space, Tag } from 'antd';
import { useMemo, useRef, useState } from 'react';

import { createActionColumn, useDelete } from '@/hooks';
import { AbilityApi } from '../../api';
import { useAbilityDetailModel } from '../models/page';

interface GradeTableProps {
  grade: number;
  atomics: AbilityAtomic[];
  domain: AbilityDomain;
  onReload: () => void;
  onShowForm: (grade: number, item?: AbilityAtomic) => void;
}

function GradeTable({ grade, atomics, domain, onReload, onShowForm }: GradeTableProps) {
  const { handleDelete } = useDelete(AbilityApi.deleteAtomic, {
    onSuccess: () => onReload(),
  });

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { runAsync: handleBatchDelete, loading: batchDeleteLoading } = useRequest(
    (ids: number[]) => AbilityApi.batchDeleteAtomics(ids),
    {
      manual: true,
      onSuccess: (res) => {
        message.success(`成功删除 ${res.deleted_count} 个原子能力`);
        setSelectedRowKeys([]);
        onReload();
      },
      onError: (error: any) => {
        message.error(error?.message || '批量删除失败');
      },
    },
  );

  const handleDeleteWithConfirm = (id: number, name?: string) => {
    Modal.confirm({
      title: '删除原子能力',
      content: `确定要删除原子能力"${name || '该能力'}"吗？此操作无法恢复。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => handleDelete(id),
    });
  };

  const handleBatchDeleteClick = () => {
    if (selectedRowKeys.length === 0) return;

    Modal.confirm({
      title: '批量删除原子能力',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个原子能力吗？此操作无法恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        handleBatchDelete(selectedRowKeys as number[]);
      },
    });
  };

  // 导出原子能力数据
  const handleExport = async () => {
    try {
      setExporting(true);
      message.loading({ content: '正在导出原子能力数据...', key: 'export', duration: 0 });

      const blob = await AbilityApi.exportAtomicsByGrade({
        domain_code: domain.code,
        subject: domain.subject,
        grade,
      });

      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `ability-atomics-${domain.code}-grade${grade}-${timestamp}.json`;

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
      message.success('原子能力数据导出成功');
    } catch (error) {
      message.destroy('export');
      message.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setExporting(false);
    }
  };

  // 导入原子能力数据
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.name.endsWith('.json')) {
      message.error('只支持 JSON 格式文件');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // 二次确认弹窗
    Modal.confirm({
      centered: true,
      title: '导入确认',
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            <strong>警告：导入操作将删除当前年级的所有现有原子能力数据！</strong>
          </p>
          <p>文件：{file.name}</p>
          <p>年级：{GRADES[grade]}</p>
          <p>确定要继续导入吗？</p>
        </div>
      ),
      okText: '确定导入',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          setImporting(true);
          message.loading({ content: '正在导入原子能力数据...', key: 'import', duration: 0 });

          const result = await AbilityApi.importAtomicsByGrade(file, {
            domain_code: domain.code,
            subject: domain.subject,
            grade,
          });

          message.destroy('import');
          message.success(
            `导入成功！已删除 ${result.deleted_count} 条旧数据，新增 ${result.created_count} 条数据`
          );

          // 刷新列表
          onReload();

          // 清空文件选择
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          message.destroy('import');
          message.error('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
        } finally {
          setImporting(false);
        }
      },
      onCancel: () => {
        // 清空文件选择
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  };

  // 处理拖拽排序结束
  const handleDragSortEnd = async (_beforeIndex: number, _afterIndex: number, newDataSource: AbilityAtomic[]) => {
    try {
      // 构建批量更新请求
      const items = newDataSource.map((item, index) => ({
        id: item.id,
        sort_order: index + 1,
      }));

      await AbilityApi.batchUpdateAtomicSortOrder({ items });
      message.success('排序已更新');
      onReload();
    } catch (error) {
      message.error('更新排序失败');
      console.error('Failed to update sort order:', error);
    }
  };

  const columns = useMemo<ProColumns<AbilityAtomic>[]>(
    () => [
      {
        title: '顺序',
        dataIndex: 'sort_order',
        width: 60,
      },
      { title: '能力名称', dataIndex: 'name', width: 200 },
      { title: '能力标识', dataIndex: 'code', width: 150 },
      {
        title: '描述',
        dataIndex: 'description',
        ellipsis: true,
        width: 300,
      },
      {
        title: '难度',
        dataIndex: 'difficulty',
        width: 80,
        renderText: (difficulty) => (
          <Tag color={difficulty >= 4 ? 'red' : difficulty >= 3 ? 'orange' : 'green'}>{difficulty}</Tag>
        ),
      },

      createActionColumn<AbilityAtomic>(
        (record) => (
          <>
            <Button size="small" key="edit" type="link" onClick={() => onShowForm(grade, record)}>
              编辑
            </Button>
            <Button
              size="small"
              key="delete"
              type="link"
              danger
              onClick={() => handleDeleteWithConfirm(record.id, record.name)}
            >
              删除
            </Button>
          </>
        ),
        { width: 120 },
      ),
    ],
    [grade, onShowForm, handleDeleteWithConfirm],
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <DragSortTable<AbilityAtomic>
        rowKey="id"
        dragSortKey="sort_order"
        columns={columns}
        search={false}
        dataSource={atomics}
        pagination={false}
        onDragSortEnd={handleDragSortEnd}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        headerTitle={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => onShowForm(grade)}>
              新增原子能力
            </Button>
            <Button
              danger
              onClick={handleBatchDeleteClick}
              disabled={selectedRowKeys.length === 0}
              loading={batchDeleteLoading}
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
            <Button
              icon={<DownloadOutlined />}
              loading={exporting}
              onClick={handleExport}
            >
              导出
            </Button>
            <Button
              icon={<UploadOutlined />}
              loading={importing}
              onClick={handleImport}
            >
              导入
            </Button>
          </Space>
        }
      />
    </>
  );
}

export default function AtomicListView() {
  const { atomicsByGrade, PRIMARY_GRADES, showForm, reloadGradeAtomics, domain } =
    useAbilityDetailModel();

  // 为每个年级创建 Tab 项
  const tabItems = useMemo(
    () =>
      domain
        ? PRIMARY_GRADES.map((grade) => ({
            key: String(grade),
            label: GRADES[grade],
            children: (
              <GradeTable
                grade={grade}
                atomics={atomicsByGrade[grade] || []}
                domain={domain}
                onReload={() => reloadGradeAtomics(grade)}
                onShowForm={showForm}
              />
            ),
          }))
        : [],
    [atomicsByGrade, PRIMARY_GRADES, showForm, reloadGradeAtomics, domain],
  );

  return <Card tabList={tabItems} className="simple-table-card" />;
}
