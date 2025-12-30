import { DeleteOutlined, EditOutlined, RedoOutlined } from '@ant-design/icons';
import { Button, Flex, Modal } from 'antd';
import { useStudentDetailModel } from '../models/page';

export function Footer() {
  const { student, deleting, resetting, editForm, handleDelete, handleResetPassword, setEditFormVisible } =
    useStudentDetailModel();

  const handleEdit = () => {
    if (student) {
      editForm.setFieldsValue({ ...student });
      setEditFormVisible(true);
    }
  };

  const onDelete = () => {
    Modal.confirm({
      centered: true,
      title: '删除确认',
      content: `确定要删除学生「${(student as any)?.name || ''}」吗？此操作不可恢复。`,
      okType: 'danger',
      onOk: () => handleDelete(),
    });
  };

  const onResetPassword = () => {
    Modal.confirm({
      centered: true,
      title: '重置密码',
      content: '确定要重置该学生的密码吗？重置后系统将生成新密码。',
      onOk: () => handleResetPassword(),
    });
  };

  return (
    <Flex align="center" gap={16}>
      <Button type="primary" icon={<EditOutlined />} onClick={handleEdit} disabled={!student}>
        编辑
      </Button>
      <Button loading={deleting} danger icon={<DeleteOutlined />} onClick={onDelete} disabled={!student}>
        删除
      </Button>
      <Button loading={resetting} danger icon={<RedoOutlined />} onClick={onResetPassword} disabled={!student}>
        重置密码
      </Button>
    </Flex>
  );
}
