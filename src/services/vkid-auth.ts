export interface VKIDUser {
  user_id: number;
  first_name: string;
  last_name: string;
  avatar: string;
  phone?: string;
  email?: string;
}

export interface VKIDTokenResponse {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  user_id: number;
  state?: string;
}

export interface VKIDUserInfoResponse {
  user: VKIDUser;
}

export interface VKIDErrorResponse {
  error: string;
  error_description: string;
}

export type VKIDResponse = VKIDTokenResponse | VKIDErrorResponse;

export interface VKIDParams {
  client_id: string;
  redirect_uri: string;
  state?: string;
  code_challenge?: string;
  code_challenge_method?: string;
  scope?: string;
}

export class VKID {
  private static readonly AUTH_URL = "https://id.vk.com/oauth2/auth";
  private static readonly TOKEN_URL = "https://id.vk.com/oauth2/auth";
  private static readonly USER_INFO_URL = "https://id.vk.com/oauth2/user_info";

  private params: VKIDParams;
  private clientSecret: string;

  constructor(params: VKIDParams, clientSecret: string) {
    this.params = params;
    this.clientSecret = clientSecret;
  }

  private generateCodeChallenge(): {
    codeVerifier: string;
    codeChallenge: string;
  } {
    const codeVerifier = this.generateRandomString(128);
    const codeChallenge = this.base64URLEncode(this.sha256(codeVerifier));
    return { codeVerifier, codeChallenge };
  }

  private generateRandomString(length: number): string {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  private sha256(plain: string): ArrayBuffer {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    // @ts-ignore
    return crypto.subtle.digest("SHA-256", data);
  }

  private base64URLEncode(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  async getAuthUrl(): Promise<{ url: string; codeVerifier: string }> {
    const { codeVerifier, codeChallenge } = this.generateCodeChallenge();

    const queryParams = new URLSearchParams({
      client_id: this.params.client_id,
      redirect_uri: this.params.redirect_uri,
      response_type: "code",
      state: this.params.state || Math.random().toString(36).substring(2, 15),
      scope: this.params.scope || "phone email",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return {
      url: `${VKID.AUTH_URL}?${queryParams.toString()}`,
      codeVerifier,
    };
  }

  async exchangeCodeForToken(
    code: string,
    codeVerifier: string
  ): Promise<VKIDResponse> {
    try {
      const response = await fetch(VKID.TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: this.params.client_id,
          client_secret: this.clientSecret,
          redirect_uri: this.params.redirect_uri,
          code,
          code_verifier: codeVerifier,
        }).toString(),
      });

      const data = await response.json();

      if ("error" in data) {
        return data as VKIDErrorResponse;
      }

      return data as VKIDTokenResponse;
    } catch (error) {
      return {
        error: "request_failed",
        error_description:
          error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getUserInfo(
    accessToken: string
  ): Promise<VKIDUserInfoResponse | VKIDErrorResponse> {
    try {
      const response = await fetch(VKID.USER_INFO_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if ("error" in data) {
        return data as VKIDErrorResponse;
      }

      return data as VKIDUserInfoResponse;
    } catch (error) {
      return {
        error: "request_failed",
        error_description:
          error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
