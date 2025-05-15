import { cropText } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import type { VKAttachment, VKProfile, VKReplyMessage } from "@/types/vk.type";
import { parseTextWithLinks } from "@/utils/vk.util";

interface ReplyBlockProps {
  message: VKReplyMessage;
  profile?: VKProfile;
}

export const ReplyBlock = ({ message, profile }: ReplyBlockProps) => {
  const data = useUserStore((state) => state.user);
  const isCurrentUser = message.from_id === data?.id;

  const getAttachmentType = (attachments?: VKAttachment[]) => {
    if (!attachments || attachments.length === 0) return null;

    const attachment = attachments[0];
    switch (attachment.type) {
      case "photo":
        return "Фотография";
      case "sticker":
        return "Стикер";
      case "audio_message":
        return "Голосовое сообщение";
      case "wall":
        return "Запись со стены";
      default:
        return "Вложение";
    }
  };

  const displayName = profile
    ? profile.isGroup
      ? profile.name
      : `${profile.first_name} ${profile.last_name || ""}`.trim()
    : isCurrentUser
    ? "Вы"
    : `id${message.from_id}`;

  const attachmentType = !message.text
    ? getAttachmentType(message.attachments)
    : null;
  const displayText = message.text
    ? cropText(message.text, 50)
    : attachmentType;

  return (
    <div className="flex items-center gap-2 p-1 mb-2 rounded-l-md">
      <div className="h-10 w-[3px] bg-white/40 rounded-l-full" />
      <div className="overflow-hidden">
        <div className="text-xs font-medium">{displayName}</div>
        <div className="text-xs text-gray-300 truncate">
          {parseTextWithLinks(displayText || "")}
        </div>
      </div>
    </div>
  );
};
