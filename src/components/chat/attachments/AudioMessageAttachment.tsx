import type React from "react"
import { AudioMessage } from "./AudioMessage"

interface AudioMessageAttachmentProps {
  attachments: any[]
  isCurrentUser: boolean
}

export const AudioMessageAttachment: React.FC<AudioMessageAttachmentProps> = ({ attachments, isCurrentUser }) => {
  if (attachments.length === 0) return null

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment, index) => {
        const audioMessage = attachment.audio_message
        if (!audioMessage) return null

        return <AudioMessage key={index} isCurrentUser={isCurrentUser} audioMessage={audioMessage} />
      })}
    </div>
  )
}
