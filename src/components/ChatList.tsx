import { cn, cropText } from "@/lib/utils";
import {
  VKConversationItem,
  VKGroup,
  VKMessage,
  VKProfile,
} from "@/types/vk.type";
import { getChatTitle } from "@/utils/vk.util";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { memo, useMemo } from "react";

interface ChatListProps {
  conversations: VKConversationItem[];
  profiles: VKProfile[];
  groups: VKGroup[];
  activeId: number | undefined;
  onSelect: (conversation: VKConversationItem) => void;
  getAvatar: (conversation: VKConversationItem) => string | undefined;
}

const MessageAttachmentTypes = {
  sticker: "Стикер",
  photo: "Фотография",
  wall: "Пост",
  audio_message: "Аудиозапись",
} as const;

const ChatListItem = memo(
  ({
    conversation,
    profiles,
    activeId,
    onSelect,
    getAvatar,
  }: {
    conversation: VKConversationItem;
    profiles: VKProfile[];
    activeId: number | undefined;
    onSelect: (conversation: VKConversationItem) => void;
    getAvatar: (conversation: VKConversationItem) => string | undefined;
  }) => {
    const chatTitle = useMemo(
      () => getChatTitle(profiles, conversation),
      [profiles, conversation]
    );
    const chatImage = useMemo(
      () => getAvatar(conversation),
      [conversation, getAvatar]
    );

    const formatLastMessage = (
      lastMessage: VKMessage
    ): { text: string; isAttachment: boolean } => {
      if (lastMessage.text) {
        return { text: lastMessage.text, isAttachment: false };
      }

      const attachmentType = lastMessage.attachments[0]
        ?.type as keyof typeof MessageAttachmentTypes;
      const attachmentText = MessageAttachmentTypes[attachmentType] || "";

      return {
        text: attachmentText,
        isAttachment: !!attachmentType,
      };
    };

    const { text: chatLastMessage, isAttachment } = useMemo(
      () => formatLastMessage(conversation.last_message),
      [conversation.last_message]
    );

    return (
      <div
        key={conversation.conversation.peer.id}
        onClick={() => onSelect(conversation)}
        className={cn(
          "m-3 cursor-pointer hover:bg-[#2a2a5a] rounded-xl shadow shadow-gray-800 transition-colors",
          {
            "bg-[#2a2a3a]": activeId === conversation.conversation.peer.id,
          }
        )}
      >
        <div className="p-2 flex items-center">
          <img
            src={chatImage}
            alt={chatTitle}
            className="w-10 h-10 rounded-full mr-3"
            loading="lazy"
          />
          <div>
            <h3 className="text-sm font-medium">{chatTitle}</h3>
            <p className="text-xs text-gray-400">
              id{conversation.last_message.from_id}:{" "}
              <span className={cn({ "text-blue-400": isAttachment })}>
                {cropText(chatLastMessage, 10)}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }
);

export default function ChatList({
  conversations,
  profiles,
  activeId,
  onSelect,
  getAvatar,
}: ChatListProps) {
  return (
    <ScrollArea className="h-72 rounded-md">
      <div className="pb-1">
        {conversations.map((conversation) => (
          <ChatListItem
            key={conversation.conversation.peer.id}
            conversation={conversation}
            profiles={profiles}
            activeId={activeId}
            onSelect={onSelect}
            getAvatar={getAvatar}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
