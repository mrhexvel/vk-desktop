import type { AvatarProps } from "@/types/components";
import type React from "react";

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  size = "md",
  online = false,
  className = "",
}) => {
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  }[size];

  const onlineIndicatorClass = {
    sm: "h-2.5 w-2.5 -right-0.5 -bottom-0.5",
    md: "h-3 w-3 -right-0.5 -bottom-0.5",
    lg: "h-3.5 w-3.5 -right-0.5 -bottom-0.5",
  }[size];

  const fallbackUrl = `/placeholder.svg?height=${
    size === "lg" ? 64 : size === "md" ? 40 : 32
  }&width=${size === "lg" ? 64 : size === "md" ? 40 : 32}&query=avatar`;

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div className={`overflow-hidden rounded-full ${sizeClass}`}>
        {src ? (
          <img
            src={src || "/placeholder.svg"}
            alt={alt}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.src = fallbackUrl;
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6c5ce7] to-[#8471fa] text-white">
            {alt.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {online && (
        <span
          className={`absolute block rounded-full border-2 border-[#18142b] bg-[#4cd137] ${onlineIndicatorClass}`}
          aria-hidden="true"
        ></span>
      )}
    </div>
  );
};

export default Avatar;
