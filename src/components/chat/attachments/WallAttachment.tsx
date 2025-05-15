import { cropText } from "@/lib/utils";
import type {
  VKAttachment,
  VKProfile,
  VKWallMessageAttachment,
} from "@/types/vk.type";
import { ExternalLink } from "lucide-react";

interface WallAttachmentProps {
  attachments: VKAttachment[];
  profileMap: Record<number, VKProfile>;
}

export const WallAttachment = ({
  attachments,
  profileMap,
}: WallAttachmentProps) => {
  return (
    <div className="mt-2 space-y-2">
      {attachments
        .filter((att): att is VKWallMessageAttachment => att.type === "wall")
        .map((att, index) => {
          const wall = att.wall;
          const authorProfile = wall.from_id ? profileMap[wall.from_id] : null;
          const authorName = authorProfile
            ? authorProfile.isGroup
              ? authorProfile.name
              : `${authorProfile.first_name} ${
                  authorProfile.last_name || ""
                }`.trim()
            : `id${wall.owner_id}`;

          const photoAttachment = wall.attachments?.find(
            (a) => a.type === "photo"
          );
          let photoUrl = null;
          if (photoAttachment && photoAttachment.type === "photo") {
            const sizes = photoAttachment.photo.sizes;
            const mediumSize =
              sizes.find((size) => size.type === "x") ||
              sizes[sizes.length - 1];
            photoUrl = mediumSize.url;
          }

          return (
            <div
              key={index}
              className="border border-[#3F4A4B] rounded-lg overflow-hidden"
            >
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">{authorName}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(wall.date * 1000).toLocaleDateString()}
                  </span>
                </div>

                {wall.text && (
                  <div className="text-sm mb-2">{cropText(wall.text, 100)}</div>
                )}

                {photoUrl && (
                  <div className="rounded-lg overflow-hidden mb-2">
                    <img
                      src={photoUrl || "/placeholder.svg"}
                      alt="Post attachment"
                      className="w-full h-auto max-h-[200px] object-cover"
                    />
                  </div>
                )}

                <a
                  href={`https://vk.com/wall${wall.owner_id}_${wall.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[#8B5CF6] hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Открыть запись
                </a>
              </div>
            </div>
          );
        })}
    </div>
  );
};
