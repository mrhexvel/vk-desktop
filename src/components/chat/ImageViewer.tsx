import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

interface ImageViewerProps {
  images: Array<{
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }>;
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  images,
  initialIndex,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsLoading(true);
    resetTransform();
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            resetTransform();
          }
          break;
        case "ArrowRight":
          if (currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1);
            resetTransform();
          }
          break;
      }
    },
    [isOpen, currentIndex, images.length, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const resetTransform = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(3, scale + delta));
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsLoading(true);
      resetTransform();
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsLoading(true);
      resetTransform();
    }
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-md animate-fade-in"
      style={{
        zIndex: 9999,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="text-sm font-medium">
            {currentIndex + 1} из {images.length}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
          userSelect: "none",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && scale === 1) onClose();
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
          <img
            src={currentImage.url || "/placeholder.svg"}
            alt={currentImage.alt || "Изображение"}
            className={cn(
              "max-w-full max-h-full object-contain transition-all duration-300 select-none",
              isLoading && "opacity-0"
            )}
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${
                position.y / scale
              }px)`,
              transformOrigin: "center center",
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            draggable={false}
          />

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            disabled={currentIndex === 0}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 backdrop-blur-sm",
              currentIndex === 0 && "opacity-30 cursor-not-allowed"
            )}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={nextImage}
            disabled={currentIndex === images.length - 1}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 backdrop-blur-sm",
              currentIndex === images.length - 1 &&
                "opacity-30 cursor-not-allowed"
            )}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <div className="flex justify-center gap-3 overflow-x-auto max-w-full scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsLoading(true);
                  resetTransform();
                }}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                  index === currentIndex
                    ? "border-white shadow-lg scale-110"
                    : "border-white/30 opacity-70 hover:opacity-100 hover:border-white/60"
                )}
              >
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={`Миниатюра ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-6 text-white/60 text-xs space-y-1 bg-black/40 p-3 rounded-lg backdrop-blur-sm">
        <div>🖱️ Колесо мыши - масштаб</div>
        <div>✋ Перетаскивание - перемещение</div>
        <div>⌨️ ESC - закрыть</div>
        <div>⬅️➡️ Стрелки - навигация</div>
      </div>

      {scale !== 1 && (
        <div className="absolute top-20 right-6 bg-black/60 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
};
