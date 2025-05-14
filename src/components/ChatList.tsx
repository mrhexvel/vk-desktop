import { VKConversationItem, VKGroup, VKProfile } from "@/types/vk.type";
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
  return (
    <ScrollArea className="h-72 rounded-md">
      <div className="pb-1">
        {conversations.map((conversation) => {
          const chatTitle = getChatTitle(profiles, conversation);

          const chatImage = getAvatar(conversation);

          return (
            <div
              key={conversation.conversation.peer.id}
              onClick={() => onSelect(conversation)}
              className={`m-3 cursor-pointer hover:bg-[#2a2a5a] rounded-xl shadow shadow-gray-800 transition-colors ${
                activeId === conversation.conversation.peer.id
                  ? "bg-[#2a2a3a]"
                  : ""
              }`}
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
                    {conversation.last_message.text}
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
