import { useRequest } from 'ahooks';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { StudentApi } from '../../api';

// 练习类型配置
const PRACTICE_TYPES = [
  { slug: 'daily_practice', name: '日常练习' },
  { slug: 'unit_practice', name: '单元练习' },
  { slug: 'assess_practice', name: '综合评估' },
];

const useContainer = () => {
  const { id } = useParams<{ id: string }>();
  const [practiceSlug, setPracticeSlug] = useState<string>('daily_practice');

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
    practices: PRACTICE_TYPES,
    practiceSlug,
    setPracticeSlug,
  };
};

export const PracticeSessionListModel = createContainer(useContainer);
export const usePracticeSessionListModel = PracticeSessionListModel.useContainer;
