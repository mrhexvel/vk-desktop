import { VKMessageAttachmentPhoto } from "@/types/vk-api";
import type React from "react";
import { useState } from "react";
import { cn } from "../../../lib/utils";
import { ImageViewer } from "../ImageViewer";

interface PhotoAttachmentProps {
  attachments: VKMessageAttachmentPhoto[];
}

export const PhotoAttachment: React.FC<PhotoAttachmentProps> = ({
  attachments,
}) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (attachments.length === 0) return null;

  const getPhotoUrl = (
    photo: VKMessageAttachmentPhoto,
    preferredSize = "x"
  ) => {
    const sizes = photo.photo?.sizes || [];
    const preferredSizes = [preferredSize, "x", "y", "r", "q", "p", "m", "s"];

    for (const size of preferredSizes) {
      const found = sizes.find((s) => s.type === size);
      if (found) return found.url;
    }

    return sizes.length > 0 ? sizes[sizes.length - 1].url : null;
  };

  const getImageDimensions = (photo: VKMessageAttachmentPhoto) => {
    const sizes = photo.photo?.sizes || [];
    const largeSize = sizes.find((s) => s.type === "x" || s.type === "y");
    return largeSize
      ? { width: largeSize.width, height: largeSize.height }
      : { width: 400, height: 300 };
  };

  const images = attachments.map((attachment, index) => ({
    url:
      getPhotoUrl(attachment, "z") || "/placeholder.svg?height=400&width=400",
    ...getImageDimensions(attachment),
    alt: `Фото ${index + 1}`,
  }));

  const openViewer = (index: number) => {
    setSelectedIndex(index);
    setViewerOpen(true);
  };

  if (attachments.length === 1) {
    const photoUrl = getPhotoUrl(attachments[0]);
    const dimensions = getImageDimensions(attachments[0]);
    const aspectRatio = dimensions.width / dimensions.height;

    return (
      <>
        <div
          className="mt-2 rounded-lg overflow-hidden group cursor-pointer relative"
          onClick={() => openViewer(0)}
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-lg",
              aspectRatio > 2
                ? "max-h-32"
                : aspectRatio < 0.75
                ? "max-h-48 max-w-48"
                : "max-h-48"
            )}
          >
            <img
              src={
                photoUrl || "/placeholder.svg?height=300&width=400&query=photo"
              }
              alt="Фото"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black/50 rounded-full p-2">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <ImageViewer
          images={images}
          initialIndex={selectedIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </>
    );
  }

  if (attachments.length === 2) {
    return (
      <>
        <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-w-64">
          {attachments.map((attachment, index) => {
            const photoUrl = getPhotoUrl(attachment);
            return (
              <div
                key={index}
                className="aspect-[4/3] overflow-hidden group cursor-pointer relative"
                onClick={() => openViewer(index)}
              >
                <img
                  src={
                    photoUrl ||
                    "/placeholder.svg?height=200&width=200&query=photo"
                  }
                  alt={`Фото ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/50 rounded-full p-1">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ImageViewer
          images={images}
          initialIndex={selectedIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </>
    );
  }

  if (attachments.length === 3) {
    return (
      <>
        <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-w-64">
          <div
            className="row-span-2 overflow-hidden group cursor-pointer relative"
            onClick={() => openViewer(0)}
          >
            <img
              src={
                getPhotoUrl(attachments[0]) ||
                "/placeholder.svg?height=400&width=200&query=photo"
              }
              alt="Фото 1"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black/50 rounded-full p-1">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {attachments.slice(1, 3).map((attachment, index) => {
            const photoUrl = getPhotoUrl(attachment);
            const actualIndex = index + 1;
            return (
              <div
                key={actualIndex}
                className="aspect-[4/3] overflow-hidden group cursor-pointer relative"
                onClick={() => openViewer(actualIndex)}
              >
                <img
                  src={
                    photoUrl ||
                    "/placeholder.svg?height=200&width=200&query=photo"
                  }
                  alt={`Фото ${actualIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/50 rounded-full p-1">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ImageViewer
          images={images}
          initialIndex={selectedIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-w-64">
        {attachments.slice(0, 4).map((attachment, index) => {
          const photoUrl = getPhotoUrl(attachment);
          const isLast = index === 3 && attachments.length > 4;

          return (
            <div
              key={index}
              className="aspect-[4/3] overflow-hidden group cursor-pointer relative"
              onClick={() => openViewer(index)}
            >
              <img
                src={
                  photoUrl ||
                  "/placeholder.svg?height=200&width=200&query=photo"
                }
                alt={`Фото ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

              {isLast && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    +{attachments.length - 4}
                  </span>
                </div>
              )}

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/50 rounded-full p-1">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {attachments.length > 4 && (
        <div className="text-xs text-gray-400 mt-1 text-center">
          {attachments.length} фото
        </div>
      )}

      <ImageViewer
        images={images}
        initialIndex={selectedIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
};
