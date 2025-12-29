import { GRADES } from '@ai-education/shared-web';
import { BookOutlined } from '@ant-design/icons';
import { CheckCard } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Avatar, Button, Card, Checkbox, Empty, Flex, message, Modal, Space, Tag } from 'antd';
import { useState } from 'react';
import { StudentApi } from '../../api';
import { AddTextbookForm } from '../components/AddTextbookForm';
import { useStudentDetailModel } from '../models/page';
;

export function TextbookList() {
  const { student, textbookService, addTextbookVisible, setAddTextbookVisible } = useStudentDetailModel();

  const { data, loading, refresh } = textbookService;
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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

  const allSelected = data && data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < (data?.length || 0);

  return (
    <Card
      title="关联教材"
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
            {data?.map((textbook) => {
              const active = textbook.grade === (student?.grade || 0);
              return (
                <CheckCard
                  key={textbook.id}
                  value={textbook.id}
                  style={{ width: '100%' }}
                  avatar={<Avatar shape="square" size={48} icon={<BookOutlined />} />}
                  title={
                    <Flex align="center" gap={8}>
                      <span>{textbook.subject}</span>
                      {active && <Tag color="success">当前阶段</Tag>}
                    </Flex>
                  }
                  description={`${textbook.version} | ${GRADES[textbook.grade]} | ${textbook.semester}`}
                />
              );
            })}
          </div>
        </CheckCard.Group>
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
