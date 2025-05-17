import { useUserStore } from "@/store/userStore";
import { VKConversationItem, VKGroup, VKProfile } from "@/types/vk.type";
import { getChatTitle } from "@/utils/vk.util";
import { Info, NotepadText, Phone, Video } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface ChatHeaderProps {
  conversation: VKConversationItem;
  profiles: VKProfile[] | undefined;
  groups: VKGroup[] | undefined;
  showRightSidebar: boolean;
  setShowRightSidebar: (show: boolean) => void;
  getAvatar: (conversation: VKConversationItem) => string | undefined;
}

export const ChatHeader = ({
  conversation,
  profiles,
  showRightSidebar,
  setShowRightSidebar,
  getAvatar,
}: ChatHeaderProps) => {
  const data = useUserStore((state) => state.user);
  const isGroupChat = conversation.conversation.peer.type === "chat";
  const chatTitle = getChatTitle(profiles, conversation);

  const membersCount = isGroupChat
    ? conversation.conversation.chat_settings?.members_count
    : 1;

  const isMyConversation = conversation.conversation.peer.id === data?.id;
  const isPrivateConversation = conversation.conversation.peer.id < 2000000000;

  return (
    <div className="bg-[#121218] h-16 flex items-center px-4 border-b border-[#2a2a3a]">
      <div className="flex items-center">
        {isMyConversation ? (
          <div className="w-8 h-8 rounded-full mr-3 flex items-center justify-center bg-purple-400">
            {" "}
            ,
            <NotepadText />
          </div>
        ) : (
          <Avatar className="h-8 w-8 mr-3 bg-[#2a2a3a]">
            <AvatarImage src={getAvatar(conversation)} />
            <AvatarFallback>{chatTitle?.substring(0, 2)}</AvatarFallback>
          </Avatar>
        )}

        <div>
          <div className="flex items-center">
            <h2 className="text-sm font-medium">
              {isMyConversation ? <p>Избранные</p> : chatTitle}
            </h2>
            {!isPrivateConversation && (
              <Badge className="ml-2 bg-[#2a2a3a] text-gray-400 p-1 h-5 text-xs">
                {membersCount} участников
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-gray-400 text-xs">в сети</p>
            <div className="w-[6px] h-[6px] bg-emerald-600 rounded-full" />
          </div>
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
          <NavLink to={`/user/${conversation.conversation.peer.id}`}>
            <Info className="h-5 w-5 text-gray-400" />
          </NavLink>
        </Button>
      </div>
    </div>
  );
};
