import { cn, cropText } from "@/lib/utils";
import { VKConversationItem, VKGroup, VKProfile } from "@/types/vk.type";
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
  messageSenders: Record<number, { firstName?: string; groupName?: string }>;
}

const MessageAttachmentTypes = {
  sticker: "Стикер",
  photo: "Фотография",
  wall: "Пост",
  audio_message: "Аудиозапись",
} as const;

const MessageActionTypes = {
  chat_invite_user_by_link: "Присоединился",
  chat_invite_user: "Добавлен",
  chat_kick_user: "Исключён",
} as const;

const ChatListItem = memo(
  ({
    conversation,
    profiles,
    activeId,
    onSelect,
    getAvatar,
    messageSenders,
  }: {
    conversation: VKConversationItem;
    profiles: VKProfile[];
    activeId: number | undefined;
    onSelect: (conversation: VKConversationItem) => void;
    getAvatar: (conversation: VKConversationItem) => string | undefined;
    messageSenders: Record<number, { firstName?: string; groupName?: string }>;
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
      conversation: VKConversationItem
    ): {
      text: string;
      isAttachment: boolean;
      isPrivateChat: boolean;
      isAction: boolean;
      actionType?: keyof typeof MessageActionTypes;
    } => {
      if (conversation.last_message.action) {
        const actionType = conversation.last_message.action
          .type as keyof typeof MessageActionTypes;
        return {
          text: MessageActionTypes[actionType] || "Действие",
          isAttachment: false,
          isPrivateChat: false,
          isAction: true,
          actionType,
        };
      }

      if (conversation.last_message.text) {
        return {
          text: conversation.last_message.text,
          isAttachment: false,
          isPrivateChat: conversation.conversation.peer.id < 2000000000,
          isAction: false,
        };
      }

      const attachmentType = conversation.last_message.attachments[0]
        ?.type as keyof typeof MessageAttachmentTypes;
      const attachmentText = MessageAttachmentTypes[attachmentType] || "";

      return {
        text: attachmentText,
        isAttachment: !!attachmentType,
        isPrivateChat: conversation.conversation.peer.id < 2000000000,
        isAction: false,
      };
    };

    const {
      text: chatLastMessage,
      isAttachment,
      isPrivateChat,
      isAction,
    } = useMemo(() => formatLastMessage(conversation), [conversation]);

    const senderName = useMemo(() => {
      const fromId = conversation.last_message.from_id;
      const sender = messageSenders[fromId];

      if (sender?.firstName) {
        return sender.firstName;
      }
      if (sender?.groupName) {
        return sender.groupName;
      }
      return `id${fromId}`;
    }, [conversation.last_message.from_id, messageSenders]);

    return (
      <div
        key={conversation.conversation.peer.id}
        onClick={() => onSelect(conversation)}
        className={cn(
          "m-3 cursor-pointer hover:bg-[#2a2e3a] rounded-xl transition-colors",
          {
            "bg-white/10": activeId === conversation.conversation.peer.id,
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
              {isAction ? (
                <span className="text-green-400">
                  <span className="text-purple-400">{senderName}</span>:{" "}
                  {chatLastMessage}
                </span>
              ) : (
                <>
                  {isPrivateChat ? (
                    <span
                      className={cn({
                        "text-purple-400": isAttachment,
                        "text-blue-400": !!isAttachment,
                      })}
                    >
                      {cropText(chatLastMessage, 15)}
                    </span>
                  ) : (
                    <>
                      {senderName}:{" "}
                      <span
                        className={cn({
                          "text-purple-400": isAttachment,
                          "text-blue-400": !!isAttachment && !isAction,
                        })}
                      >
                        {cropText(chatLastMessage, 15)}
                      </span>
                    </>
                  )}
                </>
              )}
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
  messageSenders,
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
            messageSenders={messageSenders}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
