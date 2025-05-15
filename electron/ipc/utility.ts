import axios from "axios";
import { ipcMain } from "electron";
import { API_URL } from "../constants/api.constants";

ipcMain.handle("vk:execute", async (_, accessToken: string, code: string) => {
  try {
    const response = await axios.get(`${API_URL}/execute`, {
      params: { access_token: accessToken, v: "5.131", code },
    });

    if (response.data.error) {
      throw new Error(response.data.error.error_msg);
    }

    return response.data.response;
  } catch (error) {
    console.error("Error execute request:", error);
    throw error;
  }
});
