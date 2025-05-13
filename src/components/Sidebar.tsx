import { VKConversationItem } from "@/types/vk.type";
import { MoreVertical, Search } from "lucide-react";
import ChatList from "./ChatList";
import { StoryCircle } from "./StoryCyrcle";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface SidebarProps {
  activeMembers: Array<{
    id: number;
    first_name: string;
    photo_100: string;
  }>;
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

export const Sidebar = ({
  activeMembers,
  conversations,
  profiles,
  groups,
  activeId,
  onSelect,
}: SidebarProps) => {
  return (
    <div className="w-[280px] border-r border-[#2a2a3a] flex-shrink-0 flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-lg font-medium">VK DESKTOP</h1>
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

      <div className="px-4 py-2">
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
      </div>

      <ScrollArea className="flex-1">
        <ChatList
          conversations={conversations}
          profiles={profiles}
          groups={groups}
          activeId={activeId}
          onSelect={onSelect}
        />
      </ScrollArea>
    </div>
  );
};
