export const resolveImageUrl = (item) => {
  if (item.image) return item.image;
  if (!item.linkUrl) return null;

  const url = item.linkUrl;
  // Google Drive
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}=w1200`;
    }
  }
  // Canva (Thumbnails blocked by Cloudflare - handled via iframe in UI)
  if (url.includes("canva.com/design/")) {
    return null; 
  }
  return null;
};

export const getLightboxDisplayUrl = (item) => {
  const resolved = resolveImageUrl(item);
  if (resolved) return resolved;
  
  if (item.linkUrl) {
    if (item.linkUrl.includes("canva.com/design/")) {
       return null; // Fallback to iframe in UI
    }
    return `https://image.thum.io/get/width/1200/crop/800/${item.linkUrl}`;
  }
  return null;
};
