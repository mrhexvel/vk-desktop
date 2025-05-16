"use client";

import type { VKConversationItem, VKProfile } from "@/types/vk.type";
import { Search } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { ChatList } from "./ChatList";
import { ScrollArea } from "./ui/scroll-area";

interface SidebarProps {
  conversations: VKConversationItem[] | undefined;
  profiles: VKProfile[];
  activeId: number | undefined;
  onSelect: (conversation: VKConversationItem) => void;
  getAvatar: (conversation: VKConversationItem) => string | undefined;
}

const Sidebar = memo(
  ({
    conversations,
    profiles,
    activeId,
    onSelect,
    getAvatar,
  }: SidebarProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredConversations = useCallback(() => {
      if (!conversations) return [];
      if (!searchQuery.trim()) return conversations;

      return conversations.filter((conversation) => {
        const chatName = conversation.conversation.chat_settings?.title;
        const lastMessageText = conversation.last_message.text || "";

        return (
          chatName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lastMessageText.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }, [conversations, searchQuery]);

    return (
      <aside className="w-80 border-r border-[#2a2a3a] flex flex-col bg-[#121218]">
        <div className="p-3 border-b border-[#2a2a3a]">
          <div className="flex justify-between">
            <p className="font-semibold">VK DESKTOP</p>
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <ChatList
            conversations={filteredConversations()}
            profiles={profiles}
            activeId={activeId}
            onSelect={onSelect}
            getAvatar={getAvatar}
          />
        </ScrollArea>
      </aside>
    );
  }
);

Sidebar.displayName = "Sidebar";

export { Sidebar };
