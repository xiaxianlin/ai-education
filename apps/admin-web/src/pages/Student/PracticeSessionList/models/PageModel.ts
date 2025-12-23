import { useRequest } from 'ahooks';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { StudentApi } from '../../api';

const useContainer = () => {
  const { id } = useParams<{ id: string }>();
  const [practiceId, setPracticeId] = useState<number>();

  // 获取学生信息
  const {
    data: student,
    loading: studentLoading,
    error: studentError,
  } = useRequest(() => StudentApi.getStudent(id!), {
    ready: !!id,
    refreshDeps: [id],
  });

  // 获取学生的练习列表
  const practiceService = useRequest(() => StudentApi.getStudentPractices(student?.id || ''), {
    ready: !!student?.id,
  });

  return {
    student,
    studentId: id,
    studentLoading,
    studentError,
    practiceService,
    practiceId,
    setPracticeId,
  };
};

export const PracticeSessionListModel = createContainer(useContainer);
export const usePracticeSessionListModel = PracticeSessionListModel.useContainer;
