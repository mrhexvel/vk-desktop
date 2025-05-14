import { vkService } from "@/services/vk.service";
import { VKGetConversationsResponse } from "@/types/vk.type";
import { create } from "zustand";

interface IConversation {
  isLoading: boolean;
  conversations: VKGetConversationsResponse["response"] | undefined;
  fetchConversations: () => void;
}

export const useConversationsStore = create<IConversation>((set) => ({
  conversations: undefined,
  isLoading: true,
  fetchConversations: () => {
    vkService
      .getConversations()
      .then((data) => set({ conversations: data }))
      .finally(() => set({ isLoading: false }));
  },
}));
