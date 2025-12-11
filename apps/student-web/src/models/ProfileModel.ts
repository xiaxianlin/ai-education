import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { uniq } from "lodash-es";
import { createContainer } from "unstated-next";

const useContaienr = () => {
  const { data, loading } = useRequest(() => studentApi.getProfile());

  return {
    loading,
    student: data?.student,
    textbooks: data?.textbooks || [],
    subjects: uniq(data?.textbooks?.map((t) => t.subject) ?? []),
    activeTextbooks:
      data?.textbooks
        .filter((t) => t.grade === data?.student.grade)
        .sort((a, b) => {
          // 先按 subject 排序
          if (a.subject > b.subject) return -1;
          if (a.subject < b.subject) return 1;
          // subject 相同再按 semester 排序
          const semesterOrder = { 上学期: 0, 下学期: 1 };
          const orderA = semesterOrder[a.semester as "上学期" | "下学期"] ?? 2;
          const orderB = semesterOrder[b.semester as "上学期" | "下学期"] ?? 2;
          return orderA - orderB;
        }) || [],
  };
};

export const ProfileModel = createContainer(useContaienr);
export const useProfileModel = ProfileModel.useContainer;
