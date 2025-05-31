import { Check, CheckCheck } from "lucide-react";
import type React from "react";
import { cn } from "../../lib/utils";

export type MessageSendStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "error";

interface MessageStatusProps {
  status: MessageSendStatus;
  time: string;
  className?: string;
}

export const MessageStatus: React.FC<MessageStatusProps> = ({
  status,
  time,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-1 text-xs", className)}>
      <span className="text-[var(--color-muted-foreground)]">{time}</span>
      {status === "sending" && (
        <svg
          className="w-3 h-3 text-[var(--color-muted-foreground)] animate-spin-slow"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {status === "sent" && (
        <Check className="w-3 h-3 text-[var(--color-muted-foreground)]" />
      )}
      {status === "delivered" && (
        <svg
          className="w-3 h-3 text-[var(--color-muted-foreground)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      )}
      {status === "read" && (
        <CheckCheck className="w-3 h-3 text-[var(--color-primary)]" />
      )}
      {status === "error" && (
        <svg
          className="w-3 h-3 text-[var(--color-destructive)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          ></path>
        </svg>
      )}
    </div>
  );
};
