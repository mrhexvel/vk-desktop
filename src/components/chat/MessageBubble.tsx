import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import type { VKMessage, VKProfile } from "@/types/vk.type";
import { parseTextWithLinks } from "@/utils/vk.util";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const MessageBubble = ({
  from_id,
  text,
  attachments,
  profile,
}: VKMessage & {
  profile?: VKProfile;
}) => {
  const data = useUserStore((state) => state.user);
  const isCurrentUser = from_id === data?.id;
  const sticker = attachments?.find((att) => att.type === "sticker")?.sticker;
  const stickerUrl = sticker?.images[1]?.url;

  if (!profile) {
    return (
      <div className="flex gap-3 max-w-[80%] self-start">
        <div className="h-8 w-8 mt-1 rounded-full bg-[#2a2a3a] animate-pulse"></div>
        <div className="flex flex-col items-start">
          <div className="h-4 w-24 bg-[#2a2a3a] rounded-md animate-pulse mb-1"></div>
          <div className="h-8 w-48 bg-[#2a2a3a] rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const displayName = profile.isGroup
    ? profile.name
    : `${profile.first_name} ${profile.last_name || ""}`.trim();

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
            src={profile.photo_100 || "/placeholder.svg"}
            alt={displayName}
          />
          <AvatarFallback>
            {displayName?.substring(0, 2) || "UN"}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex flex-col items-start">
        {!isCurrentUser && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{displayName}</span>
            <span className="text-xs text-gray-400">02:36</span>
            {profile.id === 715616525 && !profile.isGroup && (
              <span className="text-xs text-gray-400">Разработчик</span>
            )}
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-2 break-words",
            isCurrentUser ? "bg-[#5d3f92]" : "bg-[#2a2a3a]",
            !text && stickerUrl && "p-0 bg-transparent"
          )}
        >
          {text && (
            <div className={cn("whitespace-pre-wrap", stickerUrl && "mb-2")}>
              {parseTextWithLinks(text)}
            </div>
          )}
          {stickerUrl && (
            <img
              src={stickerUrl || "/placeholder.svg"}
              alt="Sticker"
              className="max-w-[128px] h-auto"
            />
          )}
        </div>
      </div>
    </div>
  );
};
