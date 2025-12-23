import { useRequest } from 'ahooks';
import { Button, Card, Checkbox, Empty, message, Modal, Space } from 'antd';
import { useMemo, useState } from 'react';
import { StudentApi } from '../../api';
import { AddTextbookForm } from '../components/AddTextbookForm';
import { TextbookCard } from '../components/TextbookCard';
import { useStudentDetailModel } from '../models/page';

export function TextbookList() {
  const { student, textbookService, addTextbookVisible, setAddTextbookVisible } = useStudentDetailModel();

  const { data, loading, refresh } = textbookService;
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isManaging, setIsManaging] = useState(false);

  const { runAsync: removeTextbook } = useRequest(
    (textbookIds: number[]) => StudentApi.removeStudentTextbook(student?.id || '', textbookIds),
    {
      manual: true,
      ready: !!student?.id,
      onSuccess: () => {
        message.success('删除成功');
        setSelectedIds([]);
        refresh();
      },
    },
  );

  const handleSelect = (textbookId: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, textbookId]);
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== textbookId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(data?.map((textbook) => textbook.id) || []);
    } else {
      setSelectedIds([]);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;

    Modal.confirm({
      title: '批量删除教材',
      content: `确定要删除选中的 ${selectedIds.length} 本教材吗？`,
      onOk: () => removeTextbook(selectedIds),
    });
  };

  const handleSingleDelete = (textbookId: number) => {
    removeTextbook([textbookId]);
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
          <span>关联教材</span>
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
          {data.map((textbook) => (
            <TextbookCard
              key={textbook.id}
              textbook={textbook}
              active={textbook.grade === (student?.grade || 0)}
              selected={isManaging ? selectedIds.includes(textbook.id) : undefined}
              onSelect={isManaging ? (checked) => handleSelect(textbook.id, checked) : undefined}
              onDelete={() => handleSingleDelete(textbook.id)}
            />
          ))}
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span style={{ color: '#bfbfbf', fontSize: '14px' }}>暂无关联教材</span>}
          style={{ padding: '40px 0' }}
        />
      )}
      <AddTextbookForm
        studentId={student?.id || ''}
        open={addTextbookVisible}
        onCancel={() => setAddTextbookVisible(false)}
        onSuccess={() => {
          refresh();
          setAddTextbookVisible(false);
        }}
      />
    </Card>
  );
}
