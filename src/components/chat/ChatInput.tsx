import { useTranslation } from "@/hooks/useTranslation";
import { cn, cropText } from "@/lib/utils";
import { useChatsStore } from "@/store/chatsStore";
import { Message } from "@/types/chat";
import type React from "react";
import { useRef, useState } from "react";

interface ChatInputProps {
  chatId: number;
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  chatId,
  replyToMessage,
  onCancelReply,
}) => {
  const [message, setMessage] = useState("");
  const { sendMessage } = useChatsStore();
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(chatId, message.trim(), [], replyToMessage?.id);
      setMessage("");

      if (onCancelReply) {
        onCancelReply();
      }

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    if (e.key === "Escape" && replyToMessage && onCancelReply) {
      onCancelReply();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const getReplyPreview = () => {
    if (!replyToMessage) return "";

    if (replyToMessage.text) {
      return cropText(replyToMessage.text, 50);
    }

    if (replyToMessage.attachments && replyToMessage.attachments.length > 0) {
      const attachment = replyToMessage.attachments[0];
      switch (attachment.type) {
        case "photo":
          return t("messages.photo");
        case "video":
          return t("messages.video");
        case "audio":
          return t("messages.audio");
        case "doc":
          return t("messages.document");
        case "sticker":
          return t("messages.sticker");
        case "audio_message":
          return t("messages.voice");
        case "link":
          return t("messages.link");
        default:
          return t("messages.attachment");
      }
    }

    return t("messages.attachment");
  };

  const getReplyAuthor = () => {
    if (!replyToMessage) return "";

    if (replyToMessage.sender) {
      return `${replyToMessage.sender.firstName} ${replyToMessage.sender.lastName}`;
    }

    return replyToMessage.isOut ? t("details.you") : t("messages.user");
  };

  return (
    <div>
      {replyToMessage && (
        <div className="px-4 p-3 glass-effect">
          <div className="flex items-start justify-between rounded-lg">
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-1">
                <svg
                  className="w-4 h-4 mr-2 text-[var(--color-primary)]"
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
                <span className="text-sm font-medium text-[var(--color-primary)]">
                  {t("messages.reply")}
                </span>
              </div>
              <div className="text-xs text-[var(--color-muted-foreground)] mb-1">
                {getReplyAuthor()}
              </div>
              <div className="text-sm text-[var(--color-card-foreground)] truncate">
                {getReplyPreview()}
              </div>
            </div>
            <button
              onClick={onCancelReply}
              className="ml-2 p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-card-foreground)] hover:bg-[var(--color-accent)] rounded-full transition-smooth"
              title={t("buttons.cancel")}
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="glass-effect p-3">
        <div className="flex items-end rounded-lg p-2 glass-effect">
          <button
            className="mr-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-card-foreground)] p-2 rounded-full hover:bg-[var(--color-accent)] transition-smooth hover-lift"
            title={t("buttons.attach")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={
              replyToMessage
                ? t("chat.replyPlaceholder")
                : t("chat.inputPlaceholder")
            }
            className="max-h-32 min-h-[2.5rem] flex-1 resize-none overflow-y-auto bg-transparent py-2 px-2 text-[var(--color-card-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none scrollbar-thin"
            rows={1}
          />

          <button
            className="mx-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-card-foreground)] p-2 rounded-full hover:bg-[var(--color-accent)] transition-smooth hover-lift"
            title={t("buttons.emoji")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <button
            onClick={handleSend}
            className={cn(
              "rounded-full p-2 text-white transition-smooth hover-lift",
              message.trim() || replyToMessage
                ? "gradient-primary"
                : "bg-[var(--color-muted)] cursor-not-allowed"
            )}
            disabled={!message.trim() && !replyToMessage}
            title={t("buttons.send")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
