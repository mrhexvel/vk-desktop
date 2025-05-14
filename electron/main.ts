import axios from "axios";
import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VK_API_URL = "https://api.vk.com/method";

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
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

ipcMain.handle("vk:getConversations", async (event, accessToken: string) => {
  try {
    const response = await axios.get(
      `${VK_API_URL}/messages.getConversations`,
      {
        params: {
          access_token: accessToken,
          v: "5.131",
          extended: 1,
          fields: "photo_100",
        },
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error.error_msg);
    }

    return response.data.response;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
});

ipcMain.handle(
  "vk:execute",
  async (event, accessToken: string, code: string) => {
    try {
      const response = await axios.get(`${VK_API_URL}/execute`, {
        params: { access_token: accessToken, v: "5.131", code },
      });

      if (response.data.error) {
        throw new Error(response.data.error.error_msg);
      }

      return response.data.response;
    } catch (error) {
      console.error("Error execute request:", error);
      throw error;
    }
  }
);

ipcMain.handle(
  "vk:users.get",
  async (event, accessToken: string, user_ids?: string) => {
    try {
      const response = await axios.get(`${VK_API_URL}/users.get`, {
        params: {
          access_token: accessToken,
          v: "5.131",
          user_ids,
          fields: "photo_100,online,sex,screen_name,online_info",
        },
      });

      if (response.data.error) {
        throw new Error(response.data.error.error_msg);
      }

      return response.data.response;
    } catch (error) {
      console.error("Error execute request:", error);
      throw error;
    }
  }
);

app.whenReady().then(() => {
  createWindow();
});
