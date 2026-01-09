import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { orderBy, uniq } from "lodash-es";
import { useMemo } from "react";
import { createContainer } from "unstated-next";

const useContainer = () => {
  const { data, loading } = useRequest(() => studentApi.getProfile());

  const { name, phone, grade, textbooks = [] } = data || {};

  const activeTextbooks = useMemo(() => {
    return orderBy(
      textbooks.filter((t) => t.grade === grade),
      ["subject", "semester"],
      ["asc", "asc"]
    );
  }, [textbooks, grade]);

  return {
    loading,
    profile: { name, phone, grade },
    textbooks,
    subjects: uniq(activeTextbooks.map((t) => t.subject)),
    activeTextbooks,
  };
};

export const ProfileModel = createContainer(useContainer);
export const useProfileModel = ProfileModel.useContainer;
