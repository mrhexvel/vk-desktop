interface Window {
  api: {
    getAuthSession: () => Promise<SessionUser | null>
    setAuthSession: (session: SessionUser) => Promise<boolean>
    clearAuthSession: () => Promise<boolean>
    callVKAPI: (method: string, params: Record<string, any>) => Promise<any>
    showNotification: (title: string, body: string) => Promise<boolean>

    openOAuthWindow: (url: string) => Promise<boolean>
    onOAuthCallback: (callback: (url: string) => void) => () => void
  }
}

interface SessionUser {
  access_token: string
  user_id: number
  userInfo: {
    firstName: string
    lastName: string
    photoUrl: string
  }
}
