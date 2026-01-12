import { useInitialStateModel } from '@/models/initialState';
import { GRADES } from '@ai-education/shared-web';
;

export const useConfigs = () => {
  const { configs } = useInitialStateModel();
  const {
    semesters = [],
    subjects = [],
    question_types = [],
    difficulty_levels = [],
    providers = [],
  } = configs || {};

  const subjectEnum = subjects.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}) || {};

  const gradeEnum = Object.keys(GRADES).reduce((prev, key) => ({ ...prev, [key]: GRADES[Number(key)] }), {});

  const difficultyLevelEmun = difficulty_levels.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}) || {};

  const questionTypeEnum = question_types.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}) || {};

  return {
    semesters,
    subjects,
    question_types,
    difficulty_levels,
    providers,
    subjectEnum,
    gradeEnum,
    questionTypeEnum,
    difficultyLevelEmun,
  };
};
