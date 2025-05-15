import { formatTime } from "@/lib/utils";
import type { VKAttachment, VKVideoAttachment } from "@/types/vk.type";
import { Play } from "lucide-react";

interface VideoAttachmentProps {
  attachments: VKAttachment[];
}

export const VideoAttachment = ({ attachments }: VideoAttachmentProps) => {
  return (
    <div className="mt-2 space-y-2">
      {attachments
        .filter((att): att is VKVideoAttachment => att.type === "video")
        .map((att, index) => {
          const video = att.video;
          const thumbnailUrl =
            video.image && video.image.length > 0
              ? video.image[video.image.length - 1].url
              : video.first_frame && video.first_frame.length > 0
              ? video.first_frame[video.first_frame.length - 1].url
              : null;

          return (
            <a
              key={index}
              href={`https://vk.com/video${video.owner_id}_${video.id}${
                video.access_key ? `_${video.access_key}` : ""
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg overflow-hidden"
            >
              <div className="relative">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-auto object-cover rounded-lg"
                    style={{ maxHeight: "200px" }}
                  />
                ) : (
                  <div className="w-full h-32 bg-[#1C2526] rounded-lg"></div>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                    <Play className="w-6 h-6" />
                  </div>
                </div>

                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {formatTime(video.duration)}
                </div>
              </div>

              <div className="mt-2 text-sm font-medium">{video.title}</div>
            </a>
          );
        })}
    </div>
  );
};
