import { vkService } from "@/services/vk.service";
import { VKProfile } from "@/types/vk.type";
import { useState } from "react";

export const useGetUser = (user_id: number) => {
  const [profile, setProfile] = useState<VKProfile>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  vkService
    .usersGet(user_id.toString())
    .then((data) => setProfile(data))
    .finally(() => setIsLoading(false));

  return { isLoading, profile };
};
