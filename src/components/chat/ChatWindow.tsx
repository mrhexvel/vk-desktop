"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { useAuthStore } from "../../store/authStore";
import { useChatsStore } from "../../store/chatsStore";
import Avatar from "../UI/Avatar";
import { ScrollArea } from "../UI/ScrollArea";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";

interface ChatWindowProps {
  showDetails: boolean;
  toggleDetails: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  showDetails,
  toggleDetails,
}) => {
  const { selectedChatId, chats, messages, loadingMessages } = useChatsStore();
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  const chatMessages = selectedChatId ? messages[selectedChatId] || [] : [];

  const checkScrollPosition = useCallback(() => {
    if (!scrollViewportRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollViewportRef.current;
    const threshold = 100;
    const atBottom = scrollHeight - scrollTop - clientHeight <= threshold;

    setIsAtBottom(atBottom);
    setShowScrollButton(!atBottom && chatMessages.length > 0);
  }, [chatMessages.length]);

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }
  }, []);

  // Скролл к последнему сообщению при изменении сообщений
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom(false);
    }
  }, [chatMessages, scrollToBottom, isAtBottom]);

  // Скролл к последнему сообщению при смене чата
  useEffect(() => {
    if (selectedChatId) {
      // Небольшая задержка для уверенности, что DOM обновился
      setTimeout(() => {
        scrollToBottom(false);
        setIsAtBottom(true);
        setShowScrollButton(false);
      }, 100);
    }
  }, [selectedChatId, scrollToBottom]);

  // Удаляем автоматическое открытие деталей для групповых чатов
  // useEffect(() => {
  //   if (isGroupChat && !showDetails) {
  //     toggleDetails()
  //   }
  // }, [isGroupChat, showDetails, toggleDetails])

  const showOnlineStatus =
    selectedChat?.type === "user" && selectedChat?.online;

  if (!selectedChatId || !selectedChat) {
    return (
      <div className="flex h-full items-center justify-center animate-fade-in">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse-custom">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>
          <p className="text-lg text-var(--color-muted-foreground)">
            {t("chat.selectPlaceholder")}
          </p>
          <p className="text-sm text-var(--color-muted-foreground) mt-2">
            {t("chat.selectSubtitle")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col animate-fade-in gradient-bg">
      <div className="flex items-center justify-between bg-[#1e1e24] px-4 py-3">
        <div className="flex items-center">
          <Avatar
            src={selectedChat.avatar}
            online={showOnlineStatus}
            size="md"
            className="mr-3"
          />
          <div>
            <h2 className="text-base font-medium text-var(--color-sidebar-foreground)">
              {selectedChat.title}
            </h2>
            <p className="text-xs text-var(--color-muted-foreground)">
              {selectedChat.type === "user"
                ? selectedChat.online
                  ? t("status.online")
                  : t("status.offline")
                : ""}
              {selectedChat.type === "chat" &&
                selectedChat.membersCount &&
                ` • ${selectedChat.membersCount} ${t("chat.members")}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            className="text-var(--color-muted-foreground) hover:text-var(--color-sidebar-foreground) p-2 rounded-full hover:bg[-var(--color-sidebar-accent)] transition-smooth hover-lift"
            title={t("buttons.call")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
          <button
            className="text-var(--color-muted-foreground) hover:text-var(--color-sidebar-foreground) p-2 rounded-full hover:bg-[var(--color-sidebar-accent)] transition-smooth hover-lift"
            title={t("buttons.video")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            onClick={toggleDetails}
            className={`text-var(--color-muted-foreground) hover:text-var(--color-sidebar-foreground) p-2 rounded-full hover:bg-[var(--color-sidebar-accent)] transition-smooth hover-lift ${
              showDetails
                ? "bg-[var(--color-sidebar-accent)] text-var(--color-sidebar-foreground)"
                : ""
            }`}
            title={t("buttons.info")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <button
            onClick={() => {
              const { logout } = useAuthStore.getState();
              logout();
            }}
            className="text-var(--color-muted-foreground) hover:text-var(--color-sidebar-foreground) p-2 rounded-full hover:bg-[var(--color-sidebar-accent)] transition-smooth hover-lift"
            title={t("sidebar.logout")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <ScrollArea
          className="h-full"
          viewportRef={scrollViewportRef}
          onScroll={checkScrollPosition}
        >
          <div className="p-4">
            {loadingMessages ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-var(--color-primary) border-t-transparent"></div>
              </div>
            ) : (
              <>
                <MessageList messages={chatMessages} />
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>

        {showScrollButton && (
          <button
            onClick={() => scrollToBottom(true)}
            className="floating-action animate-scale-in"
            title={t("buttons.scrollToBottom")}
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              zIndex: 50,
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        )}
      </div>

      <ChatInput chatId={selectedChatId} />
    </div>
  );
};

export default ChatWindow;
