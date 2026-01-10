import { useRequest } from 'ahooks';
import { useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { StudentApi } from '../../api';

const useContainer = () => {
  const { id } = useParams<{ id: string }>();

  // 获取学生信息
  const {
    data: student,
    loading: studentLoading,
    error: studentError,
  } = useRequest(() => StudentApi.getStudent(id!), {
    ready: !!id,
    refreshDeps: [id],
  });

  return {
    student,
    studentId: id,
    studentLoading,
    studentError,
  };
};

export const PracticeSessionListModel = createContainer(useContainer);
export const usePracticeSessionListModel = PracticeSessionListModel.useContainer;
