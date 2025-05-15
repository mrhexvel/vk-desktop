import { vkService } from "@/services/vk.service";
import { VKMessageHistory } from "@/types/vk.type";
import { create } from "zustand";

interface IHistory {
  isLoading: boolean;
  history: VKMessageHistory | undefined;
  fetchHistory: (peer_id: number) => void;
}

export const useMessageHistory = create<IHistory>((set) => ({
  history: undefined,
  isLoading: true,
  fetchHistory: (peer_id: number) => {
    vkService
      .getHistory(peer_id)
      .then((data) => {
        set({ history: data });
        console.log(data);
      })
      .finally(() => set({ isLoading: false }));
  },
}));
