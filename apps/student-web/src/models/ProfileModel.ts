import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { uniq } from "lodash-es";
import { useMemo } from "react";
import { createContainer } from "unstated-next";

const useContainer = () => {
  const { data, loading } = useRequest(() => studentApi.getProfile());

  const activeTextbooks = useMemo(() => {
    return (data?.textbooks || [])
      .filter((t) => t.grade === data?.student.grade)
      .sort((a, b) => {
        if (a.subject > b.subject) return -1;
        if (a.subject < b.subject) return 1;
        return a.semester.localeCompare(b.semester);
      });
  }, [data]);

  return {
    loading,
    student: data?.student,
    textbooks: data?.textbooks || [],
    subjects: uniq(data?.textbooks?.map((t) => t.subject) ?? []),
    activeTextbooks,
  };
};

export const ProfileModel = createContainer(useContainer);
export const useProfileModel = ProfileModel.useContainer;
