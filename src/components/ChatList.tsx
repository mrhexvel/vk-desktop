"use client";

import { cn, cropText } from "@/lib/utils";
import type { VKConversationItem, VKProfile } from "@/types/vk.type";
import { getChatTitle } from "@/utils/vk.util";
import { memo, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ChatListProps {
  conversations: VKConversationItem[] | undefined;
  profiles: VKProfile[];
  activeId: number | undefined;
  onSelect: (conversation: VKConversationItem) => void;
  getAvatar: (conversation: VKConversationItem) => string | undefined;
}

const ChatList = memo(
  ({
    conversations,
    profiles,
    activeId,
    onSelect,
    getAvatar,
  }: ChatListProps) => {
    const sortedConversations = useMemo(() => {
      if (!conversations) return [];

      return [...conversations].sort((a, b) => {
        return b.last_message.date - a.last_message.date;
      });
    }, [conversations]);

    const getChatName = (conversation: VKConversationItem): string => {
      const { peer } = conversation.conversation;

      if (peer.type === "user") {
        const profile = getChatTitle(profiles, conversation);

        return profile || "Избранные";
      } else if (peer.type === "chat") {
        return (
          conversation.conversation.chat_settings?.title || `Чат ${peer.id}`
        );
      } else if (peer.type === "group") {
        return `Группа ${Math.abs(peer.id)}`;
      }

      return `Чат ${peer.id}`;
    };

    const getLastMessage = (conversation: VKConversationItem): string => {
      const { last_message } = conversation;

      if (last_message.text) {
        return cropText(last_message.text, 30);
      }

      if (last_message.attachments && last_message.attachments.length > 0) {
        const attachment = last_message.attachments[0];

        switch (attachment.type) {
          case "photo":
            return "Фотография";
          case "video":
            return "Видео";
          case "audio_message":
            return "Аудиозапись";
          case "doc":
            return "Документ";
          case "link":
            return "Ссылка";
          case "wall":
            return "Запись со стены";
          case "sticker":
            return "Стикер";
          default:
            return "Вложение";
        }
      }

      return "Сообщение";
    };

    return (
      <div className="flex flex-col space-y-1 p-2">
        {sortedConversations.map((conversation) => {
          const isActive = conversation.conversation.peer.id === activeId;
          const avatarUrl = getAvatar(conversation);
          const chatName = getChatName(conversation);
          const lastMessage = getLastMessage(conversation);
          const unreadCount = conversation.conversation.unread_count || 0;

          return (
            <div
              key={conversation.conversation.peer.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                isActive ? "bg-[#2a2a3a]" : "hover:bg-[#1c1c28]"
              )}
              onClick={() => onSelect(conversation)}
            >
              <Avatar className="h-10 w-10 bg-[#2a2a3a]">
                <AvatarImage
                  src={avatarUrl || "/placeholder.svg"}
                  alt={chatName}
                />
                <AvatarFallback>{chatName.substring(0, 2)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm truncate">
                    {chatName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(
                      conversation.last_message.date * 1000
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 truncate">
                    {lastMessage}
                  </span>
                  {unreadCount > 0 && (
                    <span className="flex items-center justify-center min-w-5 h-5 bg-[#5d3f92] text-white text-xs rounded-full px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

ChatList.displayName = "ChatList";

export { ChatList };
