import { useMemo } from 'react';
import { GRADES } from '@/constants/course';
import { useInitialState } from './useInitialState';

export const useConfigs = () => {
  const { initialState } = useInitialState();
  const {
    semesters,
    subjects,
    textbook_versions,
    question_types,
    question_subtypes,
    difficulty_levels,
  } = (initialState?.configs || {}) as Configs;
  const subjectEnum = subjects?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}) || {};

  const gradeEnum = Object.keys(GRADES).reduce(
    (prev, key) => ({ ...prev, [key]: GRADES[Number(key)] }),
    {},
  );
  // question_types 可能是数组或对象格式，需要兼容处理
  const questionTypeEmun = useMemo(() => {
    if (!question_types) return {};
    // 如果是数组格式（旧格式兼容）
    if (Array.isArray(question_types)) {
      return question_types.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {});
    }
    // 如果是对象格式（新格式），提取所有键
    if (typeof question_types === 'object') {
      return Object.keys(question_types).reduce((prev, curr) => ({ ...prev, [curr]: curr }), {});
    }
    return {};
  }, [question_types]);

  const difficultyLevelEmun =
    difficulty_levels?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}) || {};

  const textbookVersionEmun =
    textbook_versions?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}) || {};

  return {
    semesters,
    subjects,
    textbook_versions,
    question_types,
    question_subtypes,
    difficulty_levels,
    subjectEnum,
    gradeEnum,
    questionTypeEmun,
    difficultyLevelEmun,
    textbookVersionEmun,
  };
};
