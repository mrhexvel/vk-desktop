import { VKConversationItem } from "@/types/vk.type";
import { getMessageSendersInfo } from "@/utils/vk.util";
import { MoreVertical, Search } from "lucide-react";
import { useEffect, useState } from "react";
import ChatList from "./ChatList";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface SidebarProps {
  conversations: VKConversationItem[] | undefined;
  activeId: number | undefined;
  onSelect: (conversation: VKConversationItem) => void;
  getAvatar: (conversation: VKConversationItem) => string | undefined;
}

export const Sidebar = ({
  conversations,
  activeId,
  onSelect,
  getAvatar,
}: SidebarProps) => {
  const [messageSenders, setMessageSenders] = useState<
    Record<number, { firstName?: string; groupName?: string }>
  >({});

  useEffect(() => {
    const fromIds = conversations
      ? conversations.map((c) => c.last_message.from_id).filter(Boolean)
      : [];

    if (fromIds.length > 0) {
      getMessageSendersInfo(fromIds).then((data) => {
        const senders: typeof messageSenders = {};

        data.users?.forEach((user) => {
          senders[user.id] = { firstName: user.first_name };
        });

        data.groups?.forEach((group) => {
          senders[-group.id] = { groupName: group.name };
        });

        setMessageSenders(senders);
      });
    }
  }, [conversations]);

  if (!conversations) {
    return <p>не</p>;
  }

  return (
    <aside className="w-[320px] border-r border-[#2a2a3a] flex-shrink-0 flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <div className="flex">
          <h1 className="text-lg font-medium">VK DESKTOP</h1>
          <span className="flex justify-center items-center px-2 h-4 rounded-sm text-[8px] bg-gray-700 relative -top-1 -left-1 rotate-45">
            BETA
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-[#2a2a3a] hover:bg-[#3a3a4a]"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Поиск..."
            className="pl-9 bg-[#2a2a3a] border-none h-9 rounded-full text-sm placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* TODO: сториы */}
      {/* <div className="px-4 py-2">
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
          {activeMembers.map((member, index) => (
            <StoryCircle
              key={member.id}
              name={index === 0 ? "Вы" : member.first_name}
              image={member.photo_100}
              isActive={index < 2}
            />
          ))}
        </div>
      </div> */}

      <ScrollArea className="flex-1">
        <ChatList
          conversations={conversations}
          activeId={activeId}
          onSelect={onSelect}
          getAvatar={getAvatar}
          messageSenders={messageSenders}
        />
      </ScrollArea>
    </aside>
  );
};
