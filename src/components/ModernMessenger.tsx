import { mockVkApiData } from "@/mocks/sidebar.mock";
import { useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { Sidebar } from "./Sidebar";

export const ModernMessenger = () => {
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [activeConversation, setActiveConversation] = useState(
    mockVkApiData.response.items[0]
  );

  const currentUser = {
    id: 1,
    first_name: "Вы",
    photo_100: "/you.png",
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
          conversations={mockVkApiData.response.items}
          profiles={mockVkApiData.response.profiles}
          groups={mockVkApiData.response.groups}
          activeId={activeConversation.conversation.peer.id}
          onSelect={(conversation) => setActiveConversation(conversation)}
        />
        <div className="flex-1 flex flex-col">
          <ChatHeader
            conversation={activeConversation}
            profiles={mockVkApiData.response.profiles}
            groups={mockVkApiData.response.groups}
            showRightSidebar={showRightSidebar}
            setShowRightSidebar={setShowRightSidebar}
          />
        </div>
      </div>
    </div>
  );
};
