import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("vkApi", {
  getConversations: (accessToken: string) =>
    ipcRenderer.invoke("vk:getConversations", accessToken),

  execute: (accessToken: string, code: string) =>
    ipcRenderer.invoke("vk:execute", accessToken, code),

  usersGet: (accessToken: string, user_ids?: string) =>
    ipcRenderer.invoke("vk:users.get", accessToken, user_ids),

  groupsGetById: (accessToken: string, group_id: number) =>
    ipcRenderer.invoke("vk:groups.getById", accessToken, group_id),
});
