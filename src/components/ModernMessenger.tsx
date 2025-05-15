"use client";

import type React from "react";

import { cn } from "@/lib/utils";
import { VKApiService, vkService } from "@/services/vk.service";
import { useConversationsStore } from "@/store/useConversationsStore";
import { useMessageHistory } from "@/store/useMessageHistory";
import { useUserStore } from "@/store/userStore";
import type { VKConversationItem, VKProfile } from "@/types/vk.type";
import { Mic, Paperclip, Reply, Send, Smile } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MessageBubble } from "./chat/MessageBubble";
import { ChatHeader } from "./ChatHeader";
import { Sidebar } from "./Sidebar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

export const ModernMessenger = () => {
  const [messageText, setMessageText] = useState("");
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const conversations = useConversationsStore((state) => state.conversations);
  const profiles = conversations?.profiles;
  const groups = conversations?.groups;
  const [activeConversation, setActiveConversation] =
    useState<VKConversationItem | null>(null);
  const fetchHistory = useMessageHistory((state) => state.fetchHistory);
  const clearHistory = useMessageHistory((state) => state.clearHistory);
  const messages = useMessageHistory((state) => state.history);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const isHistoryLoading = useMessageHistory((state) => state.isLoading);
  const [replyToMessage, setReplyToMessage] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeConversation) {
      const peerId = activeConversation.conversation.peer.id;
      clearHistory();
      setIsMessagesLoading(true);
      fetchHistory(peerId);
      setReplyToMessage(null);
    }
    scrollToBottom();
  }, [activeConversation, fetchHistory, clearHistory]);

  useEffect(() => {
    if (!isHistoryLoading && messages) {
      setIsMessagesLoading(false);
    }
  }, [isHistoryLoading, messages]);

  useEffect(() => {
    if (messages?.items && messages.items.length > 0) {
      const collectUserIds = (items: typeof messages.items): number[] => {
        let ids: number[] = [];

        items.forEach((msg) => {
          ids.push(msg.from_id);

          if (msg.reply_message) {
            ids.push(msg.reply_message.from_id);
          }

          if (msg.fwd_messages && msg.fwd_messages.length > 0) {
            ids = [...ids, ...collectUserIds(msg.fwd_messages)];
          }
        });

        return ids;
      };

      const allUserIds = collectUserIds(messages.items);
      const uniqueUserIds = [...new Set(allUserIds)];

      const userIds = uniqueUserIds.filter((id) => id > 0);
      const groupIds = uniqueUserIds
        .filter((id) => id < 0)
        .map((id) => Math.abs(id));

      const currentProfiles = useUserStore.getState().profiles;
      const missingUserIds = userIds.filter((id) => !currentProfiles[id]);
      const missingGroupIds = groupIds.filter((id) => !currentProfiles[-id]);

      if (missingUserIds.length > 0 || missingGroupIds.length > 0) {
        const executeCode = `
        var users = API.users.get({"user_ids": "${missingUserIds.join(
          ","
        )}", "fields": "photo_100"});
        var groups = API.groups.getById({"group_ids": "${missingGroupIds.join(
          ","
        )}", "fields": "photo_100"});
        return {"users": users, "groups": groups};
      `;

        vkService
          .execute(executeCode)
          .then((response) => {
            const users = response.users || [];
            const groups = response.groups || [];

            const userProfiles: VKProfile[] = users.map((user) => ({
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              photo_100: user.photo_100,
              isGroup: false,
            }));

            const groupProfiles: VKProfile[] = groups.map((group) => ({
              id: -group.id,
              first_name: group.name,
              name: group.name,
              photo_100: group.photo_100,
              isGroup: true,
            }));

            const combinedProfiles = [...userProfiles, ...groupProfiles];
            useUserStore.getState().setProfiles(combinedProfiles);
          })
          .catch((error) => {
            console.error("Ошибка execute запроса:", error);
          });
      }
    }
  }, [messages]);

  const profileMap = useMemo(() => {
    const map: Record<number, VKProfile> = {};
    if (profiles) {
      profiles.forEach((profile) => {
        map[profile.id] = profile;
      });
    }

    const userProfiles = useUserStore.getState().profiles;
    Object.keys(userProfiles).forEach((id) => {
      map[Number(id)] = userProfiles[Number(id)];
    });

    return map;
  }, [profiles]);

  const handleSendMessage = (): void => {
    if (messageText.trim()) {
      console.log("отправлено сообщение:", messageText);
      if (replyToMessage) {
        console.log("в ответ на сообщение ID:", replyToMessage);
      }
      setMessageText("");
      setReplyToMessage(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const replyMessageInfo = useMemo(() => {
    if (!replyToMessage || !messages?.items) return null;

    const message = messages.items.find((msg) => msg.id === replyToMessage);
    if (!message) return null;

    const profile = profileMap[message.from_id];
    return { message, profile };
  }, [replyToMessage, messages, profileMap]);

  const cropText = (text: string, maxLength: number): string => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="flex h-screen bg-[#121218] text-white">
      <div className="w-full flex">
        <Sidebar
          conversations={conversations?.items}
          activeId={activeConversation?.conversation.peer.id}
          onSelect={(conversation) => setActiveConversation(conversation)}
          getAvatar={(conv) =>
            VKApiService.getConversationAvatar(conv, profiles!, groups!)
          }
        />
        <div
          className={cn(
            "flex-1 flex flex-col",
            activeConversation && "gradient-bg"
          )}
        >
          {activeConversation && (
            <>
              <ChatHeader
                conversation={activeConversation}
                profiles={profiles}
                groups={groups}
                showRightSidebar={showRightSidebar}
                setShowRightSidebar={setShowRightSidebar}
                getAvatar={(conv) =>
                  VKApiService.getConversationAvatar(conv, profiles!, groups!)
                }
              />

              <ScrollArea className="flex-1 h-72 p-4">
                <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                  {isMessagesLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                  ) : messages?.items.length === 0 || !messages?.items ? (
                    <p className="text-center text-gray-400">Нет сообщений</p>
                  ) : (
                    [...messages.items]
                      .reverse()
                      .map((message) => (
                        <MessageBubble
                          key={message.id}
                          {...message}
                          profileMap={profileMap}
                          profile={profileMap[message.from_id]}
                        />
                      ))
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-3">
                {replyMessageInfo && (
                  <div className="mx-3 mb-2 p-2 bg-[#2a2a3a] rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Reply className="h-4 w-4 text-[#5d3f92]" />
                      <div>
                        <div className="text-xs font-medium text-[#5d3f92]">
                          {replyMessageInfo.profile
                            ? replyMessageInfo.profile.isGroup
                              ? replyMessageInfo.profile.name
                              : `${replyMessageInfo.profile.first_name} ${
                                  replyMessageInfo.profile.last_name || ""
                                }`.trim()
                            : `id${replyMessageInfo.message.from_id}`}
                        </div>
                        <div className="text-xs text-gray-300 truncate">
                          {cropText(
                            replyMessageInfo.message.text || "Вложение",
                            50
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full hover:bg-[#3a3a4a]"
                      onClick={() => setReplyToMessage(null)}
                    >
                      <span className="text-xs">✕</span>
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-[#2a2a3a] rounded-full p-1 pl-3">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Введите сообщение..."
                    className="bg-transparent border-none focus-visible:ring-0 h-9 placeholder:text-gray-500"
                  />

                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-[#3a3a4a]"
                    >
                      <Paperclip className="h-5 w-5 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-[#3a3a4a]"
                    >
                      <Smile className="h-5 w-5 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-[#3a3a4a]"
                    >
                      <Mic className="h-5 w-5 text-gray-400" />
                    </Button>
                    <Button
                      className="rounded-full bg-[#5d3f92] hover:bg-[#4a3173] h-9 w-9"
                      onClick={handleSendMessage}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
