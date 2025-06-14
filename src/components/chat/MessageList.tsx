import type React from "react";
import { memo } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import type { Message } from "../../types/chat";
import { formatMessageDate } from "../../utils/formatters";
import MessageBubble from "./MessageBubble";
import { SystemMessage } from "./SystemMessage";

interface MessageListProps {
  messages: Message[];
  highlightedMessageId?: number | null;
  onReplyClick?: (messageId: number) => void;
  onReplyToMessage?: (message: Message) => void;
}

const MessageList: React.FC<MessageListProps> = memo(
  ({ messages, highlightedMessageId, onReplyClick, onReplyToMessage }) => {
    const { t } = useTranslation();

    if (messages.length === 0) {
      return (
        <div className="flex h-full items-center justify-center animate-fade-in">
          <p className="text-lg text-var(--color-muted-foreground)">
            {t("chat.noMessages")}
          </p>
        </div>
      );
    }

    const groupedMessages: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.date);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (!groupedMessages[dateKey]) {
        groupedMessages[dateKey] = [];
      }

      groupedMessages[dateKey].push(message);
    });

    return (
      <div className="space-y-4 message-list">
        {Object.entries(groupedMessages).map(([dateKey, messagesGroup]) => (
          <div key={dateKey} className="space-y-1">
            <div className="mb-2 flex justify-center">
              <div className="rounded-full bg-var(--color-muted) bg-opacity-70 px-3 py-1 text-xs text-var(--color-muted-foreground) glass-effect">
                {formatMessageDate(new Date(messagesGroup[0].date))}
              </div>
            </div>

            <div className="flex flex-col">
              {messagesGroup.map((message, index) => {
                if (message.action) {
                  return (
                    <SystemMessage
                      key={`${message.id}-${message.localId || ""}`}
                      action={message.action}
                      fromSender={message.sender}
                      memberSender={
                        message.action.member_id ? message.sender : undefined
                      }
                      date={message.date}
                    />
                  );
                }

                const prevMessage = index > 0 ? messagesGroup[index - 1] : null;
                const isGrouped =
                  (prevMessage &&
                    !prevMessage.action &&
                    prevMessage.fromId === message.fromId &&
                    message.date - prevMessage.date < 60000 &&
                    !prevMessage.isOut === !message.isOut) ||
                  false;

                return (
                  <MessageBubble
                    key={`${message.id}-${message.localId || ""}`}
                    message={message}
                    grouped={isGrouped}
                    isHighlighted={highlightedMessageId === message.id}
                    onReplyClick={onReplyClick}
                    onReplyToMessage={onReplyToMessage}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

MessageList.displayName = "MessageList";

export default MessageList;
