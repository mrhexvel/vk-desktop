// @ts-nocheck
import { useChatsStore } from "../store/chatsStore";
import type { Message } from "../types/chat";
import type {
  ChatsStoreType,
  GroupMap,
  ProfileMap,
  SenderInfo,
} from "../types/longpoll";
import type {
  VKGroup,
  VKLongPollServer,
  VKMessage,
  VKProfile,
} from "../types/vk-api";
import { vkAPI } from "./vk-api-service";

let lastChatUpdateTime = 0;

let longPollServer: VKLongPollServer | null = null;

let isPolling = false;

async function getLongPollServer(): Promise<void> {
  try {
    const response = await vkAPI.directRequest<VKLongPollServer>(
      "messages.getLongPollServer",
      {
        lp_version: 3,
        need_pts: 1,
      },
      false
    );

    if (response) {
      longPollServer = {
        server: response.server,
        key: response.key,
        ts: response.ts,
        wait: 25,
      };
    }
  } catch (error) {
    console.error("Error getting Long Poll server:", error);
    throw error;
  }
}

async function startPolling(): Promise<void> {
  if (!longPollServer) {
    await getLongPollServer();
  }

  if (!longPollServer) {
    throw new Error("Failed to get Long Poll server");
  }

  isPolling = true;
  poll();
}

async function poll(): Promise<void> {
  if (!isPolling || !longPollServer) return;

  try {
    const { server, key, ts, wait } = longPollServer;

    const url = `https://${server}?act=a_check&key=${key}&ts=${ts}&wait=${wait}&mode=2&version=3`;

    const response = await fetch(url);
    const data = (await response.json()) as {
      failed?: number;
      ts?: string;
      updates?: unknown[][];
    };

    if (data.failed) {
      if (data.failed === 1 && data.ts) {
        longPollServer.ts = data.ts;
      } else {
        await getLongPollServer();
      }
    } else if (data.ts) {
      longPollServer.ts = data.ts;

      if (data.updates) {
        await processUpdates(data.updates);
      }
    }

    poll();
  } catch (error) {
    console.error("Long Poll error:", error);

    setTimeout(() => {
      if (isPolling) {
        poll();
      }
    }, 5000);
  }
}

async function processUpdates(updates: unknown[][]): Promise<void> {
  const chatsStore = useChatsStore.getState();

  for (const update of updates) {
    const [updateCode, ...updateData] = update;

    switch (updateCode) {
      case 4:
        await processNewMessage(updateData, chatsStore);
        break;

      case 2:
        await processMessageEdit(updateData, chatsStore);
        break;

      case 3:
        processMessageDelete(updateData, chatsStore);
        break;

      case 6:
        processReadMessages(updateData, chatsStore);
        break;

      case 8:
        processUserOnline(updateData, chatsStore);
        break;

      case 9:
        processUserOffline(updateData, chatsStore);
        break;
    }
  }
}

async function processNewMessage(
  updateData: unknown[],
  chatsStore: ChatsStoreType
): Promise<void> {
  const messageId = Number(updateData[0] || 0);
  const flags = Number(updateData[1] || 0);
  const peerId = Number(updateData[2] || 0);
  const timestamp = Number(updateData[3] || 0);
  const text = String(updateData[4] || "");
  const attachments = (updateData[5] as Record<string, unknown>) || {};
  const randomId = Number(updateData[6] || 0);

  const isOut = (flags & 2) !== 0;

  const quickMessage: Message = {
    id: messageId,
    chatId: peerId,
    fromId: isOut
      ? chatsStore.chats.find((c) => c.id === peerId)?.lastMessage?.fromId || 0
      : 0,
    text: text,
    date: timestamp * 1000,
    isOut: isOut,
    attachments: [],
  };

  chatsStore.addMessage(peerId, quickMessage);
  chatsStore.updateChatLastMessage(peerId, quickMessage);

  if (!isOut) {
    const chat = chatsStore.chats.find((c) => c.id === peerId);
    if (chat) {
      window.api.showNotification(chat.title, text || "New message");
    }
  }

  try {
    const response = await vkAPI.directRequest<{
      items: VKMessage[];
      profiles?: VKProfile[];
      groups?: VKGroup[];
    }>(
      "messages.getById",
      {
        message_ids: messageId,
        extended: 1,
      },
      false
    );

    if (response && response.items && response.items.length > 0) {
      const messageData = response.items[0];
      const profiles = response.profiles || [];
      const groups = response.groups || [];

      const profilesMap: ProfileMap = {};
      profiles.forEach((profile) => {
        profilesMap[profile.id] = profile;
      });

      const groupsMap: GroupMap = {};
      groups.forEach((group) => {
        groupsMap[group.id] = group;
      });

      const getSenderInfo = async (
        fromId: number
      ): Promise<SenderInfo | null> => {
        if (fromId > 0) {
          let sender = profilesMap[fromId];
          if (!sender) {
            sender = await vkAPI.getProfile(fromId);
          }
          if (sender) {
            return {
              id: sender.id,
              firstName: sender.first_name,
              lastName: sender.last_name,
              photo: sender.photo_100 || "",
            };
          }
        } else if (fromId < 0) {
          const groupId = -fromId;
          let sender = groupsMap[groupId];
          if (!sender) {
            sender = await vkAPI.getGroup(groupId);
          }
          if (sender) {
            return {
              id: sender.id,
              firstName: sender.name,
              lastName: "",
              photo: sender.photo_100 || "",
            };
          }
        }
        return null;
      };

      const processMessage = async (item: VKMessage): Promise<Message> => {
        const senderInfo = await getSenderInfo(item.from_id);

        const message: Message = {
          id: item.id,
          chatId: peerId,
          fromId: item.from_id,
          text: item.text || "",
          date: item.date * 1000,
          isOut: item.out === 1,
          attachments: item.attachments || [],
          sender: senderInfo,
          conversation_message_id: item.conversation_message_id,
          peer_id: item.peer_id,
          random_id: item.random_id,
          ref: item.ref,
          ref_source: item.ref_source,
          out: item.out,
          important: item.important,
          is_hidden: item.is_hidden,
          keyboard: item.keyboard,
          payload: item.payload,
          geo: item.geo,
          action: item.action,
          admin_author_id: item.admin_author_id,
          is_cropped: item.is_cropped,
          members_count: item.members_count,
          update_time: item.update_time,
          was_listened: item.was_listened,
          pinned_at: item.pinned_at,
          message_tag: item.message_tag,
        };

        if (item.reply_message) {
          const replySenderInfo = await getSenderInfo(
            item.reply_message.from_id
          );
          message.reply_message = {
            id: item.reply_message.id,
            from_id: item.reply_message.from_id,
            text: item.reply_message.text || "",
            date: item.reply_message.date * 1000,
            attachments: item.reply_message.attachments || [],
            sender: replySenderInfo,
          };
        }

        if (item.fwd_messages && Array.isArray(item.fwd_messages)) {
          message.fwd_messages = await Promise.all(
            item.fwd_messages.map((fwdMsg) => processMessage(fwdMsg))
          );
        }

        return message;
      };

      const fullMessage = await processMessage(messageData);

      chatsStore.updateMessage(peerId, messageId, fullMessage);
      chatsStore.updateChatLastMessage(peerId, fullMessage);
    }
  } catch (error) {
    console.error("Error processing new message:", error);
  }

  if (Date.now() - lastChatUpdateTime > 30000) {
    chatsStore.fetchChats();
    lastChatUpdateTime = Date.now();
  }
}

