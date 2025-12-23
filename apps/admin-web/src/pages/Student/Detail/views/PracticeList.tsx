import { useRequest } from 'ahooks';
import { Button, Card, Checkbox, Empty, message, Modal, Space } from 'antd';
import { useMemo, useState } from 'react';
import { StudentApi } from '../../api';
import { AddPracticeForm } from '../components/AddPracticeForm';
import { PracticeCard } from '../components/PracticeCard';
import { useStudentDetailModel } from '../models/page';

export function PracticeList() {
  const { student, practiceService, addPracticeVisible, setAddPracticeVisible } = useStudentDetailModel();

  const { data, loading, refresh } = practiceService;
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isManaging, setIsManaging] = useState(false);

  const { runAsync: removePractice } = useRequest(
    (practiceIds: number[]) => StudentApi.removeStudentPractice(student?.id || '', practiceIds),
    {
      manual: true,
      ready: !!student?.id,
      onSuccess: () => {
        message.success('移除成功');
        setSelectedIds([]);
        refresh();
      },
    },
  );

  const handleSelect = (practiceId: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, practiceId]);
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== practiceId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(data?.map((practice) => practice.id) || []);
    } else {
      setSelectedIds([]);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;

    Modal.confirm({
      title: '批量移除练习',
      content: `确定要移除选中的 ${selectedIds.length} 个练习吗？`,
      onOk: () => removePractice(selectedIds),
    });
  };

  const handleSingleDelete = (practiceId: number) => {
    removePractice([practiceId]);
  };

  const handleEnterManage = () => {
    setIsManaging(true);
  };

  const handleExitManage = () => {
    setIsManaging(false);
    setSelectedIds([]);
  };

  const allSelected = useMemo(() => {
    return data && data.length > 0 && selectedIds.length === data.length;
  }, [data, selectedIds]);

  const someSelected = useMemo(() => {
    return selectedIds.length > 0 && selectedIds.length < (data?.length || 0);
  }, [data, selectedIds]);

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>关联练习</span>
          {data && data.length > 0 && (
            <Space>
              {!isManaging ? (
                <Button size="small" onClick={handleEnterManage}>
                  管理
                </Button>
              ) : (
                <>
                  <Checkbox
                    indeterminate={someSelected}
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  >
                    全选
                  </Checkbox>
                  {selectedIds.length > 0 && (
                    <Button danger size="small" onClick={handleBatchDelete}>
                      批量删除 ({selectedIds.length})
                    </Button>
                  )}
                  <Button size="small" onClick={handleExitManage}>
                    退出
                  </Button>
                </>
              )}
            </Space>
          )}
        </div>
      }
      loading={loading}
    >
      {data?.length && data.length > 0 ? (
        <div className="grid grid-cols-4 gap-3">
          {data.map((practice) => (
            <PracticeCard
              key={practice.id}
              practice={practice}
              selected={isManaging ? selectedIds.includes(practice.id) : undefined}
              onSelect={isManaging ? (checked) => handleSelect(practice.id, checked) : undefined}
              onDelete={() => handleSingleDelete(practice.id)}
            />
          ))}
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span style={{ color: '#bfbfbf', fontSize: '14px' }}>暂无关联练习</span>}
          style={{ padding: '40px 0' }}
        />
      )}
      <AddPracticeForm
        studentId={student?.id || ''}
        open={addPracticeVisible}
        onCancel={() => setAddPracticeVisible(false)}
        onSuccess={() => {
          refresh();
          setAddPracticeVisible(false);
        }}
      />
    </Card>
  );
}
