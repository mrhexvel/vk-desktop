import type React from "react";
import type { ReactNode } from "react";
import type { Message, MessageSender } from "./chat";
import type { VKMessageAttachment } from "./vk-api";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

export interface ChatInputProps {
  chatId: number;
}

export interface ChatWindowProps {
  showDetails: boolean;
  toggleDetails: () => void;
}

export interface ChatDetailsProps {
  onClose: () => void;
}

export interface MessageBubbleProps {
  message: Message;
  grouped?: boolean;
}

export interface MessageListProps {
  messages: Message[];
}

export interface ReplyBlockProps {
  message: Partial<Message>;
  profile?: MessageSender;
}

export interface SidebarChatItemProps {
  chat: {
    id: number;
    type: string;
    title: string;
    avatar: string;
    lastMessage?: {
      id: number;
      fromId: number;
      text: string;
      date: number;
      isOut: boolean;
      attachments: VKMessageAttachment[];
      unread: number;
    };
    unreadCount: number;
    online: boolean;
    membersCount?: number;
  };
  selected: boolean;
  onClick: () => void;
}

export interface PhotoAttachmentProps {
  attachments: VKMessageAttachment[];
}

export interface StickerAttachmentProps {
  sticker: any;
}

export interface VideoAttachmentProps {
  attachments: VKMessageAttachment[];
}

export interface DocumentAttachmentProps {
  attachments: VKMessageAttachment[];
}

export interface LinkAttachmentProps {
  attachments: VKMessageAttachment[];
}

export interface AudioMessageAttachmentProps {
  attachments: VKMessageAttachment[];
  isCurrentUser: boolean;
}

export interface AudioMessageProps {
  isCurrentUser: boolean;
  audioMessage: {
    duration: number;
    waveform?: number[];
    link_mp3?: string;
    link_ogg?: string;
    [key: string]: unknown;
  };
}

export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<"div"> {
  viewportRef?: React.RefObject<HTMLDivElement>;
  orientation?: "vertical" | "horizontal" | "both";
  onScroll?: React.UIEventHandler<HTMLDivElement>;
}
