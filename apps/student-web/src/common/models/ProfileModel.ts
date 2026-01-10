import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { useMemo } from "react";
import { createContainer } from "unstated-next";

const useContainer = () => {
  const { data, loading, refresh } = useRequest(() => studentApi.getProfile(), {
    refreshDeps: [],
  });

  const { name, phone, grade, semester, subject, textbooks = [] } = data || {};

  const activeTextbook = useMemo(() => {
    if (!grade || !semester || !subject) return undefined;
    return textbooks.find((t) => t.grade === grade && t.semester === semester && t.subject === subject);
  }, [textbooks, grade, semester, subject]);

  const updateSettings = async (params: UpdateStudentSettingsRequest) => {
    await studentApi.updateSettings(params);
    refresh();
  };

  return {
    loading,
    profile: { name, phone, grade, semester, subject },
    activeTextbook,
    updateSettings,
    refresh,
  };
};

export const ProfileModel = createContainer(useContainer);
export const useProfileModel = ProfileModel.useContainer;
