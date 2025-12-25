import { CheckCard } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Avatar, Button, Card, Checkbox, Empty, Flex, message, Modal, Space } from 'antd';
import { useState } from 'react';
import { StudentApi } from '../../api';
import { AddPracticeForm } from '../components/AddPracticeForm';
import { useStudentDetailModel } from '../models/page';

export function PracticeList() {
  const { student, practiceService, addPracticeVisible, setAddPracticeVisible } = useStudentDetailModel();

  const { data, loading, refresh } = practiceService;
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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

  const allSelected = data && data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < (data?.length || 0);

  return (
    <Card
      title="关联练习"
      loading={loading}
      extra={
        <Space>
          <Checkbox
            indeterminate={someSelected}
            checked={allSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
          >
            全选
          </Checkbox>
          <Button danger size="small" onClick={handleBatchDelete}>
            批量删除 ({selectedIds.length})
          </Button>
        </Space>
      }
    >
      {data?.length && data.length > 0 ? (
        <CheckCard.Group
          multiple
          value={selectedIds}
          onChange={(value) => setSelectedIds(value as number[])}
          style={{ width: '100%' }}
        >
          <div className="grid grid-cols-4 gap-3">
            {data?.map((practice) => (
              <CheckCard
                key={practice.id}
                value={practice.id}
                style={{ width: '100%' }}
                avatar={<Avatar shape="square" size={48} icon={practice.icon} />}
                title={
                  <Flex align="center" gap={8}>
                    <span>{practice.name}</span>
                  </Flex>
                }
                description={practice.description || '暂无描述'}
              />
            ))}
          </div>
        </CheckCard.Group>
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
