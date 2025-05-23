"use client"

import React from "react"
import { getAllPossibleStickerUrls } from "../../../services/sticker-service"

interface StickerAttachmentProps {
  sticker: any
}

export const StickerAttachment: React.FC<StickerAttachmentProps> = ({ sticker }) => {
  const [stickerUrlIndex, setStickerUrlIndex] = React.useState(0)
  const stickerUrls = getAllPossibleStickerUrls(sticker)
  const currentStickerUrl = stickerUrls[stickerUrlIndex] || "/colorful-sticker.png"

  return (
    <div className="flex justify-center max-w-[192px] max-h-[192px]">
      <img
        src={currentStickerUrl || "/placeholder.svg"}
        alt="Sticker"
        className="max-h-[192px] max-w-[192px] object-contain"
        onError={() => {
          if (stickerUrlIndex < stickerUrls.length - 1) {
            setStickerUrlIndex(stickerUrlIndex + 1)
          }
        }}
      />
    </div>
  )
}
