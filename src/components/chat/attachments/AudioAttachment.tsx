"use client";

import { cn, formatTime } from "@/lib/utils";
import type { VKAudioMessageAttachment } from "@/types/vk.type";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AudioMessageProps {
  isCurrentUser: boolean;
  audioMessage: VKAudioMessageAttachment["audio_message"];
}

export const AudioMessage = ({
  isCurrentUser,
  audioMessage,
}: AudioMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audioMessage.duration);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const normalizedWaveform = audioMessage.waveform.map(
    (value) => value / Math.max(...audioMessage.waveform)
  );

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

    normalizedWaveform.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      const isPlayed = index / normalizedWaveform.length < playedRatio;

      ctx.fillStyle = isPlayed ? "#8B5CF6" : "#6B7280";
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
  }, [currentTime, drawWaveform, isPlaying]);

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
          "w-10 h-10 rounded-full bg-[#3F4A4B] flex items-center justify-center flex-shrink-0",
          isCurrentUser && "bg-[#f25ff4]/10"
        )}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </button>

      <div className="flex-1">
        <canvas ref={canvasRef} width={200} height={40} className="w-full" />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <audio ref={audioRef} src={audioMessage.link_mp3} preload="metadata" />
    </div>
  );
};
