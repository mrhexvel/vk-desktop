import { VKConversationItem, VKProfile } from "@/types/vk.type";

// TODO: переписать это говно
const getProfileById = (profiles: VKProfile[], id: number) =>
  profiles.find((p) => p.id === id);

export function getChatTitle(
  profiles: VKProfile[],
  conversation: VKConversationItem
) {
  const isGroupChat = conversation.conversation.peer.type === "chat";
  if (isGroupChat) {
    return conversation.conversation.chat_settings?.title;
  }

  return `${
    getProfileById(profiles, conversation.conversation.peer.id)?.first_name
  } ${getProfileById(profiles, conversation.conversation.peer.id)?.last_name}`;
}
