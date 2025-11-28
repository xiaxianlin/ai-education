import { create } from "zustand";

interface ProfileStoreState {
  student?: Student;
  textbooks?: Textbook[];
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
        subjects: profile.textbooks.map((t) => t.subject),
      }),
  };
});
