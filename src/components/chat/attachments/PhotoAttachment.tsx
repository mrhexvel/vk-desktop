import { cn } from "@/lib/utils";
import { VKMessageAttachmentPhoto } from "@/types/vk-api";
import type React from "react";

interface PhotoAttachmentProps {
  attachments: VKMessageAttachmentPhoto[];
}

export const PhotoAttachment: React.FC<PhotoAttachmentProps> = ({
  attachments,
}) => {
  if (attachments.length === 0) return null;

  const getPhotoUrl = (photo: VKMessageAttachmentPhoto) => {
    const sizes = photo.photo?.sizes || [];
    const preferredSizes = ["x", "y", "r", "q", "p"];

    for (const size of preferredSizes) {
      const found = sizes.find((s) => s.type === size);
      if (found) return found.url;
    }

    return sizes.length > 0 ? sizes[sizes.length - 1].url : null;
  };

  if (attachments.length === 1) {
    const photoUrl = getPhotoUrl(attachments[0]);

    return (
      <div className="mt-2 rounded-lg overflow-hidden">
        <img
          src={photoUrl || "/placeholder.svg?height=200&width=200&query=photo"}
          alt="Photo"
          className="max-h-80 max-w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="mt-2 grid gap-1">
      <div
        className={cn(
          "grid",
          attachments.length === 2 && "grid-cols-2",
          attachments.length === 3 && "grid-cols-3",
          attachments.length >= 4 && "grid-cols-2 grid-rows-2"
        )}
      >
        {attachments.slice(0, 4).map((attachment, index) => {
          const photoUrl = getPhotoUrl(attachment);

          return (
            <div
              key={index}
              className={cn(
                "aspect-square overflow-hidden rounded-md",
                attachments.length === 3 &&
                  index === 0 &&
                  "col-span-3 row-span-1 aspect-video"
              )}
            >
              <img
                src={
                  photoUrl ||
                  "/placeholder.svg?height=100&width=100&query=photo"
                }
                alt="Photo"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          );
        })}
      </div>

      {attachments.length > 4 && (
        <div className="text-xs text-gray-400 mt-1">
          +{attachments.length - 4} фото
        </div>
      )}
    </div>
  );
};
