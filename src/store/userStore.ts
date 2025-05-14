import { vkService } from "@/services/vk.service";
import { VKProfile } from "@/types/vk.type";
import { create } from "zustand";

interface IUser {
  isLoading: boolean;
  user: VKProfile | undefined;
  fetchUser: () => void;
}

export const useUserStore = create<IUser>((set) => ({
  user: undefined,
  isLoading: true,
  fetchUser: () => {
    vkService
      .usersGet()
      .then((data) => set({ user: data }))
      .finally(() => set({ isLoading: false }));
  },
}));
