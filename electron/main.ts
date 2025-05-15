import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import axios from "axios";
import { API_URL } from "./constants/api.constants";
import "./ipc";

createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;
let longPollActive = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let longPollServer: any = null;
let activeConversationId: number | null = null;

// нада сделать дедупликации сообщений
const processedMessages = new Set<string>();
const MESSAGE_CACHE_TIMEOUT = 5000;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "vk-logo.svg"),
    height: 900,
    width: 1300,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
    },
    frame: false,
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

const pendingUpdates = {
  newMessages: new Set<number>(),
  editedMessages: new Set<number>(),
  readMessages: new Set<number>(),
  typingUsers: new Map<number, Set<number>>(),
  updateConversations: false,
  updateHistory: new Set<number>(),
};

let updateTimeout: NodeJS.Timeout | null = null;
const UPDATE_DELAY = 300;

function scheduleUpdates() {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  updateTimeout = setTimeout(() => {
    processUpdates();
    updateTimeout = null;
  }, UPDATE_DELAY);
}

function processUpdates() {
  if (!win) return;

  if (pendingUpdates.updateHistory.size > 0) {
    for (const peerId of pendingUpdates.updateHistory) {
      win.webContents.send("vk:updateMessageHistory", peerId);
    }
    pendingUpdates.updateHistory.clear();
  }

  if (pendingUpdates.updateConversations) {
    win.webContents.send("vk:updateConversations");
    pendingUpdates.updateConversations = false;
  }

  if (pendingUpdates.typingUsers.size > 0) {
    for (const [peerId, userIds] of pendingUpdates.typingUsers.entries()) {
      for (const userId of userIds) {
        win.webContents.send("vk:typing", { userId, peerId });
      }
    }
    pendingUpdates.typingUsers.clear();
  }

  if (pendingUpdates.newMessages.size > 0) {
    pendingUpdates.newMessages.clear();
  }
  pendingUpdates.editedMessages.clear();
  pendingUpdates.readMessages.clear();
}

function isMessageProcessed(messageId: number, peerId: number): boolean {
  const key = `${messageId}_${peerId}`;
  if (processedMessages.has(key)) {
    return true;
  }

  processedMessages.add(key);

  setTimeout(() => {
    processedMessages.delete(key);
  }, MESSAGE_CACHE_TIMEOUT);

  return false;
}

async function getLongPollServer(accessToken: string) {
  try {
    const response = await axios.get(`${API_URL}/messages.getLongPollServer`, {
      params: {
        access_token: accessToken,
        v: "5.131",
        lp_version: 10,
        need_pts: 1,
      },
    });

    if (response.data.error) {
      throw new Error(response.data.error.error_msg);
    }

    return response.data.response;
  } catch (error) {
    console.error("Error getting Long Poll server:", error);
    throw error;
  }
}

async function startLongPolling(accessToken: string) {
  if (longPollActive) return;

  try {
    longPollServer = await getLongPollServer(accessToken);
    longPollActive = true;
    poll(accessToken);
  } catch (error) {
    console.error("Failed to start Long Polling:", error);
  }
}

async function poll(accessToken: string) {
  if (!longPollActive || !longPollServer || !win) return;

  try {
    const { server, key, ts } = longPollServer;

    const response = await axios.get(`https://${server}`, {
      params: {
        act: "a_check",
        key,
        ts,
        wait: 25,
        mode: 2,
        version: 10,
      },
    });

    if (response.data.failed) {
      await handleFailure(response.data.failed, accessToken);
    } else {
      longPollServer.ts = response.data.ts;
      await handleUpdates(response.data.updates, accessToken);
    }

    if (longPollActive) {
      poll(accessToken);
    }
  } catch (error) {
    console.error("Long Polling error:", error);

    setTimeout(() => {
      if (longPollActive) {
        startLongPolling(accessToken);
      }
    }, 3000);
  }
}

