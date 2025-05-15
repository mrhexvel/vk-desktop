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

  getHistory: (accessToken: string, peer_id: number) =>
    ipcRenderer.invoke("vk:messages.getHistory", accessToken, peer_id),

  getMessagesById: (accessToken: string, message_id: number) =>
    ipcRenderer.invoke("vk:messages.getById", accessToken, message_id),

  getLongPollServer: (accessToken: string) =>
    ipcRenderer.invoke("vk:messages.getLongPollServer", accessToken),

  startLongPolling: (accessToken: string) =>
    ipcRenderer.invoke("vk:startLongPolling", accessToken),

  stopLongPolling: () => ipcRenderer.invoke("vk:stopLongPolling"),

  setActiveConversation: (conversationId: number | null) =>
    ipcRenderer.invoke("vk:setActiveConversation", conversationId),

  onNewMessage: (callback: (data: any) => void) => {
    const listener = (_event: any, data: any) => {
      callback(data);
    };
    ipcRenderer.on("vk:newMessage", listener);
    return () => ipcRenderer.removeListener("vk:newMessage", listener);
  },

  onUpdateConversations: (callback: () => void) => {
    const listener = () => {
      callback();
    };
    ipcRenderer.on("vk:updateConversations", listener);
    return () => ipcRenderer.removeListener("vk:updateConversations", listener);
  },

  onUpdateMessageHistory: (callback: (peerId: number) => void) => {
    const listener = (_event: any, peerId: number) => {
      callback(peerId);
    };
    ipcRenderer.on("vk:updateMessageHistory", listener);
    return () =>
      ipcRenderer.removeListener("vk:updateMessageHistory", listener);
  },

  onTyping: (callback: (data: { userId: number; peerId: number }) => void) => {
    const listener = (_event: any, data: { userId: number; peerId: number }) =>
      callback(data);
    ipcRenderer.on("vk:typing", listener);
    return () => ipcRenderer.removeListener("vk:typing", listener);
  },
});
