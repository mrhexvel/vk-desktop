import { VKConversationItem } from "@/types/vk.type";
import { Info, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface ChatHeaderProps {
  conversation: VKConversationItem;
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
  showRightSidebar: boolean;
  setShowRightSidebar: (show: boolean) => void;
}

export const ChatHeader = ({
  conversation,
  profiles,
  groups,
  showRightSidebar,
  setShowRightSidebar,
}: ChatHeaderProps) => {
  const isGroupChat = conversation.conversation.peer.type === "chat";
  const groupInfo = isGroupChat
    ? groups.find((g) => g.id === conversation.conversation.peer.id)
    : null;
  const chatTitle = isGroupChat
    ? conversation.conversation.chat_settings?.title
    : `${getProfileById(conversation.conversation.peer.id)?.first_name} ${
        getProfileById(conversation.conversation.peer.id)?.last_name
      }`;

  const membersCount = isGroupChat
    ? conversation.conversation.chat_settings?.members_count
    : 2;

  function getProfileById(id: number) {
    return profiles.find((p) => p.id === id);
  }

  return (
    <div className="h-16 flex items-center px-4 border-b border-[#2a2a3a]">
      <div className="flex items-center">
        <Avatar className="h-8 w-8 mr-3 bg-[#2a2a3a]">
          <AvatarImage
            src={
              isGroupChat
                ? groupInfo?.photo_100
                : getProfileById(conversation.conversation.peer.id)?.photo_100
            }
          />
          <AvatarFallback>{chatTitle?.substring(0, 2)}</AvatarFallback>
        </Avatar>

        <div>
          <div className="flex items-center">
            <h2 className="text-sm font-medium">{chatTitle}</h2>
            <Badge className="ml-2 bg-[#2a2a3a] text-gray-400 p-1 h-5 text-xs">
              {membersCount} members
            </Badge>
          </div>
          <p className="text-xs text-gray-400">12:35 PM</p>
        </div>
      </div>

      <div className="ml-auto flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-[#2a2a3a]"
        >
          <Phone className="h-5 w-5 text-gray-400" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-[#2a2a3a]"
        >
          <Video className="h-5 w-5 text-gray-400" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-[#2a2a3a]"
          onClick={() => setShowRightSidebar(!showRightSidebar)}
        >
          <Info className="h-5 w-5 text-gray-400" />
        </Button>
      </div>
    </div>
  );
};
