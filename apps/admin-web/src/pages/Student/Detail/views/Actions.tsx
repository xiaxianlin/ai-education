import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, Modal } from 'antd';
import { useStudentDetailModel } from '../models/page';

export function Actions() {
  const {
    student,
    deleting,
    resetting,
    toggling,
    handleDelete,
    handleResetPassword,
    handleToggleStatus,
  } = useStudentDetailModel();
  const menuItems: MenuProps['items'] = [
    {
      key: 'delete',
      label: '删除',
      danger: true,
      disabled: deleting,
      onClick: () => {
        Modal.confirm({
          centered: true,
          title: '删除确认',
          content: `确定要删除学生「${(student as any)?.name || ''}」吗？此操作不可恢复。`,
          okType: 'danger',
          onOk: () => handleDelete(),
        });
      },
    },
    {
      key: 'status',
      label: (student as any)?.status === 1 ? '停用' : '启用',
      disabled: toggling,
      onClick: () => {
        const newStatus = (student as any)?.status === 1 ? 0 : 1;
        Modal.confirm({
          centered: true,
          title: '状态变更',
          content: `确定要${newStatus === 1 ? '启用' : '停用'}该学生吗？`,
          onOk: () => handleToggleStatus(newStatus),
        });
      },
    },
    {
      key: 'reset',
      label: '重置密码',
      disabled: resetting,
      onClick: () => {
        Modal.confirm({
          centered: true,
          title: '重置密码',
          content: '确定要重置该学生的密码吗？重置后系统将生成新密码。',
          onOk: () => handleResetPassword(),
        });
      },
    },
  ];

  return (
    <Dropdown key="more" menu={{ items: menuItems }} trigger={['click']}>
      <Button icon={<MoreOutlined />}>操作</Button>
    </Dropdown>
  );
}
