import { createContainer } from 'unstated-next';
import { useRequest } from 'ahooks';
import { TextbookVersionApi } from '@/services/textbook_version';
import { SubjectApi } from '@/services/subject';

const useContainer = () => {
  const { data: subjects } = useRequest(SubjectApi.actives);
  const { data: versions } = useRequest(TextbookVersionApi.actives);

  return {
    subjects,
    versions,
  };
};

export const CourseModel = createContainer(useContainer);
export const useCourseModel = CourseModel.useContainer;
