import { toast } from '@/components/ui/toast';
import { useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import { StudentApi } from '../../api';

const useContainer = () => {
  const actionRef = useRef<{ reload: () => void }>();
  const [item, setItem] = useState<Student>();
  const [visible, setVisible] = useState(false);

  const showForm = (student?: Student) => {
    setItem(student);
    setVisible(true);
  };

  const onCancel = () => {
    setItem(undefined);
    setVisible(false);
  };

  const handleSubmit = async (values: SaveStudentRequest) => {
    if (item) {
      await StudentApi.updateStudent(item.id, values);
      toast.success('更新成功');
    } else {
      await StudentApi.createStudent(values);
      toast.success('学生已创建，默认密码为手机号后6位');
    }
    setItem(undefined);
    setVisible(false);
    actionRef.current?.reload();
  };

  const handleDelete = (student: Student) => {
    if (!window.confirm(`确定要删除学生「${student?.name || ''}」吗？`)) return;
    StudentApi.deleteStudent(student.id).then(() => {
      toast.success('删除成功');
      actionRef.current?.reload();
    });
  };

  return {
    actionRef,
    formProps: {
      visible,
      item,
      showForm,
      onCancel,
      handleSubmit,
    },
    handleDelete,
  };
};

export const StudentListModel = createContainer(useContainer);
export const useStudentListModel = StudentListModel.useContainer;
