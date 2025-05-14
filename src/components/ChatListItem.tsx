import { cn, cropText } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { VKConversationItem } from "@/types/vk.type";
import { getChatTitle } from "@/utils/vk.util";
import { NotepadText } from "lucide-react";
import { memo, useMemo } from "react";
import {
  MESSAGE_ACTION_TYPES,
  MESSAGE_ATTACHMENT_TYPES,
} from "../constants/message.constants";
import { FormattedMessage, MessageSenders } from "../types";

interface ChatListItemProps {
  conversation: VKConversationItem;
  activeId: number | undefined;
  onSelect: (conversation: VKConversationItem) => void;
  getAvatar: (conversation: VKConversationItem) => string | undefined;
  messageSenders: MessageSenders;
}

const formatLastMessage = (
  conversation: VKConversationItem
): FormattedMessage => {
  const { last_message } = conversation;

  if (last_message.action) {
    const actionType = last_message.action
      .type as keyof typeof MESSAGE_ACTION_TYPES;
    return {
      text: MESSAGE_ACTION_TYPES[actionType] || "Действие",
      isAttachment: false,
      isPrivateChat: false,
      isAction: true,
    };
  }

  if (last_message.text) {
    return {
      text: last_message.text,
      isAttachment: false,
      isPrivateChat: conversation.conversation.peer.id < 2000000000,
      isAction: false,
    };
  }

  const attachmentType = last_message.attachments[0]
    ?.type as keyof typeof MESSAGE_ATTACHMENT_TYPES;
  return {
    text: MESSAGE_ATTACHMENT_TYPES[attachmentType] || "",
    isAttachment: !!attachmentType,
    isPrivateChat: conversation.conversation.peer.id < 2000000000,
    isAction: false,
  };
};

const ChatListItem = memo(
  ({
    conversation,
    activeId,
    onSelect,
    getAvatar,
    messageSenders,
  }: ChatListItemProps) => {
    const data = useUserStore((state) => state.user);
    const chatTitle = useMemo(
      () => getChatTitle([], conversation),
      [conversation]
    );

    const chatImage = useMemo(
      () => getAvatar(conversation) || "",
      [conversation, getAvatar]
    );

    const {
      text: chatLastMessage,
      isAttachment,
      isPrivateChat,
      isAction,
    } = useMemo(() => formatLastMessage(conversation), [conversation]);

    const senderName = useMemo(() => {
      const fromId = conversation.last_message.from_id;
      const sender = messageSenders[fromId];
      return sender?.firstName || sender?.groupName || `id${fromId}`;
    }, [conversation.last_message.from_id, messageSenders]);

    const isMyConversation = conversation.conversation.peer.id === data?.id;

    return (
      <div
        onClick={() => onSelect(conversation)}
        className={cn(
          "m-3 cursor-pointer hover:bg-[#2a2e3a] rounded-xl transition-colors",
          activeId === conversation.conversation.peer.id && "bg-white/10"
        )}
      >
        <div className="p-2 flex items-center">
          {isMyConversation ? (
            <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center bg-purple-400">
              <NotepadText />
            </div>
          ) : (
            <img
              src={chatImage}
              alt={chatTitle}
              className="w-10 h-10 rounded-full mr-3"
              loading="lazy"
            />
          )}
          <div>
            <h3 className="text-sm font-medium">
              {isMyConversation ? <p>Избранные</p> : chatTitle}
            </h3>
            <p className="text-xs text-gray-400">
              {isAction ? (
                <span className="text-green-400">
                  <span className="text-purple-400">{senderName}</span>:{" "}
                  {chatLastMessage}
                </span>
              ) : (
                <>
                  {isPrivateChat ? (
                    <span className={cn(isAttachment && "text-purple-400")}>
                      {cropText(chatLastMessage, 15)}
                    </span>
                  ) : (
                    <>
                      {senderName}:{" "}
                      <span className={cn(isAttachment && "text-purple-400")}>
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

export default ChatListItem;
