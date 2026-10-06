import { PortfolioItem } from "../types";

/**
 * Hosts/patterns that cannot be embedded as <img> (CORS-blocked, auth-gated, or webpage-only).
 * These fall back to null so the UI can render an iframe or placeholder instead.
 */
const BLOCKED_EMBED_PATTERNS = [
  "canva.com/design/",       // Cloudflare blocks hotlinking
  "instagram.com/",          // Requires auth / JS
  "facebook.com/",           // Requires auth / JS
  "behance.net/",            // Webpage only
  "dribbble.com/",           // Webpage only
];

function isBlockedEmbed(url: string): boolean {
  return BLOCKED_EMBED_PATTERNS.some((p) => url.includes(p));
}

export const resolveImageUrl = (item: PortfolioItem, size = "w800"): string | null => {
  // 1. Supabase storage / already-resolved image path
  if (item.image) return item.image;

  const linkUrl = item.linkUrl || item.linkurl;
  if (!linkUrl) return null;

  const url = linkUrl;

  // 2. Google Drive → convert to direct proxy URL
  if (url.includes("drive.google.com")) {
    const match =
      url.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
      url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}=${size}`;
    }
    // Folder / other Drive pages are not images
    return null;
  }

  // 3. Explicitly blocked / iframe-only sources
  if (isBlockedEmbed(url)) return null;

  // 4. Any other HTTP/HTTPS URL — pass through and let the browser try.
  //    Works for: CDN direct images (fastwork-static, cloudinary, imgix, etc.),
  //    direct .jpg/.png/.webp links with or without query params, etc.
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return null;
};

export const getLightboxDisplayUrl = (item: PortfolioItem) => {
  const resolved = resolveImageUrl(item, "w1200");
  if (resolved) return resolved;

  // For blocked embeds (e.g. Canva) — signal the UI to render an iframe instead
  const linkUrl = item.linkUrl || item.linkurl;
  if (linkUrl && isBlockedEmbed(linkUrl)) return null;

  return null;
};
