import type {
  ExecuteProfiles,
  VKConversationItem,
  VKGetConversationsResponse,
  VKGroup,
  VKMessageHistory,
  VKProfile,
} from "@/types/vk.type";

export class VKApiService {
  private readonly accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  getAccessToken(): string {
    return this.accessToken;
  }

  async getConversations(): Promise<VKGetConversationsResponse["response"]> {
    try {
      const response = await window.vkApi.getConversations(this.accessToken);
      return response;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  }

  async execute(code: string): Promise<ExecuteProfiles> {
    try {
      const response = await window.vkApi.execute(this.accessToken, code);
      return response;
    } catch (error) {
      console.error("Error execute:", error);
      throw error;
    }
  }

  async usersGet(user_ids?: string): Promise<VKProfile[]> {
    try {
      const response = await window.vkApi.usersGet(this.accessToken, user_ids);
      return response;
    } catch (error) {
      console.error("Error execute:", error);
      throw error;
    }
  }

  async groupsGetById(group_id: number): Promise<VKGroup> {
    try {
      const response = await window.vkApi.groupsGetById(
        this.accessToken,
        group_id
      );
      return response;
    } catch (error) {
      console.error("Error execute:", error);
      throw error;
    }
  }

  async getHistory(peer_id: number): Promise<VKMessageHistory> {
    const maxRetries = 2;
    let retries = 0;

    const tryFetchHistory = async (): Promise<VKMessageHistory> => {
      try {
        const response = await window.vkApi.getHistory(
          this.accessToken,
          peer_id
        );
        return response;
      } catch (error) {
        if (retries < maxRetries) {
          retries++;
          const delay = 300 * Math.pow(2, retries);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return tryFetchHistory();
        }

        throw error;
      }
    };

    return tryFetchHistory();
  }

  async getMessageById(message_id: number): Promise<VKMessageHistory> {
    try {
      const response = await window.vkApi.getMessagesById(
        this.accessToken,
        message_id
      );
      return response;
    } catch (error) {
      console.error(`Error fetching message info for message:`, error);
      throw error;
    }
  }

  async getLongPollServer() {
    try {
      const response = await window.vkApi.getLongPollServer(this.accessToken);
      return response;
    } catch (error) {
      console.error("Error getting Long Poll server:", error);
      throw error;
    }
  }

  static getConversationAvatar(
    conversation: VKConversationItem,
    profiles: VKProfile[],
    groups: VKGroup[]
  ): string | undefined {
    const { peer } = conversation.conversation;
    if (peer.type === "user") {
      const profile = profiles.find((p) => p.id === peer.id);
      return profile?.photo_100;
    } else if (peer.type === "chat") {
      return conversation.conversation.chat_settings?.photo?.photo_100;
    } else if (peer.type === "group") {
      const group = groups.find((g) => g.id === -peer.id);
      return group?.photo_100;
    }
    return undefined;
  }
}

declare global {
  interface Window {
    vkApi: {
      getConversations: (
        accessToken: string
      ) => Promise<VKGetConversationsResponse["response"]>;

      execute: (accessToken: string, code: string) => Promise<ExecuteProfiles>;

      usersGet: (
        accessToken: string,
        user_ids?: string
      ) => Promise<VKProfile[]>;

      groupsGetById: (
        accessToken: string,
        group_id: number
      ) => Promise<VKGroup>;

      getHistory: (
        accessToken: string,
        peer_id: number
      ) => Promise<VKMessageHistory>;

      getMessagesById: (
        accessToken: string,
        message_id: number
      ) => Promise<VKMessageHistory>;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getLongPollServer: (accessToken: string) => Promise<any>;

      startLongPolling: (accessToken: string) => Promise<boolean>;

      stopLongPolling: () => Promise<boolean>;

      setActiveConversation: (
        conversationId: number | null
      ) => Promise<boolean>;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onNewMessage: (callback: (data: any) => void) => () => void;

      onUpdateConversations: (callback: () => void) => () => void;

      onUpdateMessageHistory: (
        callback: (peerId: number) => void
      ) => () => void;

      onTyping: (
        callback: (data: { userId: number; peerId: number }) => void
      ) => () => void;
    };
  }
}

export const vkService = new VKApiService(import.meta.env.VITE_ACCESS_TOKEN);
