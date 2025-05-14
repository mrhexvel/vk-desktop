import { mockVkApiData } from "@/mocks/sidebar.mock";
import { VKApiService, vkService } from "@/services/vk.service";
import { VKConversationItem, VKGroup, VKProfile } from "@/types/vk.type";
import { useEffect, useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { Sidebar } from "./Sidebar";

export const ModernMessenger = () => {
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [conversations, setConversations] = useState<VKConversationItem[]>([]);
  const [profiles, setProfiles] = useState<VKProfile[]>([]);
  const [groups, setGroups] = useState<VKGroup[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<VKConversationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = {
    id: 1,
    first_name: "Вы",
    photo_100: "/you.jpg",
  };

  const activeMembers = [
    currentUser,
    ...mockVkApiData.response.profiles.slice(0, 3),
  ];

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await vkService.getConversations();
        setConversations(response.items);
        setProfiles(response.profiles);
        setGroups(response.groups);
        setActiveConversation(response.items[0] || null);
      } catch (err) {
        setError("Не удалось загрузить чаты.");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#121218] text-white">Loading...</div>
    );
  }

  if (error) {
    return <div className="flex h-screen bg-[#121218] text-white">{error}</div>;
  }

  return (
    <div className="flex h-screen bg-[#121218] text-white">
      <div className="w-full flex">
        <Sidebar
          activeMembers={activeMembers}
          conversations={conversations}
          activeId={activeConversation?.conversation.peer.id}
          onSelect={(conversation) => setActiveConversation(conversation)}
          getAvatar={(conv) =>
            VKApiService.getConversationAvatar(conv, profiles, groups)
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
                VKApiService.getConversationAvatar(conv, profiles, groups)
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};
