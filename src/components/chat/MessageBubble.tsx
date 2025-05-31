import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { cn, parseTextWithLinks } from "../../lib/utils";
import type { Message } from "../../types/chat";
import { formatTime } from "../../utils/formatters";
import Avatar from "../ui/Avatar";
import { AudioMessageAttachment } from "./attachments/AudioMessageAttachment";
import { DocumentAttachment } from "./attachments/DocumentAttachment";
import { LinkAttachment } from "./attachments/LinkAttachment";
import { PhotoAttachment } from "./attachments/PhotoAttachment";
import { StickerAttachment } from "./attachments/StickerAttachment";
import { VideoAttachment } from "./attachments/VideoAttachment";
import { MessageStatus } from "./MessageStatus";
import { ReplyBlock } from "./ReplyBlock";

interface MessageBubbleProps {
  message: Message;
  grouped?: boolean;
  isHighlighted?: boolean;
  onReplyClick?: (messageId: number) => void;
  onReplyToMessage?: (message: Message) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  grouped = false,
  isHighlighted = false,
  onReplyClick,
  onReplyToMessage,
}) => {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [prevStatus, setPrevStatus] = useState(message.sendStatus);
  const messageRef = useRef<HTMLDivElement>(null);
  const {
    isOut,
    text,
    date,
    attachments,
    sender,
    sendStatus = "sent",
  } = message;

  const isCurrentUser = isOut;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (prevStatus !== sendStatus) {
      setPrevStatus(sendStatus);
    }
  }, [sendStatus, prevStatus]);

  const photoAttachments =
    attachments?.filter((att) => att.type === "photo") || [];
  const stickerAttachment = attachments?.find((att) => att.type === "sticker");
  const videoAttachments =
    attachments?.filter((att) => att.type === "video") || [];
  const docAttachments = attachments?.filter((att) => att.type === "doc") || [];
  const linkAttachments =
    attachments?.filter((att) => att.type === "link") || [];
  const audioMessageAttachments =
    attachments?.filter((att) => att.type === "audio_message") || [];

  const displayName = sender
    ? `${sender.firstName} ${sender.lastName}`
    : "Неизвестный пользователь";

  const handleReply = () => {
    if (onReplyToMessage) {
      onReplyToMessage(message);
    }
    setShowActions(false);
  };

  const handleCopyText = () => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
    setShowActions(false);
  };

  if (!sender && !isCurrentUser) {
    return (
      <div className="flex gap-3 max-w-[80%] self-start mb-2">
        <div className="h-8 w-8 mt-1 rounded-full bg-[#2a2a3a] animate-pulse"></div>
        <div className="flex flex-col items-start">
          <div className="h-4 w-24 bg-[#2a2a3a] rounded-md animate-pulse mb-1"></div>
          <div className="h-8 w-48 bg-[#2a2a3a] rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messageRef}
      className={cn(
        "group relative flex gap-3 w-full message-container",
        isCurrentUser ? "justify-end" : "justify-start",
        grouped ? "mt-1" : "mt-4",
        !isVisible ? "opacity-0" : "animate-smooth-appear"
      )}
      id={`message-${message.id}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{
        transformOrigin: isCurrentUser ? "right bottom" : "left bottom",
      }}
    >
      {!isCurrentUser && (
        <div className="w-8 flex-shrink-0">
          {!grouped && (
            <Avatar
              src={sender?.photo || "/placeholder.svg"}
              alt={displayName}
              size="sm"
            />
          )}
        </div>
      )}

      <div
        className={cn(
          "flex flex-col max-w-[70%] relative",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        {!isCurrentUser && !grouped && sender && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-[#6c5ce7]">
              {parseTextWithLinks(displayName)}
            </span>
            <span className="text-xs text-gray-400">
              {formatTime(new Date(date))}
            </span>
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl p-2 break-words word-wrap max-w-full overflow-hidden message-content transition-smooth",
            isCurrentUser ? "bg-[#6c5ce7]" : "bg-[#2d2447]",
            !text && stickerAttachment && "bg-transparent flex flex-col",
            !text &&
              audioMessageAttachments.length > 0 &&
              "bg-transparent flex flex-col",
            isHighlighted &&
              "ring-2 ring-[#6c5ce7] ring-opacity-50 shadow-lg shadow-[#6c5ce7]/20",
            sendStatus === "sending" && "opacity-80"
          )}
        >
          {message.reply_message && (
            <ReplyBlock
              message={message.reply_message}
              profile={message.reply_message.sender}
              onReplyClick={onReplyClick}
            />
          )}

          {message.fwd_messages && message.fwd_messages.length > 0 && (
            <div className="border-l-2 border-gray-500 pl-2 mb-2">
              <div className="text-sm font-medium text-blue-400">
                Пересланные сообщения
              </div>
              <div className="text-xs text-gray-400">
                {message.fwd_messages.length}{" "}
                {message.fwd_messages.length === 1
                  ? "сообщение"
                  : message.fwd_messages.length < 5
                  ? "сообщения"
                  : "сообщений"}
              </div>
            </div>
          )}

          {text && (
            <div className="whitespace-pre-wrap text-sm text-white break-words overflow-wrap-anywhere max-w-full">
              {parseTextWithLinks(text)}
            </div>
          )}

          {photoAttachments.length > 0 && (
            <PhotoAttachment attachments={photoAttachments} />
          )}

          {stickerAttachment && stickerAttachment.type === "sticker" && (
            <StickerAttachment sticker={stickerAttachment.sticker} />
          )}

          {videoAttachments.length > 0 && (
            <VideoAttachment attachments={videoAttachments} />
          )}

          {docAttachments.length > 0 && (
            <DocumentAttachment attachments={docAttachments} />
          )}

          {linkAttachments.length > 0 && (
            <LinkAttachment attachments={linkAttachments} />
          )}

          {audioMessageAttachments.length > 0 && (
            <AudioMessageAttachment
              attachments={audioMessageAttachments}
              isCurrentUser={isCurrentUser}
            />
          )}
        </div>

        {showActions && (
          <div
            className={cn(
              "absolute top-0 flex items-center gap-1 bg-var(--color-card) rounded-lg shadow-lg border border-var(--color-border) p-1 z-10 animate-scale-in",
              isCurrentUser ? "-left-20" : "-right-20"
            )}
          >
            <button
              onClick={handleReply}
              className="p-2 text-var(--color-muted-foreground) hover:text-var(--color-card-foreground) hover:bg-var(--color-accent) rounded-md transition-smooth"
              title={t("messages.reply")}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </button>

            {text && (
              <button
                onClick={handleCopyText}
                className="p-2 text-var(--color-muted-foreground) hover:text-var(--color-card-foreground) hover:bg-var(--color-accent) rounded-md transition-smooth"
                title={t("buttons.copy")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {isCurrentUser && (
          <div
            className={cn(
              "flex justify-end mt-1",
              prevStatus !== sendStatus && "animate-status-change"
            )}
          >
            <MessageStatus
              status={sendStatus}
              time={formatTime(new Date(date))}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
