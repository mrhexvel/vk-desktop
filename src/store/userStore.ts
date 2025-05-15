import { vkService } from "@/services/vk.service";
import { VKProfile } from "@/types/vk.type";
import { create } from "zustand";

interface IUser {
  user: VKProfile | undefined;
  profiles: Record<number, VKProfile>;
  isLoading: boolean;
  fetchUser: () => void;
  setProfiles: (profiles: VKProfile[]) => void;
}

export const useUserStore = create<IUser>((set) => ({
  user: undefined,
  profiles: {},
  isLoading: true,
  fetchUser: () => {
    vkService
      .usersGet()
      .then((data) => set({ user: data[0] }))
      .finally(() => set({ isLoading: false }));
  },
  setProfiles: (profiles) =>
    set((state) => ({
      profiles: {
        ...state.profiles,
        ...profiles.reduce(
          (acc, profile) => ({ ...acc, [profile.id]: profile }),
          {}
        ),
      },
    })),
}));
