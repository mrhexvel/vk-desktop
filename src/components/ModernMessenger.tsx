"use client";

import type React from "react";

import { cn } from "@/lib/utils";
import { VKApiService, vkService } from "@/services/vk.service";
import { useConversationsStore } from "@/store/useConversationsStore";
import { useMessageHistory } from "@/store/useMessageHistory";
import { useUserStore } from "@/store/userStore";
import type { VKConversationItem, VKProfile } from "@/types/vk.type";
import { Mic, Paperclip, Send, Smile } from "lucide-react";
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
      const participantIds = [
        ...new Set(messages.items.map((msg) => msg.from_id)),
      ];
      const userIds = participantIds.filter((id) => id > 0);
      const groupIds = participantIds
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
    if (messages?.items) {
      messages.items.forEach((msg) => {
        const profile =
          profiles?.find((p) => p.id === msg.from_id) ||
          useUserStore.getState().profiles[msg.from_id];
        if (profile) {
          map[msg.from_id] = profile;
        }
      });
    }
    return map;
  }, [messages, profiles]);

  const handleSendMessage = (): void => {
    if (messageText.trim()) {
      console.log("отправлено сообщение:", messageText);
      setMessageText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isLoading = messages?.items.length === 0 || !messages?.items;

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
                  ) : isLoading ? (
                    <p className="text-center text-gray-400">Нет сообщений</p>
                  ) : (
                    [...messages.items].reverse().map((message) => {
                      return (
                        <MessageBubble
                          {...message}
                          key={message.id}
                          profile={profileMap[message.from_id]}
                        />
                      );
                    })
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-3">
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
