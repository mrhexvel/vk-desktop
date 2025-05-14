import {
  ExecuteProfiles,
  VKConversationItem,
  VKGetConversationsResponse,
  VKGroup,
  VKProfile,
} from "@/types/vk.type";

export class VKApiService {
  private readonly accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
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

  async usersGet(user_ids?: string): Promise<VKProfile> {
    try {
      const response = await window.vkApi.usersGet(this.accessToken, user_ids);
      return response[0];
    } catch (error) {
      console.error("Error execute:", error);
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
    };
  }
}

// да, я долбаёб, но об этом никому 🤫
export const vkService = new VKApiService("");
