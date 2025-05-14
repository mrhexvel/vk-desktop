"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("vkApi", {
  getConversations: (accessToken) => electron.ipcRenderer.invoke("vk:getConversations", accessToken)
});
