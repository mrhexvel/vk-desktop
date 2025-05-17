import { vkService } from "@/services/vk.service";
import { VKProfile } from "@/types/vk.type";
import { useEffect, useState } from "react";

export const useGetUsers = (user_ids: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<VKProfile[] | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const user = await vkService.usersGet(user_ids);
      setData(user);
      setIsLoading(false);
    }

    fetchData();
  }, [user_ids]);

  return { isLoading, data };
};
