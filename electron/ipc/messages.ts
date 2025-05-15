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

ipcMain.handle(
  "vk:messages.getLongPollServer",
  async (_, accessToken: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/messages.getLongPollServer`,
        {
          params: {
            access_token: accessToken,
            v: "5.131",
            lp_version: 10,
            need_pts: 1,
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error.error_msg);
      }

      return response.data.response;
    } catch (error) {
      console.error("Error getting Long Poll server:", error);
      throw error;
    }
  }
);

ipcMain.handle(
  "vk:messages.getById",
  async (_, accessToken: string, message_id: number) => {
    try {
      console.log(`Fetching message info for message ${message_id}...`);
      const response = await axios.get(`${API_URL}/messages.getById`, {
        params: {
          access_token: accessToken,
          v: "5.131",
          message_ids: message_id,
          extended: 1,
        },
      });

      if (response.data.error) {
        throw new Error(response.data.error.error_msg);
      }

      console.log(`Fetched info for message ${message_id}`);
      return response.data.response;
    } catch (error) {
      console.error(
        `Error fetching message info for message ${message_id}:`,
        error
      );
      throw error;
    }
  }
);
