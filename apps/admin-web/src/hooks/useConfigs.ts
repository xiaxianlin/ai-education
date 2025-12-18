import { GRADES } from '@/constants/course';
import { useInitialStateModel } from '@/models/initialState';

export const useConfigs = () => {
  const initialState = useInitialStateModel();
  const {
    semesters = [],
    subjects = [],
    textbook_versions = [],
    question_scenes = [],
    difficulty_levels = [],
    providers = [],
    question_types = {},
  } = (initialState?.configs || {}) as Configs;
  const subjectEnum = subjects.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}) || {};

  const gradeEnum = Object.keys(GRADES).reduce((prev, key) => ({ ...prev, [key]: GRADES[Number(key)] }), {});

  const difficultyLevelEmun = difficulty_levels.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}) || {};

  const textbookVersionEmun = textbook_versions.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}) || {};

  const questionTypeEnum = question_scenes.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}) || {};

  return {
    semesters,
    subjects,
    textbook_versions,
    question_scenes,
    difficulty_levels,
    providers,
    question_types,
    subjectEnum,
    gradeEnum,
    questionTypeEnum,
    difficultyLevelEmun,
    textbookVersionEmun,
  };
};
