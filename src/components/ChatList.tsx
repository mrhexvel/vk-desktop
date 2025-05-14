import { cn, cropText } from "@/lib/utils";
import {
  VKConversationItem,
  VKGroup,
  VKMessage,
  VKProfile,
} from "@/types/vk.type";
import { getChatTitle } from "@/utils/vk.util";
import { ScrollArea } from "@radix-ui/react-scroll-area";

interface ChatListProps {
  conversations: VKConversationItem[];
  profiles: VKProfile[];
  groups: VKGroup[];
  activeId: number | undefined;
  onSelect: (conversation: VKConversationItem) => void;
  getAvatar: (conversation: VKConversationItem) => string | undefined;
}

export default function ChatList({
  conversations,
  profiles,
  activeId,
  onSelect,
  getAvatar,
}: ChatListProps) {
  const formatLastmessage = (lastMessage: VKMessage): string => {
    if (lastMessage.text !== "") {
      return lastMessage.text;
    }

    switch (lastMessage.attachments[0]?.type) {
      case "sticker":
        return "Стикер";
      case "photo":
        return "Фотография";
      case "wall":
        return "Пост";
      case "audio_message":
        return "Аудиозапись";
      default:
        return "";
    }
  };

  return (
    <ScrollArea className="h-72 rounded-md">
      <div className="pb-1">
        {conversations.map((conversation) => {
          console.log(conversation);

          const chatTitle = getChatTitle(profiles, conversation);
          const chatImage = getAvatar(conversation);
          const chatLastMessage = formatLastmessage(conversation.last_message);

          return (
            <div
              key={conversation.conversation.peer.id}
              onClick={() => onSelect(conversation)}
              className={cn(
                "m-3 cursor-pointer hover:bg-[#2a2a5a] rounded-xl shadow shadow-gray-800 transition-colors",
                {
                  "bg-[#2a2a3a]":
                    activeId === conversation.conversation.peer.id,
                }
              )}
            >
              <div className="p-2 flex items-center">
                <img
                  src={chatImage}
                  alt={chatTitle}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h3 className="text-sm font-medium">{chatTitle}</h3>
                  <p className="text-xs text-gray-400">
                    id{conversation.last_message.from_id}:{" "}
                    {cropText(chatLastMessage, 10)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
