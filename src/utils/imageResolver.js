export const resolveImageUrl = (item, size = 'w800') => {
  if (item.image) return item.image;
  if (!item.linkUrl) return null;

  const url = item.linkUrl;
  // Google Drive - optimized for better loading and multiple sizes
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      // Use Google Drive's direct image proxy with optimized size
      return `https://lh3.googleusercontent.com/d/${match[1]}=${size}-rw`;
    }
  }
  // Canva (Thumbnails blocked by Cloudflare - handled via iframe in UI)
  if (url.includes("canva.com/design/")) {
    return null;
  }
  return null;
};

export const getOptimizedImageUrl = (item, size = 'w800') => {
  return resolveImageUrl(item, size);
};

export const getThumbnailUrl = (item) => {
  return resolveImageUrl(item, 'w400');
};

export const getLightboxDisplayUrl = (item) => {
  const resolved = resolveImageUrl(item, 'w1200');
  if (resolved) return resolved;

  if (item.linkUrl) {
    if (item.linkUrl.includes("canva.com/design/")) {
       return null; // Fallback to iframe in UI
    }
    // Use a more reliable screenshot service
    return `https://api.screenshotone.com/take?access_key=demo&url=${encodeURIComponent(item.linkUrl)}&viewport_width=1200&viewport_height=800&image_quality=80&format=webp&cache=true`;
  }
  return null;
};

export const getFallbackImageUrl = (category) => {
  const fallbacks = {
    poster: '/img/fallbacks/poster-placeholder.svg',
    feed: '/img/fallbacks/feed-placeholder.svg',
    ecommerce: '/img/fallbacks/banner-placeholder.svg',
    logo: '/img/fallbacks/logo-placeholder.svg',
    management: '/img/fallbacks/management-placeholder.svg',
    ads: '/img/fallbacks/ads-placeholder.svg',
  };
  return fallbacks[category] || '/img/fallbacks/default-placeholder.svg';
};
