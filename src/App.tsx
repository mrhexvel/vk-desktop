import React, { useEffect } from "react";
import Loader from "./components/Loader";
import { ModernMessenger } from "./components/ModernMessenger";
import { useConversationsStore } from "./store/useConversationsStore";
import { useUserStore } from "./store/userStore";

const App: React.FC = () => {
  const isUserLoading = useUserStore((state) => state.isLoading);
  const fetchUser = useUserStore((state) => state.fetchUser);

  const isConversationsLoading = useConversationsStore(
    (state) => state.isLoading
  );
  const conversations = useConversationsStore((state) => state.conversations);
  const fetchConversations = useConversationsStore(
    (state) => state.fetchConversations
  );

  useEffect(() => {
    fetchUser();
    fetchConversations();
  }, [fetchUser, fetchConversations]);

  if ((isUserLoading || isConversationsLoading) && !conversations) {
    return <Loader />;
  }

  return <ModernMessenger />;
};

export default App;
