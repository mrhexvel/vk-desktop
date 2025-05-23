import type React from "react"

interface LinkAttachmentProps {
  attachments: any[]
}

export const LinkAttachment: React.FC<LinkAttachmentProps> = ({ attachments }) => {
  if (attachments.length === 0) return null

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment, index) => {
        const link = attachment.link
        if (!link) return null

        const title = link.title || link.url || "Ссылка"
        const description = link.description || ""
        const url = link.url || "#"

        let imageUrl = null
        if (link.photo) {
          const sizes = link.photo.sizes || []
          if (sizes.length > 0) {
            const mediumSizes = sizes.filter((s: any) => ["m", "p", "q", "r"].includes(s.type))
            if (mediumSizes.length > 0) {
              imageUrl = mediumSizes[0].url
            } else {
              imageUrl = sizes[sizes.length - 1].url
            }
          }
        }

        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-[#3d3157] rounded-lg overflow-hidden hover:bg-[#4a3d6a] transition-colors"
          >
            {imageUrl && (
              <div className="w-full h-40 overflow-hidden">
                <img src={imageUrl || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-3">
              <p className="text-sm font-medium text-white">{title}</p>
              {description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{description}</p>}
              <p className="text-xs text-[#6c5ce7] mt-2 truncate">{url}</p>
            </div>
          </a>
        )
      })}
    </div>
  )
}
