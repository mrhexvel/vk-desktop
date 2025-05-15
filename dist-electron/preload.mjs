"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("vkApi", {
  getConversations: (accessToken) => electron.ipcRenderer.invoke("vk:getConversations", accessToken),
  execute: (accessToken, code) => electron.ipcRenderer.invoke("vk:execute", accessToken, code),
  usersGet: (accessToken, user_ids) => electron.ipcRenderer.invoke("vk:users.get", accessToken, user_ids),
  groupsGetById: (accessToken, group_id) => electron.ipcRenderer.invoke("vk:groups.getById", accessToken, group_id),
  getHistory: (accessToken, peer_id) => electron.ipcRenderer.invoke("vk:messages.getHistory", accessToken, peer_id),
  getMessagesById: (accessToken, message_id) => electron.ipcRenderer.invoke("vk:messages.getById", accessToken, message_id),
  getLongPollServer: (accessToken) => electron.ipcRenderer.invoke("vk:messages.getLongPollServer", accessToken),
  startLongPolling: (accessToken) => electron.ipcRenderer.invoke("vk:startLongPolling", accessToken),
  stopLongPolling: () => electron.ipcRenderer.invoke("vk:stopLongPolling"),
  setActiveConversation: (conversationId) => electron.ipcRenderer.invoke("vk:setActiveConversation", conversationId),
  onNewMessage: (callback) => {
    const listener = (_event, data) => {
      callback(data);
    };
    electron.ipcRenderer.on("vk:newMessage", listener);
    return () => electron.ipcRenderer.removeListener("vk:newMessage", listener);
  },
  onUpdateConversations: (callback) => {
    const listener = () => {
      callback();
    };
    electron.ipcRenderer.on("vk:updateConversations", listener);
    return () => electron.ipcRenderer.removeListener("vk:updateConversations", listener);
  },
  onUpdateMessageHistory: (callback) => {
    const listener = (_event, peerId) => {
      callback(peerId);
    };
    electron.ipcRenderer.on("vk:updateMessageHistory", listener);
    return () => electron.ipcRenderer.removeListener("vk:updateMessageHistory", listener);
  },
  onTyping: (callback) => {
    const listener = (_event, data) => callback(data);
    electron.ipcRenderer.on("vk:typing", listener);
    return () => electron.ipcRenderer.removeListener("vk:typing", listener);
  }
});
