import React, { useEffect, useState } from "react";
import Loader from "./components/Loader";
import { ModernMessenger } from "./components/ModernMessenger";
import { useUserStore } from "./store/userStore";

const App: React.FC = () => {
  const isLoading = useUserStore((state) => state.isLoading);
  const fetchUser = useUserStore((state) => state.fetchUser);
  const [isMinTimeElapsed, setIsMinTimeElapsed] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinTimeElapsed(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !isMinTimeElapsed) {
    return <Loader />;
  }

  return <ModernMessenger />;
};

export default App;
