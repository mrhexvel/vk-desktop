import { useGetUser } from "@/hooks/useGetUser";
import { Info, MessageCircle, MoreHorizontal, User2 } from "lucide-react";
import { NavLink, useParams } from "react-router-dom";
import Loader from "./Loader";
import { Button } from "./ui/button";

export const User = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetUser(id as string);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="max-w-[80%] mx-auto text-white flex flex-col items-center">
      <div className="w-full mt-12 text-center bg-[#24242D] flex flex-col items-center rounded-xl p-4">
        <div className="flex flex-col items-center gap-3">
          <img
            src={data?.photo_max_orig}
            alt={data?.first_name}
            className="h-[240px] w-[240px] rounded-full"
          />
          <p className="font-medium text-3xl">
            {data?.first_name} {data?.last_name}
          </p>
          <div className="mb-4 text-muted-foreground flex items-center gap-2">
            <p>{data?.status}</p>
            <Info className="w-4 h-4 cursor-pointer hover:text-purple-400 transition-colors" />
          </div>
        </div>
        <div className="w-[40%] flex flex-col gap-2">
          <Button className="bg-purple-500 hover:bg-purple-400 cursor-pointer transition-colors">
            <MessageCircle />
            <span>Сообщения</span>
          </Button>
          <div className="w-full flex gap-2">
            <Button className="flex-grow bg-gray-500 hover:bg-purple-400 cursor-pointer transition-colors">
              <User2 />
            </Button>
            <Button className="flex-grow bg-gray-500 hover:bg-purple-400 cursor-pointer transition-colors">
              <MoreHorizontal />
            </Button>
          </div>
        </div>
      </div>
      <NavLink to={"/"}>На главную</NavLink>
    </div>
  );
};
