import axios from "axios";
import { ipcMain } from "electron";
import { API_URL } from "../constants/api.constants";

ipcMain.handle(
  "vk:users.get",
  async (_, accessToken: string, user_ids?: string) => {
    try {
      const response = await axios.get(`${API_URL}/users.get`, {
        params: {
          access_token: accessToken,
          v: "5.131",
          user_ids,
          fields:
            "photo_100,photo_max_orig,online,sex,screen_name,online_info,about,status",
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
