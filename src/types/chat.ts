import type { VKMessageAction, VKMessageAttachment } from "./vk-api";

export type ChatType = "user" | "chat" | "group";
export type ChatMemberRole = "creator" | "admin" | "member";
export type MessageSendStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "error";

export interface MessageSender {
  id: number;
  firstName: string;
  lastName: string;
  photo: string;
}

export interface ChatMember {
  id: number;
  firstName: string;
  lastName: string;
  photo: string;
  online: boolean;
  role?: ChatMemberRole;
  canKick?: boolean;
  invited_by?: number;
  join_date?: number;
}

export interface ReplyMessage {
  id: number;
  from_id: number;
  text: string;
  date: number;
  attachments: VKMessageAttachment[];
  sender?: MessageSender;
}

export interface ChatLastMessage {
  id: number;
  fromId: number;
  text: string;
  date: number;
  isOut: boolean;
  attachments: VKMessageAttachment[];
  unread: number;
  reply_message?: ReplyMessage;
  fwd_messages?: Message[];
  sendStatus?: MessageSendStatus;
}

export interface ChatItem {
  id: number;
  type: ChatType;
  title: string;
  avatar: string;
  lastMessage?: ChatLastMessage;
  unreadCount: number;
  online: boolean;
  membersCount?: number;
  isAdmin?: boolean;
  members?: ChatMember[];
  canManage?: boolean;
}

export interface Message {
  id: number;
  chatId: number;
  fromId: number;
  text: string;
  date: number;
  isOut: boolean;
  attachments: VKMessageAttachment[];
  sender?: MessageSender;
  reply_message?: ReplyMessage;
  fwd_messages?: Message[];
  conversation_message_id?: number;
  peer_id?: number;
  random_id?: number;
  ref?: string;
  ref_source?: string;
  out?: number;
  important?: boolean;
  is_hidden?: boolean;
  keyboard?: any;
  payload?: string;
  geo?: {
    type: string;
    coordinates: string;
    place?: {
      id: number;
      title: string;
      latitude: number;
      longitude: number;
      created: number;
      icon: string;
      checkins: number;
      updated: number;
      type: number;
      country: number;
      city: number;
      address: string;
    };
  };
  action?: VKMessageAction;
  admin_author_id?: number;
  is_cropped?: boolean;
  members_count?: number;
  update_time?: number;
  was_listened?: boolean;
  pinned_at?: number;
  message_tag?: string;
  sendStatus?: MessageSendStatus;
  localId?: string;
}

export interface StickerImage {
  url: string;
  width: number;
  height: number;
}

export interface Sticker {
  id?: number;
  sticker_id?: number;
  product_id?: number;
  inner_type?: string;
  is_allowed?: boolean;
  images?: StickerImage[];
  images_with_background?: StickerImage[];
  image_config_id?: number;
}

export interface StickerImageConfig {
  id: number;
  pattern: string;
  sizes: number[];
  format_modifiers: Array<{
    id: string;
    modifier: string;
  }>;
  theme_modifiers: Array<{
    id: string;
    modifier: string;
  }>;
}

export interface StickerImageConfigs {
  default_id: number;
  hash: string;
  items: StickerImageConfig[];
}

export interface APIServiceOptions {
  cacheTime?: number;
  rateLimit?: number;
  batchSize?: number;
  retryCount?: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface BatchRequest {
  method: string;
  params: Record<string, unknown>;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}
