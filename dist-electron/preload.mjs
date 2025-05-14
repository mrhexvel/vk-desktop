"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("vkApi", {
  getConversations: (accessToken) => electron.ipcRenderer.invoke("vk:getConversations", accessToken),
  execute: (accessToken, code) => electron.ipcRenderer.invoke("vk:execute", accessToken, code),
  usersGet: (accessToken, user_ids) => electron.ipcRenderer.invoke("vk:users.get", accessToken, user_ids),
  groupsGetById: (accessToken, group_id) => electron.ipcRenderer.invoke("vk:groups.getById", accessToken, group_id)
});
