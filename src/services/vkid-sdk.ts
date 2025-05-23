declare global {
  interface Window {
    VK: {
      Auth: {
        login: (callback: (data: VKIDAuthResponse) => void, options?: VKIDAuthOptions) => void
        logout: (callback: () => void) => void
        getSession: () => VKIDAuthResponse | null
        getAccessToken: () => string | null
      }
      Widgets: {
        Auth: (element_id: string, options?: VKIDWidgetOptions) => void
      }
      init: (options: VKIDInitOptions) => void
      UI: {
        button: (element_id: string) => void
      }
      id: string
    }
  }
}

export interface VKIDInitOptions {
  apiId: number | string
}

export interface VKIDWidgetOptions {
  onAuth?: (user: any) => void
  width?: number | string
  authUrl?: string
}

export interface VKIDAuthOptions {
  authUrl?: string
  appId?: number
  redirectUrl?: string
  scope?: string
}

export interface VKIDAuthResponse {
  session: {
    mid: number
    sid: string
    secret: string
    expire: number
    sig: string
    access_token: string
    user: {
      id: number
      first_name: string
      last_name: string
      photo: string
    }
  }
  status: "connected" | "not_authorized" | "unknown"
}

export function loadVKIDScript(appId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.VK) {
      console.log("VK SDK already loaded, initializing...")
      try {
        window.VK.init({ apiId: appId })
        console.log("VK SDK initialized successfully")
        resolve()
      } catch (error) {
        console.error("Error initializing VK SDK:", error)
        reject(error)
      }
      return
    }

    console.log("Loading VK SDK script...")
    const script = document.createElement("script")
    script.src = "https://vk.com/js/api/openapi.js?169"
    script.async = true
    script.onload = () => {
      console.log("VK SDK script loaded, initializing...")
      try {
        if (!window.VK) {
          throw new Error("VK SDK not available after script load")
        }
        window.VK.init({ apiId: appId })
        console.log("VK SDK initialized successfully")
        resolve()
      } catch (error) {
        console.error("Error initializing VK SDK:", error)
        reject(error)
      }
    }
    script.onerror = (error) => {
      console.error("Error loading VK SDK script:", error)
      reject(error)
    }

    document.head.appendChild(script)
  })
}

export function loginWithVKID(options?: VKIDAuthOptions): Promise<VKIDAuthResponse> {
  return new Promise((resolve, reject) => {
    if (!window.VK) {
      reject(new Error("VK SDK not loaded"))
      return
    }

    try {
      window.VK.Auth.login((data) => {
        if (data.session) {
          resolve(data)
        } else {
          reject(new Error("Authorization failed"))
        }
      }, options)
    } catch (error) {
      console.error("Error during VK.Auth.login:", error)
      reject(error)
    }
  })
}

export function logoutFromVKID(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.VK) {
      reject(new Error("VK SDK not loaded"))
      return
    }

    try {
      window.VK.Auth.logout(() => {
        resolve()
      })
    } catch (error) {
      console.error("Error during VK.Auth.logout:", error)
      reject(error)
    }
  })
}

export function getVKIDSession(): VKIDAuthResponse | null {
  if (!window.VK) {
    return null
  }

  try {
    return window.VK.Auth.getSession()
  } catch (error) {
    console.error("Error getting VK session:", error)
    return null
  }
}

export function getVKIDAccessToken(): string | null {
  if (!window.VK) {
    return null
  }

  try {
    return window.VK.Auth.getAccessToken()
  } catch (error) {
    console.error("Error getting VK access token:", error)
    return null
  }
}

export function createVKIDAuthButton(elementId: string, options?: VKIDWidgetOptions): void {
  if (!window.VK) {
    console.error("VK SDK not loaded, cannot create auth button")
    return
  }

  try {
    window.VK.Widgets.Auth(elementId, options)
  } catch (error) {
    console.error("Error creating VK ID auth button:", error)
  }
}
