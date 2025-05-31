import type React from "react";
import { useTranslation } from "../../hooks/useTranslation";
import type { MessageSender } from "../../types/chat";
import type { VKMessageAction } from "../../types/vk-api";

interface SystemMessageProps {
  action: VKMessageAction;
  fromSender?: MessageSender | null;
  memberSender?: MessageSender | null;
  date: number;
}

export const SystemMessage: React.FC<SystemMessageProps> = ({
  action,
  fromSender,
  memberSender,
}) => {
  const { t } = useTranslation();

  const getActionText = (): string => {
    const fromName = fromSender
      ? `${fromSender.firstName} ${fromSender.lastName}`
      : t("messages.user");
    const memberName = memberSender
      ? `${memberSender.firstName} ${memberSender.lastName}`
      : t("messages.user");

    switch (action.type) {
      case "chat_create":
        return t("systemMessages.chatCreate", { user: fromName });

      case "chat_title_update":
        return t("systemMessages.chatTitleUpdate", {
          user: fromName,
          title: action.text || t("systemMessages.unknownTitle"),
        });

      case "chat_photo_update":
        return t("systemMessages.chatPhotoUpdate", { user: fromName });

      case "chat_photo_remove":
        return t("systemMessages.chatPhotoRemove", { user: fromName });

      case "chat_invite_user":
        if (action.member_id === fromSender?.id) {
          return t("systemMessages.userJoined", { user: fromName });
        }
        return t("systemMessages.userInvited", {
          inviter: fromName,
          user: memberName,
        });

      case "chat_kick_user":
        if (action.member_id === fromSender?.id) {
          return t("systemMessages.userLeft", { user: fromName });
        }
        return t("systemMessages.userKicked", {
          kicker: fromName,
          user: memberName,
        });

      case "chat_pin_message":
        return t("systemMessages.messagePinned", { user: fromName });

      case "chat_unpin_message":
        return t("systemMessages.messageUnpinned", { user: fromName });

      case "chat_invite_user_by_link":
        return t("systemMessages.userJoinedByLink", { user: fromName });

      default:
        return t("systemMessages.unknownAction", { user: fromName });
    }
  };

  const getActionIcon = (): React.ReactNode => {
    switch (action.type) {
      case "chat_create":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        );

      case "chat_title_update":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        );

      case "chat_photo_update":
      case "chat_photo_remove":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );

      case "chat_invite_user":
      case "chat_invite_user_by_link":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        );

      case "chat_kick_user":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
            />
          </svg>
        );

      case "chat_pin_message":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        );

      case "chat_unpin_message":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        );

      default:
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="flex justify-center my-3 animate-fade-in">
      <div className="flex items-center gap-2 rounded-full bg-[var(--color-muted)] bg-opacity-70 px-4 py-2 text-xs text-[var(--color-muted-foreground)] glass-effect max-w-[80%]">
        <span className="text-[var(--color-primary)] flex-shrink-0">
          {getActionIcon()}
        </span>
        <span className="text-center">{getActionText()}</span>
      </div>
    </div>
  );
};
