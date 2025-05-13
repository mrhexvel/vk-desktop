"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  vkApiRequest: (method, params) => electron.ipcRenderer.invoke("vk-api-request", method, params),
  startLongPoll: (token) => electron.ipcRenderer.send("start-longpoll", token),
  onLongPollUpdate: (callback) => electron.ipcRenderer.on("longpoll-update", (event, update) => callback(update))
});
