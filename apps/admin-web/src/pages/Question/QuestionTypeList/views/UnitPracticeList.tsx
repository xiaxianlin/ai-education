import { DeleteButton } from '@/components';
import { useExport } from '@/hooks/useExport';
import { createActionColumn } from '@/hooks/useTableColumns';
import { DownloadOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import type { UploadProps } from 'antd';
import { Button, Modal, Space, Tag, Upload } from 'antd';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionApi } from '../../api';
import { useUnitPracticeModel } from '../models/unitPractice';

export default function UnitPracticeListView() {
  const navigate = useNavigate();
  const { actionRef, subject, handleDelete, importing, importQuestionTypes, validateFile } = useUnitPracticeModel();

  // 导出题型数据
  const { exporting, handleExport } = useExport(QuestionApi.exportQuestionTypes, {
    successMessage: '题型数据导出成功',
    errorMessage: '导出失败',
    loadingMessage: '正在导出题型数据...',
    defaultFilename: 'question-types',
    fileExtension: 'json',
  });

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
            <strong>警告：导入操作将删除所有现有题型数据！</strong>
          </p>
          <p>文件：{file.name}</p>
          <p>确定要继续导入吗？</p>
        </div>
      ),
      okText: '确定导入',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        importQuestionTypes(file);
      },
    });

    // 阻止默认上传行为
    return false;
  };

  const columns = useMemo<ProColumns<QuestionType>[]>(
    () => [
      {
        title: '名称',
        dataIndex: 'name',
        width: 150,
        render: (text, record) => (
          <Button type="link" onClick={() => navigate(`/question_type/detail/${record.id}`)}>
            {text}
          </Button>
        ),
      },
      {
        title: '科目',
        dataIndex: 'subject',
        width: 80,
        render: (_, record) => <Tag color="blue">{record.subject}</Tag>,
      },
      {
        title: '学段',
        dataIndex: 'grade_band',
        width: 80,
        render: (_, record) =>
          record.grade_band ? (
            <Tag color="green">
              {record.grade_band === 'Low' ? '低年级' : record.grade_band === 'Mid' ? '中年级' : '高年级'}
            </Tag>
          ) : (
            '-'
          ),
      },
      createActionColumn<QuestionType>(
        (record) => (
          <>
            <Button key="edit" type="link" onClick={() => navigate(`/question_type/unit/form?id=${record.id}`)}>
              编辑
            </Button>
            <DeleteButton buttonProps={{ type: 'link' }} onConfirm={() => handleDelete(record.id)} />
          </>
        ),
        { width: 120 },
      ),
    ],
    [navigate, handleDelete],
  );

  return (
    <ProTable<QuestionType>
      bordered
      rowKey="id"
      search={false}
      columns={columns}
      actionRef={actionRef}
      scroll={{ x: 'max-content' }}
      pagination={{
        defaultPageSize: 20,
      }}
      headerTitle={
        <Space>
          <Button type="primary" size="large" onClick={() => navigate('/question_type/unit/form')} icon={<PlusOutlined />}>
            新增题型
          </Button>
          <Button size="large" icon={<DownloadOutlined />} loading={exporting} onClick={handleExport}>
            导出题型
          </Button>
          <Upload beforeUpload={handleUpload} accept=".json" showUploadList={false}>
            <Button size="large" icon={<UploadOutlined />} loading={importing}>
              导入题型
            </Button>
          </Upload>
        </Space>
      }
      request={async ({ current, pageSize }) => {
        const res = await QuestionApi.searchUnitPracticeTypes({
          page: current,
          size: pageSize,
          subject,
        });
        return {
          data: res?.data || [],
          total: res?.total || 0,
          success: true,
        };
      }}
    />
  );
}
