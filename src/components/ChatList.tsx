import { VKConversationItem } from "@/types/vk.type";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { MessageSenders } from "../types";
import ChatListItem from "./ChatListItem";

interface ChatListProps {
  conversations: VKConversationItem[];
  activeId: number | undefined;
  onSelect: (conversation: VKConversationItem) => void;
  getAvatar: (conversation: VKConversationItem) => string | undefined;
  messageSenders: MessageSenders;
}

export default function ChatList({
  conversations,
  activeId,
  onSelect,
  getAvatar,
  messageSenders,
}: ChatListProps) {
  return (
    <ScrollArea className="h-72 rounded-md">
      <div className="pb-1">
        {conversations.map((conversation) => (
          <ChatListItem
            key={conversation.conversation.peer.id}
            conversation={conversation}
            activeId={activeId}
            onSelect={onSelect}
            getAvatar={getAvatar}
            messageSenders={messageSenders}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
