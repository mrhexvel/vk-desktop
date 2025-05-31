export const MESSENGER_APP_ID = "51453752";
export const MESSENGER_APP_SECRET = "4UyuCUsdK8pVCNoeQuGi";
export const MESSENGER_APP_SCOPE = 1454174;

export interface VKOAuthParams {
  clientId: string;
  redirectUri: string;
  display?: "page" | "popup" | "mobile";
  scope?: string | number;
  responseType?: "token" | "code";
  state?: string;
  revoke?: 0 | 1;
}

export interface VKOAuthResult {
  accessToken: string;
  expiresIn: number;
  userId: number;
  state?: string;
  email?: string;
}

export const VK_SCOPES = {
  NOTIFY: 1,
  FRIENDS: 2,
  PHOTOS: 4,
  AUDIO: 8,
  VIDEO: 16,
  STORIES: 64,
  PAGES: 128,
  STATUS: 1024,
  NOTES: 2048,
  MESSAGES: 4096,
  WALL: 8192,
  ADS: 32768,
  OFFLINE: 65536,
  DOCS: 131072,
  GROUPS: 262144,
  NOTIFICATIONS: 524288,
  STATS: 1048576,
  EMAIL: 4194304,
  MARKET: 134217728,
};

export function createOAuthUrl(params: VKOAuthParams): string {
  const defaultScope = MESSENGER_APP_SCOPE;

  const queryParams = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    display: params.display || "popup",
    scope: (params.scope || defaultScope).toString(),
    response_type: params.responseType || "token",
    revoke: params.revoke?.toString() || "1",
    v: "5.199",
  });

  if (params.state) {
    queryParams.append("state", params.state);
  }

  return `https://oauth.vk.com/authorize?${queryParams.toString()}`;
}

export function parseOAuthResult(url: string): VKOAuthResult | null {
  try {
    if (!url.includes("access_token=")) {
      return null;
    }

    const hashParams = new URLSearchParams(url.split("#")[1]);

    const accessToken = hashParams.get("access_token");
    const expiresIn = Number.parseInt(hashParams.get("expires_in") || "0", 10);
    const userId = Number.parseInt(hashParams.get("user_id") || "0", 10);
    const state = hashParams.get("state") || undefined;
    const email = hashParams.get("email") || undefined;

    if (!accessToken || !userId) {
      return null;
    }

    return {
      accessToken,
      expiresIn,
      userId,
      state,
      email,
    };
  } catch (error) {
    console.error("Error parsing OAuth result:", error);
    return null;
  }
}

export interface VKUserResponse {
  id: number;
  first_name: string;
  last_name: string;
  photo_50?: string;
  photo_100?: string;
  photo_200?: string;
  [key: string]: unknown;
}

export async function fetchUserInfo(
  accessToken: string,
  userId: number
): Promise<VKUserResponse> {
  try {
    const response = await fetch(
      `https://api.vk.com/method/users.get?user_ids=${userId}&fields=photo_200&access_token=${accessToken}&v=5.199`
    );
    const data = (await response.json()) as {
      response?: VKUserResponse[];
      error?: { error_msg: string };
    };

    if (data.error) {
      throw new Error(data.error.error_msg || "Failed to fetch user info");
    }

    if (!data.response || !data.response[0]) {
      throw new Error("Empty response from API");
    }

    return data.response[0];
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
}

export async function checkAccessPermissions(
  accessToken: string
): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.vk.com/method/account.getAppPermissions?access_token=${accessToken}&v=5.199`
    );
    const data = (await response.json()) as {
      response?: number;
      error?: { error_msg: string };
    };

    if (data.error) {
      throw new Error(data.error.error_msg || "Failed to check permissions");
    }

    if (!data.response) {
      throw new Error("Empty response from API");
    }

    const permissionsMask = data.response;
    const grantedPermissions: string[] = [];

    console.log("Permissions mask:", permissionsMask);

    const permissionBits: Record<string, number> = {
      notify: VK_SCOPES.NOTIFY,
      friends: VK_SCOPES.FRIENDS,
      photos: VK_SCOPES.PHOTOS,
      audio: VK_SCOPES.AUDIO,
      video: VK_SCOPES.VIDEO,
      stories: VK_SCOPES.STORIES,
      pages: VK_SCOPES.PAGES,
      status: VK_SCOPES.STATUS,
      notes: VK_SCOPES.NOTES,
      messages: VK_SCOPES.MESSAGES,
      wall: VK_SCOPES.WALL,
      ads: VK_SCOPES.ADS,
      offline: VK_SCOPES.OFFLINE,
      docs: VK_SCOPES.DOCS,
      groups: VK_SCOPES.GROUPS,
      notifications: VK_SCOPES.NOTIFICATIONS,
      stats: VK_SCOPES.STATS,
      email: VK_SCOPES.EMAIL,
      market: VK_SCOPES.MARKET,
    };

    for (const [permission, bit] of Object.entries(permissionBits)) {
      if ((permissionsMask & bit) === bit) {
        grantedPermissions.push(permission);
      }
    }

    console.log("Granted permissions:", grantedPermissions);
    return grantedPermissions;
  } catch (error) {
    console.error("Error checking permissions:", error);
    throw error;
  }
}

export interface VKStickerInfo {
  words: string[];
  user_stickers?: Array<{
    sticker_id: number;
    pack_id: number;
  }>;
  [key: string]: unknown;
}

export async function getStickerInfo(
  accessToken: string,
  stickerId: number,
  productId: number
): Promise<VKStickerInfo | null> {
  try {
    const response = await fetch(
      `https://api.vk.com/method/store.getStickersKeywords?stickers_ids=${productId}_${stickerId}&access_token=${accessToken}&v=5.199`
    );
    const data = (await response.json()) as {
      response?: VKStickerInfo;
      error?: { error_msg: string };
    };

    if (data.error) {
      console.warn("Error fetching sticker info:", data.error.error_msg);
      return null;
    }

    return data.response || null;
  } catch (error) {
    console.error("Error fetching sticker info:", error);
    return null;
  }
}
