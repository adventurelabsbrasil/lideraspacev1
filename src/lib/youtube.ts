/**
 * Converts a YouTube watch URL or short URL to embed format.
 * Returns the input as-is if it's already an embed URL or not a YouTube URL.
 */
export function youtubeToEmbedUrl(url: string): string {
  const t = url.trim();
  if (!t) return '';
  const m = t.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  if (t.includes('youtube.com/embed/')) return t;
  return t;
}
