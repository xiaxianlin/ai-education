import { api } from "@/lib/api";

export const profileService = {
  getProfile: async (): Promise<Profile> => {
    return api.get<Profile>("/profile");
  },
};
