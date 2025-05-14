export interface VKProfile {
  id: number;
  first_name: string;
  last_name: string;
  photo_50: string;
  photo_100: string;
  online: number;
  screen_name: string;
  sex: number;
  online_info: {
    visible: boolean;
    last_seen: number;
    is_online: boolean;
    app_id: number;
  };
}

export interface VKGroup {
  id: number;
  name: string;
  screen_name: string;
  photo_50: string;
  photo_100: string;
  photo_200: string;
}

export interface VKPeer {
  id: number;
  type: "user" | "chat" | "group";
  local_id: number;
}

export interface VKChatSettings {
  title: string;
  owner_id: number;
  members_count: number;
  state: string;
  photo?: {
    photo_50: string;
    photo_100: string;
    photo_200: string;
  };
  active_ids: number[];
}

export interface VKPinnedMessage {
  id: number;
  text: string;
  from_id: number;
}

export interface VKConversation {
  peer: VKPeer;
  chat_settings?: VKChatSettings;
  last_message_id: number;
  in_read: number;
  out_read: number;
  unread_count: number;
  is_marked_unread: boolean;
  pinned_message?: VKPinnedMessage;
}

export interface VKPhotoSize {
  type: string;
  url: string;
  width: number;
  height: number;
}

export interface VKPhotoAttachment {
  type: "photo";
  photo: {
    id: number;
    album_id: number;
    owner_id: number;
    sizes: VKPhotoSize[];
    text: string;
    date: number;
    access_key: string;
  };
}

export interface VKAudioMessageAttachment {
  type: "audio_message";
  audio_message: {
    duration: number;
    waveform: number[];
    link_mp3: string;
    transcript: string;
  };
}

export type VKAttachment = VKPhotoAttachment | VKAudioMessageAttachment;

export interface VKMessage {
  id: number;
  date: number;
  from_id: number;
  text: string;
  attachments: VKAttachment[];
  conversation_message_id: number;
  peer_id: number;
}

export interface VKConversationItem {
  conversation: VKConversation;
  last_message: VKMessage;
}

export interface VKGetConversationsResponse {
  response: {
    count: number;
    items: VKConversationItem[];
    profiles: VKProfile[];
    groups: VKGroup[];
  };
}

export interface MediaItem {
  id: number;
  type: string;
  url: string;
}

export interface UserData {
  id: number;
  first_name: string;
  photo_100: string;
}
