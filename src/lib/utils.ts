import { type ClassValue, clsx } from "clsx"

// Simple cn utility without tailwind-merge (we don't need it for this project)
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
