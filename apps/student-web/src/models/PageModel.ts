import { useProfileModel } from "./ProfileModel";
import { useRequest } from "ahooks";
import { studentApi } from "@/lib/api";
import { createContainer } from "unstated-next";

const usePageModel = () => {
  const { activeTextbooks, subjects } = useProfileModel();

  const {
    data: practices = [],
    loading,
    refresh,
  } = useRequest(studentApi.getDailyPractice.bind(studentApi));

  const getPracticesBySubject = (subject: string) => {
    const textbooks = activeTextbooks.filter((t) => t.subject === subject);
    return textbooks.map((textbook) => ({
      textbook,
      practice: practices.find((p) => p.textbook_id === textbook.id),
    }));
  };

  return {
    loading,
    subjects,
    activeTextbooks,
    practices,
    refresh,
    getPracticesBySubject,
  };
};

export const PageModel = createContainer(usePageModel);
export const usePageModel = PageModel.useContainer;
