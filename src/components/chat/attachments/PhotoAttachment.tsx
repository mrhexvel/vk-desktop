"use client";

import type { VKAttachment, VKPhotoAttachment } from "@/types/vk.type";
import { useState } from "react";

interface PhotoAttachmentProps {
  attachments: VKAttachment[];
}

export const PhotoAttachment = ({ attachments }: PhotoAttachmentProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const photos = attachments
    .filter((att): att is VKPhotoAttachment => att.type === "photo")
    .map((att) => {
      const sizes = att.photo.sizes;
      const mediumSize =
        sizes.find((size) => size.type === "x") || sizes[sizes.length - 1];
      return mediumSize.url;
    });

  const getGridClass = () => {
    switch (photos.length) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-3";
      default:
        return "grid-cols-2";
    }
  };

  return (
    <div className="mt-2">
      <div className={`grid ${getGridClass()} gap-1`}>
        {photos.map((photoUrl, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg cursor-pointer"
            onClick={() => setSelectedPhoto(photoUrl)}
          >
            <img
              src={photoUrl || "/placeholder.svg"}
              alt={`Photo ${index + 1}`}
              className="w-full h-auto object-cover rounded-lg"
              style={{ maxHeight: photos.length === 1 ? "300px" : "150px" }}
            />
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-3xl flex items-center justify-center z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl max-h-screen p-4">
            <img
              src={selectedPhoto || "/placeholder.svg"}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
