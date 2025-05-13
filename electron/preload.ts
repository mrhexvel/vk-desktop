import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  vkApiRequest: (method: string, params: Record<string, unknown>) =>
    ipcRenderer.invoke("vk-api-request", method, params),

  startLongPoll: (token: string) => ipcRenderer.send("start-longpoll", token),

  onLongPollUpdate: (callback: (update: unknown) => void) =>
    ipcRenderer.on("longpoll-update", (event, update) => callback(update)),
});
