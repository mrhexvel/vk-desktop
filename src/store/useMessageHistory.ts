import { vkService } from "@/services/vk.service";
import type { VKMessage, VKMessageHistory } from "@/types/vk.type";
import { create } from "zustand";

interface IHistory {
  isLoading: boolean;
  history: VKMessageHistory | null;
  fetchHistory: (peer_id: number) => Promise<void>;
  clearHistory: () => void;
  updateHistoryBackground: (peer_id: number) => Promise<void>;
  addMessage: (message: VKMessage) => void;
}

export const useMessageHistory = create<IHistory>((set, get) => ({
  history: null,
  isLoading: true,
  fetchHistory: async (peer_id: number) => {
    set({ isLoading: true });
    try {
      const data = await vkService.getHistory(peer_id);
      set({ history: data });
    } catch (error) {
      console.error("Error fetching message history:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  clearHistory: () => set({ history: null, isLoading: true }),

  updateHistoryBackground: async (peer_id: number) => {
    try {
      const data = await vkService.getHistory(peer_id);
      set((state) => ({
        history: data,
        isLoading: state.isLoading,
      }));
    } catch (error) {
      console.error("Error updating message history in background:", error);
    }
  },

  addMessage: (message: VKMessage) => {
    const currentHistory = get().history;
    if (!currentHistory) return;

    const messageExists = currentHistory.items.some(
      (item) => item.id === message.id
    );

    if (messageExists) return;

    const newHistory = {
      ...currentHistory,
      count: currentHistory.count + 1,
      items: [message, ...currentHistory.items],
    };

    set((state) => ({
      history: newHistory,
      isLoading: state.isLoading,
    }));
  },
}));
