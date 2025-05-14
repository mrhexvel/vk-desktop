import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cropText(text: string, count: number) {
  return text.slice(0, count) + (text.length > count ? "..." : "");
}
