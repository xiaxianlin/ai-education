import { DownloadOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Modal, Space, Tag } from 'antd';
import { useMemo } from 'react';

import { createActionColumn } from '@/hooks';
import { useAbilityModel } from '../models/page';

export default function AbilityListView() {
  const {
    abilities,
    loading,
    showForm,
    exporting,
    importing,
    selectedRowKeys,
    setSelectedRowKeys,
    fileInputRef,
    deleteAbility,
    batchDeleteAbilities,
    batchDeleteLoading,
    handleExport,
    handleImport,
    importAbilities,
    validateFile,
    subject,
    selectedGrade,
  } = useAbilityModel();

  // 删除确认弹窗（视图逻辑）
  const handleDeleteWithConfirm = (id: number, name?: string) => {
    Modal.confirm({
      title: '删除能力',
      content: `确定要删除能力"${name || '该能力'}"吗？此操作无法恢复。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => deleteAbility(id),
    });
  };

  // 批量删除确认弹窗（视图逻辑）
  const handleBatchDeleteClick = () => {
    if (selectedRowKeys.length === 0) return;

    Modal.confirm({
      title: '批量删除能力',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个能力吗？此操作无法恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        batchDeleteAbilities(selectedRowKeys as number[]);
      },
    });
  };

  // 处理文件选择（视图逻辑）
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!validateFile(file)) {
      return;
    }

    // 导入确认弹窗（视图逻辑）
    Modal.confirm({
      centered: true,
      title: '导入确认',
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            <strong>警告：导入操作将删除当前年级的所有现有能力数据！</strong>
          </p>
          <p>文件：{file.name}</p>
          <p>学科：{subject}</p>
          <p>年级：{selectedGrade}年级</p>
          <p>确定要继续导入吗？</p>
        </div>
      ),
      okText: '确定导入',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        importAbilities(file);
      },
      onCancel: () => {
        // 清空文件选择
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  };

  const columns = useMemo<ProColumns<Ability>[]>(
    () => [
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
      {
        title: '状态',
        dataIndex: 'is_active',
        width: 80,
        renderText: (isActive) => (
          <Tag color={isActive === 1 ? 'green' : 'default'}>{isActive === 1 ? '启用' : '禁用'}</Tag>
        ),
      },
      createActionColumn<Ability>(
        (record) => (
          <>
            <Button size="small" key="edit" type="link" onClick={() => showForm(record)}>
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
    [showForm, handleDeleteWithConfirm],
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
      <ProTable<Ability>
        rowKey="id"
        columns={columns}
        search={false}
        dataSource={abilities}
        loading={loading}
        pagination={false}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        headerTitle={
          <Space>
            <Button icon={<DownloadOutlined />} loading={exporting} onClick={handleExport}>
              导出
            </Button>
            <Button icon={<UploadOutlined />} loading={importing} onClick={handleImport}>
              导入
            </Button>
            <Button
              danger
              onClick={handleBatchDeleteClick}
              disabled={selectedRowKeys.length === 0}
              loading={batchDeleteLoading}
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showForm()}>
              新增能力
            </Button>
          </Space>
        }
      />
    </>
  );
}
