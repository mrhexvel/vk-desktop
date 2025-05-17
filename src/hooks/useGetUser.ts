import { vkService } from "@/services/vk.service";
import { VKProfile } from "@/types/vk.type";
import { useEffect, useState } from "react";

export const useGetUser = (user_id: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<VKProfile | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const user = await vkService.usersGet(user_id);
      setData(user[0]);
      setIsLoading(false);
    }

    fetchData();
  }, [user_id]);

  return { isLoading, data };
};
