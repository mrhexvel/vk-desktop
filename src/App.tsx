import type React from "react";
import { useEffect } from "react";
import AuthScreen from "./components/Auth/AuthScreen";
import MainLayout from "./components/Layout/MainLayout";
import { useTranslation } from "./hooks/useTranslation";
import { initLongPoll } from "./services/longpoll";
import {
  getStickerConfigs,
  initStickerService,
} from "./services/sticker-service";
import { vkAPI } from "./services/vk-api-service";
import { useAuthStore } from "./store/authStore";

const App: React.FC = () => {
  const { accessToken, loading, error } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (accessToken) {
      vkAPI.clearCache();

      initLongPoll();

      initStickerService(accessToken).catch((err) => {
        console.error("Failed to initialize sticker service:", err);
      });

      getStickerConfigs(accessToken)
        .then((configs) => {
          console.log("Sticker configs loaded:", configs);
        })
        .catch((err) => {
          console.error("Failed to load sticker configs:", err);
        });
    }
  }, [accessToken]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#121218] vk-pattern-bg">
        <div className="flex flex-col items-center animate-fade-in">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-var(--color-primary) border-t-transparent"></div>
          <p className="mt-4 text-var(--color-muted-foreground)">
            {t("app.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#121218] vk-pattern-bg">
        <div className="text-center text-var(--color-muted-foreground) animate-fade-in">
          <p className="text-lg">
            {t("app.error")}: {error}
          </p>
        </div>
      </div>
    );
  }

  return accessToken ? <MainLayout /> : <AuthScreen />;
};

export default App;
