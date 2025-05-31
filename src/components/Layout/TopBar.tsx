import { useAuthStore } from "@/store/authStore";
import { useChatsStore } from "@/store/chatsStore";
import type React from "react";
import Avatar from "../UI/Avatar";

const TopBar: React.FC = () => {
  const { userInfo, logout } = useAuthStore();
  const { selectedChatId, chats } = useChatsStore();

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  return (
    <div className="flex h-14 items-center justify-between bg-purple-800 px-4">
      <div className="flex items-center">
        {selectedChat && (
          <>
            <Avatar
              src={selectedChat.avatar}
              online={selectedChat.online}
              size="md"
              className="mr-3"
            />
            <div>
              <h2 className="text-lg font-medium text-white">
                {selectedChat.title}
              </h2>
              <p className="text-xs text-purple-200">
                {selectedChat.online ? "в сети" : "не в сети"}
                {selectedChat.type === "chat" &&
                  selectedChat.membersCount &&
                  ` • ${selectedChat.membersCount} участников`}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <button className="rounded-full text-white hover:bg-purple-700 p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        </button>

        <button className="rounded-full text-white hover:bg-purple-700 p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
          </svg>
        </button>

        {userInfo && (
          <div className="relative group">
            <Avatar
              src={userInfo.photoUrl}
              size="sm"
              className="cursor-pointer"
            />

            <div className="absolute right-0 top-full z-10 mt-2 hidden w-48 origin-top-right rounded-md bg-purple-800 shadow-lg ring-1 ring-black ring-opacity-5 transition group-hover:block">
              <div className="py-1">
                <div className="border-b border-purple-700 px-4 py-2">
                  <p className="text-sm font-medium text-white">
                    {userInfo.firstName} {userInfo.lastName}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-purple-700"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
