import { GRADES } from '@ai-education/shared-web';
import { BookOutlined, PlusOutlined } from '@ant-design/icons';
import { CheckCard } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Avatar, Button, Checkbox, Empty, Flex, message, Modal, Tag } from 'antd';
import { useState } from 'react';
import { StudentApi } from '../../api';
import { AddTextbookForm } from '../components/AddTextbookForm';
import { useStudentDetailModel } from '../models/page';
export function TextbookList() {
  const { student, textbookService, addTextbookVisible, setAddTextbookVisible } = useStudentDetailModel();

  const { data, refresh } = textbookService;
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
    <Flex vertical gap={16}>
      <Flex align="center" justify="space-between">
        <Checkbox
          indeterminate={someSelected}
          checked={allSelected}
          onChange={(e) => handleSelectAll(e.target.checked)}
        >
          全选
        </Checkbox>
        <Flex align="center" gap={16}>
          <Button danger onClick={handleBatchDelete}>
            批量删除 ({selectedIds.length})
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddTextbookVisible(true)}>
            添加教材
          </Button>
        </Flex>
      </Flex>
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
    </Flex>
  );
}
