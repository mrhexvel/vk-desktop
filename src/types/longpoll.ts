import type { useChatsStore } from "../store/chatsStore"
import type { VKLongPollServer, VKMessage, VKProfile, VKGroup } from "./vk-api"
import type { Message, MessageSender } from "./chat"

export interface LongPollState {
  server: VKLongPollServer | null
  isPolling: boolean
  lastUpdateTime: number
}

export interface MessageProcessorResult {
  message: Message
  profiles: VKProfile[]
  groups: VKGroup[]
}

export interface ProfileMap {
  [id: number]: VKProfile
}

export interface GroupMap {
  [id: number]: VKGroup
}

export interface ProcessMessageOptions {
  messageData: VKMessage
  profilesMap: ProfileMap
  groupsMap: GroupMap
  peerId: number
}

export type ChatsStoreType = ReturnType<typeof useChatsStore.getState>

export interface SenderInfo extends MessageSender {}

export interface UpdateProcessingFunctions {
  processNewMessage: (updateData: unknown[], chatsStore: ChatsStoreType) => Promise<void>
  processMessageEdit: (updateData: unknown[], chatsStore: ChatsStoreType) => Promise<void>
  processMessageDelete: (updateData: unknown[], chatsStore: ChatsStoreType) => void
  processReadMessages: (updateData: unknown[], chatsStore: ChatsStoreType) => void
  processUserOnline: (updateData: unknown[], chatsStore: ChatsStoreType) => void
  processUserOffline: (updateData: unknown[], chatsStore: ChatsStoreType) => void
}
