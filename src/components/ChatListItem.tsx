import { cn, cropText } from "@/lib/utils";
import { useConversationsStore } from "@/store/useConversationsStore";
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
    const profiles = useConversationsStore(
      (state) => state.conversations?.profiles
    );

    const chatTitle = useMemo(
      () => getChatTitle(profiles, conversation),
      [conversation, profiles]
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

    const getAvatarJsx = () => {
      if (isMyConversation) {
        return (
          <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center bg-purple-400">
            <NotepadText />
          </div>
        );
      }
      return (
        <img
          src={chatImage}
          alt={chatTitle}
          className="w-10 h-10 rounded-full mr-3"
          loading="lazy"
        />
      );
    };

    const getTitle = () => (isMyConversation ? "Избранные" : chatTitle);

    const getLastMessage = () => {
      const messageText = cropText(chatLastMessage, 10);
      const messageClass = isAttachment ? "text-purple-400" : "";

      if (isAction) {
        return (
          <span className="text-green-400">
            <span className="text-purple-400">{senderName}</span>:{" "}
            {chatLastMessage}
          </span>
        );
      }

      if (isPrivateChat) {
        return <span className={messageClass}>{messageText}</span>;
      }

      return (
        <>
          {senderName}: <span className={messageClass}>{messageText}</span>
        </>
      );
    };

    const isMyConversation = conversation.conversation.peer.id === data?.id;

    return (
      <div
        onClick={() => onSelect(conversation)}
        className={cn(
          "m-3 cursor-pointer hover:bg-purple-400/10 rounded-xl transition-colors flex items-center justify-between",
          activeId === conversation.conversation.peer.id && "bg-purple-900/20"
        )}
      >
        <div className="p-2 flex items-center">
          {getAvatarJsx()}
          <div>
            <h3 className="text-sm font-medium">{getTitle()}</h3>
            <p className="text-xs text-gray-400">{getLastMessage()}</p>
          </div>
        </div>
        {conversation.conversation.unread_count && (
          <p className="w-5 h-5 flex items-center justify-center bg-gray-600 text-xs rounded-full mr-2">
            {conversation.conversation.unread_count}
          </p>
        )}
      </div>
    );
  }
);

export default ChatListItem;
