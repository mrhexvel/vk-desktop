import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import type { ReplyBlockProps } from "@/types/components";
import type React from "react";

export const ReplyBlock: React.FC<ReplyBlockProps> = ({
  message,
  profile,
  onReplyClick,
}) => {
  const { t } = useTranslation();

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : message.sender
    ? `${message.sender.firstName} ${message.sender.lastName}`
    : message.from_id && message.from_id > 0
    ? t("messages.user")
    : t("messages.community");

  const hasAttachments = message.attachments && message.attachments.length > 0;
  const attachmentType =
    hasAttachments && message.attachments?.[0]
      ? message.attachments[0].type
      : null;

  const getAttachmentPreview = (): string | null => {
    if (!hasAttachments || !message.attachments || !message.attachments[0])
      return null;

    const attachment = message.attachments[0];

    if (attachment.type === "photo" && "photo" in attachment) {
      const sizes = attachment.photo?.sizes || [];
      const smallSize =
        sizes.find((s) => s.type === "s" || s.type === "m") || sizes[0];
      return smallSize?.url || null;
    } else if (attachment.type === "video" && "video" in attachment) {
      return attachment.video?.image?.[0]?.url || null;
    }

    return null;
  };

  const attachmentPreview = getAttachmentPreview();

  const getAttachmentDescription = (type: string | null): string => {
    if (!type) return "";

    switch (type) {
      case "photo":
        return t("messages.photo");
      case "video":
        return t("messages.video");
      case "audio":
        return t("messages.audio");
      case "doc":
        return t("messages.document");
      case "link":
        return t("messages.link");
      case "sticker":
        return t("messages.sticker");
      case "audio_message":
        return t("messages.voice");
      case "wall":
        return t("messages.wall");
      default:
        return t("messages.attachment");
    }
  };

  const handleClick = () => {
    if (onReplyClick && message.id) {
      onReplyClick(message.id);
    }
  };

  return (
    <div
      className={cn(
        "border-l-2 border-var(--color-border) pl-2 mb-2 opacity-80 transition-all duration-200",
        onReplyClick &&
          "cursor-pointer hover:opacity-100 hover:border-[#6c5ce7] hover:bg-white/5 rounded-r-md pr-2 py-1"
      )}
      onClick={handleClick}
    >
      <div className="text-sm font-medium text-var(--color-primary)">
        {displayName}
      </div>
      <div className="flex items-center gap-2">
        {attachmentPreview && (
          <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
            <img
              src={attachmentPreview || "/placeholder.svg"}
              alt="Attachment"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div
          className={cn(
            "text-sm text-var(--color-muted-foreground) truncate",
            attachmentPreview ? "max-w-[200px]" : "max-w-[250px]"
          )}
        >
          {message.text || getAttachmentDescription(attachmentType)}
        </div>
      </div>
    </div>
  );
};
