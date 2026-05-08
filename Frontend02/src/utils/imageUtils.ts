/**
 * After Cloudinary migration, every stored image URL is a full HTTPS URL.
 * Pass through unchanged; legacy /uploads paths returned as-is (will surface
 * as broken images, signaling stale data that needs re-upload).
 */
export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return imagePath;
};

/**
 * Cloudinary on-the-fly transform: auto format (WebP/AVIF), auto quality,
 * width cap. Pass-through for non-Cloudinary URLs.
 */
export const optimizedImage = (url: string | undefined, width = 800): string => {
  const resolved = getImageUrl(url);
  if (!resolved.includes('res.cloudinary.com')) return resolved;
  return resolved.replace('/upload/', `/upload/q_auto,f_auto,w_${width}/`);
};
