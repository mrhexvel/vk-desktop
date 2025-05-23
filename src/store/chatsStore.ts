// @ts-nocheck
import { create } from "zustand";
import { vkAPI } from "../services/vk-api-service";
import type {
  ChatItem,
  ChatMember,
  ChatType,
  Message,
  ReplyMessage,
} from "../types/chat";
import type {
  VKGroup,
  VKMessage,
  VKMessageAttachment,
  VKProfile,
} from "../types/vk-api";

interface ChatsState {
  chats: ChatItem[];
  selectedChatId: number | null;
  messages: Record<number, Message[]>;
  loadingChats: boolean;
  loadingMessages: boolean;
  error: string | null;

  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: number) => Promise<void>;
  selectChat: (chatId: number) => void;
  sendMessage: (
    chatId: number,
    text: string,
    attachments?: string[]
  ) => Promise<void>;
  addMessage: (chatId: number, message: Message) => void;
  updateMessage: (chatId: number, messageId: number, message: Message) => void;
  updateChatLastMessage: (chatId: number, message: Message) => void;
  markAsRead: (chatId: number, messageIds: number[]) => Promise<void>;
  fetchChatMembers: (chatId: number) => Promise<ChatMember[]>;
  removeChatMember: (chatId: number, memberId: number) => Promise<boolean>;
  leaveChat: (chatId: number) => Promise<boolean>;
  clearChatHistory: (chatId: number) => Promise<boolean>;
}