async function processMessageEdit(
  updateData: unknown[],
  chatsStore: ChatsStoreType
): Promise<void> {
  const messageId = Number(updateData[0] || 0);
  const flags = Number(updateData[1] || 0);
  const peerId = Number(updateData[2] || 0);
  const timestamp = Number(updateData[3] || 0);
  const text = String(updateData[4] || "");
  const attachments = (updateData[5] as Record<string, unknown>) || {};

  try {
    const response = await vkAPI.directRequest<{ items: VKMessage[] }>(
      "messages.getById",
      {
        message_ids: messageId,
        extended: 1,
      }
    );

    if (response && response.items && response.items.length > 0) {
      const messageData = response.items[0];
      const messages = chatsStore.messages[peerId] || [];

      const updatedMessages = messages.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            text: messageData.text,
            attachments: messageData.attachments || [],
            action: messageData.action,
          };
        }
        return msg;
      });

      chatsStore.messages[peerId] = updatedMessages;
    }
  } catch (error) {
    console.error("Error processing message edit:", error);
  }
}

function processMessageDelete(
  updateData: unknown[],
  chatsStore: ChatsStoreType
): void {
  const messageId = Number(updateData[0] || 0);
  const flags = Number(updateData[1] || 0);
  const peerId = Number(updateData[2] || 0);

  const messages = chatsStore.messages[peerId] || [];
  const updatedMessages = messages.filter((msg) => msg.id !== messageId);

  chatsStore.messages[peerId] = updatedMessages;
}

function processReadMessages(
  updateData: unknown[],
  chatsStore: ChatsStoreType
): void {
  const peerId = Number(updateData[0] || 0);
  const messageId = Number(updateData[1] || 0);

  const updatedChats = chatsStore.chats.map((chat) => {
    if (chat.id === peerId) {
      return {
        ...chat,
        unreadCount: 0,
      };
    }
    return chat;
  });

  chatsStore.chats = updatedChats;
}

function processUserOnline(
  updateData: unknown[],
  chatsStore: ChatsStoreType
): void {
  const userId = Number(updateData[0] || 0);
  const platform = Number(updateData[1] || 0);
  const timestamp = Number(updateData[2] || 0);

  const updatedChats = chatsStore.chats.map((chat) => {
    if (chat.type === "user" && chat.id === userId) {
      return {
        ...chat,
        online: true,
      };
    }
    return chat;
  });

  chatsStore.chats = updatedChats;
}

function processUserOffline(
  updateData: unknown[],
  chatsStore: ChatsStoreType
): void {
  const userId = Number(updateData[0] || 0);
  const flags = Number(updateData[1] || 0);
  const timestamp = Number(updateData[2] || 0);

  const updatedChats = chatsStore.chats.map((chat) => {
    if (chat.type === "user" && chat.id === userId) {
      return {
        ...chat,
        online: false,
      };
    }
    return chat;
  });

  chatsStore.chats = updatedChats;
}

function stopPolling(): void {
  isPolling = false;
}

export function initLongPoll(): void {
  startPolling().catch((error) => {
    console.error("Failed to initialize Long Poll:", error);
  });

  window.addEventListener("beforeunload", () => {
    stopPolling();
  });
}
