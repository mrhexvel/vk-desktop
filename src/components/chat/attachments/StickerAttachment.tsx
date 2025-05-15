import type { VKStickerMessageAttachment } from "@/types/vk.type";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";

interface StickerAttachmentProps {
  sticker: VKStickerMessageAttachment["sticker"];
}

export const StickerAttachment = ({ sticker }: StickerAttachmentProps) => {
  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const stickerImage = sticker.images[2];
  const hasAnimation = !!sticker.animation_url;

  useEffect(() => {
    if (hasAnimation) {
      setIsLoading(true);
      setError(false);

      fetch(sticker.animation_url!)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setAnimationData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error loading sticker animation:", err);
          setError(true);
          setIsLoading(false);
        });
    }
  }, [sticker.animation_url, hasAnimation]);

  return (
    <div className="flex justify-center">
      {hasAnimation && !isLoading && !error && animationData ? (
        <div className="w-[200px] h-[200px]">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width: "100%", height: "100%" }}
            rendererSettings={{
              preserveAspectRatio: "xMidYMid slice",
            }}
          />
        </div>
      ) : (
        <img
          src={stickerImage.url || "/placeholder.svg"}
          alt="Sticker"
          className="w-[200px] h-auto"
        />
      )}
    </div>
  );
};
