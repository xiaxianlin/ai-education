import { GRADES } from '@/constants/course';
import { useModel } from '@umijs/max';

export const useConfigs = () => {
  const { initialState } = useModel('@@initialState');
  const { semesters, subjects, textbook_versions, question_types, question_subtypes, difficulty_levels } =
    initialState?.configs || {};
  const subjectEnum = subjects?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}) || {};

  const gradeEnum = Object.keys(GRADES).reduce(
    (prev, key) => ({ ...prev, [key]: GRADES[Number(key)].grade }),
    {},
  );
  const questionTypeEmun =
    question_types?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}) || {};

  const difficultyLevelEmun =
    difficulty_levels?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}) || {};

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
  };
};
