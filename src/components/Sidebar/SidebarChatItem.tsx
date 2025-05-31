import { cropText } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import type { ChatItem } from "@/types/chat";
import { NotebookText } from "lucide-react";
import type React from "react";
import Avatar from "../ui/Avatar";

interface SidebarChatItemProps {
  chat: ChatItem;
  selected: boolean;
  onClick: () => void;
}

const SidebarChatItem: React.FC<SidebarChatItemProps> = ({
  chat,
  selected,
  onClick,
}) => {
  const lastMessage = chat.lastMessage;
  const userId = useAuthStore((state) => state.userId);

  const getLastMessageText = () => {
    if (!lastMessage) return "";

    if (lastMessage.attachments && lastMessage.attachments.length > 0) {
      if (lastMessage.text) {
        return lastMessage.text;
      }

      const attachment = lastMessage.attachments[0];
      const type = attachment.type;

      if (type === "photo") return "Фотография";
      if (type === "video") return "Видео";
      if (type === "audio") return "Аудио";
      if (type === "doc") return "Документ";
      if (type === "sticker") return "Стикер";

      return "Вложение";
    }

    return lastMessage.text;
  };

  const showOnlineStatus = chat.type === "user" && chat.online;

  return (
    <div
      className={`
        flex cursor-pointer items-center rounded-xl px-2 py-3 transition-colors
        ${selected && "bg-gray-600/20 border border-gray-500"}
      `}
      onClick={onClick}
    >
      <div className="relative mr-3">
        {chat.id === userId ? (
          <div className="p-2 rounded-full bg-purple-400">
            <NotebookText />
          </div>
        ) : (
          <Avatar src={chat.avatar} size="md" />
        )}
        {showOnlineStatus && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#4cd137] border-2 border-[#18142b]"></span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h3
            className={`truncate text-sm font-medium ${
              selected ? "text-white" : "text-gray-300"
            }`}
          >
            {chat.id === userId ? "Избранные" : chat.title}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <p className="truncate text-xs text-gray-400">
            {cropText(getLastMessageText(), 16)}
          </p>

          {chat.unreadCount > 0 && (
            <span className="unread-counter ml-1">{chat.unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarChatItem;
