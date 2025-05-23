// @ts-nocheck
import { create } from "zustand";
import {
  checkAccessPermissions,
  createOAuthUrl,
  fetchUserInfo,
  MESSENGER_APP_ID,
  MESSENGER_APP_SCOPE,
  parseOAuthResult,
} from "../services/vk-oauth";
import type { AuthState } from "../types/user";

const VK_APP_ID = MESSENGER_APP_ID;
const VK_REDIRECT_URI = "https://oauth.vk.com/blank.html";

export const useAuthStore = create<AuthState>((set, get) => {
  if (typeof window !== "undefined" && window.api?.onOAuthCallback) {
    window.api.onOAuthCallback(async (url) => {
      try {
        await get().handleOAuthCallback(url);
      } catch (error) {
        console.error("Error handling OAuth callback:", error);
        set({
          error:
            error instanceof Error ? error.message : "Authentication failed",
          loading: false,
        });
      }
    });
  }

  if (typeof window !== "undefined" && window.api?.getAuthSession) {
    window.api
      .getAuthSession()
      .then((session) => {
        if (session) {
          set({
            accessToken: session.access_token,
            userId: session.user_id,
            userInfo: session.userInfo,
          });

          get().checkPermissions().catch(console.error);
        }
      })
      .catch(console.error);
  }

  return {
    accessToken: null,
    userId: null,
    userInfo: null,
    loading: false,
    error: null,
    grantedPermissions: [],

    loginWithVKID: async () => {
      if (!window.api?.openOAuthWindow) {
        set({
          error: "OAuth functionality not available",
          loading: false,
        });
        return;
      }

      set({ loading: true, error: null });

      try {
        console.log("Starting VK OAuth login process with full permissions");

        const oauthUrl = createOAuthUrl({
          clientId: VK_APP_ID,
          redirectUri: VK_REDIRECT_URI,
          scope: MESSENGER_APP_SCOPE,
          responseType: "token",
          display: "popup",
          revoke: 1,
        });

        console.log("Opening OAuth window with URL:", oauthUrl);
        console.log("Requesting scope:", MESSENGER_APP_SCOPE);

        await window.api.openOAuthWindow(oauthUrl);
      } catch (error) {
        console.error("Error during VK OAuth login:", error);
        set({
          error:
            error instanceof Error ? error.message : "Authentication failed",
          loading: false,
        });
      }
    },

    handleOAuthCallback: async (url: string) => {
      try {
        console.log("Handling OAuth callback:", url);

        const authResult = parseOAuthResult(url);
        if (!authResult) {
          throw new Error("Failed to parse OAuth result");
        }

        console.log("OAuth result:", authResult);

        const userInfo = await fetchUserInfo(
          authResult.accessToken,
          authResult.userId
        );
        console.log("User info:", userInfo);

        const permissions = await checkAccessPermissions(
          authResult.accessToken
        );
        console.log("Granted permissions:", permissions);

        const sessionData = {
          access_token: authResult.accessToken,
          user_id: authResult.userId,
          userInfo: {
            firstName: userInfo.first_name,
            lastName: userInfo.last_name,
            photoUrl: userInfo.photo_200,
          },
        };

        if (window.api?.setAuthSession) {
          await window.api.setAuthSession(sessionData);
        }

        set({
          accessToken: authResult.accessToken,
          userId: authResult.userId,
          userInfo: {
            firstName: userInfo.first_name,
            lastName: userInfo.last_name,
            photoUrl: userInfo.photo_200,
          },
          loading: false,
          error: null,
          grantedPermissions: permissions,
        });
      } catch (error) {
        console.error("Error handling OAuth callback:", error);
        set({
          error:
            error instanceof Error ? error.message : "Authentication failed",
          loading: false,
        });
      }
    },

    logout: async () => {
      set({ loading: true });

      try {
        if (window.api?.clearAuthSession) {
          await window.api.clearAuthSession();
        }

        set({
          accessToken: null,
          userId: null,
          userInfo: null,
          error: null,
          loading: false,
          grantedPermissions: [],
        });
      } catch (error) {
        console.error("Error during logout:", error);
        set({
          error: error instanceof Error ? error.message : "Logout failed",
          loading: false,
        });
      }
    },

    clearError: () => {
      set({ error: null });
    },

    checkPermissions: async () => {
      const { accessToken } = get();
      if (!accessToken) {
        return false;
      }

      try {
        const permissions = await checkAccessPermissions(accessToken);
        console.log("Current permissions:", permissions);

        set({ grantedPermissions: permissions });
        return true;
      } catch (error) {
        console.error("Error checking permissions:", error);
        return false;
      }
    },
  };
});
