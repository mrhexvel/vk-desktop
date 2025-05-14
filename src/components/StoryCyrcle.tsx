"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface StoryCircleProps {
  name: string;
  image: string;
  isActive: boolean;
}

export function StoryCircle({ name, image, isActive }: StoryCircleProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "p-0.5 rounded-full",
          isActive
            ? "bg-gradient-to-br from-purple-500 to-pink-500"
            : "bg-transparent"
        )}
      >
        <Avatar className="h-14 w-14 border-2 border-[#1e1e2d] bg-[#2a2a3a]">
          <AvatarImage src={image || "/avatar.jpg"} alt={name} />
          <AvatarFallback>{name.substring(0, 2)}</AvatarFallback>
        </Avatar>
      </div>
      <span className="text-xs mt-1 text-center">{name}</span>
    </div>
  );
}
