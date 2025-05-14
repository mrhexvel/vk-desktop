import { mockVkApiData } from "@/mocks/sidebar.mock";
import { VKApiService } from "@/services/vk.service";
import { useConversationsStore } from "@/store/useConversationsStore";
import { VKConversationItem } from "@/types/vk.type";
import { useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { Sidebar } from "./Sidebar";

export const ModernMessenger = () => {
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const conversations = useConversationsStore((state) => state.conversations);
  const profiles = conversations?.profiles;
  const groups = conversations?.groups;
  const [activeConversation, setActiveConversation] =
    useState<VKConversationItem | null>(null);

  const currentUser = {
    id: 1,
    first_name: "Вы",
    photo_100: "/you.jpg",
  };

  const activeMembers = [
    currentUser,
    ...mockVkApiData.response.profiles.slice(0, 3),
  ];

  return (
    <div className="flex h-screen bg-[#121218] text-white">
      <div className="w-full flex">
        <Sidebar
          activeMembers={activeMembers}
          conversations={conversations?.items}
          activeId={activeConversation?.conversation.peer.id}
          onSelect={(conversation) => setActiveConversation(conversation)}
          getAvatar={(conv) =>
            VKApiService.getConversationAvatar(conv, profiles!, groups!)
          }
        />
        <div className="flex-1 flex flex-col">
          {activeConversation && (
            <ChatHeader
              conversation={activeConversation}
              profiles={profiles}
              groups={groups}
              showRightSidebar={showRightSidebar}
              setShowRightSidebar={setShowRightSidebar}
              getAvatar={(conv) =>
                VKApiService.getConversationAvatar(conv, profiles!, groups!)
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};