async function handleFailure(failCode: number, accessToken: string) {
  switch (failCode) {
    case 1:
      if (longPollServer) {
        longPollServer = await getLongPollServer(accessToken);
      }
      break;
    case 2:
    case 3:
      longPollServer = await getLongPollServer(accessToken);
      break;
    default:
      throw new Error(`Unknown Long Polling error: ${failCode}`);
  }
}

async function handleUpdates(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updates: Array<[number, ...any[]]>,
  accessToken: string
) {
  if (!win) return;

  let hasUpdates = false;
  let hasNewMessages = false;
  let hasConversationUpdates = false;

  for (const update of updates) {
    const [eventType, ...eventData] = update;

    switch (eventType) {
      case 4:
        if (handleNewMessage(eventData)) {
          hasUpdates = true;
          hasNewMessages = true;
          hasConversationUpdates = true;
        }
        break;
      case 5:
        await handleEditMessage(eventData, accessToken);
        if (handleNewMessage(eventData)) {
          hasUpdates = true;
          hasNewMessages = true;
          hasConversationUpdates = true;
        }
        break;
      case 6:
      case 7:
        await handleReadMessages(eventData, eventType, accessToken);
        if (handleNewMessage(eventData)) {
          hasUpdates = true;
          hasNewMessages = true;
          hasConversationUpdates = true;
        }
        break;
      case 13:
        handleTyping(eventData);
        if (handleNewMessage(eventData)) {
          hasUpdates = true;
          hasNewMessages = true;
          hasConversationUpdates = true;
        }
        break;
    }
  }

  if (hasNewMessages || hasConversationUpdates) {
    processUpdatesImmediately(hasNewMessages, hasConversationUpdates);
  }

  if (hasUpdates) {
    scheduleUpdates();
  }
}

function processUpdatesImmediately(
  hasNewMessages: boolean,
  hasConversationUpdates: boolean
) {
  if (!win) return;

  if (hasConversationUpdates) {
    win.webContents.send("vk:updateConversations");
  }

  if (
    hasNewMessages &&
    activeConversationId &&
    pendingUpdates.updateHistory.has(activeConversationId)
  ) {
    win.webContents.send("vk:updateMessageHistory", activeConversationId);
    pendingUpdates.updateHistory.delete(activeConversationId);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleNewMessage(eventData: any[]): boolean {
  const messageId = eventData[0];
  const flags = eventData[1];
  const peerId = eventData[3];

  if (isMessageProcessed(messageId, peerId)) {
    return false;
  }

  const isOutgoing = !!(flags & 2);

  pendingUpdates.newMessages.add(messageId);
  pendingUpdates.updateConversations = true;

  if (activeConversationId === peerId) {
    pendingUpdates.updateHistory.add(peerId);
  }

  if (win) {
    win.webContents.send("vk:newMessage", { peerId, messageId, isOutgoing });
  }

  return true;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
async function handleEditMessage(eventData: any[], _accessToken: string) {
  const messageId = eventData[0];
  const peerId = eventData[3];

  pendingUpdates.editedMessages.add(messageId);

  if (activeConversationId === peerId) {
    pendingUpdates.updateHistory.add(peerId);
  }
}

async function handleReadMessages(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventData: any[],
  _eventType: number,
  _accessToken: string
) {
  const peerId = eventData[0];
  const messageId = eventData[1];

  pendingUpdates.readMessages.add(messageId);
  pendingUpdates.updateConversations = true;

  return true;
}

function handleTyping(eventData: any[]) {
  const userId = eventData[0];
  const peerId = eventData[1];

  if (!pendingUpdates.typingUsers.has(peerId)) {
    pendingUpdates.typingUsers.set(peerId, new Set());
  }
  pendingUpdates.typingUsers.get(peerId)!.add(userId);

  return true;
}

ipcMain.handle("vk:startLongPolling", async (_, accessToken: string) => {
  return await startLongPolling(accessToken);
});

ipcMain.handle("vk:stopLongPolling", () => {
  longPollActive = false;
  longPollServer = null;
  return true;
});

ipcMain.handle(
  "vk:setActiveConversation",
  (_, conversationId: number | null) => {
    activeConversationId = conversationId;
    return true;
  }
);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  createWindow();
});
