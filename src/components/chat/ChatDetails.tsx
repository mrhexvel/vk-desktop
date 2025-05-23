// @ts-nocheck
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { cn } from "../../lib/utils";
import { vkAPI } from "../../services/vk-api-service";
import { useAuthStore } from "../../store/authStore";
import { useChatsStore } from "../../store/chatsStore";
import type { ChatMember } from "../../types/chat";
import Avatar from "../UI/Avatar";
import { ConfirmModal } from "../UI/Modal";
import { ScrollArea } from "../UI/ScrollArea";
import ChatMemberItem from "./ChatMemberItem";

interface ChatDetailsProps {
  onClose: () => void;
}

const ChatDetails: React.FC<ChatDetailsProps> = ({ onClose }) => {
  const { selectedChatId, chats } = useChatsStore();
  const { userId } = useAuthStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"info" | "members" | "media">(
    "info"
  );
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  const isGroupChat = selectedChat?.type === "chat";
  const isCurrentUserAdmin = selectedChat?.isAdmin || false;

  useEffect(() => {
    if (selectedChatId && isGroupChat) {
      fetchChatMembers();
    }
  }, [selectedChatId, isGroupChat]);

  const fetchChatMembers = async () => {
    if (!selectedChatId) return;

    setLoading(true);
    try {
      // Fetch chat members from VK API
      const response = await vkAPI.directRequest(
        "messages.getConversationMembers",
        {
          peer_id: selectedChatId,
          fields: "photo_100,online",
        }
      );

      if (response && response.items) {
        const profiles = response.profiles || [];
        const profilesMap = new Map();
        profiles.forEach((profile: any) => {
          profilesMap.set(profile.id, profile);
        });

        const membersList: ChatMember[] = response.items
          .map((item: any) => {
            const profile = profilesMap.get(item.member_id);
            if (!profile) return null;

            return {
              id: profile.id,
              firstName: profile.first_name,
              lastName: profile.last_name,
              photo: profile.photo_100 || "",
              online: profile.online === 1,
              role: item.is_owner
                ? "creator"
                : item.is_admin
                ? "admin"
                : "member",
              canKick: item.can_kick,
              invited_by: item.invited_by,
              join_date: item.join_date,
            };
          })
          .filter(Boolean);

        // Sort members: creator first, then admins, then online members, then others
        membersList.sort((a, b) => {
          if (a.role === "creator") return -1;
          if (b.role === "creator") return 1;
          if (a.role === "admin" && b.role !== "admin") return -1;
          if (a.role !== "admin" && b.role === "admin") return 1;
          if (a.online && !b.online) return -1;
          if (!a.online && b.online) return 1;
          return 0;
        });

        setMembers(membersList);

        // Update chat admin status
        if (selectedChat) {
          const isAdmin = membersList.some(
            (member) =>
              member.id === userId &&
              (member.role === "admin" || member.role === "creator")
          );
          selectedChat.isAdmin = isAdmin;
          selectedChat.canManage = isAdmin;
          selectedChat.members = membersList;
        }
      }
    } catch (error) {
      console.error("Error fetching chat members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!selectedChatId) return;

    try {
      await vkAPI.directRequest("messages.removeChatUser", {
        chat_id: selectedChatId - 2000000000,
        user_id: memberId,
      });

      // Update members list
      setMembers((prevMembers) =>
        prevMembers.filter((member) => member.id !== memberId)
      );
    } catch (error) {
      console.error("Error removing chat member:", error);
    }
  };

  const handleMakeAdmin = async (memberId: number) => {
    if (!selectedChatId) return;

    try {
      await vkAPI.directRequest("messages.setMemberRole", {
        peer_id: selectedChatId,
        member_id: memberId,
        role: "admin",
      });

      // Update members list
      setMembers((prevMembers) =>
        prevMembers.map((member) => {
          if (member.id === memberId) {
            return { ...member, role: "admin" };
          }
          return member;
        })
      );
    } catch (error) {
      console.error("Error making member admin:", error);
    }
  };

  const handleRemoveAdmin = async (memberId: number) => {
    if (!selectedChatId) return;

    try {
      await vkAPI.directRequest("messages.setMemberRole", {
        peer_id: selectedChatId,
        member_id: memberId,
        role: "member",
      });

      // Update members list
      setMembers((prevMembers) =>
        prevMembers.map((member) => {
          if (member.id === memberId) {
            return { ...member, role: "member" };
          }
          return member;
        })
      );
    } catch (error) {
      console.error("Error removing admin status:", error);
    }
  };

  const handleViewProfile = (memberId: number) => {
    window.open(`https://vk.com/id${memberId}`, "_blank");
  };

  const handleSendMessage = (memberId: number) => {
    // Implement sending a direct message to the user
    console.log("Send message to:", memberId);
  };

  const handleLeaveChat = async () => {
    if (!selectedChatId) return;

    try {
      await vkAPI.directRequest("messages.removeChatUser", {
        chat_id: selectedChatId - 2000000000,
        user_id: userId,
      });

      // Redirect to another chat or show empty state
      window.location.reload();
    } catch (error) {
      console.error("Error leaving chat:", error);
    }
  };

  const handleClearHistory = async () => {
    if (!selectedChatId) return;

    try {
      await vkAPI.directRequest("messages.deleteConversation", {
        peer_id: selectedChatId,
        group_id: 0,
      });

      // Refresh messages
      window.location.reload();
    } catch (error) {
      console.error("Error clearing chat history:", error);
    }
  };

  if (!selectedChat) {
    return null;
  }

  const showOnlineStatus = selectedChat.type === "user" && selectedChat.online;

  const sharedMedia = [
    { id: 1, type: "image", url: "https://picsum.photos/200/200?random=1" },
    { id: 2, type: "image", url: "https://picsum.photos/200/200?random=2" },
    { id: 3, type: "image", url: "https://picsum.photos/200/200?random=3" },
    { id: 4, type: "image", url: "https://picsum.photos/200/200?random=4" },
    { id: 5, type: "image", url: "https://picsum.photos/200/200?random=5" },
    { id: 6, type: "image", url: "https://picsum.photos/200/200?random=6" },
  ];

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b border-var(--color-sidebar-border) bg-[var(--color-sidebar-accent)] bg-opacity-30 backdrop-blur-sm">
        <h3 className="text-base font-medium text-[var(--color-sidebar-foreground)]">
          {t("details.title")}
        </h3>
        <button
          onClick={onClose}
          className="text-var(--color-muted-foreground) hover:text-var(--color-sidebar-foreground) p-2 rounded-full hover:bg-[var(--color-sidebar-accent)] transition-smooth hover-lift"
          aria-label={t("buttons.close")}
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center p-6 border-b border-var(--color-sidebar-border) bg-gradient-to-b from-var(--color-sidebar-accent) to-transparent bg-opacity-10">
        <div className="relative mb-4 group">
          <Avatar
            src={selectedChat.avatar}
            size="lg"
            className="border-2 border-var(--color-sidebar) transition-transform duration-300 group-hover:scale-105"
          />
          {showOnlineStatus && (
            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-var(--color-sidebar) animate-pulse"></span>
          )}
        </div>
        <h2 className="text-xl font-semibold text-var(--color-sidebar-foreground) mb-1">
          {selectedChat.title}
        </h2>
        <p className="text-sm text-var(--color-muted-foreground) flex items-center">
          {selectedChat.type === "user" ? (
            <>
              {selectedChat.online ? (
                <>
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  {t("status.online")}
                </>
              ) : (
                t("status.offline")
              )}
            </>
          ) : selectedChat.type === "chat" ? (
            <>
              <svg
                className="w-4 h-4 mr-1 text-var(--color-muted-foreground)"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {`${selectedChat.membersCount || 0} ${t("chat.members")}`}
            </>
          ) : (
            "Group"
          )}
        </p>
      </div>

      <div className="flex border-b border-var(--color-sidebar-border)">
        <button
          className={cn(
            "flex-1 py-3 text-center text-sm font-medium transition-smooth relative",
            activeTab === "info"
              ? "text-var(--color-sidebar-primary)"
              : "text-var(--color-muted-foreground) hover:text-var(--color-sidebar-foreground)"
          )}
          onClick={() => setActiveTab("info")}
        >
          {t("details.title")}
          {activeTab === "info" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-sidebar-primary)] rounded-full" />
          )}
        </button>
        {isGroupChat && (
          <button
            className={cn(
              "flex-1 py-3 text-center text-sm font-medium transition-smooth relative",
              activeTab === "members"
                ? "text-var(--color-sidebar-primary)"
                : "text-var(--color-muted-foreground) hover:text-var(--color-sidebar-foreground)"
            )}
            onClick={() => setActiveTab("members")}
          >
            {t("details.members")}
            {activeTab === "members" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-sidebar-primary)] rounded-full" />
            )}
          </button>
        )}
        <button
          className={cn(
            "flex-1 py-3 text-center text-sm font-medium transition-smooth relative",
            activeTab === "media"
              ? "text-var(--color-sidebar-primary)"
              : "text-var(--color-muted-foreground) hover:text-var(--color-sidebar-foreground)"
          )}
          onClick={() => setActiveTab("media")}
        >
          {t("details.sharedMedia")}
          {activeTab === "media" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-sidebar-primary)] rounded-full" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {activeTab === "info" && (
            <div className="p-4 space-y-4">
              <div className="bg-[var(--color-sidebar-accent)] bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                <h3 className="text-sm font-medium text-var(--color-sidebar-foreground) mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-var(--color-sidebar-primary)"
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
                  {t("details.description")}
                </h3>
                <p className="text-sm text-var(--color-sidebar-foreground) bg-[var(--color-sidebar-accent)] bg-opacity-30 p-3 rounded-lg">
                  {selectedChat.type === "chat"
                    ? t("details.noDescription")
                    : "Send messages and share media with this contact."}
                </p>
              </div>

              <div className="bg-[var(--color-sidebar-accent)] bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-var(--color-sidebar-primary) mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <span className="text-sm font-medium text-var(--color-sidebar-foreground)">
                      {t("details.notifications")}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-[var(--color-muted)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-sidebar-primary)]"></div>
                  </label>
                </div>
              </div>

              {isGroupChat && (
                <div className="space-y-2 bg-[var(--color-sidebar-accent)] bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                  <h3 className="text-sm font-medium text-var(--color-sidebar-foreground) mb-3 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-var(--color-destructive)"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    {t("details.chatActions")}
                  </h3>
                  <button
                    onClick={() => setShowLeaveConfirm(true)}
                    className="flex w-full items-center rounded-lg p-3 text-left text-sm text-var(--color-destructive) hover:bg-[var(--color-accent)] transition-smooth bg-[var(--color-sidebar-accent)] bg-opacity-30"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    {t("details.leaveChat")}
                  </button>
                  <button
                    onClick={() => setShowClearHistoryConfirm(true)}
                    className="flex w-full items-center rounded-lg p-3 text-left text-sm text-var(--color-destructive) hover:bg-[var(--color-accent)] transition-smooth bg-[var(--color-sidebar-accent)] bg-opacity-30"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    {t("details.clearHistory")}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "members" && isGroupChat && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-var(--color-sidebar-foreground) flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-var(--color-sidebar-primary)"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  {t("details.members")} ({members.length})
                </h3>
                {isCurrentUserAdmin && (
                  <button className="text-xs text-var(--color-sidebar-primary) hover:underline transition-smooth flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    {t("buttons.invite")}
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-var(--color-primary) border-t-transparent"></div>
                  <p className="text-sm text-var(--color-muted-foreground)">
                    {t("app.loading")}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 bg-[var(--color-sidebar-accent)] bg-opacity-20 rounded-xl p-2 backdrop-blur-sm">
                  {members.map((member) => (
                    <ChatMemberItem
                      key={member.id}
                      member={member}
                      isCurrentUser={member.id === userId}
                      canManage={isCurrentUserAdmin}
                      onRemoveMember={handleRemoveMember}
                      onMakeAdmin={handleMakeAdmin}
                      onRemoveAdmin={handleRemoveAdmin}
                      onViewProfile={handleViewProfile}
                      onSendMessage={handleSendMessage}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "media" && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-var(--color-sidebar-foreground) flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-var(--color-sidebar-primary)"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {t("details.sharedMedia")}
                </h3>
                <button className="text-xs text-var(--color-sidebar-primary) hover:underline transition-smooth flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                  {t("details.viewAll")}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {sharedMedia.map((media) => (
                  <div
                    key={media.id}
                    className="aspect-square rounded-lg overflow-hidden bg-[var(--color-accent)] group relative cursor-pointer transition-transform hover:scale-[1.02] duration-300"
                  >
                    <img
                      src={media.url || "/placeholder.svg"}
                      alt="Shared media"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      <ConfirmModal
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleLeaveChat}
        title={t("modals.leaveGroupTitle")}
        message={t("modals.leaveGroupMessage")}
        confirmText={t("details.leaveChat")}
        confirmVariant="destructive"
      />

      <ConfirmModal
        isOpen={showClearHistoryConfirm}
        onClose={() => setShowClearHistoryConfirm(false)}
        onConfirm={handleClearHistory}
        title={t("modals.deleteHistoryTitle")}
        message={t("modals.deleteHistoryMessage")}
        confirmText={t("buttons.delete")}
        confirmVariant="destructive"
      />
    </div>
  );
};

export default ChatDetails;
