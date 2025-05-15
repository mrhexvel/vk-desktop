import { vkService } from "@/services/vk.service";
import { VKMessageHistory } from "@/types/vk.type";
import { create } from "zustand";

interface IHistory {
  isLoading: boolean;
  history: VKMessageHistory | null;
  fetchHistory: (peer_id: number) => void;
  clearHistory: () => void;
}

export const useMessageHistory = create<IHistory>((set) => ({
  history: null,
  isLoading: true,
  fetchHistory: (peer_id: number) => {
    vkService
      .getHistory(peer_id)
      .then((data) => {
        set({ history: data });
      })
      .finally(() => set({ isLoading: false }));
  },
  clearHistory: () => set({ history: null }),
}));
