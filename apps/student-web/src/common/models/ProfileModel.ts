import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { orderBy, uniq } from "lodash-es";
import { useMemo } from "react";
import { createContainer } from "unstated-next";

const useContainer = () => {
  const { data, loading, refresh } = useRequest(() => studentApi.getProfile(), {
    refreshDeps: [],
  });

  const { name, phone, grade, semester, subject, textbooks = [] } = data || {};

  const activeTextbooks = useMemo(() => {
    return orderBy(
      textbooks.filter((t) => t.grade === grade),
      ["subject", "semester"],
      ["asc", "asc"]
    );
  }, [textbooks, grade]);

  const updateSettings = async (params: UpdateStudentSettingsRequest) => {
    await studentApi.updateSettings(params);
    await refresh();
  };

  return {
    loading,
    profile: { name, phone, grade, semester, subject },
    textbooks,
    subjects: uniq(activeTextbooks.map((t) => t.subject)),
    activeTextbooks,
    updateSettings,
    refresh,
  };
};

export const ProfileModel = createContainer(useContainer);
export const useProfileModel = ProfileModel.useContainer;
