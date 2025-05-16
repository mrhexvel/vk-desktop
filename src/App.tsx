import React, { useEffect, useState } from "react";
import Loader from "./components/Loader";
import { ModernMessenger } from "./components/ModernMessenger";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { useConversationsStore } from "./store/useConversationsStore";
import { useUserStore } from "./store/userStore";

const App: React.FC = () => {
  const isUserLoading = useUserStore((state) => state.isLoading);
  const fetchUser = useUserStore((state) => state.fetchUser);

  const token = localStorage.getItem("access-token");
  const [inputToken, setInputToken] = useState<string>("");

  const isConversationsLoading = useConversationsStore((state) => state.isLoading);
  const conversations = useConversationsStore((state) => state.conversations);
  const fetchConversations = useConversationsStore((state) => state.fetchConversations);

  useEffect(() => {
    if (token) {
        fetchUser();
        fetchConversations();
    }
  }, [fetchUser, fetchConversations, token]);

  const handleSaveToken = () => {
    localStorage.setItem("access-token", inputToken);
    setInputToken("")
    window.location.reload()
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-screen text-white">
        <Input
          type="text"
          placeholder="Введите токен"
          value={inputToken}
          onChange={(e) => setInputToken(e.target.value)}
          className="w-64"
        />
        <Button
          onClick={handleSaveToken}
          className="cursor-pointer"
        >
          Сохранить
        </Button>
      </div>
    );
  }

  if ((isUserLoading || isConversationsLoading) && !conversations) {
    return <Loader />;
  }

  return <ModernMessenger />;
};

export default App;
