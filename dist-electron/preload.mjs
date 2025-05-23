"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  getAuthSession: () => electron.ipcRenderer.invoke("get-auth-session"),
  setAuthSession: (session) => electron.ipcRenderer.invoke("set-auth-session", session),
  clearAuthSession: () => electron.ipcRenderer.invoke("clear-auth-session"),
  callVKAPI: (method, params) => electron.ipcRenderer.invoke("vk-api-request", method, params),
  showNotification: (title, body) => electron.ipcRenderer.invoke("show-notification", title, body),
  openOAuthWindow: (url) => electron.ipcRenderer.invoke("open-oauth-window", url),
  onOAuthCallback: (callback) => {
    const listener = (_, url) => callback(url);
    electron.ipcRenderer.on("oauth-callback", listener);
    return () => electron.ipcRenderer.removeListener("oauth-callback", listener);
  }
});
