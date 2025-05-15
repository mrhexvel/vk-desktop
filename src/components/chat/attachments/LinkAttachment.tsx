import { cropText } from "@/lib/utils";
import type { VKAttachment, VKLinkAttachment } from "@/types/vk.type";
import { ExternalLink } from "lucide-react";

interface LinkAttachmentProps {
  attachments: VKAttachment[];
}

export const LinkAttachment = ({ attachments }: LinkAttachmentProps) => {
  return (
    <div className="mt-2 space-y-2">
      {attachments
        .filter((att): att is VKLinkAttachment => att.type === "link")
        .map((att, index) => {
          const link = att.link;
          const hasPhoto = link.photo?.sizes && link.photo.sizes.length > 0;
          const photoUrl = hasPhoto
            ? link.photo?.sizes[link.photo.sizes.length - 1].url
            : null;

          let domain = "";
          try {
            domain = new URL(link.url).hostname.replace("www.", "");
          } catch (e) {
            domain = link.url;
          }

          return (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-[#3F4A4B] rounded-lg overflow-hidden hover:bg-[#2A3435] transition-colors"
            >
              {photoUrl && (
                <div className="w-full h-32 overflow-hidden">
                  <img
                    src={photoUrl || "/placeholder.svg"}
                    alt={link.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-3">
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                  <ExternalLink className="w-3 h-3" />
                  {domain}
                </div>
                <div className="font-medium text-sm mb-1">{link.title}</div>
                {link.description && (
                  <div className="text-xs text-gray-300">
                    {cropText(link.description, 100)}
                  </div>
                )}
              </div>
            </a>
          );
        })}
    </div>
  );
};
