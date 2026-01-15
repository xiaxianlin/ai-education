import { useInitialStateModel } from '@/models/initialState';
import { GRADES } from '@ai-education/shared-web';
;

export const useConfigs = () => {
  const { configs } = useInitialStateModel();
  const {
    semesters = [],
    subjects = [],
    providers = [],
  } = configs || {};

  const subjectEnum = subjects.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}) || {};

  const gradeEnum = Object.keys(GRADES).reduce((prev, key) => ({ ...prev, [key]: GRADES[Number(key)] }), {});

  return {
    semesters,
    subjects,
    providers,
    subjectEnum,
    gradeEnum,
  };
};
