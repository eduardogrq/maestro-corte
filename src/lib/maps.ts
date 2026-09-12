/** One-tap directions from the agenda. Universal link: opens the app if installed. */
export function buildMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}
