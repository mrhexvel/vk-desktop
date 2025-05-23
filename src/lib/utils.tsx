import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cropText(text: string, count: number) {
  if (!text) return "";
  return text.slice(0, count) + (text.length > count ? "..." : "");
}

export const parseTextWithLinks = (() => {
  const cache = new Map<string, (string | JSX.Element)[]>();

  return (text: string, onlyFirstName?: boolean) => {
    const cacheKey = `${text}::${onlyFirstName}`;

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    const linkRegex = /\[(id\d+|club\d+|\{[^}]+})\|([^[\]]*)\]/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    text.replace(linkRegex, (match, link, displayText, index) => {
      if (index > lastIndex) {
        parts.push(text.slice(lastIndex, index));
      }

      let href = "";
      if (link.startsWith("id") || link.startsWith("club")) {
        href = `https://vk.com/${link}`;
      } else if (link.startsWith("{")) {
        href = link.slice(1, -1);
      }

      parts.push(
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:underline"
        >
          {onlyFirstName ? displayText.split(" ")[0] : displayText}
        </a>
      );

      lastIndex = index + match.length;
      return match;
    });

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    cache.set(cacheKey, parts);
    return parts;
  };
})();
