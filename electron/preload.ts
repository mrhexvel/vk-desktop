/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getAuthSession: () => ipcRenderer.invoke("get-auth-session"),
  setAuthSession: (session: any) =>
    ipcRenderer.invoke("set-auth-session", session),
  clearAuthSession: () => ipcRenderer.invoke("clear-auth-session"),

  callVKAPI: (method: string, params: Record<string, any>) =>
    ipcRenderer.invoke("vk-api-request", method, params),

  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke("show-notification", title, body),

  openOAuthWindow: (url: string) =>
    ipcRenderer.invoke("open-oauth-window", url),
  onOAuthCallback: (callback: (url: string) => void) => {
    const listener = (_: any, url: string) => callback(url);
    ipcRenderer.on("oauth-callback", listener);
    return () => ipcRenderer.removeListener("oauth-callback", listener);
  },
});
