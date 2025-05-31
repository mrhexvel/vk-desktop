import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import { useChatsStore } from "@/store/chatsStore";
import type React from "react";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import SidebarChatItem from "./SidebarChatItem";

const Sidebar: React.FC = () => {
  const { chats, selectChat, selectedChatId, loadingChats } = useChatsStore();
  const { logout } = useAuthStore();
  const { t } = useTranslation();
  const [searchQuery] = useState("");

  const filteredChats = searchQuery
    ? chats.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chats;

  return (
    <div className="flex flex-col h-full animate-fade-in px-2">
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--color-sidebar-foreground)]">
          {t("sidebar.title")}
        </h1>
        <div className="flex items-center">
          <button className="text-[var(--color-muted-foreground)] hover:text-[var(--color-sidebar-foreground)] p-1 rounded-full hover:bg-[var(--color-sidebar-accent)] transition-smooth hover-lift">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {loadingChats && filteredChats.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full"></div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex h-full items-center justify-center text-[var(--color-muted-foreground)] text-sm">
              {t("sidebar.noChats")}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <SidebarChatItem
                key={chat.id}
                chat={chat}
                selected={chat.id === selectedChatId}
                onClick={() => selectChat(chat.id)}
              />
            ))
          )}
        </ScrollArea>
      </div>

      <div className="p-4 border-t border-[var(--color-sidebar-border)]">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-sidebar-foreground)] hover:bg-[var(--color-sidebar-accent)] rounded-lg transition-smooth hover-lift"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {t("sidebar.logout")}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
