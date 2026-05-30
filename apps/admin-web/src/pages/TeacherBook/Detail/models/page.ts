import { toast } from '@/components/ui/toast';
import { useRequest } from 'ahooks';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { TeacherBookApi } from '../../api';

const useContainer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    data: teacherBook,
    loading,
    refresh,
  } = useRequest(() => TeacherBookApi.getTeacherBook(Number(id)), {
    ready: !!id,
  });

  const { runAsync: deleteTeacherBook } = useRequest(TeacherBookApi.deleteTeacherBook, {
    manual: true,
    onSuccess: () => {
      toast.success('删除成功');
      navigate('/teacher_book');
    },
  });

  const { loading: uploading, run: upload } = useRequest(
    (data) => TeacherBookApi.uploadTeacherBook(teacherBook!.id, data),
    {
      manual: true,
      onSuccess: () => {
        toast.success('上传成功');
        refresh();
      },
    },
  );

  const handleDelete = () => {
    if (!teacherBook) return;
    if (window.confirm('确定要删除该教师用书吗？')) {
      deleteTeacherBook(teacherBook.id);
    }
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
