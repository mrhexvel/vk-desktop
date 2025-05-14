import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("vkApi", {
  getConversations: (accessToken: string) =>
    ipcRenderer.invoke("vk:getConversations", accessToken),
});
