import { VKConversationItem } from "@/types/vk.type";

interface ChatListProps {
  conversations: VKConversationItem[];
  profiles: Array<{
    id: number;
    first_name: string;
    last_name: string;
    photo_100: string;
  }>;
  groups: Array<{
    id: number;
    name: string;
    photo_100: string;
  }>;
  activeId: number;
  onSelect: (conversation: VKConversationItem) => void;
}

export default function ChatList({
  conversations,
  profiles,
  groups,
  activeId,
  onSelect,
}: ChatListProps) {
  const getProfileById = (id: number) => profiles.find((p) => p.id === id);
  const getGroupById = (id: number) => groups.find((g) => g.id === id);

  return (
    <div>
      {conversations.map((conversation) => {
        const isGroupChat = conversation.conversation.peer.type === "chat";
        const chatTitle = isGroupChat
          ? conversation.conversation.chat_settings?.title
          : `${getProfileById(conversation.conversation.peer.id)?.first_name} ${
              getProfileById(conversation.conversation.peer.id)?.last_name
            }`;
        const chatImage = isGroupChat
          ? getGroupById(conversation.conversation.peer.id)?.photo_100
          : getProfileById(conversation.conversation.peer.id)?.photo_100;

        return (
          <div
            key={conversation.conversation.peer.id}
            onClick={() => onSelect(conversation)}
            className={`p-3 cursor-pointer hover:bg-[#2a2a3a] ${
              activeId === conversation.conversation.peer.id
                ? "bg-[#2a2a3a]"
                : ""
            }`}
          >
            <div className="flex items-center">
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
  );
}
