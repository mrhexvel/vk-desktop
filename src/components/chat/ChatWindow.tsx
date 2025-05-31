import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import { useChatsStore } from "@/store/chatsStore";
import { NotebookText } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Avatar from "../ui/Avatar";
import { ScrollArea } from "../ui/scroll-area";
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
  const userId = useAuthStore((state) => state.userId);

  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    number | null
  >(null);

  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chatMessages = selectedChatId ? messages[selectedChatId] || [] : [];

  const getScrollViewport = useCallback(() => {
    if (scrollViewportRef.current) {
      return scrollViewportRef.current;
    }

    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLDivElement;
      if (viewport) {
        return viewport;
      }
    }

    return null;
  }, []);

  const checkScrollPosition = useCallback(() => {
    const viewport = getScrollViewport();
    if (!viewport) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const threshold = 100;
    const atBottom = scrollHeight - scrollTop - clientHeight <= threshold;

    setIsAtBottom(atBottom);
    setShowScrollButton(!atBottom && chatMessages.length > 0);
  }, [chatMessages.length, getScrollViewport]);

  const scrollToBottom = useCallback(
    (smooth = true) => {
      const viewport = getScrollViewport();
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: smooth ? "smooth" : "auto",
        });
      } else if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
          block: "end",
        });
      }
    },
    [getScrollViewport]
  );

  const scrollToMessage = useCallback(
    (messageId: number) => {
      console.log("Scrolling to message:", messageId);

      const messageElement = document.getElementById(`message-${messageId}`);
      const viewport = getScrollViewport();

      if (messageElement && viewport) {
        setHighlightedMessageId(messageId);

        const messageRect = messageElement.getBoundingClientRect();
        const viewportRect = viewport.getBoundingClientRect();

        const currentScrollTop = viewport.scrollTop;
        const messageOffsetTop =
          messageRect.top - viewportRect.top + currentScrollTop;
        const viewportHeight = viewport.clientHeight;
        const targetScrollTop =
          messageOffsetTop - viewportHeight / 2 + messageRect.height / 2;

        viewport.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: "smooth",
        });

        setTimeout(() => {
          setHighlightedMessageId(null);
        }, 2000);
      } else {
        console.warn(
          "Could not scroll to message - missing element or viewport"
        );

        if (messageElement) {
          setHighlightedMessageId(messageId);
          messageElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          setTimeout(() => {
            setHighlightedMessageId(null);
          }, 3000);
        }
      }
    },
    [getScrollViewport]
  );

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom(false);
    }
  }, [chatMessages, scrollToBottom, isAtBottom]);

  useEffect(() => {
    if (selectedChatId) {
      setTimeout(() => {
        scrollToBottom(false);
        setIsAtBottom(true);
        setShowScrollButton(false);
      }, 100);
    }
  }, [selectedChatId, scrollToBottom]);

  useEffect(() => {
    checkScrollPosition();
  }, [chatMessages, checkScrollPosition]);

  useEffect(() => {
    const viewport = getScrollViewport();
    if (viewport) {
      const handleScrollEvent = () => checkScrollPosition();
      viewport.addEventListener("scroll", handleScrollEvent);

      checkScrollPosition();

      return () => {
        viewport.removeEventListener("scroll", handleScrollEvent);
      };
    }
  }, [getScrollViewport, checkScrollPosition, selectedChatId]);

  const handleScroll = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_event: React.UIEvent<HTMLDivElement>) => {
      checkScrollPosition();
    },
    [checkScrollPosition]
  );

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
    <div className="flex h-full flex-col animate-fade-in">
      <div className="flex items-center justify-between bg-var(--color-sidebar) px-4 py-3 border-b border-var(--color-sidebar-border) glass-effect">
        <div className="flex items-center">
          {selectedChat.id === userId ? (
            <div className="p-2 mr-3 rounded-full bg-purple-400">
              <NotebookText />
            </div>
          ) : (
            <Avatar
              src={selectedChat.avatar}
              online={showOnlineStatus}
              size="md"
              className="mr-3"
            />
          )}
          <div>
            <h2 className="text-base font-medium text-var(--color-sidebar-foreground)">
              {selectedChat.title}
            </h2>
            {selectedChat.id !== userId && (
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
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            className="text-var(--color-muted-foreground) hover:text-var(--color-sidebar-foreground) p-2 rounded-full hover:bg-var(--color-sidebar-accent) transition-smooth hover-lift"
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
            className="text-var(--color-muted-foreground) hover:text-var(--color-sidebar-foreground) p-2 rounded-full hover:bg-var(--color-sidebar-accent) transition-smooth hover-lift"
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
            className={`text-var(--color-muted-foreground) hover:text-var(--color-sidebar-foreground) p-2 rounded-full hover:bg-var(--color-sidebar-accent) transition-smooth hover-lift ${
              showDetails
                ? "bg-var(--color-sidebar-accent) text-var(--color-sidebar-foreground)"
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
            className="text-var(--color-muted-foreground) hover:text-var(--color-sidebar-foreground) p-2 rounded-full hover:bg-var(--color-sidebar-accent) transition-smooth hover-lift"
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
          ref={scrollAreaRef}
          onScroll={handleScroll}
        >
          <div className="p-4">
            {loadingMessages ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-var(--color-primary) border-t-transparent"></div>
              </div>
            ) : (
              <>
                <MessageList
                  messages={chatMessages}
                  highlightedMessageId={highlightedMessageId}
                  onReplyClick={scrollToMessage}
                />
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>

        {showScrollButton && (
          <button
            onClick={() => scrollToBottom(true)}
            className="fixed bottom-20 right-6 z-50 h-12 w-12 rounded-full bg-var(--color-primary) text-white shadow-lg hover:bg-opacity-90 transition-all duration-300 flex items-center justify-center animate-scale-in hover:scale-110 cursor-pointer"
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
