import { DeleteButton } from '@/components';
import { createActionColumn } from '@/hooks/useTableColumns';
// TODO: 以下常量已废弃：ANSWER_TYPE_LABELS, DIFFICULTY_LABELS, GRADES, INTERACTION_TYPE_LABELS, RESOURCE_TYPE_LABELS, STAGE_LABELS
import { DownloadOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Space, Tag } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// TODO: AbilityApi 导入已删除，如需能力映射功能需要重新实现
import { QuestionApi } from '../../api';
import { useQuestionTypeModel } from '../models/page';

export default function ListView() {
  const navigate = useNavigate();
  const { actionRef, subject, handleDelete } = useQuestionTypeModel();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 导出题型数据为 JSON
  const handleExport = async () => {
    try {
      setExporting(true);
      message.loading({ content: '正在导出题型数据...', key: 'export', duration: 0 });

      // 调用后端导出接口（全量数据）
      const blob = await QuestionApi.exportQuestionTypes();

      // 从响应头获取文件名，如果没有则使用默认文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `question-types-${timestamp}.json`;

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
      message.success('题型数据导出成功');
    } catch (error) {
      message.destroy('export');
      message.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setExporting(false);
    }
  };

  // 导入题型数据
  const handleImport = () => {
    // 触发文件选择
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.name.endsWith('.json')) {
      message.error('只支持 JSON 格式文件');
      // 清空文件选择
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
            <strong>警告：导入操作将删除所有现有题型数据！</strong>
          </p>
          <p>文件：{file.name}</p>
          <p>确定要继续导入吗？</p>
        </div>
      ),
      okText: '确定导入',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          setImporting(true);
          message.loading({ content: '正在导入题型数据...', key: 'import', duration: 0 });

          const result = await QuestionApi.importQuestionTypes(file);

          message.destroy('import');
          message.success(`导入成功！已删除 ${result.deleted_count} 条旧数据，新增 ${result.created_count} 条数据`);

          // 刷新列表
          actionRef.current?.reload();

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
        title: '题型分类',
        dataIndex: 'category',
        width: 100,
        render: (_, record) => (
          <Tag color={record.category === 'ability_practice' ? 'purple' : 'cyan'}>
            {record.category === 'ability_practice' ? '能力练习' : '单元练习'}
          </Tag>
        ),
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
      {
        title: '能力代码',
        dataIndex: 'ability_code',
        width: 120,
        render: (_, record) => (record.ability_code ? <Tag color="cyan">{record.ability_code}</Tag> : '-'),
      },
      {
        title: '题型分类',
        dataIndex: 'category',
        width: 100,
        render: (_, record) => (
          <Tag color={record.category === 'ability_practice' ? 'purple' : 'cyan'}>
            {record.category === 'ability_practice' ? '能力练习' : '单元练习'}
          </Tag>
        ),
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
      {
        title: '能力代码',
        dataIndex: 'ability_code',
        width: 120,
        render: (_, record) => (record.ability_code ? <Tag color="cyan">{record.ability_code}</Tag> : '-'),
      },
      createActionColumn<QuestionType>(
        (record) => (
          <>
            <Button key="edit" type="link" onClick={() => navigate(`/question_type/form/${record.id}`)}>
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
          <Button type="primary" size="large" onClick={() => navigate('/question_type/form')} icon={<PlusOutlined />}>
            新增题型
          </Button>
          <Button size="large" icon={<DownloadOutlined />} loading={exporting} onClick={handleExport}>
            导出题型
          </Button>
          <Button size="large" icon={<UploadOutlined />} loading={importing} onClick={handleImport}>
            导入题型
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </Space>
      }
      request={async ({ current, pageSize }) => {
        const res = await QuestionApi.searchQuestionTypes({
          page: current,
          size: pageSize,
          subject,
          // TODO: grade 参数已删除，如需按年级筛选，需要根据 grade_band 筛选
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
