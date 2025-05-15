import { vkService } from "@/services/vk.service";
import type { VKGetConversationsResponse } from "@/types/vk.type";
import { create } from "zustand";

interface IConversation {
  isLoading: boolean;
  conversations: VKGetConversationsResponse["response"] | undefined;
  fetchConversations: () => Promise<void>;
  updateConversationsBackground: () => Promise<void>;
}

export const useConversationsStore = create<IConversation>((set, get) => ({
  conversations: undefined,
  isLoading: true,
  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const data = await vkService.getConversations();
      set({ conversations: data });
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  updateConversationsBackground: async () => {
    try {
      const data = await vkService.getConversations();

      const currentData = get().conversations;
      if (!currentData) {
        set({ conversations: data });
        return;
      }

      let hasChanges = false;

      if (data.items.length !== currentData.items.length) {
        hasChanges = true;
      } else {
        for (let i = 0; i < data.items.length; i++) {
          const newItem = data.items[i];
          const oldItem = currentData.items.find(
            (item) => item.conversation.peer.id === newItem.conversation.peer.id
          );

          if (!oldItem || oldItem.last_message.id !== newItem.last_message.id) {
            hasChanges = true;
            break;
          }
        }
      }

      if (hasChanges) {
        set({ conversations: data });
      }
    } catch (error) {
      console.error("Error updating conversations in background:", error);
    }
  },
}));
