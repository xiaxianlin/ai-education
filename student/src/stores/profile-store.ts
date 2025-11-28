import { create } from "zustand";

interface ProfileStoreState {
  student?: Student;
  textbooks?: Textbook[];
  setProfile: (profile: Profile) => void;
}

export const useProfileStore = create<ProfileStoreState>((set) => {
  return {
    student: undefined,
    textbooks: undefined,
    setProfile: (profile) =>
      set({ student: profile.student, textbooks: profile.textbooks }),
  };
});
