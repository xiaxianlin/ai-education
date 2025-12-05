import { message, Modal } from 'antd';
import { useRequest } from 'ahooks';
import { createContainer } from 'unstated-next';
import { adminApi } from '@/lib/api';
import { useNavigate, useParams } from 'react-router-dom';

const useContainer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    data: teacherBook,
    loading,
    refresh,
  } = useRequest(() => adminApi.getTeacherBook(Number(id)), {
    ready: !!id,
  });

  const { runAsync: deleteTeacherBook } = useRequest(adminApi.deleteTeacherBook, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      navigate('/teacher_book');
    },
  });

  const { loading: uploading, run: upload } = useRequest(
    (data) => adminApi.uploadTeacherBook(teacherBook!.id, data),
    {
      manual: true,
      onSuccess: () => {
        message.success('上传成功');
        refresh();
      },
    },
  );

  const handleDelete = () => {
    if (!teacherBook) return;
    Modal.confirm({
      centered: true,
      title: '删除确认',
      content: `确定要删除该教师用书吗？`,
      okType: 'danger',
      onOk: () => {
        deleteTeacherBook(teacherBook.id);
      },
    });
  };

  return {
    id: Number(id),
    loading,
    teacherBook,
    uploading,
    upload,
    handleDelete,
  };
};

export const TeacherBookDetailModel = createContainer(useContainer);
export const useTeacherBookDetailModel = TeacherBookDetailModel.useContainer;
