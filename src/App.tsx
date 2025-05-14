import React, { useEffect } from "react";
import { ModernMessenger } from "./components/ModernMessenger";
import { useUserStore } from "./store/userStore";

const App: React.FC = () => {
  const fetchUser = useUserStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <ModernMessenger />;
};

export default App;
