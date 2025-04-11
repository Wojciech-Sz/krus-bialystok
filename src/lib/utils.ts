import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const extractIdentifierFromUrl = (url: string): string => {
  const marker = "/f/";
  const index = url.indexOf(marker);

  if (index === -1) {
    // Marker not found
    return "";
  }

  const startIndex = index + marker.length;
  if (startIndex >= url.length) {
    // Marker found, but nothing follows it
    return "";
  }

  return url.substring(startIndex);
};
