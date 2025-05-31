import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import type React from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnClickOutside?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnClickOutside = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (
      closeOnClickOutside &&
      modalRef.current &&
      !modalRef.current.contains(e.target as Node)
    ) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }[size];

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={cn(
          "w-full animate-scale-in rounded-xl bg-[var(--color-card)] p-4 shadow-lg glass-effect",
          sizeClasses
        )}
      >
        <div className="flex items-center justify-between border-b border-var(--color-border) pb-3">
          <h3 className="text-lg font-semibold text-var(--color-card-foreground)">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-var(--color-muted-foreground) hover:bg-[var(--color-accent)] hover:text-var(--color-card-foreground) transition-smooth"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="py-4">{children}</div>
        {footer && (
          <div className="border-t border-var(--color-border) pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "destructive";
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmVariant = "primary",
}) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="mb-4">{message}</div>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-var(--color-border) px-4 py-2 text-sm font-medium text-var(--color-muted-foreground) hover:bg-[var(--color-accent)] hover:text-var(--color-card-foreground) transition-smooth"
        >
          {cancelText || t("buttons.cancel")}
        </button>
        <button
          onClick={handleConfirm}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium text-white transition-smooth",
            confirmVariant === "destructive"
              ? "bg-[var(--color-destructive)] hover:bg-opacity-90"
              : "bg-[var(--color-primary)] hover:bg-opacity-90"
          )}
        >
          {confirmText || t("buttons.confirm")}
        </button>
      </div>
    </Modal>
  );
};
