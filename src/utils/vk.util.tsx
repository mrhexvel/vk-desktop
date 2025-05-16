import { vkService } from "@/services/vk.service";
import { VKConversationItem, VKProfile } from "@/types/vk.type";

// TODO: переписать это говно
const getProfileById = (profiles: VKProfile[], id: number) =>
  profiles.find((p) => p.id === id);

export function getChatTitle(
  profiles: VKProfile[] | undefined,
  conversation: VKConversationItem | undefined
) {
  const isGroupChat = conversation?.conversation.peer.type === "chat";

  if (isGroupChat) {
    return conversation.conversation.chat_settings?.title;
  }

  return `${
    getProfileById(profiles!, conversation!.conversation.peer.id)?.first_name
  } ${
    getProfileById(profiles!, conversation!.conversation.peer.id)?.last_name
  }`;
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
        fields: "name",
        v: "5.131"
      });
    }

    return result;
  `;

  const response = await vkService.execute(code);
  return response;
};

export const parseTextWithLinks = (() => {
  const cache = new Map<string, (string | JSX.Element)[]>();

  return (text: string, onlyFirstName?: boolean) => {
    const cacheKey = `${text}::${onlyFirstName}`;

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    const linkRegex = /\[(id\d+|club\d+|\{[^}]+})\|([^[\]]*)\]/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    text.replace(linkRegex, (match, link, displayText, index) => {
      if (index > lastIndex) {
        parts.push(text.slice(lastIndex, index));
      }

      let href = "";
      if (link.startsWith("id") || link.startsWith("club")) {
        href = `https://vk.com/${link}`;
      } else if (link.startsWith("{")) {
        href = link.slice(1, -1);
      }

      parts.push(
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:underline"
        >
          {onlyFirstName ? displayText.split(" ")[0] : displayText}
        </a>
      );

      lastIndex = index + match.length;
      return match;
    });

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    cache.set(cacheKey, parts);
    return parts;
  };
})();
