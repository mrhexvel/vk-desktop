import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import type { VKAttachment, VKMessage, VKProfile } from "@/types/vk.type";
import { parseTextWithLinks } from "@/utils/vk.util";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ReplyBlock } from "./ReplyBlock";
import { AudioMessage } from "./attachments/AudioAttachment";
import { DocumentAttachment } from "./attachments/DocumentAttachment";
import { ForwardedMessages } from "./attachments/ForwardedMessages";
import { LinkAttachment } from "./attachments/LinkAttachment";
import { PhotoAttachment } from "./attachments/PhotoAttachment";
import { StickerAttachment } from "./attachments/StickerAttachment";
import { VideoAttachment } from "./attachments/VideoAttachment";
import { WallAttachment } from "./attachments/WallAttachment";

interface MessageBubbleProps extends VKMessage {
  profile?: VKProfile;
  profileMap?: Record<number, VKProfile>;
  isForwarded?: boolean;
}

export const MessageBubble = ({
  from_id,
  text,
  attachments,
  profile,
  reply_message,
  date,
  fwd_messages,
  profileMap = {},
  isForwarded = false,
}: MessageBubbleProps) => {
  const data = useUserStore((state) => state.user);
  const isCurrentUser = from_id === data?.id;
  const profiles = useUserStore((state) => state.profiles);

  const replyProfile = reply_message
    ? profiles[reply_message.from_id]
    : undefined;

  if (!profile) {
    return (
      <div className="flex gap-3 max-w-[80%] self-start mb-2">
        <div className="h-8 w-8 mt-1 rounded-full bg-[#2a2a3a] animate-pulse"></div>
        <div className="flex flex-col items-start">
          <div className="h-4 w-24 bg-[#2a2a3a] rounded-md animate-pulse mb-1"></div>
          <div className="h-8 w-48 bg-[#2a2a3a] rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const displayName = profile.isGroup
    ? `[id${+profile.id}|${profile.name}]`
    : `[id${+profile.id}|${profile.first_name} ${
        profile.last_name || ""
      }]`.trim();

  const photoAttachments = attachments.filter(
    (att) => att.type === "photo"
  ) as VKAttachment[];
  const stickerAttachment = attachments.find((att) => att.type === "sticker");
  const audioMessageAttachment = attachments.find(
    (att) => att.type === "audio_message"
  );
  const wallAttachments = attachments.filter(
    (att) => att.type === "wall"
  ) as VKAttachment[];
  const documentAttachments = attachments.filter(
    (att) => att.type === "doc"
  ) as VKAttachment[];
  const linkAttachments = attachments.filter(
    (att) => att.type === "link"
  ) as VKAttachment[];
  const videoAttachments = attachments.filter(
    (att) => att.type === "video"
  ) as VKAttachment[];

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[80%]",
        isCurrentUser ? "self-end" : "self-start"
      )}
    >
      {!isCurrentUser && !isForwarded && (
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

      <div className={cn("flex flex-col items-start w-full")}>
        {!isCurrentUser && !isForwarded && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">
              {parseTextWithLinks(displayName)}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {profile.id === 715616525 && !profile.isGroup && (
              <span className="text-xs text-gray-400">Разработчик</span>
            )}
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl p-2 break-words",
            isCurrentUser ? "bg-[#5d3f92]" : "bg-[#2a2a3a]",
            !text && stickerAttachment && "bg-transparent flex flex-col",
            isForwarded && "bg-opacity-70"
          )}
        >
          {reply_message && (
            <ReplyBlock message={reply_message} profile={replyProfile} />
          )}

          {isForwarded && (
            <div className="text-xs text-gray-400 mb-2 leading-0">
              {parseTextWithLinks(displayName, true)},{" "}
              {new Date(Date.now()).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}

          {text && (
            <div className="whitespace-pre-wrap">
              {parseTextWithLinks(text)}
            </div>
          )}

          {fwd_messages && fwd_messages.length > 0 && (
            <ForwardedMessages
              messages={fwd_messages}
              profileMap={profileMap}
            />
          )}

          {photoAttachments.length > 0 && (
            <PhotoAttachment attachments={photoAttachments} />
          )}

          {stickerAttachment && stickerAttachment.type === "sticker" && (
            <StickerAttachment sticker={stickerAttachment.sticker} />
          )}

          {audioMessageAttachment &&
            audioMessageAttachment.type === "audio_message" && (
              <AudioMessage
                isCurrentUser={isCurrentUser}
                audioMessage={audioMessageAttachment.audio_message}
              />
            )}

          {wallAttachments.length > 0 && (
            <WallAttachment
              attachments={wallAttachments}
              profileMap={profileMap}
            />
          )}

          {documentAttachments.length > 0 && (
            <DocumentAttachment attachments={documentAttachments} />
          )}

          {linkAttachments.length > 0 && (
            <LinkAttachment attachments={linkAttachments} />
          )}

          {videoAttachments.length > 0 && (
            <VideoAttachment attachments={videoAttachments} />
          )}
        </div>
      </div>
    </div>
  );
};
