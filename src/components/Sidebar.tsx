"use client";

import type { VKConversationItem } from "@/types/vk.type";
import { Search } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { ChatList } from "./ChatList";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface SidebarProps {
  conversations: VKConversationItem[] | undefined;
  activeId: number | undefined;
  onSelect: (conversation: VKConversationItem) => void;
  getAvatar: (conversation: VKConversationItem) => string | undefined;
}

const Sidebar = memo(
  ({ conversations, activeId, onSelect, getAvatar }: SidebarProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredConversations = useCallback(() => {
      if (!conversations) return [];
      if (!searchQuery.trim()) return conversations;

      return conversations.filter((conversation) => {
        const chatName =
          conversation.conversation.chat_settings?.title ||
          `id${conversation.conversation.peer.id}`;

        const lastMessageText = conversation.last_message.text || "";

        return (
          chatName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lastMessageText.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }, [conversations, searchQuery]);

    return (
      <aside className="w-80 border-r border-[#2a2a3a] flex flex-col bg-[#121218]">
        <div className="p-3 border-b border-[#2a2a3a]">
          <p className="font-semibold">VK DESKTOP</p>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Поиск"
              className="pl-9 bg-[#2a2a3a] border-none focus-visible:ring-1 focus-visible:ring-[#5d3f92]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <ChatList
            conversations={filteredConversations()}
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
