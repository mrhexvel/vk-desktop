import { memo, useEffect, useState } from "react";

interface TypingIndicatorProps {
  userName: string;
}

export const TypingIndicator = memo(({ userName }: TypingIndicatorProps) => {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return ".";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-xs text-gray-400 italic animate-pulse">
      {userName} печатает{dots}
    </div>
  );
});

TypingIndicator.displayName = "TypingIndicator";
