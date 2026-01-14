import { DownloadOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import type { UploadProps } from 'antd';
import { Button, Modal, Space, Tag, Upload } from 'antd';
import { useMemo } from 'react';

import { createActionColumn } from '@/hooks';
import { AbilityApi } from '../api';
import { useAbilityModel } from '../models/page';

export default function AbilityListView() {
  const {
    formProps,
    exporting,
    importing,
    selectedRowKeys,
    setSelectedRowKeys,
    deleteAbility,
    batchDeleteAbilities,
    batchDeleteLoading,
    handleExport,
    importAbilities,
    validateFile,
    subject,
    grade,
    actionRef,
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

  // 处理文件上传（视图逻辑）
  const handleUpload: UploadProps['beforeUpload'] = (file) => {
    // 验证文件类型
    if (!validateFile(file)) {
      return Upload.LIST_IGNORE;
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
          <p>年级：{grade}年级</p>
          <p>确定要继续导入吗？</p>
        </div>
      ),
      okText: '确定导入',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        importAbilities(file);
      },
    });

    // 阻止默认上传行为
    return false;
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
            <Button size="small" key="edit" type="link" onClick={() => formProps.showForm(record)}>
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
    [formProps.showForm, handleDeleteWithConfirm],
  );

  return (
    <ProTable<Ability>
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      search={false}
      pagination={false}
      rowSelection={{
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
      }}
      request={async () => {
        const res = await AbilityApi.searchAbilities({ subject, grade });
        return { data: res || [], success: true };
      }}
      headerTitle={
        <Space>
          <Button icon={<DownloadOutlined />} loading={exporting} onClick={handleExport}>
            导出
          </Button>
          <Upload beforeUpload={handleUpload} accept=".json" showUploadList={false}>
            <Button icon={<UploadOutlined />} loading={importing}>
              导入
            </Button>
          </Upload>
          <Button
            danger
            onClick={handleBatchDeleteClick}
            disabled={selectedRowKeys.length === 0}
            loading={batchDeleteLoading}
          >
            批量删除 ({selectedRowKeys.length})
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => formProps.showForm()}>
            新增能力
          </Button>
        </Space>
      }
    />
  );
}
