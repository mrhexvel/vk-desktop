"use client";

import type React from "react";
import { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { cn } from "../../lib/utils";
import type { ChatMember } from "../../types/chat";
import Avatar from "../UI/Avatar";
import { ConfirmModal } from "../UI/Modal";

interface ChatMemberItemProps {
  member: ChatMember;
  isCurrentUser: boolean;
  canManage: boolean;
  onRemoveMember?: (memberId: number) => void;
  onMakeAdmin?: (memberId: number) => void;
  onRemoveAdmin?: (memberId: number) => void;
  onViewProfile?: (memberId: number) => void;
  onSendMessage?: (memberId: number) => void;
}

const ChatMemberItem: React.FC<ChatMemberItemProps> = ({
  member,
  isCurrentUser,
  canManage,
  onRemoveMember,
  onMakeAdmin,
  onRemoveAdmin,
  onViewProfile,
  onSendMessage,
}) => {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const handleRemoveMember = () => {
    if (onRemoveMember) {
      onRemoveMember(member.id);
    }
    setShowRemoveConfirm(false);
  };

  const displayName = `${member.firstName} ${member.lastName}`;
  const isAdmin = member.role === "admin" || member.role === "creator";
  const isCreator = member.role === "creator";

  return (
    <>
      <div
        className={cn(
          "group relative flex items-center rounded-lg p-2 transition-smooth",
          showActions
            ? "bg-[var(--color-accent)]"
            : "hover:bg-[var(--color-accent)]"
        )}
      >
        <div className="relative mr-3">
          <Avatar src={member.photo} online={member.online} size="md" />
          {isAdmin && (
            <div className="absolute -bottom-1 -right-1 rounded-full bg-[var(--color-primary)] p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <p className="text-sm font-medium text-var(--color-card-foreground) truncate">
              {displayName}
              {isCurrentUser && (
                <span className="ml-1 text-xs text-var(--color-muted-foreground)">
                  {t("details.you")}
                </span>
              )}
            </p>
            {isCreator && (
              <span className="ml-2 rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs text-white">
                {t("details.creator")}
              </span>
            )}
            {isAdmin && !isCreator && (
              <span className="ml-2 rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs text-var(--color-muted-foreground)">
                {t("details.admin")}
              </span>
            )}
          </div>
          <p className="text-xs text-var(--color-muted-foreground) flex items-center">
            {member.online ? (
              <>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                {t("status.online")}
              </>
            ) : (
              t("status.offline")
            )}
          </p>
        </div>

        <button
          onClick={() => setShowActions(!showActions)}
          className={cn(
            "p-2 rounded-full transition-smooth",
            showActions
              ? "text-var(--color-card-foreground) bg-[var(--color-muted)]"
              : "text-var(--color-muted-foreground) opacity-0 group-hover:opacity-100 hover:text-var(--color-card-foreground) hover:bg-[var(--color-muted)]"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>

        {showActions && (
          <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg bg-[var(--color-card)] shadow-lg ring-1 ring-var(--color-border) glass-effect animate-scale-in">
            <div className="py-1">
              <button
                onClick={() => {
                  if (onViewProfile) onViewProfile(member.id);
                  setShowActions(false);
                }}
                className="flex w-full items-center px-4 py-2 text-left text-sm text-var(--color-card-foreground) hover:bg-[var(--color-accent)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {t("details.viewProfile")}
              </button>

              {!isCurrentUser && (
                <button
                  onClick={() => {
                    if (onSendMessage) onSendMessage(member.id);
                    setShowActions(false);
                  }}
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-var(--color-card-foreground) hover:bg-[var(--color-accent)]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  {t("details.sendMessage")}
                </button>
              )}

              {canManage && !isCurrentUser && !isCreator && (
                <>
                  <div className="border-t border-var(--color-border) my-1"></div>
                  {isAdmin ? (
                    <button
                      onClick={() => {
                        if (onRemoveAdmin) onRemoveAdmin(member.id);
                        setShowActions(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-var(--color-card-foreground) hover:bg-[var(--color-accent)]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                      {t("details.removeAdmin")}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (onMakeAdmin) onMakeAdmin(member.id);
                        setShowActions(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-var(--color-card-foreground) hover:bg-[var(--color-accent)]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      {t("details.makeAdmin")}
                    </button>
                  )}
                  <button
                    onClick={() => setShowRemoveConfirm(true)}
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-var(--color-destructive) hover:bg-[var(--color-accent)]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
                      />
                    </svg>
                    {t("details.removeFromChat")}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={handleRemoveMember}
        title={t("modals.removeUserTitle")}
        message={t("modals.removeUserMessage", { name: displayName })}
        confirmText={t("buttons.remove")}
        confirmVariant="destructive"
      />
    </>
  );
};

export default ChatMemberItem;
