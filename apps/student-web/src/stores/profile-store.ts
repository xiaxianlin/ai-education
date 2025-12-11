import { useCallback, useMemo, useState } from "react";
import { createContainer } from "unstated-next";
import { uniq } from "lodash-es";

interface ProfileState {
  student?: Student;
  textbooks?: Textbook[];
  activeTextbooks?: Textbook[];
  subjects?: string[];
}

interface ProfileStoreValue extends ProfileState {
  setProfile: (profile: Profile) => void;
}

function useProfileStoreInternal(): ProfileStoreValue {
  const [state, setState] = useState<ProfileState>({
    student: undefined,
    textbooks: [],
    activeTextbooks: [],
    subjects: [],
  });

  const setProfile = useCallback((profile: Profile) => {
    setState({
      student: profile.student,
      textbooks: profile.textbooks,
      subjects: uniq(profile.textbooks.map((t) => t.subject)),
      activeTextbooks: profile.textbooks
        .filter((t) => t.grade === profile.student.grade)
        .sort((a, b) => {
          // 先按 subject 排序
          if (a.subject > b.subject) return -1;
          if (a.subject < b.subject) return 1;
          // subject 相同再按 semester 排序
          const semesterOrder = { "上学期": 0, "下学期": 1 };
          const orderA = semesterOrder[a.semester as "上学期" | "下学期"] ?? 2;
          const orderB = semesterOrder[b.semester as "上学期" | "下学期"] ?? 2;
          return orderA - orderB;
        }),
    });
  }, []);

  return useMemo(
    () => ({
      ...state,
      setProfile,
    }),
    [setProfile, state]
  );
}

const ProfileStore = createContainer(useProfileStoreInternal);

type UseProfileStore = {
  (): ProfileStoreValue;
  <T>(selector: (state: ProfileStoreValue) => T): T;
};

export const ProfileProvider = ProfileStore.Provider;
export const useProfileStore: UseProfileStore = ((selector?: (state: ProfileStoreValue) => unknown) => {
  const store = ProfileStore.useContainer();
  return selector ? selector(store) : store;
}) as UseProfileStore;
