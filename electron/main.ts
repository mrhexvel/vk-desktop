import { app, BrowserWindow, ipcMain, Notification, session } from "electron";
import Store from "electron-store";
import { release } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchWithAuth, VKAPIError } from "./shared/api-types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

if (release().startsWith("6.1")) app.disableHardwareAcceleration();

if (process.platform === "win32") app.setAppUserModelId(app.getName());

const store = new Store();

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

let win: BrowserWindow | null = null;
let authWindow: BrowserWindow | null = null;

interface SessionUserInfo {
  firstName: string;
  lastName: string;
  photoUrl: string;
}

interface SessionUser {
  access_token: string;
  user_id: number;
  userInfo: SessionUserInfo;
}

const VK_REDIRECT_URI = "https://oauth.vk.com/blank.html";

function createWindow() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vk.com https://id.vk.com https://unpkg.com",
        ],
      },
    });
  });

  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "vk-logo.svg"),
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      webSecurity: false,
      nodeIntegration: false,
    },
    frame: false,
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.webContents.openDevTools();
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

function handleOAuthCallback(url: string) {
  if (win) {
    win.webContents.send("oauth-callback", url);
  }

  if (authWindow) {
    authWindow.close();
    authWindow = null;
  }
}

ipcMain.handle("get-auth-session", () => {
  return store.get("authSession", null);
});

ipcMain.handle("set-auth-session", (_, sessionData) => {
  store.set("authSession", sessionData);
  return true;
});

ipcMain.handle("clear-auth-session", () => {
  store.delete("authSession");
  return true;
});

ipcMain.handle("open-oauth-window", (_, url) => {
  if (authWindow) {
    authWindow.focus();
    return true;
  }

  authWindow = new BrowserWindow({
    width: 800,
    height: 600,
    parent: win || undefined,
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  authWindow.loadURL(url);

  authWindow.once("ready-to-show", () => {
    authWindow?.show();
  });

  authWindow.webContents.on("will-navigate", (e, navigationUrl) => {
    if (navigationUrl.startsWith(VK_REDIRECT_URI)) {
      e.preventDefault();
      handleOAuthCallback(navigationUrl);
    }
  });

  authWindow.webContents.setWindowOpenHandler(({ url: openUrl }) => {
    if (openUrl.startsWith(VK_REDIRECT_URI)) {
      handleOAuthCallback(openUrl);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  authWindow.on("closed", () => {
    authWindow = null;
  });

  return true;
});

ipcMain.handle(
  "vk-api-request",
  async (_, method: string, params: Record<string, string>) => {
    try {
      const session = store.get("authSession") as SessionUser;
      if (!session) {
        throw new VKAPIError("Session not found", 401);
      }

      const result = await fetchWithAuth(method, params, session.access_token);
      return result;
    } catch (error) {
      console.error("VK API request error:", error);
      throw error;
    }
  }
);

ipcMain.handle("show-notification", (_, title: string, body: string) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      icon: path.join(process.env.DIST!, "favicon.ico"),
    });
    notification.show();
    return true;
  }
  return false;
});
