import axios from "axios";
import { ipcMain } from "electron";
import { API_URL } from "../constants/api.constants";

ipcMain.handle("vk:getConversations", async (_, accessToken: string) => {
  try {
    const response = await axios.get(`${API_URL}/messages.getConversations`, {
      params: {
        access_token: accessToken,
        v: "5.131",
        extended: 1,
        fields: "photo_100",
      },
    });

    if (response.data.error) {
      throw new Error(response.data.error.error_msg);
    }

    return response.data.response;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
});

ipcMain.handle(
  "vk:messages.getHistory",
  async (_, accessToken: string, peer_id: number) => {
    try {
      const response = await axios.get(`${API_URL}/messages.getHistory`, {
        params: {
          access_token: accessToken,
          v: "5.131",
          peer_id,
          count: 20,
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
