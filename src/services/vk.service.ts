import {
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
    };
  }
}
