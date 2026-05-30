import { Button } from '@/components/ui';
import { useStudentDetailModel } from '../models/page';

export function Footer() {
  const { student, deleting, resetting, handleDelete, handleResetPassword, setEditFormVisible } = useStudentDetailModel();

  const handleEdit = () => {
    if (student) {
      setEditFormVisible(true);
    }
  };

  const onDelete = () => {
    if (window.confirm(`确定要删除学生「${(student as any)?.name || ''}」吗？此操作不可恢复。`)) {
      handleDelete();
    }
  };

  const onResetPassword = () => {
    if (window.confirm('确定要重置该学生的密码吗？重置后系统将生成新密码。')) {
      handleResetPassword();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={handleEdit} disabled={!student}>
        编辑
      </Button>
      <Button loading={deleting} variant="destructive" onClick={onDelete} disabled={!student}>
        删除
      </Button>
      <Button loading={resetting} variant="outline" onClick={onResetPassword} disabled={!student}>
        重置密码
      </Button>
    </div>
  );
}
