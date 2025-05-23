// @ts-nocheck

import { useEffect, useRef, useState } from "react";
import { cn } from "../../../lib/utils";
import type { AudioMessageProps } from "../../../types/components";
import { formatTime } from "../../../utils/formatters";

export const AudioMessage = ({
  isCurrentUser,
  audioMessage,
}: AudioMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audioMessage.duration || 0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const normalizedWaveform = audioMessage.waveform
    ? audioMessage.waveform.map(
        (value: number) => value / Math.max(...audioMessage.waveform)
      )
    : Array(50).fill(0.5);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / normalizedWaveform.length;
    const playedRatio = currentTime / duration;

    ctx.clearRect(0, 0, width, height);

    normalizedWaveform.forEach((value: number, index: number) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      const isPlayed = index / normalizedWaveform.length < playedRatio;

      ctx.fillStyle = isPlayed ? "#6c5ce7" : "#4a4a4a";
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      });

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    drawWaveform();
  }, [currentTime, isPlaying]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      audioRef.current?.play();
      animationRef.current = requestAnimationFrame(updateTime);
    }
    setIsPlaying(!isPlaying);
  };

  const updateTime = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      animationRef.current = requestAnimationFrame(updateTime);
    }
  };

  return (
    <div className="flex items-center gap-3 w-full max-w-[300px]">
      <button
        onClick={togglePlayPause}
        className={cn(
          "w-10 h-10 rounded-full bg-[#3d3157] flex items-center justify-center flex-shrink-0",
          isCurrentUser && "bg-[#5b4bc9]"
        )}
      >
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        )}
      </button>

      <div className="flex-1">
        <canvas ref={canvasRef} width={200} height={40} className="w-full" />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatTime(new Date(currentTime * 1000))}</span>
          <span>{formatTime(new Date(duration * 1000))}</span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioMessage.link_mp3 || audioMessage.link_ogg}
        preload="metadata"
      />
    </div>
  );
};
