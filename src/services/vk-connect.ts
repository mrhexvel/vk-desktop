declare global {
  interface Window {
    vkBridge: {
      send: (method: string, params?: any) => Promise<any>
      subscribe: (callback: (event: any) => void) => void
      unsubscribe: (callback: (event: any) => void) => void
      supports: (method: string) => boolean
      supportsAsync: (method: string) => Promise<{ supported: boolean }>
      isWebView: () => boolean
      isIframe: () => boolean
      isEmbedded: () => boolean
      isStandalone: () => boolean
    }
  }
}

export function loadVKConnect(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.vkBridge) {
      console.log("VK Bridge already loaded")
      resolve()
      return
    }

    console.log("Loading VK Bridge script...")
    const script = document.createElement("script")
    script.src = "https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js"
    script.async = true
    script.onload = () => {
      console.log("VK Bridge script loaded")
      try {
        window.vkBridge.send("VKWebAppInit", {})
        console.log("VK Bridge initialized")
        resolve()
      } catch (error) {
        console.error("Error initializing VK Bridge:", error)
        reject(error)
      }
    }
    script.onerror = (error) => {
      console.error("Error loading VK Bridge script:", error)
      reject(error)
    }

    document.head.appendChild(script)
  })
}

export async function isMethodSupported(method: string): Promise<boolean> {
  if (!window.vkBridge) {
    return false
  }

  try {
    const result = await window.vkBridge.supportsAsync(method)
    return result.supported
  } catch (error) {
    console.error(`Error checking support for ${method}:`, error)
    return false
  }
}

export async function authWithVKID(appId: string): Promise<any> {
  if (!window.vkBridge) {
    throw new Error("VK Bridge not loaded")
  }

  try {
    const isSupported = await isMethodSupported("VKWebAppGetAuthToken")
    if (!isSupported) {
      throw new Error("VKWebAppGetAuthToken is not supported")
    }

    const authData = await window.vkBridge.send("VKWebAppGetAuthToken", {
      app_id: Number(appId),
      scope: "friends,photos,email,phone,groups,wall,offline",
    })

    return authData
  } catch (error) {
    console.error("Error during VK ID auth:", error)
    throw error
  }
}

export async function getUserInfo(): Promise<any> {
  if (!window.vkBridge) {
    throw new Error("VK Bridge not loaded")
  }

  try {
    const isSupported = await isMethodSupported("VKWebAppGetUserInfo")
    if (!isSupported) {
      throw new Error("VKWebAppGetUserInfo is not supported")
    }

    const userInfo = await window.vkBridge.send("VKWebAppGetUserInfo", {})
    return userInfo
  } catch (error) {
    console.error("Error getting user info:", error)
    throw error
  }
}

export async function checkVKBridgeSupport(): Promise<{
  isWebView: boolean
  isIframe: boolean
  isEmbedded: boolean
  isStandalone: boolean
  supportedMethods: string[]
}> {
  if (!window.vkBridge) {
    throw new Error("VK Bridge not loaded")
  }

  const isWebView = window.vkBridge.isWebView()
  const isIframe = window.vkBridge.isIframe()
  const isEmbedded = window.vkBridge.isEmbedded()
  const isStandalone = window.vkBridge.isStandalone()

  const methods = [
    "VKWebAppInit",
    "VKWebAppGetAuthToken",
    "VKWebAppGetUserInfo",
    "VKWebAppShowWallPostBox",
    "VKWebAppGetEmail",
    "VKWebAppGetPhoneNumber",
    "VKWebAppGetClientVersion",
    "VKWebAppOpenApp",
  ]

  const supportPromises = methods.map(async (method) => {
    const isSupported = await isMethodSupported(method)
    return { method, supported: isSupported }
  })

  const supportResults = await Promise.all(supportPromises)
  const supportedMethods = supportResults.filter((r) => r.supported).map((r) => r.method)

  return {
    isWebView,
    isIframe,
    isEmbedded,
    isStandalone,
    supportedMethods,
  }
}
