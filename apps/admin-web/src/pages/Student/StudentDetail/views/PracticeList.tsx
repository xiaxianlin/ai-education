import { GRADES, SPECIALTY_TYPE_LABELS, SpecialtyType, STAGE_LABELS } from '@ai-education/shared-web';
import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Button, message, Modal, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { StudentApi } from '../../api';
import { AddPracticeForm } from '../components/AddPracticeForm';
import { useStudentDetailModel } from '../models/page';

export function PracticeList() {
  const { student, practiceService, addPracticeVisible, setAddPracticeVisible } = useStudentDetailModel();

  const { data, loading, refresh } = practiceService;
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const { runAsync: removePractice } = useRequest(
    (practiceIds: number[]) => StudentApi.removeStudentPractice(student?.id || '', practiceIds),
    {
      manual: true,
      ready: !!student?.id,
      onSuccess: () => {
        message.success('移除成功');
        setSelectedRowKeys([]);
        refresh();
      },
    },
  );

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) return;

    Modal.confirm({
      title: '批量移除练习',
      content: `确定要移除选中的 ${selectedRowKeys.length} 个练习吗？`,
      onOk: () => removePractice(selectedRowKeys as number[]),
    });
  };

  const columns = useMemo<ProColumns<Practice>[]>(
    () => [
      {
        title: '科目',
        dataIndex: 'subject',
        width: 80,
        render: (text) => text || '-',
      },

      {
        title: '名称',
        dataIndex: 'name',
        width: 150,
      },

      {
        title: '学段',
        dataIndex: 'stages',
        width: 120,
        hideInSearch: true,
        render: (_, record) =>
          record.stages?.length ? (
            <>
              {record.stages.map((stage) => (
                <Tag key={stage} color="purple">
                  {STAGE_LABELS[stage as Stage] || stage}
                </Tag>
              ))}
            </>
          ) : (
            '-'
          ),
      },
      {
        title: '年级',
        dataIndex: 'grades',
        width: 200,
        hideInSearch: true,
        render: (_, record) =>
          record.grades?.length ? (
            <>
              {record.grades.map((g) => (
                <Tag key={g}>{GRADES[g]}</Tag>
              ))}
            </>
          ) : (
            '-'
          ),
      },
      {
        title: '专项类型',
        dataIndex: 'specialty_type',
        width: 120,
        hideInSearch: true,
        render: (_, record) =>
          record.specialty_type ? <Tag>{SPECIALTY_TYPE_LABELS[record.specialty_type as SpecialtyType]}</Tag> : '-',
      },
      {
        title: '图标',
        dataIndex: 'icon',
        width: 80,
        hideInSearch: true,
      },
      {
        title: '描述',
        dataIndex: 'description',
        ellipsis: true,
        render: (text) => text || '暂无描述',
      },
    ],
    [],
  );

  return (
    <>
      <ProTable<Practice>
        className='practice-list'
        rowKey="id"
        columns={columns}
        dataSource={data || []}
        loading={loading}
        search={false}
        pagination={false}
        scroll={{ x: 'max-content' }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        toolbar={{
          actions: [
            <Button danger onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
              批量删除 ({selectedRowKeys.length})
            </Button>,
          ],
        }}
        headerTitle={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddPracticeVisible(true)}>
            添加练习
          </Button>
        }
        options={false}
      />
      <AddPracticeForm
        studentId={student?.id || ''}
        open={addPracticeVisible}
        onCancel={() => setAddPracticeVisible(false)}
        onSuccess={() => {
          refresh();
          setAddPracticeVisible(false);
        }}
      />
    </>
  );
}