export const useChatsStore = create<ChatsState>((set, get) => ({
  chats: [],
  selectedChatId: null,
  messages: {},
  loadingChats: false,
  loadingMessages: false,
  error: null,

  fetchChats: async () => {
    try {
      set({ loadingChats: true, error: null });

      const response = await vkAPI.getConversations(20, 0);

      if (response && response.conversations && response.conversations.items) {
        const items = response.conversations.items;
        const profiles = [
          ...(response.conversations.profiles || []),
          ...(response.additional_profiles || []),
        ];
        const groups = [
          ...(response.conversations.groups || []),
          ...(response.additional_groups || []),
        ];

        const profilesMap = new Map<number, VKProfile>();
        profiles.forEach((profile) => {
          profilesMap.set(profile.id, profile);
        });

        const groupsMap = new Map<number, VKGroup>();
        groups.forEach((group) => {
          groupsMap.set(group.id, group);
        });

        const chats: ChatItem[] = items.map((item) => {
          const conversation = item.conversation;
          const peer = conversation.peer;
          const lastMessage = item.last_message;

          const chat: ChatItem = {
            id: peer.id,
            type: peer.type as ChatType,
            title: "",
            avatar: "",
            lastMessage: lastMessage
              ? {
                  id: lastMessage.id,
                  fromId: lastMessage.from_id,
                  text: lastMessage.text || "",
                  date: lastMessage.date * 1000,
                  isOut: lastMessage.out === 1,
                  attachments: lastMessage.attachments || [],
                  unread: conversation.unread_count || 0,
                  reply_message: lastMessage.reply_message
                    ? {
                        id: lastMessage.reply_message.id,
                        from_id: lastMessage.reply_message.from_id,
                        text: lastMessage.reply_message.text || "",
                        date: lastMessage.reply_message.date * 1000,
                        attachments:
                          lastMessage.reply_message.attachments || [],
                      }
                    : undefined,
                  fwd_messages: lastMessage.fwd_messages || [],
                }
              : undefined,
            unreadCount: conversation.unread_count || 0,
            online: false,
            isAdmin: false,
            canManage: false,
          };

          if (peer.type === "user") {
            const profile = profilesMap.get(peer.id);
            if (profile) {
              chat.title = `${profile.first_name} ${profile.last_name}`;
              chat.avatar = profile.photo_100 || "";
              chat.online = profile.online === 1;
            } else {
              chat.title = "Пользователь";
              chat.avatar = "";
            }
          } else if (peer.type === "group") {
            const group = groupsMap.get(-peer.id);
            if (group) {
              chat.title = group.name || "Сообщество";
              chat.avatar = group.photo_100 || "";
            } else {
              chat.title = "Сообщество";
              chat.avatar = "";
            }
          } else if (peer.type === "chat") {
            chat.title = conversation.chat_settings?.title || "Беседа";
            chat.avatar = conversation.chat_settings?.photo?.photo_100 || "";
            chat.membersCount = conversation.chat_settings?.members_count;
            chat.isAdmin = conversation.chat_settings?.is_admin || false;
            chat.canManage = conversation.chat_settings?.is_admin || false;
          }

          return chat;
        });

        set({ chats, loadingChats: false });

        if (get().selectedChatId === null && chats.length > 0) {
          get().selectChat(chats[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      set({
        loadingChats: false,
        error: error instanceof Error ? error.message : "Failed to load chats",
      });
    }
  },

  fetchMessages: async (chatId: number) => {
    try {
      set({ loadingMessages: true, error: null });

      const response = await vkAPI.getHistory(chatId, 50, 0);

      if (response && response.history && response.history.items) {
        const items = response.history.items;
        const profiles = [
          ...(response.history.profiles || []),
          ...(response.additional_profiles || []),
        ];
        const groups = [
          ...(response.history.groups || []),
          ...(response.additional_groups || []),
        ];

        const profilesMap = new Map<number, VKProfile>();
        profiles.forEach((profile) => {
          profilesMap.set(profile.id, profile);
        });

        const groupsMap = new Map<number, VKGroup>();
        groups.forEach((group) => {
          groupsMap.set(group.id, group);
        });

        const getSenderInfo = (fromId: number) => {
          if (fromId > 0) {
            const profile = profilesMap.get(fromId);
            if (profile) {
              return {
                id: profile.id,
                firstName: profile.first_name,
                lastName: profile.last_name,
                photo: profile.photo_100 || "",
              };
            }
          } else if (fromId < 0) {
            const group = groupsMap.get(-fromId);
            if (group) {
              return {
                id: group.id,
                firstName: group.name,
                lastName: "",
                photo: group.photo_100 || "",
              };
            }
          }
          return null;
        };

        const processMessage = (item: VKMessage): Message => {
          const senderInfo = getSenderInfo(item.from_id);

          const message: Message = {
            id: item.id,
            chatId: chatId,
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
            const replySenderInfo = getSenderInfo(item.reply_message.from_id);
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
            message.fwd_messages = item.fwd_messages.map((fwdMsg) =>
              processMessage(fwdMsg)
            );
          }

          return message;
        };

        const messages: Message[] = items.map(processMessage);

        messages.sort((a, b) => a.date - b.date);

        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: messages,
          },
          loadingMessages: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      set({
        loadingMessages: false,
        error:
          error instanceof Error ? error.message : "Failed to load messages",
      });
    }
  },

  selectChat: (chatId: number) => {
    set({ selectedChatId: chatId });

    if (!get().messages[chatId]) {
      get().fetchMessages(chatId);
    }
  },

  sendMessage: async (chatId: number, text: string, attachments = []) => {
    try {
      const response = await vkAPI.directRequest<number>("messages.send", {
        peer_id: chatId,
        message: text,
        attachment: attachments.join(","),
        random_id: Math.floor(Math.random() * 1000000),
      });

      if (response) {
        const newMessage: Message = {
          id: response,
          chatId,
          fromId:
            get().chats.find((chat) => chat.id === chatId)?.lastMessage
              ?.fromId || 0,
          text,
          date: Date.now(),
          isOut: true,
          attachments: attachments.map((att) => ({
            type: "link",
            link: { url: att },
          })) as VKMessageAttachment[],
        };

        get().addMessage(chatId, newMessage);
        get().updateChatLastMessage(chatId, newMessage);
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to send message",
      });
    }
  },

  addMessage: (chatId: number, message: Message) => {
    set((state) => {
      const currentMessages = state.messages[chatId] || [];

      if (currentMessages.some((msg) => msg.id === message.id)) {
        return state;
      }

      const updatedMessages = [...currentMessages, message].sort(
        (a, b) => a.date - b.date
      );

      return {
        messages: {
          ...state.messages,
          [chatId]: updatedMessages,
        },
      };
    });
  },

  updateMessage: (chatId: number, messageId: number, message: Message) => {
    set((state) => {
      const currentMessages = state.messages[chatId] || [];
      const updatedMessages = currentMessages.map((msg) =>
        msg.id === messageId ? message : msg
      );

      return {
        messages: {
          ...state.messages,
          [chatId]: updatedMessages,
        },
      };
    });
  },

  updateChatLastMessage: (chatId: number, message: Message) => {
    set((state) => {
      const updatedChats = state.chats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            lastMessage: {
              id: message.id,
              fromId: message.fromId,
              text: message.text,
              date: message.date,
              isOut: message.isOut,
              attachments: message.attachments,
              unread: message.isOut ? 0 : (chat.lastMessage?.unread || 0) + 1,
              reply_message: message.reply_message as ReplyMessage | undefined,
              fwd_messages: message.fwd_messages,
            },
          };
        }
        return chat;
      });

      const sortedChats = updatedChats.sort((a, b) => {
        const aTime = a.lastMessage?.date || 0;
        const bTime = b.lastMessage?.date || 0;
        return bTime - aTime;
      });

      return { chats: sortedChats };
    });
  },

  markAsRead: async (chatId: number, messageIds: number[]) => {
    try {
      await vkAPI.directRequest("messages.markAsRead", {
        peer_id: chatId,
        start_message_id: Math.min(...messageIds),
      });

      set((state) => {
        const updatedChats = state.chats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              unreadCount: 0,
              lastMessage: chat.lastMessage
                ? {
                    ...chat.lastMessage,
                    unread: 0,
                  }
                : undefined,
            };
          }
          return chat;
        });

        return { chats: updatedChats };
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },

  fetchChatMembers: async (chatId: number): Promise<ChatMember[]> => {
    try {
      const response = await vkAPI.directRequest(
        "messages.getConversationMembers",
        {
          peer_id: chatId,
          fields: "photo_100,online",
        }
      );

      if (response && response.items) {
        const profiles = response.profiles || [];
        const profilesMap = new Map();
        profiles.forEach((profile: any) => {
          profilesMap.set(profile.id, profile);
        });

        const membersList: ChatMember[] = response.items
          .map((item: any) => {
            const profile = profilesMap.get(item.member_id);
            if (!profile) return null;

            return {
              id: profile.id,
              firstName: profile.first_name,
              lastName: profile.last_name,
              photo: profile.photo_100 || "",
              online: profile.online === 1,
              role: item.is_owner
                ? "creator"
                : item.is_admin
                ? "admin"
                : "member",
              canKick: item.can_kick,
              invited_by: item.invited_by,
              join_date: item.join_date,
            };
          })
          .filter(Boolean);

        return membersList;
      }
      return [];
    } catch (error) {
      console.error("Error fetching chat members:", error);
      return [];
    }
  },

  removeChatMember: async (
    chatId: number,
    memberId: number
  ): Promise<boolean> => {
    try {
      await vkAPI.directRequest("messages.removeChatUser", {
        chat_id: chatId - 2000000000,
        user_id: memberId,
      });
      return true;
    } catch (error) {
      console.error("Error removing chat member:", error);
      return false;
    }
  },

  leaveChat: async (chatId: number): Promise<boolean> => {
    try {
      await vkAPI.directRequest("messages.removeChatUser", {
        chat_id: chatId - 2000000000,
        user_id: 0, // Current user
      });
      return true;
    } catch (error) {
      console.error("Error leaving chat:", error);
      return false;
    }
  },

  clearChatHistory: async (chatId: number): Promise<boolean> => {
    try {
      await vkAPI.directRequest("messages.deleteConversation", {
        peer_id: chatId,
        group_id: 0,
      });
      return true;
    } catch (error) {
      console.error("Error clearing chat history:", error);
      return false;
    }
  },
}));
