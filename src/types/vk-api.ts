export interface VKBaseResponse<T> {
  response: T
}

export interface VKError {
  error_code: number
  error_msg: string
  request_params: Array<{
    key: string
    value: string
  }>
}

export interface VKProfile {
  id: number
  first_name: string
  last_name: string
  photo_50?: string
  photo_100?: string
  photo_200?: string
  online?: 0 | 1
  online_mobile?: 0 | 1
  online_app?: number
  last_seen?: {
    time: number
    platform: number
  }
  sex?: 0 | 1 | 2
  screen_name?: string
  is_closed?: boolean
  can_access_closed?: boolean
}

export interface VKGroup {
  id: number
  name: string
  screen_name: string
  is_closed: 0 | 1 | 2
  type: "group" | "page" | "event"
  photo_50?: string
  photo_100?: string
  photo_200?: string
}

export interface VKMessageAttachmentPhoto {
  type: "photo"
  photo: {
    id: number
    album_id: number
    owner_id: number
    sizes: Array<{
      type: string
      url: string
      width: number
      height: number
    }>
    text: string
    date: number
    access_key?: string
  }
}

export interface VKMessageAttachmentVideo {
  type: "video"
  video: {
    id: number
    owner_id: number
    title: string
    description: string
    duration: number
    image: Array<{
      url: string
      width: number
      height: number
    }>
    first_frame: Array<{
      url: string
      width: number
      height: number
    }>
    date: number
    access_key?: string
  }
}

export interface VKMessageAttachmentAudio {
  type: "audio"
  audio: {
    id: number
    owner_id: number
    artist: string
    title: string
    duration: number
    url: string
    date: number
    access_key?: string
  }
}

export interface VKMessageAttachmentDoc {
  type: "doc"
  doc: {
    id: number
    owner_id: number
    title: string
    size: number
    ext: string
    url: string
    date: number
    type: number
    access_key?: string
  }
}

export interface VKMessageAttachmentLink {
  type: "link"
  link: {
    url: string
    title: string
    description: string
    target: string
    photo?: {
      id: number
      album_id: number
      owner_id: number
      sizes: Array<{
        type: string
        url: string
        width: number
        height: number
      }>
    }
  }
}

export interface VKMessageAttachmentSticker {
  type: "sticker"
  sticker: {
    product_id: number
    sticker_id: number
    images: Array<{
      url: string
      width: number
      height: number
    }>
    images_with_background: Array<{
      url: string
      width: number
      height: number
    }>
  }
}

export interface VKMessageAttachmentAudioMessage {
  type: "audio_message"
  audio_message: {
    id: number
    owner_id: number
    duration: number
    waveform: number[]
    link_ogg: string
    link_mp3: string
    access_key?: string
    transcript_error?: number
  }
}

export interface VKMessageAttachmentWall {
  type: "wall"
  wall: {
    id: number
    owner_id: number
    from_id: number
    date: number
    text: string
    attachments?: VKMessageAttachment[]
  }
}

export interface VKMessageAttachmentGift {
  type: "gift"
  gift: {
    id: number
    thumb_256: string
    thumb_96: string
    thumb_48: string
  }
}

export type VKMessageAttachment =
  | VKMessageAttachmentPhoto
  | VKMessageAttachmentVideo
  | VKMessageAttachmentAudio
  | VKMessageAttachmentDoc
  | VKMessageAttachmentLink
  | VKMessageAttachmentSticker
  | VKMessageAttachmentAudioMessage
  | VKMessageAttachmentWall
  | VKMessageAttachmentGift

export interface VKMessageAction {
  type:
    | "chat_photo_update"
    | "chat_photo_remove"
    | "chat_create"
    | "chat_title_update"
    | "chat_invite_user"
    | "chat_kick_user"
    | "chat_pin_message"
    | "chat_unpin_message"
    | "chat_invite_user_by_link"
  member_id?: number
  text?: string
  email?: string
  photo?: {
    photo_50: string
    photo_100: string
    photo_200: string
  }
  conversation_message_id?: number
}

export interface VKMessage {
  id: number
  date: number
  peer_id: number
  from_id: number
  text: string
  random_id: number
  attachments: VKMessageAttachment[]
  important: boolean
  geo?: {
    type: string
    coordinates: {
      latitude: number
      longitude: number
    }
    place?: {
      id: number
      title: string
      latitude: number
      longitude: number
      created: number
      icon: string
      country: string
      city: string
    }
  }
  payload?: string
  keyboard?: {
    one_time: boolean
    buttons: Array<
      Array<{
        action: {
          type: string
          label: string
          payload: string
        }
        color: string
      }>
    >
  }
  fwd_messages?: VKMessage[]
  reply_message?: VKMessage
  action?: VKMessageAction
  admin_author_id?: number
  conversation_message_id: number
  is_cropped?: boolean
  members_count?: number
  update_time?: number
  was_listened?: boolean
  pinned_at?: number
  message_tag?: string
  out: 0 | 1
}

export interface VKConversation {
  peer: {
    id: number
    type: "user" | "chat" | "group"
    local_id: number
  }
  last_message_id: number
  in_read: number
  out_read: number
  unread_count?: number
  important: boolean
  unanswered: boolean
  chat_settings?: {
    title: string
    members_count: number
    state: "in" | "kicked" | "left"
    photo?: {
      photo_50: string
      photo_100: string
      photo_200: string
    }
    active_ids: number[]
    is_group_channel: boolean
  }
  can_write?: {
    allowed: boolean
  }
  can_send_money?: boolean
  can_receive_money?: boolean
}

export interface VKConversationWithMessage {
  conversation: VKConversation
  last_message: VKMessage
}

export interface VKConversationsResponse {
  count: number
  items: VKConversationWithMessage[]
  unread_count?: number
  profiles: VKProfile[]
  groups: VKGroup[]
}

export interface VKHistoryResponse {
  count: number
  items: VKMessage[]
  profiles: VKProfile[]
  groups: VKGroup[]
}

export interface VKLongPollServer {
  server: string
  key: string
  ts: string
  pts?: number
}

export interface VKLongPollUpdate {
  ts: string
  updates: Array<[number, ...unknown[]]>
  failed?: number
}
