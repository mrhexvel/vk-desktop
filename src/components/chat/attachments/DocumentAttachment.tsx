import { formatFileSize } from "@/lib/utils";
import type { VKAttachment, VKDocumentAttachment } from "@/types/vk.type";
import {
  File,
  FileArchive,
  FileCode,
  FileText,
  Film,
  ImageIcon,
  Music,
} from "lucide-react";

interface DocumentAttachmentProps {
  attachments: VKAttachment[];
}

export const DocumentAttachment = ({
  attachments,
}: DocumentAttachmentProps) => {
  const getDocumentIcon = (ext: string) => {
    const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    const archiveExts = ["zip", "rar", "7z", "tar", "gz"];
    const codeExts = [
      "js",
      "ts",
      "html",
      "css",
      "json",
      "xml",
      "py",
      "java",
      "php",
      "c",
      "cpp",
      "h",
    ];
    const videoExts = ["mp4", "avi", "mov", "wmv", "flv", "mkv"];
    const audioExts = ["mp3", "wav", "ogg", "flac", "aac"];

    if (imageExts.includes(ext.toLowerCase()))
      return <ImageIcon className="w-6 h-6" />;
    if (archiveExts.includes(ext.toLowerCase()))
      return <FileArchive className="w-6 h-6" />;
    if (codeExts.includes(ext.toLowerCase()))
      return <FileCode className="w-6 h-6" />;
    if (videoExts.includes(ext.toLowerCase()))
      return <Film className="w-6 h-6" />;
    if (audioExts.includes(ext.toLowerCase()))
      return <Music className="w-6 h-6" />;
    if (ext.toLowerCase() === "pdf") return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  return (
    <div className="mt-2 space-y-2">
      {attachments
        .filter((att): att is VKDocumentAttachment => att.type === "doc")
        .map((att, index) => {
          const doc = att.doc;
          const hasPreview =
            doc.preview?.photo?.sizes && doc.preview.photo.sizes.length > 0;
          const previewUrl = hasPreview
            ? doc.preview?.photo?.sizes[doc.preview.photo.sizes.length - 1].url
            : null;

          return (
            <a
              key={index}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-[#1C2526] rounded-lg hover:bg-[#2A3435] transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-[#3F4A4B] rounded-lg flex items-center justify-center">
                {getDocumentIcon(doc.ext)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{doc.title}</div>
                <div className="text-xs text-gray-400">
                  {doc.ext.toUpperCase()} · {formatFileSize(doc.size)}
                </div>
              </div>

              {previewUrl && (
                <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </a>
          );
        })}
    </div>
  );
};
