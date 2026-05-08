/**
 * After the Cloudinary migration, every image URL stored in MongoDB is a full
 * HTTPS URL (e.g. https://res.cloudinary.com/<cloud>/image/upload/...).
 * This helper passes those through unchanged and only falls back to the
 * placeholder when the input is empty.
 */
export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return '/placeholder.jpg';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Legacy data still pointing at /uploads — return as relative; will likely 404
  // (intentional: surface the data issue rather than silently break).
  return imagePath;
};

/**
 * Adds Cloudinary on-the-fly transformations: auto format (WebP/AVIF) and
 * auto quality, plus a width cap. Reduces payload 40-60% on most images.
 * Pass-through for non-Cloudinary URLs.
 */
export const optimizedImage = (url: string | undefined, width = 800): string => {
  const resolved = getImageUrl(url);
  if (!resolved.includes('res.cloudinary.com')) return resolved;
  return resolved.replace('/upload/', `/upload/q_auto,f_auto,w_${width}/`);
};

export const getImageUrls = (images: string[] | undefined): string[] => {
  if (!images || images.length === 0) return ['/placeholder.jpg'];
  return images.map((img) => getImageUrl(img));
};
