import { vkService } from "@/services/vk.service";
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

export const getMessageSendersInfo = async (fromIds: number[]) => {
  const userIds = fromIds.filter((id) => id > 0).join(",");
  const groupIds = fromIds
    .filter((id) => id < 0)
    .map((id) => Math.abs(id))
    .join(",");

  const code = `
    var userIds = [${userIds}];
    var groupIds = [${groupIds}];
    var result = {};

    if (userIds.length > 0) {
      result.users = API.users.get({
        user_ids: userIds,
        fields: "first_name,last_name",
        v: "5.131"
      });
    }

    if (groupIds.length > 0) {
      result.groups = API.groups.getById({
        group_ids: groupIds,
        v: "5.131"
      });
    }

    return result;
  `;

  const response = await vkService.execute(code);
  return response;
};
