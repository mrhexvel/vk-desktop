import { cn, parseTextWithLinks } from "@/lib/utils";
import type { MessageBubbleProps } from "@/types/components";
import { formatTime } from "@/utils/formatters";
import type React from "react";
import Avatar from "../ui/Avatar";
import { AudioMessageAttachment } from "./attachments/AudioMessageAttachment";
import { DocumentAttachment } from "./attachments/DocumentAttachment";
import { LinkAttachment } from "./attachments/LinkAttachment";
import { PhotoAttachment } from "./attachments/PhotoAttachment";
import { StickerAttachment } from "./attachments/StickerAttachment";
import { VideoAttachment } from "./attachments/VideoAttachment";
import { ReplyBlock } from "./ReplyBlock";

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  grouped = false,
  isHighlighted = false,
  onReplyClick,
}) => {
  const { isOut, text, date, attachments, sender } = message;

  const isCurrentUser = isOut;

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
      className={cn(
        "flex gap-3",
        isCurrentUser ? "justify-end" : "justify-start",
        grouped ? "mt-1" : "mt-4"
      )}
      id={`message-${message.id}`}
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
          "flex flex-col max-w-[70%]",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        {!isCurrentUser && !grouped && sender && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">
              {parseTextWithLinks(displayName)}
            </span>
            <span className="text-xs text-gray-400">
              {formatTime(new Date(date))}
            </span>
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl p-2 break-words word-wrap max-w-full overflow-hidden",
            isCurrentUser ? "bg-[#6c5ce7]" : "bg-[#2d2447]",
            !text && stickerAttachment && "bg-transparent flex flex-col",
            !text &&
              audioMessageAttachments.length > 0 &&
              "bg-transparent flex flex-col",
            isHighlighted && "bg-blue-500",
            isHighlighted && "animate-pulse-highlight"
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

        {isCurrentUser && (
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-400">
              {formatTime(new Date(date))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
