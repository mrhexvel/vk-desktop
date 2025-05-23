export class VKAPIError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.name = "VKAPIError";
    this.code = code;
  }
}

export async function fetchWithAuth(
  method: string,
  params: Record<string, string | number>,
  token: string
): Promise<any> {
  const apiVersion = "5.199";
  const url = new URL(`https://api.vk.com/method/${method}`);

  url.searchParams.append("access_token", token);
  url.searchParams.append("v", apiVersion);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.error) {
      console.error(`VK API error for method ${method}:`, data.error);

      if (data.error.error_code === 15) {
        throw new VKAPIError(
          `Access denied: no access to call this method. It cannot be called with current scopes. Method: ${method}`,
          data.error.error_code
        );
      } else if (data.error.error_code === 5) {
        throw new VKAPIError(
          "User authorization failed: invalid access token or token expired",
          data.error.error_code
        );
      } else {
        throw new VKAPIError(
          data.error.error_msg || `Unknown error calling method ${method}`,
          data.error.error_code
        );
      }
    }

    return data.response;
  } catch (error) {
    if (error instanceof VKAPIError) {
      throw error;
    }

    console.error(`Network error calling VK API method ${method}:`, error);
    throw new VKAPIError(
      error instanceof Error
        ? error.message
        : "Network error while calling VK API",
      -1
    );
  }
}
