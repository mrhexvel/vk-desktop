import axios from "axios";
import { ipcMain } from "electron";
import { API_URL } from "../constants/api.constants";

ipcMain.handle(
  "vk:groups.getById",
  async (_, accessToken: string, group_id: number) => {
    try {
      const response = await axios.get(`${API_URL}/groups.getById`, {
        params: {
          access_token: accessToken,
          v: "5.131",
          group_id,
          fields: "name",
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
