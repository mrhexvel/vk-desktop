import { useGetUser } from "@/hooks/useGetUser";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { VKMessage } from "@/types/vk.type";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const MessageBubble = ({ from_id, text }: VKMessage) => {
  const data = useUserStore((state) => state.user);
  const { isLoading, profile } = useGetUser(from_id);
  const isCurrentUser = from_id === data?.id;

  if (isLoading) {
    return <p>Загрузка</p>;
  }

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[80%]",
        isCurrentUser ? "self-end" : "self-start"
      )}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mt-1 bg-[#2a2a3a]">
          <AvatarImage
            src={profile?.photo_100 || "/placeholder.svg"}
            alt={profile?.first_name || ""}
          />
          <AvatarFallback>
            {profile?.first_name?.substring(0, 2) || "UN"}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex flex-col items-start">
        {!isCurrentUser && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">
              {profile?.first_name} {data?.last_name}
            </span>
            <span className="text-xs text-gray-400">02:36</span>
            {profile?.id === 715616525 && (
              <span className="text-xs text-gray-400">Разработчик</span>
            )}
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-2 break-words",
            isCurrentUser ? "bg-[#5d3f92]" : "bg-[#2a2a3a]"
          )}
        >
          {text}
        </div>
      </div>
    </div>
  );
};
