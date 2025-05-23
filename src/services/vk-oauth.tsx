export const MESSENGER_APP_ID = "51453752";
export const MESSENGER_APP_SECRET = "4UyuCUsdK8pVCNoeQuGi";
export const MESSENGER_APP_SCOPE = 1454174;

// Параметры для OAuth авторизации
export interface VKOAuthParams {
  clientId: string;
  redirectUri: string;
  display?: "page" | "popup" | "mobile";
  scope?: string | number;
  responseType?: "token" | "code";
  state?: string;
  revoke?: 0 | 1;
}

// Результат авторизации
export interface VKOAuthResult {
  accessToken: string;
  expiresIn: number;
  userId: number;
  state?: string;
  email?: string;
}

// Полный список возможных прав доступа с их битовыми значениями
export const VK_SCOPES = {
  // Базовые права
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

// Функция для создания URL авторизации
export function createOAuthUrl(params: VKOAuthParams): string {
  // Используем числовое значение scope для максимальных прав
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

// Функция для парсинга результата авторизации из URL
export function parseOAuthResult(url: string): VKOAuthResult | null {
  try {
    // Проверяем, содержит ли URL фрагмент с токеном
    if (!url.includes("access_token=")) {
      return null;
    }

    // Извлекаем фрагмент URL (часть после #)
    const hashParams = new URLSearchParams(url.split("#")[1]);

    // Получаем параметры
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

// Интерфейс для результата запроса пользователя
export interface VKUserResponse {
  id: number;
  first_name: string;
  last_name: string;
  photo_50?: string;
  photo_100?: string;
  photo_200?: string;
  [key: string]: unknown;
}

// Функция для получения информации о пользователе
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

// Функция для проверки прав доступа
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

    // Преобразуем битовую маску в список прав
    const permissionsMask = data.response;
    const grantedPermissions: string[] = [];

    console.log("Permissions mask:", permissionsMask);

    // Маппинг битовых флагов на названия прав
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

    // Проверяем каждое право
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

// Интерфейс для информации о стикере
export interface VKStickerInfo {
  words: string[];
  user_stickers?: Array<{
    sticker_id: number;
    pack_id: number;
  }>;
  [key: string]: unknown;
}

// Функция для получения информации о стикерах
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
