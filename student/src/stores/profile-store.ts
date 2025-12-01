import { create } from "zustand";
import { uniq } from "lodash-es";
interface ProfileStoreState {
  student?: Student;
  textbooks?: Textbook[];
  activeTextbooks?: Textbook[];
  subjects?: string[];
  setProfile: (profile: Profile) => void;
}

export const useProfileStore = create<ProfileStoreState>((set) => {
  return {
    student: undefined,
    textbooks: [],
    subjects: [],
    setProfile: (profile) =>
      set({
        student: profile.student,
        textbooks: profile.textbooks,
        subjects: uniq(profile.textbooks.map((t) => t.subject)),
        activeTextbooks: profile.textbooks.filter(
          (t) => t.grade === profile.student.grade
        ),
      }),
  };
});
