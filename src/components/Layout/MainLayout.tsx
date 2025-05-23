"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useChatsStore } from "../../store/chatsStore";
import ChatDetails from "../Chat/ChatDetails";
import ChatWindow from "../Chat/ChatWindow";
import Sidebar from "../Sidebar/Sidebar";

const MainLayout: React.FC = () => {
  const { fetchChats, selectedChatId } = useChatsStore();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchChats();

    const interval = setInterval(() => {
      fetchChats();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchChats]);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121218] animate-fade-in">
      <div className="w-80 flex-shrink-0 overflow-hidden bg-[var(--color-sidebar)] glass-effect">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-hidden bg-[#121218] vk-pattern-bg">
        <ChatWindow showDetails={showDetails} toggleDetails={toggleDetails} />
      </div>

      {selectedChatId && showDetails && (
        <div className="w-80 flex-shrink-0 overflow-hidden bg-[var(--color-sidebar)] glass-effect animate-slide-in-right">
          <ChatDetails onClose={() => setShowDetails(false)} />
        </div>
      )}
    </div>
  );
};

export default MainLayout;
