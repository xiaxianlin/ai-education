import { GRADES } from '@ai-education/shared-web';
import { PlusOutlined } from '@ant-design/icons';
import { DragSortTable, ProColumns } from '@ant-design/pro-components';
import { Button, Card, message, Modal, Tag } from 'antd';
import { useMemo } from 'react';

import { createActionColumn, useDelete } from '@/hooks';
import { AbilityApi } from '../../api';
import { useAbilityDetailModel } from '../models/page';

interface GradeTableProps {
  grade: number;
  atomics: AbilityAtomic[];
  onReload: () => void;
  onShowForm: (grade: number, item?: AbilityAtomic) => void;
}

function GradeTable({ grade, atomics, onReload, onShowForm }: GradeTableProps) {
  const { handleDelete } = useDelete(AbilityApi.deleteAtomic, {
    onSuccess: () => onReload(),
  });

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
        width: 80,
      },
      { title: '能力名称', dataIndex: 'name', width: 200 },
      { title: '能力代码', dataIndex: 'code', width: 150 },
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
    <DragSortTable<AbilityAtomic>
      rowKey="id"
      dragSortKey="sort_order"
      columns={columns}
      search={false}
      dataSource={atomics}
      pagination={false}
      onDragSortEnd={handleDragSortEnd}
      headerTitle={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => onShowForm(grade)}>
          新增原子能力
        </Button>
      }
    />
  );
}

export default function AtomicListView() {
  const { atomicsByGrade, PRIMARY_GRADES, showForm, reloadGradeAtomics } = useAbilityDetailModel();

  // 为每个年级创建 Tab 项
  const tabItems = useMemo(
    () =>
      PRIMARY_GRADES.map((grade) => ({
        key: String(grade),
        label: GRADES[grade],
        children: (
          <GradeTable
            grade={grade}
            atomics={atomicsByGrade[grade] || []}
            onReload={() => reloadGradeAtomics(grade)}
            onShowForm={showForm}
          />
        ),
      })),
    [atomicsByGrade, PRIMARY_GRADES, showForm, reloadGradeAtomics],
  );

  return <Card tabList={tabItems} className="simple-table-card" />;
}
