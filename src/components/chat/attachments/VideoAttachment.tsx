import type React from "react"

interface VideoAttachmentProps {
  attachments: any[]
}

export const VideoAttachment: React.FC<VideoAttachmentProps> = ({ attachments }) => {
  if (attachments.length === 0) return null

  const getVideoPreview = (video: any) => {
    if (!video || !video.video) return null

    const image = video.video.image || video.video.first_frame
    if (!image || !Array.isArray(image) || image.length === 0) {
      return "/video-production-setup.png"
    }

    const sortedImages = [...image].sort((a, b) => b.width * b.height - a.width * a.height)
    return sortedImages[0].url
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment, index) => {
        const video = attachment.video
        const previewUrl = getVideoPreview(attachment)
        const title = video?.title || "Видео"
        const duration = video?.duration || 0

        return (
          <div key={index} className="rounded-lg overflow-hidden">
            <div className="relative">
              <img
                src={previewUrl || "/placeholder.svg"}
                alt={title}
                className="w-full object-cover rounded-lg"
                style={{ maxHeight: "200px" }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
              {duration > 0 && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(duration)}
                </div>
              )}
            </div>
            <div className="p-2 text-sm">
              <p className="text-white font-medium truncate">{title}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
